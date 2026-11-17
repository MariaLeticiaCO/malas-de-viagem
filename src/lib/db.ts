import "server-only";
import { Redis } from "@upstash/redis";
import type { Bag, Item } from "./types";

/**
 * Storage:
 *  - "bags"            hash  bagId -> Bag (JSON)
 *  - "items:<bagId>"   hash  itemId -> Item (JSON)
 * Uses Upstash Redis (Vercel Marketplace) when configured, otherwise an
 * in-memory store so the app also runs locally without setup.
 */

const url = process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL;
const token = process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN;

type Store = {
  hgetall<T>(key: string): Promise<Record<string, T>>;
  hget<T>(key: string, field: string): Promise<T | null>;
  hset<T>(key: string, field: string, value: T): Promise<void>;
  hdel(key: string, field: string): Promise<void>;
};

function redisStore(redis: Redis): Store {
  return {
    async hgetall<T>(key: string) {
      return ((await redis.hgetall<Record<string, T>>(key)) ?? {}) as Record<string, T>;
    },
    async hget<T>(key: string, field: string) {
      return ((await redis.hget<T>(key, field)) ?? null) as T | null;
    },
    async hset<T>(key: string, field: string, value: T) {
      await redis.hset(key, { [field]: value });
    },
    async hdel(key: string, field: string) {
      await redis.hdel(key, field);
    },
  };
}

function memoryStore(): Store {
  const g = globalThis as unknown as { __memdb?: Map<string, Map<string, unknown>> };
  const db = (g.__memdb ??= new Map());
  const h = (key: string) => {
    if (!db.has(key)) db.set(key, new Map());
    return db.get(key)!;
  };
  return {
    async hgetall<T>(key: string) {
      return Object.fromEntries(h(key)) as Record<string, T>;
    },
    async hget<T>(key: string, field: string) {
      return (h(key).get(field) as T) ?? null;
    },
    async hset<T>(key: string, field: string, value: T) {
      h(key).set(field, structuredClone(value));
    },
    async hdel(key: string, field: string) {
      h(key).delete(field);
    },
  };
}

const store: Store = url && token ? redisStore(new Redis({ url, token })) : memoryStore();

export const isPersistent = Boolean(url && token);

export async function listBags(): Promise<Bag[]> {
  const all = await store.hgetall<Bag>("bags");
  return Object.values(all).sort((a, b) => a.createdAt - b.createdAt);
}

export const getBag = (id: string) => store.hget<Bag>("bags", id);
export const saveBag = (bag: Bag) => store.hset("bags", bag.id, bag);

export async function listItems(bagId: string): Promise<Item[]> {
  const all = await store.hgetall<Item>(`items:${bagId}`);
  return Object.values(all).sort((a, b) => a.createdAt - b.createdAt);
}

export const getItem = (bagId: string, itemId: string) =>
  store.hget<Item>(`items:${bagId}`, itemId);
export const saveItem = (bagId: string, item: Item) =>
  store.hset(`items:${bagId}`, item.id, item);
export const deleteItem = (bagId: string, itemId: string) =>
  store.hdel(`items:${bagId}`, itemId);
