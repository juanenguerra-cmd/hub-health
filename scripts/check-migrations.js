import fs from "node:fs";
import path from "node:path";

const dir = path.join(process.cwd(), "migrations");
if (!fs.existsSync(dir)) process.exit(0);

const files = fs.readdirSync(dir).filter(f => f.endsWith(".sql"));
let bad = [];

for (const f of files) {
  const p = path.join(dir, f);
  const sql = fs.readFileSync(p, "utf8");

  if (sql.includes("...")) bad.push(`${f}: contains "..." placeholder`);
  if (!/create\s+table/i.test(sql)) bad.push(`${f}: no CREATE TABLE found`);
}

if (bad.length) {
  console.error("Migration sanity check failed:\n" + bad.map(x => `- ${x}`).join("\n"));
  process.exit(1);
}

console.log("Migration sanity check OK");
