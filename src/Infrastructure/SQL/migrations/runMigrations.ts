import { promises as fs } from "fs";
import path from "path";

import pool from "../db";

async function runMigrations(fileName: string) {
  try {
    const sqlFile = path.join(__dirname, fileName);
    const sql = await fs.readFile(sqlFile, "utf-8");

    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      await client.query(sql);
      await client.query("COMMIT");
      console.log(`Migration ${fileName} executed successfully.`);
    } catch (error) {
      await client.query("ROLLBACK");
      console.error(`Error executing migration ${fileName}:`, error);
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error(`Error executing migration ${fileName}:`, error);
    throw error;
  }
}

if (require.main === module) {
  const fileName = process.argv[2];
  runMigrations(fileName)
    .then(() => {
      console.log("Migration completed.");
      process.exit(0);
    })
    .catch((error) => {
      console.error("Migration failed:", error);
      process.exit(1);
    });
}

export default runMigrations;
