import { useEffect } from "react";
import { useBriefing } from "@/features/briefing/useBriefing";
import { resolveBriefingPeriod } from "@/features/briefing/briefingScheduler";
import { useApp } from "@/features/i18n/I18nProvider";
import { briefingToNowBarContent } from "./nowBarMapping";
import { nowBarAdapter } from "./providers";

/** Renders nothing. Pushes the current briefing state to the Now Bar adapter (a no-op on the web). */
export function NowBarSync() {
  const { briefingType, briefingLanguage } = useApp();
  const briefing = useBriefing(briefingType);
  useEffect(() => {
    const now = new Date(briefing.generatedAt);
    void nowBarAdapter.update(briefingToNowBarContent(briefing, briefingType === "evening" ? "evening" : resolveBriefingPeriod(now) === "evening" ? "morning" : resolveBriefingPeriod(now), briefingLanguage, now));
  }, [briefing, briefingType, briefingLanguage]);
  return null;
}
