import { useEffect } from "react";
import { useBriefing } from "@/features/briefing/useBriefing";
import { useApp } from "@/features/i18n/I18nProvider";
import { briefingToNowBarContent } from "./nowBarMapping";
import { nowBarAdapter } from "./providers";
import { installNativeBridge } from "./capacitorBridge";

/** Renders nothing. Pushes the current briefing state to the Now Bar adapter (a no-op on the web). */
export function NowBarSync() {
  const { briefingType, briefingLanguage } = useApp();
  const briefing = useBriefing(briefingType);
  useEffect(() => { installNativeBridge(); }, []);
  useEffect(() => {
    // The app's selected briefing type (set by the scheduler/demo switch) is the source of truth.
    void nowBarAdapter.update(briefingToNowBarContent(briefing, briefingType, briefingLanguage, new Date(briefing.generatedAt)));
  }, [briefing, briefingType, briefingLanguage]);
  return null;
}
