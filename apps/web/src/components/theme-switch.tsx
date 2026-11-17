import { useTheme } from "@/components/theme-provider";
import { Switch } from "@/components/ui/switch";

function useDarkTheme() {
  const { resolvedTheme, setTheme } = useTheme();
  const setDark = (dark: boolean) => setTheme(dark ? "dark" : "light");
  return [resolvedTheme === "dark", setDark] as const;
}

function ThemeSwitch({ className }: Readonly<{ className?: string }>) {
  const [dark, setDark] = useDarkTheme();
  return (
    <Switch label="Thème sombre" checked={dark} onCheckedChange={setDark} className={className} />
  );
}

export { ThemeSwitch, useDarkTheme };
