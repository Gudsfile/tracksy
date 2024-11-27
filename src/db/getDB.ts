import { DuckdbApp, setupDuckdb } from "./setupDB";

declare global {
  interface Window {
    db: DuckdbApp["db"];
    conn: DuckdbApp["conn"];
  }
}
/**
 * DuckDB is used on client side (browser) to query data
 * We just need to instantiate it once on the client side for a page render
 */
export const getDB = async () => {
  if (!window.db || !window.conn) {
    const {db, conn } = await setupDuckdb();
    window.db = db;
    window.conn = conn;
    console.debug("Database initialized");
  }
  return { db: window.db, conn: window.conn };
};
