import * as SQLite from "expo-sqlite";

export const storageLabel = "SQLite";

let db;

function getDb() {
  if (!db) {
    db = SQLite.openDatabaseSync("sociallens.db");
    db.execSync("CREATE TABLE IF NOT EXISTS kv (key TEXT PRIMARY KEY NOT NULL, value TEXT NOT NULL)");
  }

  return db;
}

export function loadState(key) {
  const row = getDb().getFirstSync("SELECT value FROM kv WHERE key = ?", key);

  if (!row?.value) {
    return null;
  }

  return JSON.parse(row.value);
}

export function saveState(key, state) {
  getDb().runSync(
    "INSERT OR REPLACE INTO kv (key, value) VALUES (?, ?)",
    key,
    JSON.stringify(state)
  );
}
