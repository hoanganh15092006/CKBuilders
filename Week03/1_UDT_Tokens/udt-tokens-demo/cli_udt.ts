import { ccc } from "@ckb-ccc/ccc";

async function main() {
  const client = new ccc.ClientPublicTestnet();
  const tokenArgs = "0x71fd1985b2971a9903e4d8ed0d59e6710166985217ca0681437883837b86162f";

  const type = await ccc.Script.fromKnownScript(
    client,
    ccc.KnownScript.XUdt,
    tokenArgs
  );

  const known = await client.getKnownScript(ccc.KnownScript.XUdt);
  const cellDeps = await client.getCellDeps(known.cellDeps);
  const code = cellDeps[0].outPoint;

  const udt = new ccc.udt.Udt(code, type);
  console.log("UDT Instance constructed successfully!");
  console.log("Code OutPoint:", code);
  console.log("Type Script:", type);

  const name = await udt.name().catch(() => ({ res: undefined }));
  const symbol = await udt.symbol().catch(() => ({ res: undefined }));
  const decimals = await udt.decimals().catch(() => ({ res: undefined }));

  console.log("Token Name:", name.res ?? "Legacy xUDT (no SSRI)");
  console.log("Token Symbol:", symbol.res ?? "N/A");
  console.log("Token Decimals:", decimals.res !== undefined ? Number(decimals.res) : "N/A");
}

main().catch(console.error);

