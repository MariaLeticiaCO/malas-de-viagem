import { clearRating, getBag, getStop, setRating } from "@/lib/db";
import { bad, userId } from "@/lib/server";

/** Everyone rates every stop, 1 to 5 stars. stars = 0 removes your rating. */
export async function PUT(request: Request, ctx: RouteContext<"/api/roteiro/paradas/[stopId]/avaliacao">) {
  const me = userId(request);
  if (!me || !(await getBag(me))) return bad("Entre no app primeiro", 401);
  const { stopId } = await ctx.params;
  if (!(await getStop(stopId))) return bad("Parada não encontrada", 404);
  const body = (await request.json().catch(() => ({}))) as { stars?: number };
  const stars = Math.round(Number(body.stars));
  if (stars === 0) await clearRating(stopId, me);
  else if (stars >= 1 && stars <= 5) await setRating(stopId, me, stars);
  else return bad("Avalie de 1 a 5 estrelas");
  return Response.json({ stars });
}
