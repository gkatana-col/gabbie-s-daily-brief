import type { BriefingInput, BriefingType, ResolvedLanguage, User } from "./types";

export const mockUser: User = {
  name: "Gabbie",
  preferredLanguage: "bg",
  briefingLanguage: "same",
  timezone: "Europe/Sofia",
  notificationPreferences: { morningBriefing: true, importantUpdates: true, eveningRecap: true },
  theme: "system",
};

const calendarEvents = [
  { id: "c1", title: "Екипна среща", start: "2026-10-03T10:30:00+03:00", end: "2026-10-03T11:15:00+03:00", location: "Google Meet", importance: "high", relevance: 0.9, consequenceIfMissed: "significant" },
  { id: "c2", title: "Университет", start: "2026-10-03T14:00:00+03:00", end: "2026-10-03T15:30:00+03:00", location: "София", importance: "high", relevance: 1 },
  { id: "c3", title: "Вечеря с Мила", start: "2026-10-03T19:30:00+03:00", end: "2026-10-03T21:00:00+03:00", location: "Център", importance: "medium", relevance: 0.7 },
  { id: "c4", title: "Семинар по дизайн", start: "2026-10-04T09:30:00+03:00", end: "2026-10-04T11:00:00+03:00", location: "Университет", importance: "high", relevance: 0.9 },
] as const;

const tasks = [
  { id: "t1", title: "Изпрати презентацията за проекта", dueAt: "2026-10-03T12:00:00+03:00", completed: true, completedAt: "2026-10-03T11:42:00+03:00", importance: "high", relevance: 1, consequenceIfMissed: "significant" },
  { id: "t2", title: "Прегледай бележките от лекцията", dueAt: "2026-10-03T17:30:00+03:00", completed: false, importance: "medium", relevance: 0.8 },
  { id: "t3", title: "30 минути движение", dueAt: "2026-10-03T18:30:00+03:00", completed: false, importance: "medium", relevance: 0.7 },
  { id: "t4", title: "Подготви въпросите за семинара", dueAt: "2026-10-04T08:30:00+03:00", completed: false, importance: "high", relevance: 0.9 },
] as const;

const weather = { temperature: 21, feelsLike: 20, condition: "Предимно слънчево", high: 23, low: 12, location: "София", precipitationChance: 10 };

const news = [
  { id: "n1", title: "Нови европейски програми подкрепят студентски иновации", source: "Капитал", category: "Технологии", publishedAt: "2026-10-03T11:08:00+03:00", importance: "high", relevance: 0.95 },
  { id: "n2", title: "Градът разширява зелените пространства тази есен", source: "Дневник", category: "Град", publishedAt: "2026-10-03T10:44:00+03:00", importance: "medium", relevance: 0.7 },
  { id: "n3", title: "Практични навици за по-спокойна работна седмица", source: "BBC Worklife", category: "Фокус", publishedAt: "2026-10-03T09:57:00+03:00", importance: "low", relevance: 0.65 },
] as const;

export function createMockBriefingInput(briefingType: BriefingType, language: ResolvedLanguage, user: User = mockUser): BriefingInput {
  return {
    currentDateTime: briefingType === "morning" ? "2026-10-03T08:15:00+03:00" : "2026-10-03T20:45:00+03:00",
    calendarEvents: calendarEvents.map((item) => ({ ...item })),
    tasks: tasks.map((item) => ({ ...item })),
    weather: { ...weather },
    news: news.map((item) => ({ ...item })),
    userPreferences: {
      name: user.name,
      language,
      timezone: user.timezone,
      personalPriorities: ["Фокусирана работа", "Подготовка за университета"],
      focusDurationMinutes: 90,
    },
    briefingType,
  };
}