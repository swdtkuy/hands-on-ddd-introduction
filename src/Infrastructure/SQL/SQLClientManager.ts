import { AsyncLocalStorage } from "async_hooks";
import { PoolClient } from "pg";

import pool from "./db";

export class SQLClientManager {
  private asyncLocalStorage = new AsyncLocalStorage<PoolClient>();

  getClient(): PoolClient | undefined {
    return this.asyncLocalStorage.getStore();
  }

  runWithClient<T>(client: PoolClient, callback: () => Promise<T>): Promise<T> {
    return this.asyncLocalStorage.run(client, callback);
  }

  async getConnection(): Promise<PoolClient> {
    return await pool.connect();
  }

  async withClient<T>(
    callback: (client: PoolClient) => Promise<T>,
  ): Promise<T> {
    const existingClient = this.getClient();
    if (existingClient) {
      return await callback(existingClient);
    }

    const client = await this.getConnection();
    try {
      return await callback(client);
    } finally {
      client.release();
    }
  }
}
