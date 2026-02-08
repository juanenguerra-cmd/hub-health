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
      const result = await env.DB.prepare("SELECT 1 as ok").first();
      return jsonResponse({ status: "ok", db: result?.ok ?? 0 });
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
