import "server-only";
import { GENERAL_BAG_ID } from "./types";

export function slugify(name: string) {
  return name
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
}

/** Login is name-only: the client sends its bag id. Everyone may edit the
 *  general bag; personal bags only by their owner. */
export function canEdit(request: Request, bagId: string) {
  if (bagId === GENERAL_BAG_ID) return true;
  return request.headers.get("x-user-id") === bagId;
}

export function bad(message: string, status = 400) {
  return Response.json({ error: message }, { status });
}
