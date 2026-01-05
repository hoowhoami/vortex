import { BaseRedisStorage } from "./redis-base";

export class RedisStorage extends BaseRedisStorage {
  constructor() {
    const config = {
      url: process.env.REDIS_URL!,
      clientName: "Redis",
    };
    const globalSymbol = Symbol.for("__VORTEX_REDIS_CLIENT__");
    super(config, globalSymbol);
  }
}
