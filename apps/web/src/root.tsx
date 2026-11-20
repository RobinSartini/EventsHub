import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

import "@fontsource-variable/jetbrains-mono";
import "@fontsource-variable/nunito-sans";
import "@fontsource-variable/unbounded";
import "./index.css";
import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLocation,
  useNavigate,
} from "react-router";

import type { Route } from "./+types/root";

import { ThemeProvider } from "./components/theme-provider";
import { HomeSearch } from "./components/navigation/home-search";
import { NavBar } from "./components/navigation/navbar";
import { Toaster } from "./components/ui/sonner";
import { authClient } from "./lib/auth-client";
import { queryClient } from "./utils/trpc";

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

function AppNavBar() {
  const { data: session } = authClient.useSession();
  const navigate = useNavigate();
  const isHome = useLocation().pathname === "/";
  const user = session?.user ? { name: session.user.name } : null;
  const signOut = () => authClient.signOut({ fetchOptions: { onSuccess: () => navigate("/") } });
  return (
    <NavBar
      user={user}
      onSignOut={signOut}
      className={isHome ? "relative z-10 border-b-0" : undefined}
    >
      {isHome ? <HomeSearch /> : null}
    </NavBar>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider
        attribute="class"
        defaultTheme="dark"
        disableTransitionOnChange
        storageKey="vite-ui-theme"
      >
        <div className="grid grid-rows-[auto_1fr] h-svh">
          <AppNavBar />
          <Outlet />
        </div>
        <Toaster richColors />
      </ThemeProvider>

      <ReactQueryDevtools position="bottom" buttonPosition="bottom-right" />
    </QueryClientProvider>
  );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = "Oops!";
  let details = "An unexpected error occurred.";
  let stack: string | undefined;
  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : "Error";
    details =
      error.status === 404 ? "The requested page could not be found." : error.statusText || details;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }
  return (
    <main className="pt-16 p-4 container mx-auto">
      <h1>{message}</h1>
      <p>{details}</p>
      {stack && (
        <pre className="w-full p-4 overflow-x-auto">
          <code>{stack}</code>
        </pre>
      )}
    </main>
  );
}
