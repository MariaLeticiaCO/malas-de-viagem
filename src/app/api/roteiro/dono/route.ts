import { getBag, getTrip, setTripOwner } from "@/lib/db";
import { bad, userId } from "@/lib/server";

/** Anyone picks the first "dono do rolê"; afterwards only the owner passes the crown on. */
export async function PUT(request: Request) {
  const me = userId(request);
  if (!me || !(await getBag(me))) return bad("Entre no app primeiro", 401);
  const { ownerId } = await getTrip();
  if (ownerId && ownerId !== me) return bad("Só o dono do rolê pode passar a coroa", 403);
  const body = (await request.json().catch(() => ({}))) as { ownerId?: string };
  if (!body.ownerId || !(await getBag(body.ownerId))) return bad("Pessoa não encontrada", 404);
  await setTripOwner(body.ownerId);
  return Response.json({ ownerId: body.ownerId });
}
