import { ccc } from "@ckb-ccc/connector-react";

export interface UdtMetadata {
  name?: string;
  symbol?: string;
  decimals?: number;
  icon?: string;
}

export async function getUdt(
  signer: ccc.Signer,
  tokenArgs: string
): Promise<ccc.udt.Udt> {
  const type = await ccc.Script.fromKnownScript(
    signer.client,
    ccc.KnownScript.XUdt,
    tokenArgs
  );

  const known = await signer.client.getKnownScript(ccc.KnownScript.XUdt);
  const cellDeps = await signer.client.getCellDeps(known.cellDeps);
  const code = cellDeps[0].outPoint;

  return new ccc.udt.Udt(code, type);
}

export async function fetchUdtMetadata(udt: ccc.udt.Udt): Promise<UdtMetadata> {
  const [nameRes, symbolRes, decimalsRes, iconRes] = await Promise.all([
    udt.name().catch(() => ({ res: undefined })),
    udt.symbol().catch(() => ({ res: undefined })),
    udt.decimals().catch(() => ({ res: undefined })),
    udt.icon().catch(() => ({ res: undefined })),
  ]);

  return {
    name: nameRes.res,
    symbol: symbolRes.res,
    decimals: decimalsRes.res !== undefined ? Number(decimalsRes.res) : undefined,
    icon: iconRes.res,
  };
}

export async function mintUdt(
  signer: ccc.Signer,
  udt: ccc.udt.Udt,
  receiverAddress: string,
  amount: string | number
): Promise<string> {
  const { script: to } = await ccc.Address.fromString(
    receiverAddress,
    signer.client
  );

  let { res: tx } = await udt.mint(signer, [
    { to, amount: ccc.fixedPointFrom(amount) },
  ]);

  await tx.completeInputsByCapacity(signer);
  await tx.completeFeeBy(signer);

  return await signer.sendTransaction(tx);
}

export async function transferUdt(
  signer: ccc.Signer,
  udt: ccc.udt.Udt,
  receiverAddress: string,
  amount: string | number
): Promise<string> {
  const { script: lock } = await ccc.Address.fromString(
    receiverAddress,
    signer.client
  );

  let { res: tx } = await udt.transfer(signer, [
    { to: lock, amount: ccc.fixedPointFrom(amount) },
  ]);

  tx = await udt.completeBy(tx, signer);
  await tx.completeInputsByCapacity(signer);
  await tx.completeFeeBy(signer);

  return await signer.sendTransaction(tx);
}

