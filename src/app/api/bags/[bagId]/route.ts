import { deleteBag, getBag, saveBag } from "@/lib/db";
import { bad } from "@/lib/server";

export async function PATCH(request: Request, ctx: RouteContext<"/api/bags/[bagId]">) {
  const { bagId } = await ctx.params;
  if (request.headers.get("x-user-id") !== bagId) return bad("Só o dono pode mudar a mala", 403);
  const bag = await getBag(bagId);
  if (!bag) return bad("Mala não encontrada", 404);
  const body = (await request.json().catch(() => ({}))) as { color?: string };
  if (body.color && /^#[0-9a-f]{6}$/i.test(body.color)) bag.color = body.color;
  await saveBag(bag);
  return Response.json({ bag });
}

/** Only the owner can delete their own bag (e.g. they cancelled the trip). */
export async function DELETE(request: Request, ctx: RouteContext<"/api/bags/[bagId]">) {
  const { bagId } = await ctx.params;
  if (request.headers.get("x-user-id") !== bagId) return bad("Só o dono pode excluir a mala", 403);
  if (!(await getBag(bagId))) return bad("Mala não encontrada", 404);
  await deleteBag(bagId);
  return Response.json({ ok: true });
}
