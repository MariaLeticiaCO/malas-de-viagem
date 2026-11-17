import { getBag, listBags, listItems, saveBag } from "@/lib/db";
import { bad, slugify } from "@/lib/server";
import { GENERAL_BAG_ID, type Bag } from "@/lib/types";

/** All bags plus checked/total counters per bag (general included). */
export async function GET() {
  const bags = await listBags();
  const ids = [GENERAL_BAG_ID, ...bags.map((b) => b.id)];
  const lists = await Promise.all(ids.map((id) => listItems(id)));
  const stats = Object.fromEntries(
    ids.map((id, i) => [
      id,
      { total: lists[i].length, done: lists[i].filter((it) => it.checked).length },
    ]),
  );
  return Response.json({ bags, stats });
}

/** Login or sign up by name. Without `color`, only logs in an existing bag. */
export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as
    | { name?: string; color?: string }
    | null;
  const name = body?.name?.trim().replace(/\s+/g, " ").slice(0, 30);
  if (!name) return bad("Digite seu nome");
  const id = slugify(name);
  if (!id || id === GENERAL_BAG_ID) return bad("Escolha outro nome");

  const existing = await getBag(id);
  if (existing) return Response.json({ bag: existing, existed: true });
  if (!body?.color) return Response.json({ bag: null, existed: false });
  if (!/^#[0-9a-f]{6}$/i.test(body.color)) return bad("Cor inválida");

  const bag: Bag = { id, name, color: body.color, createdAt: Date.now() };
  await saveBag(bag);
  return Response.json({ bag, existed: false }, { status: 201 });
}
