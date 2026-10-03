import type { BriefIconName } from "@/components/BriefIcon";

export type BriefWidgetMode = "morning" | "evening" | "inactive";
export type BriefWidgetSize = "4x2" | "4x1" | "compact";

export interface BriefWidgetItem {
  icon: BriefIconName;
  text: string;
}

export interface BriefWidgetData {
  mode: BriefWidgetMode;
  title: string;
  summary: string;
  primaryItem: BriefWidgetItem | null;
  secondaryItem: BriefWidgetItem | null;
  icon: BriefIconName;
  timestamp: string;
}