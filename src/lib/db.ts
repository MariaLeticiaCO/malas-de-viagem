import "server-only";
import { Redis } from "@upstash/redis";
import type { Bag, Item, Stop, Trip } from "./types";

/**
 * Storage:
 *  - "bags"            hash  bagId -> Bag (JSON)
 *  - "items:<bagId>"   hash  itemId -> Item (JSON)
 *  - "trip"            hash  "ownerId" -> bagId of the "dono do rolê"
 *  - "stops"           hash  stopId -> Stop (JSON)
 *  - "ratings:<stop>"  hash  bagId -> stars (1..5)
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
  del(key: string): Promise<void>;
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
    async del(key: string) {
      await redis.del(key);
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
    async del(key: string) {
      db.delete(key);
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

export async function getTrip(): Promise<Trip> {
  return { ownerId: (await store.hget<string>("trip", "ownerId")) ?? null };
}
export const setTripOwner = (ownerId: string) => store.hset("trip", "ownerId", ownerId);

export async function listStops(): Promise<Stop[]> {
  const all = await store.hgetall<Stop>("stops");
  return Object.values(all).sort((a, b) =>
    `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`) || a.createdAt - b.createdAt,
  );
}
export const getStop = (id: string) => store.hget<Stop>("stops", id);
export const saveStop = (stop: Stop) => store.hset("stops", stop.id, stop);
export const deleteStop = (id: string) => store.hdel("stops", id);

export async function getRatings(stopId: string): Promise<Record<string, number>> {
  const all = await store.hgetall<number | string>(`ratings:${stopId}`);
  return Object.fromEntries(Object.entries(all).map(([k, v]) => [k, Number(v)]));
}
export const setRating = (stopId: string, userId: string, stars: number) =>
  store.hset(`ratings:${stopId}`, userId, stars);
export const clearRating = (stopId: string, userId: string) =>
  store.hdel(`ratings:${stopId}`, userId);

/** Someone cancelled the trip: remove their bag, its list, their ratings,
 *  and free the crown if they were the "dono do rolê". */
export async function deleteBag(id: string) {
  const [trip, stops] = await Promise.all([getTrip(), listStops()]);
  await Promise.all([
    store.hdel("bags", id),
    store.del(`items:${id}`),
    ...stops.map((s) => store.hdel(`ratings:${s.id}`, id)),
    trip.ownerId === id ? store.hdel("trip", "ownerId") : Promise.resolve(),
  ]);
}

/** Wipes the whole itinerary (all stops and their ratings). The crown stays. */
export async function clearStops() {
  const stops = await listStops();
  await Promise.all([store.del("stops"), ...stops.map((s) => store.del(`ratings:${s.id}`))]);
}
