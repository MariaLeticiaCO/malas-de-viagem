import "server-only";
import { STOP_KIND_IDS } from "./stops";
import type { Stop, StopKind } from "./types";

type Input = Partial<Pick<Stop, "title" | "place" | "date" | "time" | "kind" | "notes">>;

/** Returns the cleaned fields, or an error message. */
export function cleanStop(body: Input | null): Omit<Stop, "id" | "createdAt"> | string {
  const title = body?.title?.trim().slice(0, 60);
  const place = body?.place?.trim().slice(0, 100) ?? "";
  const date = body?.date ?? "";
  const time = body?.time ?? "";
  const notes = body?.notes?.trim().slice(0, 280) ?? "";
  if (!title) return "Dê um nome para o rolê";
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return "Escolha o dia";
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(time)) return "Escolha o horário";
  const kind = (STOP_KIND_IDS as string[]).includes(body?.kind ?? "") ? (body!.kind as StopKind) : "passeio";
  return { title, place, date, time, kind, notes };
}
