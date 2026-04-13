import { injectable } from "tsyringe";
import { ITransactionManager } from "../../Application/shared/ITransactionManager";
import { SQLClientManager } from "./SQLClientManager";

@injectable()
export class SQLTransactionManager implements ITransactionManager {
  constructor(private readonly clientManager: SQLClientManager) {}

  async begin<T>(callback: () => Promise<T>): Promise<T> {
    const existingClient = this.clientManager.getClient();
    if (existingClient) {
      return await callback();
    }

    const client = await this.clientManager.getConnection();
    try {
      return await this.clientManager.runWithClient(client, async () => {
        try {
          await client.query("BEGIN");

          const result = await callback();

          await client.query("COMMIT");
          return result;
        } catch (error) {
          await client.query("ROLLBACK");
          throw error;
        }
      });
    } finally {
      client.release();
    }
  }
}
