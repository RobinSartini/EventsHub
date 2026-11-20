import { $ } from "bun";
import { appendFileSync, copyFileSync, existsSync, readFileSync } from "node:fs";

function keysOf(content: string) {
  return new Set(
    content
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith("#") && line.includes("="))
      .map((line) => line.slice(0, line.indexOf("="))),
  );
}

function syncEnv(examplePath: string, envPath: string) {
  if (!existsSync(envPath)) {
    copyFileSync(examplePath, envPath);
    console.log(`${envPath} créé à partir de ${examplePath}`);
    return;
  }
  const current = readFileSync(envPath, "utf8");
  const present = keysOf(current);
  const missing = readFileSync(examplePath, "utf8")
    .split(/\r?\n/)
    .filter((line) => /^[A-Z0-9_]+=/.test(line) && !present.has(line.slice(0, line.indexOf("="))));
  if (missing.length === 0) return;
  const separator = current.endsWith("\n") || current === "" ? "" : "\n";
  appendFileSync(envPath, separator + missing.join("\n") + "\n");
  console.log(`${envPath} : ajouté ${missing.map((line) => line.split("=")[0]).join(", ")}`);
}

export async function prepare() {
  syncEnv(".env.example", ".env");
  syncEnv("apps/server/.env.example", "apps/server/.env");

  const docker = await $`docker info`.quiet().nothrow();
  if (docker.exitCode !== 0) {
    console.error("Docker ne répond pas : lancez Docker Desktop puis relancez la commande.");
    process.exit(1);
  }
}

export async function prepareDatabase() {
  await $`bun run db:start`;
  await $`bun run db:push`;

  const events =
    await $`docker exec EventsHub-postgres sh -c ${'psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -tAc "select count(*) from event"'}`
      .quiet()
      .text();
  if (events.trim() === "0") {
    await $`bun run db:seed`;
  }
}

export async function stopAppContainers() {
  await $`docker compose stop web server`.quiet().nothrow();
}
