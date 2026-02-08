-- 0004_create_schema.sql
-- Purpose: create a minimal app schema + a durable “DB is alive” table
-- NOTE: avoid placeholders like "..." — D1 runs real SQLite.

PRAGMA foreign_keys = ON;

-- Track app schema version (handy for debugging)
CREATE TABLE IF NOT EXISTS app_meta (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

INSERT OR IGNORE INTO app_meta (key, value) VALUES ('schema_version', '0004');

-- Proof-of-life table (for dashboard movement and liveness checks)
CREATE TABLE IF NOT EXISTS sync_probe (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  note TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Optional: seed one row so you immediately see “rows written”
INSERT INTO sync_probe (note) VALUES ('migration 0004 applied');
