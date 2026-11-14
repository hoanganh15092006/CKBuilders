import { ccc } from "@ckb-ccc/ccc";
import { findSporesBySigner } from "@ckb-ccc/spore";

async function main() {
  const client = new ccc.ClientPublicTestnet();
  const signer = new ccc.SignerCkbPrivateKey(client, "01".repeat(32));
  await signer.connect();

  const address = await signer.getRecommendedAddress();
  console.log("Signer Address:", address);

  const balance = await signer.getBalance();
  console.log("Signer Balance:", ccc.fixedPointToString(balance), "CKB");

  console.log("Querying spores owned by signer...");
  let count = 0;
  for await (const { spore, sporeData } of findSporesBySigner({ signer })) {
    count++;
    console.log(`Spore #${count}: OutPoint =`, spore.outPoint, "Content-Type =", sporeData.contentType);
  }

  if (count === 0) {
    console.log("No spores found for this test key. Ready to create spores via dApp!");
  }
}

main().catch(console.error);

