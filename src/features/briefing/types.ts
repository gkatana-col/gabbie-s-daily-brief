export type LanguagePreference = "auto" | "bg" | "en";
export type ThemePreference = "system" | "light" | "dark";
export type ResolvedLanguage = "bg" | "en";

export interface User {
  name: string;
  preferredLanguage: LanguagePreference;
  briefingLanguage: "same" | "bg" | "en";
  timezone: string;
  notificationPreferences: {
    morningBriefing: boolean;
    importantUpdates: boolean;
    eveningRecap: boolean;
  };
  theme: ThemePreference;
}

export interface CalendarItem { id: string; title: string; start: string; end: string; location?: string }
export interface NewsItem { id: string; title: string; source: string; category: string; minutesAgo: number }
export interface Priority { id: string; title: string; time?: string; completed: boolean }
export interface Weather { temperature: number; feelsLike: number; condition: string; high: number; low: number; location: string }

export interface RawBriefingData {
  date: string;
  calendarItems: CalendarItem[];
  tasks: Priority[];
  weather: Weather;
  news: NewsItem[];
  preferences: { focusHours: string; quietEvening: boolean };
}

export interface Briefing {
  date: string;
  greeting: string;
  summary: string;
  priorities: Priority[];
  calendarItems: CalendarItem[];
  weather: Weather;
  news: NewsItem[];
  insight: string;
  eveningRecap: string;
}
