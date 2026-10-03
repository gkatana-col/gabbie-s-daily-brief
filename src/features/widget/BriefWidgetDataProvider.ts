import type { Briefing, ResolvedLanguage } from "@/features/briefing/types";
import type { BriefWidgetData, BriefWidgetMode } from "./types";

export interface BriefWidgetDataProvider {
  getData(mode: BriefWidgetMode, briefing: Briefing, language: ResolvedLanguage): BriefWidgetData;
}

const plural = (count: number, singular: string, pluralForm: string) => count === 1 ? singular : pluralForm;

export function resolveBriefWidgetMode(date: Date): BriefWidgetMode {
  const hour = date.getHours();
  if (hour >= 5 && hour < 17) return "morning";
  if (hour >= 17 && hour < 23) return "evening";
  return "inactive";
}

export const briefingWidgetDataProvider: BriefWidgetDataProvider = {
  getData(mode, briefing, language) {
    const isBg = language === "bg";
    const timestamp = new Intl.DateTimeFormat(isBg ? "bg-BG" : "en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).format(new Date(briefing.generatedAt));

    if (mode === "inactive") {
      return {
        mode,
        title: "Brief",
        summary: isBg ? "Твоят ден, накратко" : "Your day, at a glance",
        primaryItem: null,
        secondaryItem: null,
        icon: "brand",
        timestamp,
      };
    }

    if (mode === "evening") {
      const completed = briefing.completedItems.length;
      const tomorrow = briefing.calendar.length;
      return {
        mode,
        title: isBg ? "Вечерен обзор" : "Evening recap",
        summary: isBg ? `${completed + briefing.unfinishedItems.length} неща от днес` : `${completed + briefing.unfinishedItems.length} things from today`,
        primaryItem: {
          icon: "task",
          text: isBg ? `${completed} ${plural(completed, "задача приключена", "задачи приключени")}` : `${completed} ${plural(completed, "task completed", "tasks completed")}`,
        },
        secondaryItem: {
          icon: "calendar",
          text: isBg ? `Утре · ${tomorrow} ${plural(tomorrow, "събитие", "събития")}` : `${tomorrow} ${plural(tomorrow, "event", "events")} tomorrow`,
        },
        icon: "evening",
        timestamp,
      };
    }

    const university = briefing.calendar.find((item) => /универс|university/i.test(item.title)) ?? briefing.calendar[0];
    const eventTime = university
      ? new Intl.DateTimeFormat(isBg ? "bg-BG" : "en-GB", { hour: "2-digit", minute: "2-digit", hour12: false }).format(new Date(university.start))
      : null;
    const importantCount = briefing.calendar.length;
    return {
      mode,
      title: isBg ? "Добро утро" : "Good morning",
      summary: isBg ? `${importantCount} важни неща днес` : `${importantCount} important things today`,
      primaryItem: university && eventTime ? { icon: "calendar", text: `${eventTime} · ${university.title}` } : null,
      secondaryItem: briefing.weather.available
        ? { icon: "weather", text: `${briefing.weather.temperature}°C · ${briefing.weather.condition}` }
        : null,
      icon: "morning",
      timestamp,
    };
  },
};