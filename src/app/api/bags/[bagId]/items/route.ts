import { getBag, listItems, saveItem } from "@/lib/db";
import { CATEGORY_IDS } from "@/lib/constants";
import { bad, canEdit } from "@/lib/server";
import { GENERAL_BAG_ID, type CategoryId, type Item } from "@/lib/types";

export async function GET(_req: Request, ctx: RouteContext<"/api/bags/[bagId]/items">) {
  const { bagId } = await ctx.params;
  return Response.json({ items: await listItems(bagId) });
}

export async function POST(request: Request, ctx: RouteContext<"/api/bags/[bagId]/items">) {
  const { bagId } = await ctx.params;
  if (!canEdit(request, bagId)) return bad("Você só pode editar a sua mala e a geral", 403);
  if (bagId !== GENERAL_BAG_ID && !(await getBag(bagId))) return bad("Mala não encontrada", 404);

  const body = (await request.json().catch(() => null)) as
    | { text?: string; category?: string }
    | null;
  const text = body?.text?.trim().slice(0, 80);
  if (!text) return bad("Escreva o item");
  const category = (CATEGORY_IDS as string[]).includes(body?.category ?? "")
    ? (body!.category as CategoryId)
    : "outros";

  const item: Item = {
    id: crypto.randomUUID(),
    text,
    category,
    checked: false,
    addedBy: safeDecode(request.headers.get("x-user-name")).slice(0, 30),
    createdAt: Date.now(),
  };
  await saveItem(bagId, item);
  return Response.json({ item }, { status: 201 });
}

function safeDecode(v: string | null) {
  try {
    return decodeURIComponent(v ?? "");
  } catch {
    return "";
  }
}
