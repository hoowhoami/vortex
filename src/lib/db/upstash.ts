import { BaseRedisStorage } from "./redis-base";

export class UpstashRedisStorage extends BaseRedisStorage {
  constructor() {
    const url = process.env.UPSTASH_REDIS_REST_URL;
    const token = process.env.UPSTASH_REDIS_REST_TOKEN;

    if (!url || !token) {
      throw new Error("UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN must be set");
    }

    // Upstash uses redis:// protocol with auth
    const redisUrl = url.replace("https://", "redis://").replace("http://", "redis://");
    const urlWithAuth = redisUrl.includes("@")
      ? redisUrl
      : redisUrl.replace("redis://", `redis://:${token}@`);

    const config = {
      url: urlWithAuth,
      clientName: "Upstash",
    };
    const globalSymbol = Symbol.for("__VORTEX_UPSTASH_CLIENT__");
    super(config, globalSymbol);
  }
}
