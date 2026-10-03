import { CalendarDays, Home, Newspaper, Settings, SunMedium } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useApp } from "@/features/i18n/I18nProvider";

const navItems = [
  { to: "/", key: "home", icon: Home, exact: true },
  { to: "/today", key: "today", icon: SunMedium },
  { to: "/news", key: "news", icon: Newspaper },
  { to: "/calendar", key: "calendar", icon: CalendarDays },
  { to: "/settings", key: "settings", icon: Settings },
] as const;

export function AppShell({ children }: { children: React.ReactNode }) {
  const { t } = useApp();
  return <div className="min-h-dvh bg-background text-foreground"><main className="mx-auto min-h-dvh w-full max-w-5xl px-4 pb-32 pt-[max(1.25rem,env(safe-area-inset-top))] sm:px-7 md:pb-28 md:pt-8">{children}</main><nav aria-label={t("brand")} className="bottom-nav"><div className="mx-auto grid max-w-lg grid-cols-5">{navItems.map(({ to, key, icon: Icon, exact }) => <Link key={to} to={to} activeOptions={{ exact }} className="nav-item" activeProps={{ className: "nav-item nav-item-active" }}><Icon size={20} strokeWidth={2} /><span>{t(key)}</span></Link>)}</div></nav></div>;
}
