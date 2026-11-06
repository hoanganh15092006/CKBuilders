import { ccc } from "@ckb-ccc/ccc";

async function main() {
  const client = new ccc.ClientPublicTestnet();
  const signer = new ccc.SignerCkbPrivateKey(client, "01".repeat(32));

  const message = "Hello Nervos CKB from Week 02!";
  console.log("Original Message:", message);

  const signature = await signer.signMessage(message);
  console.log("Signature Object:", signature);

  const staticPass = await ccc.Signer.verifyMessage(message, signature);
  console.log("Static verification (expected true):", staticPass);

  const instancePass = await signer.verifyMessage(message, signature);
  console.log("Instance verification (expected true):", instancePass);

  const tamperFail = await ccc.Signer.verifyMessage("Tampered Message", signature);
  console.log("Tampered message verification (expected false):", tamperFail);
}

main().catch(console.error);

