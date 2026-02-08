export async function checkBackend(): Promise<boolean> {
  try {
    const res = await fetch("/api/db-smoke", {
      method: "GET",
      headers: { "accept": "application/json" },
      cache: "no-store",
    });
    return res.ok;
  } catch {
    return false;
  }
}
