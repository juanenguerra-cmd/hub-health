/// <reference types="@cloudflare/workers-types" />

type Env = {
  DB: D1Database;
};

const jsonResponse = (data: unknown, init?: ResponseInit) =>
  new Response(JSON.stringify(data, null, 2), {
    headers: {
      "content-type": "application/json; charset=utf-8",
    },
    ...init,
  });

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === "/api/health") {
      const errors: Array<{ step: string; type: string; message: string }> = [];
      const binding = "DB";
      let connectivity: "PASS" | "FAIL" = "FAIL";
      let write: "PASS" | "FAIL" = "FAIL";
      let read: "PASS" | "FAIL" = "FAIL";
      let lastId: number | null = null;

      const recordError = (step: string, error: unknown, typeOverride?: string) => {
        const message = error instanceof Error ? error.message : String(error);
        const type =
          typeOverride ??
          (message.toLowerCase().includes("permission") ||
          message.toLowerCase().includes("not authorized")
            ? "permission"
            : message.toLowerCase().includes("sql") ||
                message.toLowerCase().includes("syntax") ||
                message.toLowerCase().includes("no such table")
              ? "sql"
              : "unknown");

        console.error(`[d1-health] ${step} error`, error);
        errors.push({ step, type, message });
      };

      if (!env.DB) {
        recordError("binding", "DB binding is missing", "missing_binding");
        return jsonResponse(
          {
            binding,
            connectivity,
            write,
            read,
            errors,
          },
          { status: 500 }
        );
      }

      try {
        await env.DB.prepare("SELECT 1 as ok").first();
        connectivity = "PASS";
      } catch (error) {
        recordError("connectivity", error);
      }

      if (connectivity === "PASS") {
        try {
          await env.DB.prepare(
            "CREATE TABLE IF NOT EXISTS d1_health_check (id INTEGER PRIMARY KEY, ts TEXT)"
          ).run();
        } catch (error) {
          recordError("create_table", error);
        }

        try {
          const insert = await env.DB.prepare(
            "INSERT INTO d1_health_check (ts) VALUES (CURRENT_TIMESTAMP)"
          ).run();
          lastId = typeof insert.meta?.last_row_id === "number" ? insert.meta.last_row_id : null;
          write = lastId ? "PASS" : "FAIL";
          if (!lastId) {
            recordError("insert", "Insert did not return a row id", "sql");
          }
        } catch (error) {
          recordError("insert", error);
        }

        if (lastId) {
          try {
            const row = await env.DB.prepare(
              "SELECT id, ts FROM d1_health_check WHERE id = ?1"
            )
              .bind(lastId)
              .first();
            if (row) {
              read = "PASS";
            } else {
              recordError("read", "Inserted row not found", "sql");
            }
          } catch (error) {
            recordError("read", error);
          }

          try {
            await env.DB.prepare("DELETE FROM d1_health_check WHERE id < ?1")
              .bind(lastId)
              .run();
          } catch (error) {
            recordError("cleanup", error);
          }
        } else {
          recordError("read", "Read skipped due to failed insert", "sql");
        }
      } else {
        recordError("write", "Write skipped due to failed connectivity", "missing_binding");
        recordError("read", "Read skipped due to failed connectivity", "missing_binding");
      }

      return jsonResponse({
        binding,
        connectivity,
        write,
        read,
        errors,
      });
    }

    if (url.pathname === "/api/notes" && request.method === "GET") {
      const { results } = await env.DB.prepare(
        "SELECT id, body, created_at FROM notes ORDER BY created_at DESC"
      ).all();
      return jsonResponse({ notes: results ?? [] });
    }

    if (url.pathname === "/api/notes" && request.method === "POST") {
      const payload = await request.json<{ body?: string }>().catch(() => ({}));
      if (!payload.body?.trim()) {
        return jsonResponse({ error: "body is required" }, { status: 400 });
      }

      const body = payload.body.trim();
      const insert = await env.DB.prepare(
        "INSERT INTO notes (body) VALUES (?1) RETURNING id, body, created_at"
      )
        .bind(body)
        .first();

      return jsonResponse({ note: insert }, { status: 201 });
    }

    return jsonResponse({ error: "Not found" }, { status: 404 });
  },
};
