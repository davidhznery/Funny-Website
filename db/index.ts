import { mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { DatabaseSync } from "node:sqlite";

let database: DatabaseSync | undefined;

function databasePath() {
  return (
    process.env.DATABASE_PATH ??
    (process.env.NODE_ENV === "production"
      ? "/data/funny-website.sqlite"
      : join(process.cwd(), "data", "funny-website.sqlite"))
  );
}

export function getDb() {
  if (database) {
    return database;
  }

  const path = databasePath();
  mkdirSync(dirname(path), { recursive: true });

  database = new DatabaseSync(path);
  database.exec("PRAGMA journal_mode = WAL;");
  database.exec(`
    CREATE TABLE IF NOT EXISTS subscribers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL UNIQUE,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);

  return database;
}

export function addSubscriber(email: string) {
  return getDb()
    .prepare("INSERT OR IGNORE INTO subscribers (email) VALUES (?)")
    .run(email);
}
