// Build guard: fails if any [VERIFY] placeholder is still present in a page.
// Run this before publishing - there is no CI/build pipeline in this project,
// so this must be run manually (see CLAUDE.md).
//
// Usage: node check-verify.mjs
import fs from "node:fs";
import path from "node:path";

const ROOT = path.dirname(new URL(import.meta.url).pathname);
// Matches the bare "[VERIFY]" marker as well as descriptive variants like
// "[VERIFY: location 2 - ...]" or "[VERIFY - cover type and limits]".
const MARKER = "[VERIFY";

function findHtmlFiles(dir) {
  const results = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === "node_modules" || entry.name.startsWith(".")) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...findHtmlFiles(full));
    } else if (entry.name.endsWith(".html")) {
      results.push(full);
    }
  }
  return results;
}

const files = findHtmlFiles(ROOT);
let totalMatches = 0;

for (const file of files) {
  const lines = fs.readFileSync(file, "utf8").split("\n");
  lines.forEach((line, i) => {
    if (line.includes(MARKER)) {
      totalMatches++;
      console.log(`${path.relative(ROOT, file)}:${i + 1}: ${line.trim()}`);
    }
  });
}

if (totalMatches > 0) {
  console.error(`\n${totalMatches} [VERIFY] placeholder(s) found. Do not publish until these are resolved.`);
  process.exit(1);
} else {
  console.log("No [VERIFY] placeholders found.");
  process.exit(0);
}
