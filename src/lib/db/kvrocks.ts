import { BaseRedisStorage } from "./redis-base";

export class KvrocksStorage extends BaseRedisStorage {
  constructor() {
    const config = {
      url: process.env.KVROCKS_URL!,
      clientName: "Kvrocks",
    };
    const globalSymbol = Symbol.for("__VORTEX_KVROCKS_CLIENT__");
    super(config, globalSymbol);
  }
}
