import { cpSync, mkdirSync, existsSync, readdirSync, copyFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const src = join(root, "src/js");
const dest = join(root, "public/js");
mkdirSync(dest, { recursive: true });
for (const f of readdirSync(src)) {
  if (f.endsWith(".js")) copyFileSync(join(src, f), join(dest, f));
}
console.log("JS copied to public/js");
