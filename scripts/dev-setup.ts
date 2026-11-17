import { $ } from "bun";
import { copyFileSync, existsSync } from "node:fs";

const serverEnv = "apps/server/.env";
if (!existsSync(serverEnv)) {
  copyFileSync("apps/server/.env.example", serverEnv);
  console.log(`${serverEnv} créé à partir de .env.example`);
}

const dockerRunning = await $`docker info`.quiet().nothrow();
if (dockerRunning.exitCode !== 0) {
  console.error("Docker ne répond pas : lancez Docker Desktop puis relancez `bun dev`.");
  process.exit(1);
}

await $`bun run db:start`;
await $`bun run db:push`;

const events =
  await $`docker exec EventsHub-postgres psql -U postgres -d EventsHub -tAc "select count(*) from event"`
    .quiet()
    .text();
if (events.trim() === "0") {
  await $`bun run db:seed`;
}
