export async function isBackendAlive(): Promise<boolean> {
  try {
    // prefer /api/health; fallback to /api/db-smoke if you want
    const res = await fetch("/api/health", { cache: "no-store" });
    if (res.ok) return true;

    // fallback (optional): db-smoke exists already
    // const res2 = await fetch("/api/db-smoke", { cache: "no-store" });
    // return res2.ok;

    return false;
  } catch {
    return false;
  }
}
