import { ICacheService } from "../interfaces/ICacheService";

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

export class InMemoryCacheService implements ICacheService {
  private store = new Map<string, CacheEntry<unknown>>();
  private defaultTTL: number;

  constructor(defaultTTLSeconds: number = 3600) {
    this.defaultTTL = defaultTTLSeconds * 1000;
    setInterval(() => this.cleanup(), 60000);
  }

  async get<T>(key: string): Promise<T | null> {
    const entry = this.store.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return null;
    }
    return entry.value as T;
  }

  async set<T>(key: string, value: T, ttlSeconds?: number): Promise<void> {
    const ttl = ttlSeconds ? ttlSeconds * 1000 : this.defaultTTL;
    this.store.set(key, { value, expiresAt: Date.now() + ttl });
  }

  async delete(key: string): Promise<void> {
    this.store.delete(key);
  }

  async clear(): Promise<void> {
    this.store.clear();
  }

  private cleanup() {
    const now = Date.now();
    for (const [key, entry] of this.store) {
      if (now > entry.expiresAt) this.store.delete(key);
    }
  }
}
