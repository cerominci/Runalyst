import AsyncStorage from "@react-native-async-storage/async-storage";

const CACHE_PREFIX = "runalyst_cache:";

type CacheEntry<T> = {
  data: T;
  expiresAt: number; // 0 = never expires
};

// L1: in-memory for fast same-session reads
const memStore = new Map<string, CacheEntry<unknown>>();

function isExpired(entry: CacheEntry<unknown>): boolean {
  return entry.expiresAt !== 0 && Date.now() > entry.expiresAt;
}

// Returns undefined on miss, otherwise the stored value (may be null).
export async function cacheGet<T>(key: string): Promise<T | undefined> {
  // L1 hit
  const memEntry = memStore.get(key) as CacheEntry<T> | undefined;
  if (memEntry) {
    if (isExpired(memEntry)) {
      memStore.delete(key);
    } else {
      return memEntry.data;
    }
  }

  // L2 hit — AsyncStorage
  try {
    const raw = await AsyncStorage.getItem(CACHE_PREFIX + key);
    if (raw === null) return undefined;
    const entry = JSON.parse(raw) as CacheEntry<T>;
    if (isExpired(entry)) {
      await AsyncStorage.removeItem(CACHE_PREFIX + key);
      return undefined;
    }
    memStore.set(key, entry); // promote to L1
    return entry.data;
  } catch {
    return undefined;
  }
}

export async function cacheSet<T>(key: string, data: T, ttlMs = 0): Promise<void> {
  const entry: CacheEntry<T> = {
    data,
    expiresAt: ttlMs > 0 ? Date.now() + ttlMs : 0,
  };
  memStore.set(key, entry);
  try {
    await AsyncStorage.setItem(CACHE_PREFIX + key, JSON.stringify(entry));
  } catch {
    // AsyncStorage write failure is non-fatal — L1 still works
  }
}

export async function cacheInvalidate(...keys: string[]): Promise<void> {
  keys.forEach((key) => memStore.delete(key));
  try {
    await AsyncStorage.multiRemove(keys.map((k) => CACHE_PREFIX + k));
  } catch {
    // non-fatal
  }
}

export async function cacheClear(): Promise<void> {
  memStore.clear();
  try {
    const allKeys = await AsyncStorage.getAllKeys();
    const cacheKeys = allKeys.filter((k) => k.startsWith(CACHE_PREFIX));
    if (cacheKeys.length > 0) await AsyncStorage.multiRemove(cacheKeys);
  } catch {
    // non-fatal
  }
}
