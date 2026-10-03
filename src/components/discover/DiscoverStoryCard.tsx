import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { BriefIcon } from "@/components/BriefIcon";
import { useApp } from "@/features/i18n/I18nProvider";
import { personalReason } from "@/features/discover/discoverEngine";
import { categoryKey } from "@/features/discover/useDiscoverFeed";
import type { DiscoverStory } from "@/features/discover/types";
import type { TranslationKey } from "@/features/i18n/translations";

export function formatDiscoverTime(iso: string, language: "bg" | "en") {
  return new Intl.DateTimeFormat(language === "bg" ? "bg-BG" : "en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", timeZone: "Europe/Sofia" }).format(new Date(iso));
}

export async function shareStory(story: DiscoverStory) {
  if (typeof navigator !== "undefined" && navigator.share) { try { await navigator.share({ title: story.headline, url: story.source.url }); return "shared"; } catch { return "cancelled"; } }
  await navigator.clipboard?.writeText(story.source.url);
  return "copied";
}

export function whyText(story: DiscoverStory, t: (key: TranslationKey) => string) {
  const reason = personalReason(story);
  if (!reason) return t("discoverReasonGeneral");
  if (reason.kind === "category") return t("discoverReasonCategory").replace("{x}", t(categoryKey(reason.category)));
  if (reason.kind === "saved") return t("discoverReasonSaved").replace("{x}", t(categoryKey(reason.category)));
  if (reason.kind === "source") return t("discoverReasonSource").replace("{x}", reason.source);
  return t("discoverReasonGeneral");
}

interface Props {
  story: DiscoverStory;
  variant?: "top" | "default";
  saved: boolean;
  personalized: boolean;
  onSave: () => void;
  onHide: () => void;
  onNotInterested: () => void;
  onOpen?: () => void;
}

export function DiscoverStoryCard({ story, variant = "default", saved, personalized, onSave, onHide, onNotInterested, onOpen }: Props) {
  const { t, language } = useApp();
  const [menu, setMenu] = useState(false);
  const [note, setNote] = useState<string | null>(null);
  const top = variant === "top";

  return (
    <article className={top ? "discover-card discover-card-top" : "discover-card"}>
      <Link to="/news/$storyId" params={{ storyId: story.id }} onClick={onOpen} className="block rounded-[inherit] focus-visible:outline-2 focus-visible:outline-primary">
        {story.imageUrl && (top || story.important) && <img src={story.imageUrl} alt="" width={1024} height={640} loading={top ? "eager" : "lazy"} className="discover-image" />}
        <div className="discover-body">
          <p className="discover-meta-top">
            <span className="text-primary">{top ? t("discoverTopStory") : t(categoryKey(story.category))}</span>
            {story.important && <span className="discover-important"><BriefIcon name="important" size={12} />{t("discoverImportant")}</span>}
          </p>
          <h2 className={top ? "discover-headline discover-headline-top" : "discover-headline"}>{story.headline}</h2>
          <p className="discover-summary">{story.summary}</p>
          <p className="discover-source">
            <span>{t("discoverSource")}: {story.source.name}</span><span aria-hidden="true">·</span>
            <time dateTime={story.publishedAt}>{formatDiscoverTime(story.publishedAt, language)}</time><span aria-hidden="true">·</span>
            <span>{story.readingMinutes} {t("discoverMinRead")}</span>
          </p>
        </div>
      </Link>
      <div className="discover-actions">
        {story.aiSummary && <span className="discover-ai"><BriefIcon name="aiInsight" size={12} />{t("discoverAiSummary")}</span>}
        <div className="ml-auto flex items-center gap-0.5">
          <button type="button" className="discover-icon-btn" aria-pressed={saved} aria-label={saved ? t("discoverSaved") : t("discoverSave")} onClick={onSave}><BriefIcon name={saved ? "bookmarked" : "bookmark"} size={17} /></button>
          <button type="button" className="discover-icon-btn" aria-label={t("discoverShare")} onClick={async () => { if ((await shareStory(story)) === "copied") setNote(t("discoverCopied")); }}><BriefIcon name="share" size={17} /></button>
          <button type="button" className="discover-icon-btn" aria-label={t("discoverMore")} aria-expanded={menu} onClick={() => setMenu((v) => !v)}><BriefIcon name="more" size={17} /></button>
        </div>
      </div>
      {menu && (
        <div className="discover-menu">
          {personalized && <button type="button" onClick={() => setNote(whyText(story, t))}><BriefIcon name="info" size={15} />{t("discoverWhy")}</button>}
          <button type="button" onClick={onHide}><BriefIcon name="hide" size={15} />{t("discoverHide")}</button>
          <button type="button" onClick={onNotInterested}><BriefIcon name="notInterested" size={15} />{t("discoverNotInterested")}</button>
        </div>
      )}
      {note && <p role="status" className="discover-note">{note}</p>}
    </article>
  );
}
