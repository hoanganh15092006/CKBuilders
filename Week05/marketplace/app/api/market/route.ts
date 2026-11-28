import { getMarketAddress } from "@/app/services/chainService";

export async function GET() {
  try {
    return Response.json({ address: await getMarketAddress() });
  } catch (e) {
    return Response.json(
      { error: e instanceof Error ? e.message : String(e) },
      { status: 500 }
    );
  }
}
