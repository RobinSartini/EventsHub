import { HomeLayout } from "fumadocs-ui/layouts/home";
import { Link } from "react-router";

import { baseOptions } from "@/lib/layout.shared";

import type { Route } from "./+types/home";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "EventsHub · Documentation" },
    { name: "description", content: "Documentation technique du projet EventsHub." },
  ];
}

export default function Home() {
  return (
    <HomeLayout {...baseOptions()}>
      <div className="p-4 flex flex-col items-center justify-center text-center flex-1">
        <h1 className="text-xl font-bold mb-2">Documentation EventsHub</h1>
        <p className="text-fd-muted-foreground mb-4">
          Démarrer le projet, comprendre son architecture et utiliser son API.
        </p>
        <Link
          className="text-sm bg-fd-primary text-fd-primary-foreground rounded-full font-medium px-4 py-2.5"
          to="/docs"
        >
          Ouvrir la documentation
        </Link>
      </div>
    </HomeLayout>
  );
}
