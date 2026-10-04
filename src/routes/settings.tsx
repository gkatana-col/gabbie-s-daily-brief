import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PageHeader } from "./today";
import { BriefIcon, type BriefIconName } from "@/components/BriefIcon";
import { useApp } from "@/features/i18n/I18nProvider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { nativeBridge } from "@/features/native/nativeBridge";
import type { LanguagePreference, ThemePreference, User } from "@/features/briefing/types";

type LiveNotificationTestHook = Record<"requestPermission" | "start" | "update" | "stop", () => Promise<unknown>>;
function getLiveNotificationTestHook(): LiveNotificationTestHook | undefined {
  if (typeof window === "undefined") return undefined;
  return (window as unknown as Record<string, unknown>)["briefLiveNotificationTest"] as LiveNotificationTestHook | undefined;
}

export const Route = createFileRoute("/settings")({ component: SettingsPage, head: () => ({ meta: [{ title: "Настройки — Brief" }, { name: "description", content: "Език, тема и известия за твоя Brief." }, { property: "og:title", content: "Настройки — Brief" }, { property: "og:description", content: "Персонализирай езика, темата и известията си." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" }] }) });

function SettingsPage() {
  const { t, user, setInterfaceLanguage, setBriefingLanguage, setTheme, setNotification } = useApp();
  const [widgetAppearance, setWidgetAppearance] = useState<"system" | "light" | "dark">("system");
  const isNative = nativeBridge.isNativeApp();

  useEffect(() => {
    if (isNative) void nativeBridge.getWidgetAppearance().then(setWidgetAppearance).catch(() => undefined);
  }, [isNative]);

  const updateWidgetAppearance = (value: string) => {
    const appearance = value as "system" | "light" | "dark";
    setWidgetAppearance(appearance);
    void nativeBridge.setWidgetAppearance(appearance).catch(() => undefined);
  };

  return <div><PageHeader title={t("settingsTitle")} subtitle={t("settingsSubtitle")} /><div className="space-y-5"><SettingsSection icon="language" title={t("language")}><SelectRow label={t("interfaceLanguage")} value={user.preferredLanguage} onValueChange={(value) => setInterfaceLanguage(value as LanguagePreference)} options={[["auto", t("automatic")], ["bg", t("bulgarian")], ["en", t("english")]]} /><SelectRow label={t("briefingLanguage")} value={user.briefingLanguage} onValueChange={(value) => setBriefingLanguage(value as User["briefingLanguage"])} options={[["same", t("sameAsInterface")], ["bg", t("bulgarian")], ["en", t("english")]]} /></SettingsSection><SettingsSection icon="theme" title={t("theme")} hint={t("appearanceHint")}><SelectRow label={t("theme")} value={user.theme} onValueChange={(value) => setTheme(value as ThemePreference)} options={[["system", t("system")], ["light", t("light")], ["dark", t("dark")]]} /></SettingsSection>{isNative && <SettingsSection icon="brief" title="Външен вид на Widget-а" hint="Тази настройка променя само Brief Widget-а."><SelectRow label="Тема на Widget-а" value={widgetAppearance} onValueChange={updateWidgetAppearance} options={[["system", "Системен"], ["light", "Светъл"], ["dark", "Тъмен"]]} /></SettingsSection>}<SettingsSection icon="briefUpdates" title={t("notifications")} hint={t("notificationsHint")}><ToggleRow label={t("morningBriefing")} checked={user.notificationPreferences.morningBriefing} onCheckedChange={(value) => setNotification("morningBriefing", value)} /><ToggleRow label={t("importantUpdates")} checked={user.notificationPreferences.importantUpdates} onCheckedChange={(value) => setNotification("importantUpdates", value)} /><ToggleRow label={t("eveningRecap")} checked={user.notificationPreferences.eveningRecap} onCheckedChange={(value) => setNotification("eveningRecap", value)} /></SettingsSection><LiveNotificationTestSection /></div></div>;
}

/** Development/debug-only trigger for the native Live Notification POC. Hidden in production web builds. */
function LiveNotificationTestSection() {
  const [status, setStatus] = useState<string>("—");
  if (!import.meta.env.DEV && !nativeBridge.isNativeApp()) return null;
  const hook = getLiveNotificationTestHook();
  if (!hook) return null;
  const run = (label: string, action: () => Promise<unknown>) => async () => {
    setStatus(`${label}…`);
    try {
      const result = await action();
      setStatus(`${label}: ${typeof result === "string" ? result : JSON.stringify(result)}`);
    } catch (error) {
      setStatus(`${label}: error — ${error instanceof Error ? error.message : String(error)}`);
    }
  };
  const buttons: ReadonlyArray<readonly [string, () => Promise<unknown>]> = [
    ["Request permission", hook.requestPermission],
    ["Start", hook.start],
    ["Update", hook.update],
    ["Stop", hook.stop],
  ];
  return (
    <section className="brief-card" data-testid="live-notification-test">
      <div className="mb-4 flex items-center gap-2.5"><span className="icon-well"><BriefIcon name="briefUpdates" /></span><h2 className="font-display text-base font-semibold">Live Notification Test</h2></div>
      <div className="grid grid-cols-2 gap-2">
        {buttons.map(([label, action]) => (
          <button key={label} type="button" onClick={run(label, action)} className="h-11 rounded-xl bg-secondary/60 text-sm font-medium transition-colors hover:bg-secondary">{label}</button>
        ))}
      </div>
      <p className="mt-4 break-words text-xs leading-5 text-muted-foreground" role="status">{status}</p>
    </section>
  );
}
function SettingsSection({ icon, title, hint, children }: { icon: BriefIconName; title: string; hint?: string; children: React.ReactNode }) { return <section className="brief-card"><div className="mb-4 flex items-center gap-2.5"><span className="icon-well"><BriefIcon name={icon} /></span><h2 className="font-display text-base font-semibold">{title}</h2></div><div className="divide-y divide-border">{children}</div>{hint && <p className="mt-4 text-xs leading-5 text-muted-foreground">{hint}</p>}</section>; }
function SelectRow({ label, value, onValueChange, options }: { label: string; value: string; onValueChange: (value: string) => void; options: ReadonlyArray<readonly [string, string]> }) { return <div className="grid grid-cols-[minmax(0,1fr)_148px] items-center gap-4 py-3 first:pt-0 last:pb-0"><label className="min-w-0 text-sm font-medium">{label}</label><Select value={value} onValueChange={onValueChange}><SelectTrigger aria-label={label} className="h-11 bg-secondary/60"><SelectValue /></SelectTrigger><SelectContent>{options.map(([optionValue, text]) => <SelectItem key={optionValue} value={optionValue}>{text}</SelectItem>)}</SelectContent></Select></div>; }
function ToggleRow({ label, checked, onCheckedChange }: { label: string; checked: boolean; onCheckedChange: (value: boolean) => void }) { return <div className="grid min-h-14 grid-cols-[minmax(0,1fr)_auto] items-center gap-4 py-2"><label className="min-w-0 text-sm font-medium">{label}</label><Switch aria-label={label} checked={checked} onCheckedChange={onCheckedChange} /></div>; }
