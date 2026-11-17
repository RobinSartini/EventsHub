import { createFromSource } from "fumadocs-core/search/server";

import { source } from "@/lib/source";

import type { Route } from "./+types/search";

const server = createFromSource(source, {
  language: "french",
});

export async function loader({ request }: Route.LoaderArgs) {
  return server.GET(request);
}
