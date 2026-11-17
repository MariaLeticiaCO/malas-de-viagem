import { deleteItem, getItem, saveItem } from "@/lib/db";
import { bad, canEdit } from "@/lib/server";

type Ctx = RouteContext<"/api/bags/[bagId]/items/[itemId]">;

export async function PATCH(request: Request, ctx: Ctx) {
  const { bagId, itemId } = await ctx.params;
  if (!canEdit(request, bagId)) return bad("Sem permissão", 403);
  const item = await getItem(bagId, itemId);
  if (!item) return bad("Item não encontrado", 404);
  const body = (await request.json().catch(() => ({}))) as { checked?: boolean; text?: string };
  if (typeof body.checked === "boolean") item.checked = body.checked;
  if (typeof body.text === "string" && body.text.trim()) item.text = body.text.trim().slice(0, 80);
  await saveItem(bagId, item);
  return Response.json({ item });
}

export async function DELETE(request: Request, ctx: Ctx) {
  const { bagId, itemId } = await ctx.params;
  if (!canEdit(request, bagId)) return bad("Sem permissão", 403);
  await deleteItem(bagId, itemId);
  return Response.json({ ok: true });
}
