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
    console.log("=== Node.js Backend: Iterate On-Chain Cells ===");
    console.log("Target Address:", targetAddress);
    console.log("Scanning live cells on CKB Testnet...");

    let cellCount = 0;
    for await (const cell of client.findCellsOnChain({ script: lock, scriptType: "lock" }, "asc")) {
      cellCount++;
      console.log(
        `Cell #${cellCount}: OutPoint = ${cell.outPoint.txHash}:${cell.outPoint.index} | Capacity = ${ccc.fixedPointToString(cell.cellOutput.capacity)} CKB`
      );
      if (cellCount >= 10) {
        console.log("Displaying first 10 cells...");
        break;
      }
    }

    if (cellCount === 0) {
      console.log("No live cells found for this address on Testnet.");
    } else {
      console.log(`Scan completed. Cells inspected: ${cellCount}`);
    }
  } finally {
    await clientOwner.dispose();
  }
}

main().catch(console.error);
