import { cpSync, mkdirSync, existsSync, writeFileSync, readFileSync, readdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const content = join(root, "content");
const data = join(root, "public/data");
mkdirSync(data, { recursive: true });

function copyIfExists(name) {
  const src = join(content, name);
  if (existsSync(src)) {
    cpSync(src, join(data, name), { recursive: true });
  }
}

copyIfExists("projects.json");
copyIfExists("knowledge.json");
copyIfExists("career.json");
copyIfExists("skills.json");
copyIfExists("gallery.json");

// Build blog index from markdown frontmatter-lite
const blogDir = join(content, "blog");
const blogOut = join(root, "public/blog");
mkdirSync(blogOut, { recursive: true });
const posts = [];
if (existsSync(blogDir)) {
  for (const f of readdirSync(blogDir).filter((x) => x.endsWith(".md"))) {
    const raw = readFileSync(join(blogDir, f), "utf8");
    const slug = f.replace(/\.md$/, "");
    const title = (raw.match(/^#\s+(.+)$/m) || [, slug])[1];
    const tagsLine = raw.match(/^tags:\s*(.+)$/m);
    const tags = tagsLine ? tagsLine[1].split(",").map((t) => t.trim()) : [];
    const date = (raw.match(/^date:\s*(.+)$/m) || [, "2026-01-01"])[1];
    const summary = (raw.match(/^summary:\s*(.+)$/m) || [, ""])[1];
    const words = raw.split(/\s+/).length;
    const readingTime = Math.max(1, Math.round(words / 200));
    posts.push({ slug, title, tags, date, summary, readingTime, file: f });
    // Copy md for client fetch
    writeFileSync(join(blogOut, f), raw);
  }
}
posts.sort((a, b) => b.date.localeCompare(a.date));
writeFileSync(join(data, "blog.json"), JSON.stringify(posts, null, 2));
console.log("Content synced:", posts.length, "posts");
