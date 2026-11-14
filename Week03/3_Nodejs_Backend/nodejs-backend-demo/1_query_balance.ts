import { ccc } from "@ckb-ccc/shell";
import dotenv from "dotenv";

dotenv.config();

async function main() {
  const targetAddress =
    process.env.CKB_ADDRESS ||
    "ckt1qrfrwcdnvssswdwpn3s9v8fp87emat306ctjwsm3nmlkjg8qyza2cqgqq8c22qavedn9hl3aztfltrxrdnfdyeyc0cy7c4up";

  const clientOwner = ccc.ClientPublicTestnet.open();
  const client = clientOwner.value;

  try {
    const { script: lock } = await ccc.Address.fromString(targetAddress, client);
    const balance = await client.getBalance([lock]);

    console.log("=== Node.js Backend: Query Balance ===");
    console.log("Network: CKB Testnet");
    console.log("Queried Address:", targetAddress);
    console.log("Account Balance:", ccc.fixedPointToString(balance), "CKB");
  } finally {
    await clientOwner.dispose();
  }
}

main().catch(console.error);
