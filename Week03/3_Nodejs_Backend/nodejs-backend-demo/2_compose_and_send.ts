import { ccc } from "@ckb-ccc/shell";
import dotenv from "dotenv";

dotenv.config();

async function main() {
  const privateKey = process.env.CKB_PRIVATE_KEY || "01".repeat(32);
  const recipientAddress =
    process.env.CKB_RECIPIENT_ADDRESS ||
    "ckt1qzda0cr08m85hc8jlnfp3sog3vczr9h9rqt4ykkqfzf3gcj9qmndqgqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq";

  const clientOwner = ccc.ClientPublicTestnet.open();
  const client = clientOwner.value;

  try {
    const signer = new ccc.SignerCkbPrivateKey(client, privateKey);
    await signer.connect();

    const fromAddress = await signer.getRecommendedAddress();
    console.log("=== Node.js Backend: Compose & Send CKB ===");
    console.log("From:", fromAddress);
    console.log("To:", recipientAddress);

    const { script: lock } = await ccc.Address.fromString(
      recipientAddress,
      signer.client
    );

    const tx = ccc.Transaction.from({
      outputs: [{ capacity: ccc.fixedPointFrom(62), lock }],
    });

    console.log("Completing inputs by capacity...");
    await tx.completeInputsByCapacity(signer);

    console.log("Completing transaction fee...");
    await tx.completeFeeBy(signer);

    console.log("Signing and broadcasting transaction...");
    const txHash = await signer.sendTransaction(tx);
    console.log("Transaction Broadcast Success! Hash:", txHash);
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.log("Execution Result / Notice:", err.message);
    } else {
      console.log("Execution Result / Notice:", String(err));
    }
  } finally {
    await clientOwner.dispose();
  }
}

main().catch(console.error);

