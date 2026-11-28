import {
  claimStatus,
  getNft,
  markListed,
  markOwned,
} from "@/app/services/nftService";
import {
  amountPaidTo,
  getCommittedTx,
  transferFromMarket,
  txSpentBy,
} from "@/app/services/chainService";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const nftId = Number(id);
  const { buyer, txHash } = await req.json();

  const nft = await getNft(nftId);
  if (!nft || nft.price === null) {
    return Response.json({ error: "NFT is not for sale" }, { status: 404 });
  }
  if (nft.owner === buyer) {
    return Response.json(
      { error: "You cannot buy your own NFT" },
      { status: 400 }
    );
  }
  if (!(await claimStatus(nftId, "listed", "selling"))) {
    return Response.json(
      { error: "NFT is already sold or being processed" },
      { status: 409 }
    );
  }

  try {
    const tx = await getCommittedTx(String(txHash));
    if (!tx) throw new Error("Payment tx is not confirmed yet");
    if (!(await txSpentBy(tx, buyer))) {
      throw new Error("Tx was not signed by the buyer");
    }
    if ((await amountPaidTo(tx, nft.owner)) < BigInt(nft.price)) {
      throw new Error("Payment amount is not enough");
    }

    await transferFromMarket(nft.sporeId, buyer);
    await markOwned(nftId, buyer, String(txHash));
    return Response.json({ ok: true });
  } catch (e) {
    await markListed(nftId, BigInt(nft.price));
    return Response.json(
      { error: e instanceof Error ? e.message : String(e) },
      { status: 400 }
    );
  }
}
