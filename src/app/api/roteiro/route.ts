import { connection } from "next/server";
import { clearStops, getRatings, getTrip, listStops } from "@/lib/db";
import { bad, userId } from "@/lib/server";

export async function GET() {
  await connection(); // always read fresh data, never prerender
  const [trip, stops] = await Promise.all([getTrip(), listStops()]);
  const ratings = await Promise.all(stops.map((s) => getRatings(s.id)));
  return Response.json({
    ownerId: trip.ownerId,
    stops: stops.map((s, i) => ({ ...s, ratings: ratings[i] })),
  });
}

/** Only the "dono do rolê" can erase the whole itinerary. */
export async function DELETE(request: Request) {
  const { ownerId } = await getTrip();
  if (!ownerId || ownerId !== userId(request)) return bad("Só o dono do rolê pode apagar o roteiro", 403);
  await clearStops();
  return Response.json({ ok: true });
}
