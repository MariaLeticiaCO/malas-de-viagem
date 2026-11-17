"use client";
import { useCallback, useSyncExternalStore } from "react";
import type { Bag, Item, StopWithRatings } from "./types";

export type Stats = Record<string, { total: number; done: number }>;
export type BagsResponse = { bags: Bag[]; stats: Stats; ownerId: string | null };
export type TripResponse = { ownerId: string | null; stops: StopWithRatings[] };
export type ItemsResponse = { items: Item[] };

const KEY = "malas:user";
const listeners = new Set<() => void>();

function read(): string | null {
  try {
    return localStorage.getItem(KEY);
  } catch {
    return null;
  }
}

/** The logged-in bag lives in localStorage (login is name-only). */
export function useSession() {
  const raw = useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      window.addEventListener("storage", cb);
      return () => {
        listeners.delete(cb);
        window.removeEventListener("storage", cb);
      };
    },
    read,
    () => undefined as unknown as string | null,
  );
  const user: Bag | null | undefined = raw === undefined ? undefined : raw ? JSON.parse(raw) : null;
  const setUser = useCallback((bag: Bag | null) => {
    try {
      if (bag) localStorage.setItem(KEY, JSON.stringify(bag));
      else localStorage.removeItem(KEY);
    } catch {}
    listeners.forEach((l) => l());
  }, []);
  return { user, setUser, ready: raw !== undefined };
}

export const fetcher = (url: string) =>
  fetch(url, { cache: "no-store" }).then((r) => {
    if (!r.ok) throw new Error("Falha ao carregar");
    return r.json();
  });

export async function api<T>(
  url: string,
  method: string,
  user: Bag | null,
  body?: unknown,
): Promise<T> {
  const res = await fetch(url, {
    method,
    headers: {
      "content-type": "application/json",
      ...(user ? { "x-user-id": user.id, "x-user-name": encodeURIComponent(user.name) } : {}),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error ?? "Algo deu errado");
  return data as T;
}
