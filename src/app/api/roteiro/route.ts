import { connection } from "next/server";
import { getRatings, getTrip, listStops } from "@/lib/db";

export async function GET() {
  await connection(); // always read fresh data, never prerender
  const [trip, stops] = await Promise.all([getTrip(), listStops()]);
  const ratings = await Promise.all(stops.map((s) => getRatings(s.id)));
  return Response.json({
    ownerId: trip.ownerId,
    stops: stops.map((s, i) => ({ ...s, ratings: ratings[i] })),
  });
}
