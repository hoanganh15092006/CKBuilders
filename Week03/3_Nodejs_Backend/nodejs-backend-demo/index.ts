import { ccc } from "@ckb-ccc/shell";
import dotenv from "dotenv";

dotenv.config();

async function runDemo() {
  const targetAddress =
    process.env.CKB_ADDRESS ||
    "ckt1qrfrwcdnvssswdwpn3s9v8fp87emat306ctjwsm3nmlkjg8qyza2cqgqq8c22qavedn9hl3aztfltrxrdnfdyeyc0cy7c4up";
  const privateKey = process.env.CKB_PRIVATE_KEY || "01".repeat(32);

  const clientOwner = ccc.ClientPublicTestnet.open();
  const client = clientOwner.value;

  try {
    const { script: lock } = await ccc.Address.fromString(targetAddress, client);
    const balance = await client.getBalance([lock]);

    console.log("==========================================");
    console.log("   CKB Node.js Backend Demo with CCC");
    console.log("==========================================");
    console.log("Client: ClientPublicTestnet");
    console.log("Target Address:", targetAddress);
    console.log("Account Balance:", ccc.fixedPointToString(balance), "CKB");
    console.log("------------------------------------------");

    const signer = new ccc.SignerCkbPrivateKey(client, privateKey);
    await signer.connect();

    const message = "Automated Node.js Backend Auth";
    const signature = await signer.signMessage(message);
    const valid = await ccc.Signer.verifyMessage(message, signature);
    console.log("Signer Backend Test Key:", await signer.getRecommendedAddress());
    console.log("Cryptographic Verification Test:", valid ? "PASSED" : "FAILED");
    console.log("==========================================");
  } finally {
    await clientOwner.dispose();
  }
}

runDemo().catch(console.error);
