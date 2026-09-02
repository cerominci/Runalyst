import AsyncStorage from "@react-native-async-storage/async-storage";
import { cacheClear, cacheGet, cacheInvalidate, cacheSet } from "../cache";

beforeEach(async () => {
  await cacheClear();
  jest.clearAllMocks();
});

// ── miss ─────────────────────────────────────────────────────────────────────

describe("cacheGet — miss", () => {
  it("returns undefined for a key that was never set", async () => {
    const result = await cacheGet<string>("nonexistent");
    expect(result).toBeUndefined();
  });
});

// ── set + get ─────────────────────────────────────────────────────────────────

describe("cacheSet + cacheGet", () => {
  it("returns the stored string value", async () => {
    await cacheSet("str-key", "hello");
    expect(await cacheGet<string>("str-key")).toBe("hello");
  });

  it("stores and retrieves objects", async () => {
    const obj = { url: "https://example.com", id: 42 };
    await cacheSet("obj-key", obj);
    expect(await cacheGet<typeof obj>("obj-key")).toEqual(obj);
  });

  it("stores null (distinguishable from an undefined miss)", async () => {
    await cacheSet("null-key", null);
    expect(await cacheGet<null>("null-key")).toBeNull();
  });

  it("overwrites an existing value on second set", async () => {
    await cacheSet("overwrite", "first");
    await cacheSet("overwrite", "second");
    expect(await cacheGet<string>("overwrite")).toBe("second");
  });

  it("different keys are independent", async () => {
    await cacheSet("k1", "value-one");
    await cacheSet("k2", "value-two");
    expect(await cacheGet<string>("k1")).toBe("value-one");
    expect(await cacheGet<string>("k2")).toBe("value-two");
  });
});

// ── TTL ───────────────────────────────────────────────────────────────────────

describe("TTL expiry", () => {
  it("returns undefined after the TTL has elapsed", async () => {
    await cacheSet("expiring", "gone-soon", 1); // 1 ms TTL
    await new Promise((r) => setTimeout(r, 20));
    expect(await cacheGet<string>("expiring")).toBeUndefined();
  });

  it("returns value before the TTL elapses", async () => {
    await cacheSet("alive", "still-here", 60_000);
    expect(await cacheGet<string>("alive")).toBe("still-here");
  });

  it("zero TTL means never expires", async () => {
    await cacheSet("forever", "persists", 0);
    await new Promise((r) => setTimeout(r, 20));
    expect(await cacheGet<string>("forever")).toBe("persists");
  });
});

// ── invalidate ────────────────────────────────────────────────────────────────

describe("cacheInvalidate", () => {
  it("removes a single key", async () => {
    await cacheSet("to-remove", "value");
    await cacheInvalidate("to-remove");
    expect(await cacheGet<string>("to-remove")).toBeUndefined();
  });

  it("removes multiple keys at once", async () => {
    await cacheSet("a", "va");
    await cacheSet("b", "vb");
    await cacheInvalidate("a", "b");
    expect(await cacheGet<string>("a")).toBeUndefined();
    expect(await cacheGet<string>("b")).toBeUndefined();
  });

  it("leaves other keys untouched", async () => {
    await cacheSet("keep", "safe");
    await cacheSet("remove", "gone");
    await cacheInvalidate("remove");
    expect(await cacheGet<string>("keep")).toBe("safe");
  });
});

// ── clear ─────────────────────────────────────────────────────────────────────

describe("cacheClear", () => {
  it("removes all entries", async () => {
    await cacheSet("x", 1);
    await cacheSet("y", 2);
    await cacheClear();
    expect(await cacheGet<number>("x")).toBeUndefined();
    expect(await cacheGet<number>("y")).toBeUndefined();
  });
});

// ── L1 memory cache ───────────────────────────────────────────────────────────

describe("L1 memory cache", () => {
  it("serves a second get from memory without hitting AsyncStorage", async () => {
    await cacheSet("mem-key", "mem-value");

    // Reset spy so we only count calls that happen in cacheGet below.
    (AsyncStorage.getItem as jest.Mock).mockClear();

    await cacheGet<string>("mem-key");

    expect(AsyncStorage.getItem).not.toHaveBeenCalled();
  });

  it("falls back to AsyncStorage after in-memory eviction on clear", async () => {
    await cacheSet("persist-key", "persisted-value");

    // Simulate only clearing the in-memory store by calling cacheClear()
    // (which wipes memStore) then checking we still read from L2.
    // Re-set so AsyncStorage still has the data, then clear only the
    // module-level memStore via cacheClear + re-set the AsyncStorage value.
    await cacheClear();
    await (AsyncStorage as any).setItem(
      "runalyst_cache:persist-key",
      JSON.stringify({ data: "persisted-value", expiresAt: 0 }),
    );

    const result = await cacheGet<string>("persist-key");
    expect(result).toBe("persisted-value");
  });
});
