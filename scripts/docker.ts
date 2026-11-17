import { $ } from "bun";

import { prepare, prepareDatabase } from "./stack";

async function up() {
  await prepare();
  await prepareDatabase();
  await $`docker compose up -d --build --wait`;
  console.log("\nWeb : http://localhost:3000\nAPI : http://localhost:3001");
}

async function down() {
  await $`docker compose down`;
}

async function reset() {
  const answer = prompt(
    "Supprimer les conteneurs, les images et la base EventsHub (toutes les données) ? Tapez oui :",
  );
  if (answer?.trim().toLowerCase() !== "oui") {
    console.log("Annulé.");
    return;
  }
  await $`docker compose down --volumes --rmi local --remove-orphans`;
  await prepare();
  await prepareDatabase();
  await $`docker compose build --no-cache`;
  await $`docker compose up -d --wait`;
  console.log("\nWeb : http://localhost:3000\nAPI : http://localhost:3001");
}

const commands: Record<string, () => Promise<void>> = { up, down, reset };
const command = commands[process.argv[2] ?? ""];
if (!command) {
  console.error("Usage : bun scripts/docker.ts <up|down|reset>");
  process.exit(1);
}
await command();
