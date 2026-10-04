import { Link } from "@tanstack/react-router";
import { BriefIcon, type BriefIconName } from "@/components/BriefIcon";
import { useApp } from "@/features/i18n/I18nProvider";

const navItems: ReadonlyArray<{ to: "/" | "/today" | "/news" | "/calendar" | "/settings"; key: "home" | "today" | "news" | "calendar" | "settings"; icon: BriefIconName; exact: boolean }> = [
  { to: "/", key: "home", icon: "home", exact: true },
  { to: "/today", key: "today", icon: "morning", exact: false },
  { to: "/news", key: "news", icon: "news", exact: false },
  { to: "/calendar", key: "calendar", icon: "calendar", exact: false },
  { to: "/settings", key: "settings", icon: "settings", exact: false },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const { t } = useApp();
  return <div className="min-h-dvh bg-background text-foreground"><main className="mx-auto min-h-dvh w-full max-w-5xl px-4 pb-32 pt-[max(1.25rem,env(safe-area-inset-top))] sm:px-7 md:pb-28 md:pt-8">{children}</main><nav aria-label={t("brand")} className="bottom-nav"><div className="mx-auto grid max-w-lg grid-cols-5">{navItems.map(({ to, key, icon, exact }) => <Link key={to} to={to} activeOptions={{ exact }} className="nav-item" activeProps={{ className: "nav-item nav-item-active" }}><BriefIcon name={icon} size={19} /><span>{t(key)}</span></Link>)}</div></nav></div>;
}
