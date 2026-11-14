import { ccc } from "@ckb-ccc/shell";

async function main() {
  const clientOwner = ccc.ClientPublicTestnet.open();
  const client = clientOwner.value;

  try {
    const signer = new ccc.SignerCkbPrivateKey(client, "01".repeat(32));
    await signer.connect();

    const message = "Server-side off-chain auth with CKB CCC";
    console.log("=== Node.js Backend: Verify Signatures ===");
    console.log("Message:", message);

    const signature = await signer.signMessage(message);
    console.log("Generated Signature:", signature);

    const isValid = await ccc.Signer.verifyMessage(message, signature);
    console.log("Static verification (expected true):", isValid);

    const isAlteredValid = await ccc.Signer.verifyMessage("Altered message", signature);
    console.log("Tampered message verification (expected false):", isAlteredValid);
  } finally {
    await clientOwner.dispose();
  }
}

main().catch(console.error);

