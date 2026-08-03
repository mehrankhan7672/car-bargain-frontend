import { useEffect, useState } from "react";
import { Search, Moon, Sun, Bell } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export function useTheme() {
  const [dark, setDark] = useState(false);
  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);
  return { dark, setDark };
}

export function Topbar() {
  const { dark, setDark } = useTheme();
  return (
    <header className="sticky top-0 z-30 grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 border-b border-border bg-background/85 px-4 py-3 backdrop-blur">
      <SidebarTrigger className="shrink-0" />
      <div className="relative min-w-0">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Quick search — car, customer, dealer..."
          className="h-10 w-full rounded-xl pl-9 md:max-w-md"
        />
      </div>
      <div className="flex shrink-0 items-center gap-1.5">
        <Button variant="ghost" size="icon" className="rounded-xl" aria-label="Notifications">
          <Bell className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="rounded-xl"
          aria-label="Toggle theme"
          onClick={() => setDark(!dark)}
        >
          {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>
        <Avatar className="h-9 w-9 border border-gold/40">
          <AvatarFallback className="bg-gold-soft text-xs font-semibold text-gold-foreground">
            AR
          </AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}
