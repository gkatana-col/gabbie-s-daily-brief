import { Link } from "@tanstack/react-router";
import { BriefIcon } from "@/components/BriefIcon";
import { useApp } from "@/features/i18n/I18nProvider";
import { useDiscoverPreferences } from "@/features/discover/DiscoverPreferences";
import { categoryKey } from "@/features/discover/useDiscoverFeed";
import type { DiscoverStory } from "@/features/discover/types";
import { formatDiscoverTime, shareStory } from "./DiscoverStoryCard";

export function DiscoverArticleView({ story }: { story: DiscoverStory | undefined }) {
  const { t, language } = useApp();
  const { preferences, toggleSaved } = useDiscoverPreferences();
  const back = <Link to="/news" className="discover-back"><BriefIcon name="back" size={17} />{t("discoverBack")}</Link>;
  if (!story) return <div className="pt-3">{back}<p className="mt-8 text-muted-foreground">{t("discoverNotFound")}</p></div>;
  const saved = preferences.savedStories.includes(story.id);

  return (
    <article className="mx-auto max-w-2xl pt-3">
      <div className="flex items-center justify-between">
        {back}
        <div className="flex gap-0.5">
          <button type="button" className="discover-icon-btn" aria-pressed={saved} aria-label={saved ? t("discoverSaved") : t("discoverSave")} onClick={() => toggleSaved(story.id)}><BriefIcon name={saved ? "bookmarked" : "bookmark"} size={18} /></button>
          <button type="button" className="discover-icon-btn" aria-label={t("discoverShare")} onClick={() => void shareStory(story)}><BriefIcon name="share" size={18} /></button>
        </div>
      </div>
      <p className="mt-6 text-xs font-semibold text-primary">{t(categoryKey(story.category))}</p>
      <h1 className="mt-2 font-display text-[28px] font-semibold leading-tight sm:text-4xl">{story.headline}</h1>
      <p className="discover-source mt-3">
        <span>{t("discoverSource")}: {story.source.name}</span><span aria-hidden="true">·</span>
        <time dateTime={story.publishedAt}>{formatDiscoverTime(story.publishedAt, language)}</time><span aria-hidden="true">·</span>
        <span>{story.readingMinutes} {t("discoverMinRead")}</span>
      </p>
      {story.imageUrl && <img src={story.imageUrl} alt="" width={1024} height={640} className="discover-image mt-5 rounded-2xl" />}

      <section className="brief-card summary-card mt-6">
        <p className="discover-ai"><BriefIcon name="aiInsight" size={12} />{t("discoverAiSummary")}</p>
        <p className="mt-3 text-[16px] leading-relaxed">{story.summary}</p>
        <p className="mt-3 text-xs text-muted-foreground">{t("discoverAiDisclaimer")}</p>
      </section>

      {story.whyItMatters && (
        <section className="brief-card insight-card mt-4">
          <h2 className="font-display text-base font-semibold">{t("discoverWhyItMatters")}</h2>
          <p className="mt-2 text-[15px] leading-relaxed">{story.whyItMatters}</p>
          <p className="mt-2 text-xs text-muted-foreground">{t("discoverInterpretation")}</p>
        </section>
      )}

      {story.keyPoints.length > 0 && (
        <section className="mt-6">
          <h2 className="font-display text-base font-semibold">{t("discoverKeyPoints")}</h2>
          <ul className="mt-3 space-y-2.5">{story.keyPoints.map((point) => <li key={point} className="flex gap-2.5 text-[15px] leading-relaxed"><span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />{point}</li>)}</ul>
        </section>
      )}

      {story.relatedSources.length > 0 && <p className="mt-5 text-sm text-muted-foreground">{t("discoverAlsoCovered")}: {story.relatedSources.join(", ")}</p>}

      <a href={story.source.url} target="_blank" rel="noopener noreferrer" className="discover-original mt-7">
        {t("discoverOpenOriginal")} · {story.source.name}<BriefIcon name="externalLink" size={16} />
      </a>
    </article>
  );
}
