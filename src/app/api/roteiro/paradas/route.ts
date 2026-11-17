import { getTrip, saveStop } from "@/lib/db";
import { bad, userId } from "@/lib/server";
import { cleanStop } from "@/lib/validate-stop";
import type { Stop } from "@/lib/types";

export async function POST(request: Request) {
  const { ownerId } = await getTrip();
  if (!ownerId || ownerId !== userId(request)) return bad("Só o dono do rolê monta o roteiro", 403);
  const fields = cleanStop(await request.json().catch(() => null));
  if (typeof fields === "string") return bad(fields);
  const stop: Stop = { id: crypto.randomUUID(), createdAt: Date.now(), ...fields };
  await saveStop(stop);
  return Response.json({ stop }, { status: 201 });
}
