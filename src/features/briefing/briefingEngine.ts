import type { Briefing, RawBriefingData, ResolvedLanguage, User } from "./types";

const localizePriority = (title: string, language: ResolvedLanguage) => {
  if (language === "bg") return title;
  const titles: Record<string, string> = {
    "Подготви презентацията за проекта": "Prepare the project presentation",
    "Прегледай бележките от лекцията": "Review the lecture notes",
    "30 минути движение": "30 minutes of movement",
  };
  return titles[title] ?? title;
};

export function generateBriefing(raw: RawBriefingData, user: User, language: ResolvedLanguage): Briefing {
  const isBg = language === "bg";
  const calendarItems = raw.calendarItems.map((item) => {
    const location = isBg ? item.location : ({ "Библиотека": "Library", "Център": "City centre" }[item.location ?? ""] ?? item.location);
    return {
      ...item,
      title: isBg ? item.title : ({ "Екипна среща": "Team sync", "Фокусирана работа": "Focused work", "Вечеря с Мила": "Dinner with Mila" }[item.title] ?? item.title),
      ...(location ? { location } : {}),
    };
  });
  const englishNews = [
    ["New European programmes support student innovation", "Technology"],
    ["The city expands green spaces this autumn", "City"],
    ["Practical habits for a calmer working week", "Focus"],
  ] as const;
  return {
    date: raw.date,
    greeting: isBg ? `Добър ден, ${user.name}` : `Good afternoon, ${user.name}`,
    summary: isBg
      ? "Днес имаш сравнително спокоен график. Следобедът ти е подходящ за фокусирана работа."
      : "Your schedule is relatively calm today. The afternoon is well suited for focused work.",
    priorities: raw.tasks.map((item) => ({ ...item, title: localizePriority(item.title, language) })),
    calendarItems,
    weather: { ...raw.weather, condition: isBg ? raw.weather.condition : "Mostly sunny", location: isBg ? raw.weather.location : "Sofia" },
    news: raw.news.map((item, index) => {
      const translated = englishNews[index];
      return { ...item, title: isBg || !translated ? item.title : translated[0], category: isBg || !translated ? item.category : translated[1] };
    }),
    insight: isBg
      ? `Най-добрият ти прозорец за дълбока работа е ${raw.preferences.focusHours}. Защити го от дребни задачи.`
      : `Your best window for deep work is ${raw.preferences.focusHours}. Protect it from small tasks.`,
    eveningRecap: isBg
      ? "Вечерта изглежда спокойна. Отбележи какво си приключила и остави утрешните задачи за сутрешния Brief."
      : "The evening looks calm. Note what you completed and leave tomorrow’s tasks for your Morning Brief.",
  };
}
