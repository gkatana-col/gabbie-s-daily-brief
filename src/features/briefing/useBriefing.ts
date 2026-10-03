import { useMemo } from "react";
import { useApp } from "@/features/i18n/I18nProvider";
import { generateCachedBriefing } from "./briefingEngine";
import { createMockBriefingInput } from "./mockData";
import type { BriefingType } from "./types";

export function useBriefing(type: BriefingType) {
  const { user, briefingLanguage } = useApp();
  return useMemo(
    () => generateCachedBriefing(createMockBriefingInput(type, briefingLanguage, user)),
    [briefingLanguage, type, user],
  );
}