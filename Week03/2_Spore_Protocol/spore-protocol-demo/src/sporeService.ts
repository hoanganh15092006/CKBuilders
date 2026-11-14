import { ccc } from "@ckb-ccc/connector-react";
import {
  createSpore,
  transferSpore,
  meltSpore,
  createSporeCluster,
  findSporesBySigner,
} from "@ckb-ccc/spore";

export interface SporeItem {
  id: string;
  contentType: string;
  clusterId?: string;
  capacity: string;
  imageBlobUrl?: string;
  textContent?: string;
}

export async function mintSporeDob(
  signer: ccc.Signer,
  content: string | Uint8Array,
  contentType: string = "text/plain",
  clusterId?: string
): Promise<{ id: string; txHash: string }> {
  let contentBytes: Uint8Array;
  if (typeof content === "string") {
    contentBytes = new TextEncoder().encode(content);
  } else {
    contentBytes = content;
  }

  const data: {
    contentType: string;
    content: Uint8Array;
    clusterId?: string;
  } = {
    contentType,
    content: contentBytes,
  };

  if (clusterId && clusterId.trim().length > 0) {
    data.clusterId = clusterId.trim();
  }

  const { tx, id } = await createSpore({
    signer,
    data,
    clusterMode: data.clusterId ? "lockProxy" : undefined,
  });

  await tx.completeInputsByCapacity(signer);
  await tx.completeFeeBy(signer);

  const txHash = await signer.sendTransaction(tx);
  return { id, txHash };
}

export async function transferSporeDob(
  signer: ccc.Signer,
  sporeId: string,
  recipientAddress: string
): Promise<string> {
  const { script: newOwner } = await ccc.Address.fromString(
    recipientAddress,
    signer.client
  );

  const { tx } = await transferSpore({
    signer,
    id: sporeId,
    to: newOwner,
  });

  await tx.completeInputsByCapacity(signer);
  await tx.completeFeeBy(signer);

  return await signer.sendTransaction(tx);
}

export async function meltSporeDob(
  signer: ccc.Signer,
  sporeId: string
): Promise<string> {
  const { tx } = await meltSpore({
    signer,
    id: sporeId,
  });

  await tx.completeFeeBy(signer);
  return await signer.sendTransaction(tx);
}

export async function createCluster(
  signer: ccc.Signer,
  name: string,
  description: string
): Promise<{ clusterId: string; txHash: string }> {
  const { tx, id: clusterId } = await createSporeCluster({
    signer,
    data: {
      name,
      description,
    },
  });

  await tx.completeInputsByCapacity(signer);
  await tx.completeFeeBy(signer);

  const txHash = await signer.sendTransaction(tx);
  return { clusterId, txHash };
}

export async function listSpores(signer: ccc.Signer): Promise<SporeItem[]> {
  const results: SporeItem[] = [];
  try {
    for await (const { spore, sporeData } of findSporesBySigner({ signer })) {
      let imageBlobUrl: string | undefined;
      let textContent: string | undefined;

      if (sporeData.contentType.startsWith("image/")) {
        try {
          const bytes = ccc.bytesFrom(sporeData.content);
          const blob = new Blob([bytes.slice().buffer], { type: sporeData.contentType });
          imageBlobUrl = URL.createObjectURL(blob);
        } catch {}
      } else if (sporeData.contentType.startsWith("text/")) {
        try {
          const bytes = ccc.bytesFrom(sporeData.content);
          textContent = new TextDecoder().decode(bytes);
        } catch {}
      }

      results.push({
        id: spore.cellOutput.type?.args ?? "Unknown",
        contentType: sporeData.contentType,
        clusterId: sporeData.clusterId ? ccc.hexFrom(sporeData.clusterId) : undefined,
        capacity: ccc.fixedPointToString(spore.cellOutput.capacity),
        imageBlobUrl,
        textContent,
      });
    }
  } catch (err) {
    console.error(err);
  }
  return results;
}
