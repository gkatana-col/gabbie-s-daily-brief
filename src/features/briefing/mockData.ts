import type { RawBriefingData, User } from "./types";

export const mockUser: User = {
  name: "Gabbie",
  preferredLanguage: "bg",
  briefingLanguage: "same",
  timezone: "Europe/Sofia",
  notificationPreferences: { morningBriefing: true, importantUpdates: true, eveningRecap: true },
  theme: "system",
};

export const mockRawBriefingData: RawBriefingData = {
  date: "2026-10-03T11:32:00+03:00",
  tasks: [
    { id: "p1", title: "Подготви презентацията за проекта", time: "10:30", completed: false },
    { id: "p2", title: "Прегледай бележките от лекцията", time: "14:00", completed: false },
    { id: "p3", title: "30 минути движение", time: "18:30", completed: false },
  ],
  calendarItems: [
    { id: "c1", title: "Екипна среща", start: "10:30", end: "11:15", location: "Google Meet" },
    { id: "c2", title: "Фокусирана работа", start: "14:00", end: "16:00", location: "Библиотека" },
    { id: "c3", title: "Вечеря с Мила", start: "19:30", end: "21:00", location: "Център" },
  ],
  weather: { temperature: 21, feelsLike: 20, condition: "Предимно слънчево", high: 23, low: 12, location: "София" },
  news: [
    { id: "n1", title: "Нови европейски програми подкрепят студентски иновации", source: "Капитал", category: "Технологии", minutesAgo: 24 },
    { id: "n2", title: "Градът разширява зелените пространства тази есен", source: "Дневник", category: "Град", minutesAgo: 48 },
    { id: "n3", title: "Практични навици за по-спокойна работна седмица", source: "BBC Worklife", category: "Фокус", minutesAgo: 75 },
  ],
  preferences: { focusHours: "14:00–16:00", quietEvening: true },
};
