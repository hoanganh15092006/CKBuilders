import { ccc } from "@ckb-ccc/ccc";

export async function transferCkb(
  signer: ccc.Signer,
  receiverAddress: string,
  amountInCkb: string | number,
  feeRate?: number
): Promise<string> {
  const { script: lock } = await ccc.Address.fromString(
    receiverAddress,
    signer.client
  );

  const tx = ccc.Transaction.from({
    outputs: [{ capacity: ccc.fixedPointFrom(amountInCkb), lock }],
  });

  await tx.completeInputsByCapacity(signer);
  await tx.completeFeeBy(signer, feeRate);

  const txHash = await signer.sendTransaction(tx);
  return txHash;
}

export async function sweepAllCkb(
  signer: ccc.Signer,
  receiverAddress: string,
  feeRate?: number
): Promise<string> {
  const { script: lock } = await ccc.Address.fromString(
    receiverAddress,
    signer.client
  );

  const tx = ccc.Transaction.from({
    outputs: [{ lock }],
  });

  await tx.completeInputsAll(signer);
  await tx.completeFeeChangeToOutput(signer, 0, feeRate);

  const txHash = await signer.sendTransaction(tx);
  return txHash;
}

