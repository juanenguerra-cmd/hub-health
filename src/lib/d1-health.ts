/// <reference types="@cloudflare/workers-types" />

type D1HardCheckResult = {
  ok: boolean;
  envTag: string;
  insertedId?: number;
  readBackId?: number;
  error?: string;
};

type SqliteVersionResult = {
  version: string | null;
};

type TableRow = {
  name: string;
};

type D1LivenessResult = {
  ok: boolean;
  tablesFound: string[];
  writeOk: boolean;
  readOk: boolean;
  error?: string;
};

const getProcessEnv = (): Record<string, string | undefined> | undefined => {
  if (typeof process !== 'undefined' && process?.env) {
    return process.env as Record<string, string | undefined>;
  }
  return undefined;
};

export const resolveEnvTag = (env?: Record<string, string | undefined>): string => {
  const processEnv = getProcessEnv();
  return (
    processEnv?.ENV_TAG ??
    processEnv?.CF_PAGES_BRANCH ??
    processEnv?.NODE_ENV ??
    env?.ENV_TAG ??
    env?.CF_PAGES_BRANCH ??
    env?.NODE_ENV ??
    'unknown'
  );
};

export const runD1HardCheck = async (
  db: D1Database | undefined,
  envTag: string
): Promise<D1HardCheckResult> => {
  if (!db) {
    return {
      ok: false,
      envTag,
      error: 'missing DB binding'
    };
  }

  try {
    const insert = await db
      .prepare('INSERT INTO __sync_probe (env) VALUES (?1)')
      .bind(envTag)
      .run();

    const insertedId =
      typeof insert.meta?.last_row_id === 'number' ? insert.meta.last_row_id : undefined;

    if (!insertedId) {
      return {
        ok: false,
        envTag,
        error: 'insert did not return last_row_id'
      };
    }

    const row = await db
      .prepare('SELECT id, env FROM __sync_probe ORDER BY id DESC LIMIT 1')
      .first<{ id: number; env: string }>();

    if (!row) {
      return {
        ok: false,
        envTag,
        insertedId,
        error: 'read-back row missing'
      };
    }

    const ok = row.id === insertedId && row.env === envTag;

    return {
      ok,
      envTag,
      insertedId,
      readBackId: row.id,
      error: ok ? undefined : 'read-back mismatch'
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return {
      ok: false,
      envTag,
      error: message
    };
  }
};

export const runD1LivenessCheck = async (
  db: D1Database | undefined,
  envTag: string,
  expectedTables: string[]
): Promise<D1LivenessResult> => {
  if (!db) {
    return {
      ok: false,
      tablesFound: [],
      writeOk: false,
      readOk: false,
      error: 'missing DB binding'
    };
  }

  try {
    const placeholders = expectedTables.map((_, index) => `?${index + 1}`).join(', ');
    const { results } = await db
      .prepare(
        `SELECT name FROM sqlite_master WHERE type='table' AND name IN (${placeholders})`
      )
      .bind(...expectedTables)
      .all<TableRow>();

    const tablesFound = (results ?? []).map((row) => row.name);
    const schemaOk = tablesFound.length === expectedTables.length;

    const insert = await db
      .prepare('INSERT INTO __sync_probe (env) VALUES (?1)')
      .bind(envTag)
      .run();

    const insertedId =
      typeof insert.meta?.last_row_id === 'number' ? insert.meta.last_row_id : undefined;

    const writeOk = Boolean(insertedId);
    let readOk = false;

    if (insertedId) {
      const row = await db
        .prepare('SELECT id, env FROM __sync_probe WHERE id = ?1')
        .bind(insertedId)
        .first<{ id: number; env: string }>();
      readOk = Boolean(row && row.id === insertedId && row.env === envTag);
    }

    const ok = schemaOk && writeOk && readOk;

    return {
      ok,
      tablesFound,
      writeOk,
      readOk,
      error: ok
        ? undefined
        : !schemaOk
          ? `missing tables: ${expectedTables.filter((table) => !tablesFound.includes(table)).join(', ')}`
          : !writeOk
            ? 'write failed'
            : 'read failed'
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return {
      ok: false,
      tablesFound: [],
      writeOk: false,
      readOk: false,
      error: message
    };
  }
};

export const getSqliteVersion = async (
  db: D1Database
): Promise<SqliteVersionResult> => {
  const row = await db
    .prepare('SELECT sqlite_version() as version')
    .first<{ version: string }>();
  return { version: row?.version ?? null };
};

export const listTables = async (db: D1Database, limit = 50): Promise<TableRow[]> => {
  const { results } = await db
    .prepare("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name LIMIT ?1")
    .bind(limit)
    .all<TableRow>();
  return results ?? [];
};

export const getMigrationStatus = async (
  db: D1Database
): Promise<{
  ok: boolean;
  message?: string;
  migrations?: Array<Record<string, unknown>>;
}> => {
  try {
    const table = await db
      .prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='d1_migrations'")
      .first<{ name: string }>();

    if (!table) {
      return {
        ok: false,
        message: 'd1_migrations table not found'
      };
    }

    const { results } = await db.prepare('SELECT * FROM d1_migrations ORDER BY id').all();
    return {
      ok: true,
      migrations: results ?? []
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return {
      ok: false,
      message
    };
  }
};
