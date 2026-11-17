import type { ReactNode } from "react";

import { Logo } from "@/components/navigation/logo";
import { cn } from "@/lib/utils";

/** Billet décoratif : illustre le produit, sans donnée réelle. */
function TicketPreview() {
  return (
    <div
      aria-hidden="true"
      className="bg-card text-card-foreground shadow-float flex w-72 -rotate-6 items-center gap-4 rounded-2xl p-5"
    >
      <div className="flex-1">
        <p className="text-muted-foreground font-mono text-[10px] tracking-widest uppercase">
          Entrée n° 01
        </p>
        <p className="font-display mt-2 text-xl font-extrabold">Nuit Fluo</p>
        <p className="text-muted-foreground mt-4 font-mono text-[10px] tracking-widest uppercase">
          Sam 28.11 à 21:00
        </p>
      </div>
      <span className="bg-primary text-primary-foreground grid size-12 shrink-0 place-items-center rounded-full font-mono text-xs font-bold">
        J-11
      </span>
    </div>
  );
}

const SIGN_UP_PERKS = [
  "Réserve en 3 gestes, billet QR dans ta poche",
  "Suis tes organisateurs préférés",
  "Sois prévenu dès qu'une place se libère",
];

function SignUpPerks() {
  return (
    <ul className="relative flex flex-col gap-3">
      {SIGN_UP_PERKS.map((perk) => (
        <li key={perk} className="max-w-sm rounded-2xl bg-white/15 px-4 py-3 text-sm font-bold">
          <span aria-hidden="true">✦ </span>
          {perk}
        </li>
      ))}
    </ul>
  );
}

type AuthLayoutProps = { variant: "sign-in" | "sign-up"; children: ReactNode };

const PANELS = {
  "sign-in": {
    panel: "bg-primary text-primary-foreground",
    topBlob: "bg-signal right-[-8rem] rounded-[45%_55%_60%_40%]",
    bottomBlob: "bg-primary-foreground/20 left-[-6rem]",
    headline: "Tous les événements de ta ville, dans ta poche.",
  },
  "sign-up": {
    panel: "bg-signal-text text-signal-foreground",
    topBlob: "bg-primary left-[-8rem] rounded-full",
    bottomBlob: "bg-signal right-[-4rem]",
    headline: "Rejoins ceux qui ne ratent plus rien.",
  },
} as const;

function BrandPanel({ variant }: Readonly<{ variant: AuthLayoutProps["variant"] }>) {
  const { panel, topBlob, bottomBlob, headline } = PANELS[variant];
  return (
    <aside
      className={cn(
        "relative hidden overflow-hidden rounded-r-[48px] lg:flex lg:flex-col lg:justify-between lg:p-10",
        panel,
      )}
    >
      <span aria-hidden="true" className={cn("absolute -top-24 size-[26rem]", topBlob)} />
      <span
        aria-hidden="true"
        className={cn("absolute bottom-[-8rem] size-[22rem] rounded-full", bottomBlob)}
      />
      <Logo inverted className="relative self-start" />
      <div className="relative flex flex-1 items-center justify-center">
        {variant === "sign-in" ? <TicketPreview /> : <SignUpPerks />}
      </div>
      <p className="font-display relative max-w-xs text-4xl leading-tight font-extrabold">
        {headline}
      </p>
    </aside>
  );
}

/** Mise en page des écrans de connexion et d'inscription : panneau de marque + formulaire. */
export function AuthLayout({ variant, children }: Readonly<AuthLayoutProps>) {
  return (
    <main className="grid min-h-0 flex-1 lg:grid-cols-2">
      <BrandPanel variant={variant} />
      <div className="flex items-center justify-center px-6 py-12">
        <div className="flex w-full max-w-sm flex-col gap-8">{children}</div>
      </div>
    </main>
  );
}
