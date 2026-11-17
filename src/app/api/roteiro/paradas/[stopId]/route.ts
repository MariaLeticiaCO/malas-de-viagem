import { deleteStop, getStop, getTrip, saveStop } from "@/lib/db";
import { bad, userId } from "@/lib/server";
import { cleanStop } from "@/lib/validate-stop";

type Ctx = RouteContext<"/api/roteiro/paradas/[stopId]">;

async function isOwner(request: Request) {
  const { ownerId } = await getTrip();
  return Boolean(ownerId) && ownerId === userId(request);
}

export async function PATCH(request: Request, ctx: Ctx) {
  if (!(await isOwner(request))) return bad("Só o dono do rolê edita o roteiro", 403);
  const { stopId } = await ctx.params;
  const stop = await getStop(stopId);
  if (!stop) return bad("Parada não encontrada", 404);
  const fields = cleanStop(await request.json().catch(() => null));
  if (typeof fields === "string") return bad(fields);
  const updated = { ...stop, ...fields };
  await saveStop(updated);
  return Response.json({ stop: updated });
}

export async function DELETE(request: Request, ctx: Ctx) {
  if (!(await isOwner(request))) return bad("Só o dono do rolê edita o roteiro", 403);
  const { stopId } = await ctx.params;
  await deleteStop(stopId);
  return Response.json({ ok: true });
}
