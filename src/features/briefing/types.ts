export type LanguagePreference = "auto" | "bg" | "en";
export type ThemePreference = "system" | "light" | "dark";
export type ResolvedLanguage = "bg" | "en";
export type BriefingType = "morning" | "evening";
export type ImportanceLevel = "critical" | "high" | "medium" | "low";
export type UserDefinedImportance = Exclude<ImportanceLevel, "critical">;

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

export interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  location?: string;
  importance?: UserDefinedImportance;
  relevance?: number;
  consequenceIfMissed?: "none" | "minor" | "significant";
}

export interface Task {
  id: string;
  title: string;
  dueAt?: string;
  completed: boolean;
  completedAt?: string;
  importance?: UserDefinedImportance;
  relevance?: number;
  consequenceIfMissed?: "none" | "minor" | "significant";
}

export interface WeatherData {
  temperature: number;
  feelsLike: number;
  condition: string;
  high: number;
  low: number;
  location: string;
  precipitationChance?: number;
}

export interface NewsArticle {
  id: string;
  title: string;
  source: string;
  category: string;
  publishedAt: string;
  importance?: UserDefinedImportance;
  relevance?: number;
}

export interface BriefingUserPreferences {
  name: string;
  language: ResolvedLanguage;
  timezone: string;
  personalPriorities: string[];
  focusDurationMinutes?: number;
}

export interface BriefingInput {
  currentDateTime: string;
  calendarEvents: CalendarEvent[];
  tasks: Task[];
  weather: WeatherData | null;
  news: NewsArticle[];
  userPreferences: BriefingUserPreferences;
  briefingType: BriefingType;
}

export interface BriefingPriority {
  id: string;
  title: string;
  time?: string | undefined;
  completed: boolean;
  importance: ImportanceLevel;
  source: "calendar" | "task" | "personal";
}

export interface BriefingCalendarItem extends Omit<CalendarEvent, "importance"> {
  importance: ImportanceLevel;
}

export interface BriefingNewsItem extends Omit<NewsArticle, "importance"> {
  importance: ImportanceLevel;
}

export interface BriefingWeather {
  available: boolean;
  summary: string;
  temperature?: number;
  feelsLike?: number;
  condition?: string;
  high?: number;
  low?: number;
  location?: string;
}

export interface Briefing {
  type: BriefingType;
  greeting: string;
  summary: string;
  priorities: BriefingPriority[];
  calendar: BriefingCalendarItem[];
  weather: BriefingWeather;
  news: BriefingNewsItem[];
  insight: string;
  generatedAt: string;
  completedItems: BriefingPriority[];
  unfinishedItems: BriefingPriority[];
  tomorrowPreview: string;
}

export type ImportanceItem = {
  start?: string;
  dueAt?: string;
  importance?: UserDefinedImportance;
  relevance?: number;
  consequenceIfMissed?: "none" | "minor" | "significant";
};