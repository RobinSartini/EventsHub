import { generateOGImage } from "fumadocs-ui/og/takumi";

import { appName } from "@/lib/shared";
import { source } from "@/lib/source";

import type { Route } from "./+types/og.docs";

export function loader({ params }: Route.LoaderArgs) {
  const slugs = params["*"]
    .split("/")
    .filter((v) => v.length > 0)
    .slice(0, -1);
  const page = source.getPage(slugs);

  if (!page) throw new Response(undefined, { status: 404 });

  return generateOGImage({
    title: page.data.title,
    description: page.data.description,
    site: appName,
    format: "webp",
  });
}
