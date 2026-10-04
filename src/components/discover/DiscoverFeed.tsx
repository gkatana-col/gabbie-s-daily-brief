import { useState } from "react";
import { BriefIcon } from "@/components/BriefIcon";
import { useApp } from "@/features/i18n/I18nProvider";
import { useDiscoverPreferences } from "@/features/discover/DiscoverPreferences";
import { useDiscoverFeed, type DiscoverFeedStatus } from "@/features/discover/useDiscoverFeed";
import type { DiscoverCategoryFilter } from "@/features/discover/types";
import { DiscoverCategoryTabs } from "./DiscoverCategoryTabs";
import { DiscoverStoryCard, formatDiscoverTime } from "./DiscoverStoryCard";

const FEED_LIMIT = 7;
type DevState = "normal" | "loading" | "empty" | "offline" | "error";

export function DiscoverFeed() {
  const { t, language, user, setInterfaceLanguage, setTheme } = useApp();
  const { preferences, toggleSaved, hide, notInterested, markRead, setPersonalization } = useDiscoverPreferences();
  const { stories, status, refresh, categories, now } = useDiscoverFeed();
  const [category, setCategory] = useState<DiscoverCategoryFilter>("all");
  const [devState, setDevState] = useState<DevState>("normal");

  const effectiveStatus: DiscoverFeedStatus = devState === "loading" ? "loading" : devState === "offline" ? "offline" : devState === "error" ? "error" : status;
  const visible = devState === "empty" ? [] : (category === "all" ? stories : stories.filter((s) => s.category === category)).slice(0, FEED_LIMIT);

  return (
    <div className="discover-page">
      <header className="mb-5 pt-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="mb-2 text-xs font-semibold uppercase text-primary">Brief</p>
            <h1 className="font-display text-3xl font-semibold">{t("discoverTitle")}</h1>
            <p className="mt-1.5 text-[15px] text-muted-foreground">{t("discoverSubtitle")} · <time dateTime={now}>{formatDiscoverTime(now, language)}</time></p>
          </div>
          <button type="button" onClick={() => void refresh()} className="discover-icon-btn mt-6" aria-label={t("discoverRefresh")} disabled={effectiveStatus === "loading"}>
            <BriefIcon name="refresh" size={18} className={effectiveStatus === "loading" ? "animate-spin" : undefined} />
          </button>
        </div>
        <button type="button" role="switch" aria-checked={preferences.personalizationEnabled} onClick={() => setPersonalization(!preferences.personalizationEnabled)} className="dynamic-pill mt-3">
          <BriefIcon name={preferences.personalizationEnabled ? "aiInsight" : "discover"} size={13} />
          {preferences.personalizationEnabled ? t("discoverPersonalized") : t("discoverUnpersonalized")}
        </button>
      </header>

      <DiscoverCategoryTabs categories={categories} value={category} onChange={setCategory} />

      {effectiveStatus === "offline" && <p role="status" className="discover-banner"><BriefIcon name="offline" size={16} />{t("discoverOffline")}</p>}
      {effectiveStatus === "error" && (
        <div role="alert" className="discover-banner">
          <div className="min-w-0 flex-1"><p className="font-semibold text-foreground">{t("discoverErrorTitle")}</p><p>{t("discoverErrorBody")}</p></div>
          <button type="button" className="discover-tab" onClick={() => { setDevState("normal"); void refresh(); }}>{t("discoverRetry")}</button>
        </div>
      )}

      {effectiveStatus === "loading" ? (
        <div aria-busy="true" className="mt-4 space-y-4">
          <p className="sr-only">{t("discoverLoading")}</p>
          {[0, 1, 2].map((i) => <div key={i} className="discover-card discover-skeleton"><div className="h-3 w-24 rounded-full bg-muted" /><div className="mt-3 h-5 w-11/12 rounded-full bg-muted" /><div className="mt-2 h-5 w-2/3 rounded-full bg-muted" /><div className="mt-4 h-3 w-1/2 rounded-full bg-muted" /></div>)}
        </div>
      ) : visible.length === 0 ? (
        <div className="discover-card mt-4 p-8 text-center">
          <span className="icon-well mx-auto"><BriefIcon name="discover" /></span>
          <h2 className="mt-3 font-display text-lg font-semibold">{t("discoverEmptyTitle")}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{t("discoverEmptyBody")}</p>
        </div>
      ) : (
        <div className="discover-grid mt-4">
          {visible.map((story, index) => (
            <DiscoverStoryCard key={story.id} story={story} variant={index === 0 && category === "all" ? "top" : "default"}
              saved={preferences.savedStories.includes(story.id)} personalized={preferences.personalizationEnabled}
              onSave={() => toggleSaved(story.id)} onHide={() => hide(story.id)} onNotInterested={() => notInterested(story.topicKey)} onOpen={() => markRead(story.id)} />
          ))}
        </div>
      )}

      {import.meta.env.DEV && (
        <details className="mt-8 rounded-2xl border border-dashed border-border p-4 text-xs text-muted-foreground">
          <summary className="cursor-pointer font-semibold">{t("discoverDevPreview")}</summary>
          <div className="mt-3 flex flex-wrap gap-2">
            <span className="w-full font-medium">{t("discoverDevState")}</span>
            {(["normal", "loading", "empty", "offline", "error"] as const).map((s) => (
              <button key={s} type="button" className={devState === s ? "discover-tab discover-tab-active" : "discover-tab"} onClick={() => setDevState(s)}>{t(`discoverState${s.charAt(0).toUpperCase()}${s.slice(1)}` as "discoverStateNormal")}</button>
            ))}
            <span className="w-full" />
            <button type="button" className="discover-tab" onClick={() => setInterfaceLanguage(language === "bg" ? "en" : "bg")}>{language === "bg" ? "English" : "Български"}</button>
            <button type="button" className="discover-tab" onClick={() => setTheme(user.theme === "dark" ? "light" : "dark")}>{user.theme === "dark" ? t("light") : t("dark")}</button>
            <button type="button" className="discover-tab" onClick={() => void refresh()}>{t("discoverRefresh")}</button>
          </div>
        </details>
      )}
    </div>
  );
}
