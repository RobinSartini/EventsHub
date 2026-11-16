import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";

const html = readFileSync(process.argv[2]!, "utf8");

const hashes = [...html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/g)]
  .map((match) => match[1]!)
  .filter((content) => content.length > 0)
  .map((content) => `'sha256-${createHash("sha256").update(content).digest("base64")}'`);

console.log(hashes.join(" "));
