import type {
  Briefing,
  BriefingCalendarItem,
  BriefingInput,
  BriefingNewsItem,
  BriefingPriority,
  ImportanceItem,
  ImportanceLevel,
  ResolvedLanguage,
} from "./types";

const importanceRank: Record<ImportanceLevel, number> = { critical: 4, high: 3, medium: 2, low: 1 };
const explicitImportance = { high: 3, medium: 2, low: 1 } as const;
const cache = new Map<string, Briefing>();

const toDateKey = (value: string, timeZone: string) => new Intl.DateTimeFormat("en-CA", {
  timeZone,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
}).format(new Date(value));

const addDays = (value: string, days: number) => {
  const date = new Date(value);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString();
};

const formatTime = (value: string, language: ResolvedLanguage, timeZone: string) => new Intl.DateTimeFormat(
  language === "bg" ? "bg-BG" : "en-GB",
  { hour: "2-digit", minute: "2-digit", hour12: false, timeZone },
).format(new Date(value));

const plural = (count: number, singular: string, pluralForm: string) => count === 1 ? singular : pluralForm;

// Time-of-day greeting from the device's LOCAL hour:
// 05:00–10:59 morning, 11:00–16:59 midday, 17:00–21:59 evening, 22:00–04:59 night.
export function getTimeOfDayGreeting(hour: number, language: ResolvedLanguage): string {
  const isBg = language === "bg";
  if (hour >= 5 && hour <= 10) return isBg ? "Добро утро" : "Good morning";
  if (hour >= 11 && hour <= 16) return isBg ? "Добър ден" : "Good afternoon";
  return isBg ? "Добър вечер" : "Good evening"; // evening and night
}

export function calculateImportance(item: ImportanceItem, currentDateTime = new Date().toISOString()): ImportanceLevel {
  let score = item.importance ? explicitImportance[item.importance] : 1;
  score += Math.max(0, Math.min(1, item.relevance ?? 0.5)) * 2;
  if (item.consequenceIfMissed === "significant") score += 3;
  if (item.consequenceIfMissed === "minor") score += 1;

  const target = item.dueAt ?? item.start;
  if (target) {
    const hours = (new Date(target).getTime() - new Date(currentDateTime).getTime()) / 3_600_000;
    if (hours >= -2 && hours <= 3) score += 4;
    else if (hours > 3 && hours <= 24) score += 2;
    else if (hours < -2) score += 1;
  }

  if (score >= 9) return "critical";
  if (score >= 6) return "high";
  if (score >= 3.5) return "medium";
  return "low";
}

const byImportanceThenTime = <T extends { importance: ImportanceLevel; start?: string; dueAt?: string }>(a: T, b: T) => {
  const rankDifference = importanceRank[b.importance] - importanceRank[a.importance];
  if (rankDifference !== 0) return rankDifference;
  return new Date(a.start ?? a.dueAt ?? 0).getTime() - new Date(b.start ?? b.dueAt ?? 0).getTime();
};

const translate = (value: string, language: ResolvedLanguage) => {
  if (language === "bg") return value;
  const dictionary: Record<string, string> = {
    "Екипна среща": "Team meeting",
    "Университет": "University",
    "Вечеря с Мила": "Dinner with Mila",
    "Семинар по дизайн": "Design seminar",
    "Изпрати презентацията за проекта": "Send the project presentation",
    "Прегледай бележките от лекцията": "Review the lecture notes",
    "30 минути движение": "30 minutes of movement",
    "Подготви въпросите за семинара": "Prepare the seminar questions",
    "Предимно слънчево": "Mostly sunny",
    "София": "Sofia",
    "Център": "City centre",
    "Библиотека": "Library",
    "Нови европейски програми подкрепят студентски иновации": "New European programmes support student innovation",
    "Градът разширява зелените пространства тази есен": "The city expands green spaces this autumn",
    "Практични навици за по-спокойна работна седмица": "Practical habits for a calmer working week",
    "Технологии": "Technology",
    "Град": "City",
    "Фокус": "Focus",
    "Фокусирана работа": "Focused work",
    "Подготовка за университета": "University preparation",
  };
  return dictionary[value] ?? value;
};

function buildBriefing(input: BriefingInput): Briefing {
  const { currentDateTime, userPreferences, briefingType } = input;
  const { language, timezone } = userPreferences;
  const isBg = language === "bg";
  const today = toDateKey(currentDateTime, timezone);
  const tomorrow = toDateKey(addDays(currentDateTime, 1), timezone);

  const todayEvents: BriefingCalendarItem[] = input.calendarEvents
    .filter((event) => toDateKey(event.start, timezone) === today)
    .map((event) => ({ ...event, title: translate(event.title, language), ...(event.location ? { location: translate(event.location, language) } : {}), importance: calculateImportance(event, currentDateTime) }))
    .sort(byImportanceThenTime);
  const tomorrowEvents = input.calendarEvents
    .filter((event) => toDateKey(event.start, timezone) === tomorrow)
    .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());
  const relevantTasks = input.tasks.filter((task) => {
    const dueDate = task.dueAt ? toDateKey(task.dueAt, timezone) : today;
    return briefingType === "morning" ? !task.completed && dueDate <= today : dueDate === today;
  });
  const taskPriorities: BriefingPriority[] = relevantTasks.map((task) => ({
    id: task.id,
    title: translate(task.title, language),
    ...(task.dueAt ? { time: formatTime(task.dueAt, language, timezone) } : {}),
    completed: task.completed,
    importance: calculateImportance(task, currentDateTime),
    source: "task",
  }));
  const eventPriorities: BriefingPriority[] = todayEvents.map((event) => ({
    id: event.id,
    title: event.title,
    time: formatTime(event.start, language, timezone),
    completed: new Date(event.end).getTime() < new Date(currentDateTime).getTime(),
    importance: event.importance,
    source: "calendar",
  }));
  const priorities = [...eventPriorities, ...taskPriorities].sort(byImportanceThenTime).slice(0, 5);
  const completedItems = taskPriorities.filter((item) => item.completed);
  const unfinishedItems = taskPriorities.filter((item) => !item.completed);
  const news: BriefingNewsItem[] = input.news.map((article) => ({
    ...article,
    title: translate(article.title, language),
    category: translate(article.category, language),
    importance: calculateImportance(article, currentDateTime),
  })).sort(byImportanceThenTime);

  const weather = input.weather ? {
    available: true,
    summary: isBg
      ? `${translate(input.weather.condition, language)}, ${input.weather.temperature}°. Максимална температура ${input.weather.high}°.`
      : `${translate(input.weather.condition, language)}, ${input.weather.temperature}°. High of ${input.weather.high}°.` ,
    temperature: input.weather.temperature,
    feelsLike: input.weather.feelsLike,
    condition: translate(input.weather.condition, language),
    high: input.weather.high,
    low: input.weather.low,
    location: translate(input.weather.location, language),
  } : {
    available: false,
    summary: isBg ? "Няма налични данни за времето." : "Weather data is unavailable.",
  };

  let summary: string;
  if (briefingType === "morning") {
    if (!todayEvents.length && !relevantTasks.length) summary = isBg ? "Нямаш записани събития или задачи за днес." : "You have no events or tasks scheduled for today.";
    else if (isBg) summary = `Днес имаш ${todayEvents.length} ${plural(todayEvents.length, "ангажимент", "ангажимента")} и ${relevantTasks.length} ${plural(relevantTasks.length, "задача", "задачи")}.`;
    else summary = `Today you have ${todayEvents.length} ${plural(todayEvents.length, "event", "events")} and ${relevantTasks.length} ${plural(relevantTasks.length, "task", "tasks")}.`;
  } else {
    const total = completedItems.length + unfinishedItems.length;
    summary = total === 0
      ? (isBg ? "Няма записани задачи за днес." : "No tasks were recorded for today.")
      : (isBg ? `Днес приключи ${completedItems.length} от ${total} планирани ${plural(total, "задача", "задачи")}.` : `You completed ${completedItems.length} of ${total} planned ${plural(total, "task", "tasks")} today.`);
  }

  const firstTomorrowEvent = tomorrowEvents[0];
  const tomorrowPreview = firstTomorrowEvent
    ? (isBg ? `Утре имаш ${tomorrowEvents.length} ${plural(tomorrowEvents.length, "важно събитие", "събития")}. Първото е в ${formatTime(firstTomorrowEvent.start, language, timezone)} ч.` : `Tomorrow you have ${tomorrowEvents.length} ${plural(tomorrowEvents.length, "event", "events")}. The first starts at ${formatTime(firstTomorrowEvent.start, language, timezone)}.`)
    : (isBg ? "Няма записани събития за утре." : "No events are scheduled for tomorrow.");

  let insight: string;
  if (briefingType === "evening") insight = unfinishedItems.length
    ? (isBg ? `Остават ${unfinishedItems.length} ${plural(unfinishedItems.length, "незавършена задача", "незавършени задачи")}. Провери сроковете им преди утре.` : `${unfinishedItems.length} ${plural(unfinishedItems.length, "task remains", "tasks remain")} unfinished. Check their deadlines before tomorrow.`)
    : tomorrowPreview;
  else if (todayEvents.length >= 2) {
    const chronological = [...todayEvents].sort((a, b) => new Date(a.end).getTime() - new Date(b.end).getTime());
    const gaps = chronological.slice(0, -1).flatMap((event, index) => {
      const nextEvent = chronological[index + 1];
      if (!nextEvent) return [];
      return [{ start: event.end, end: nextEvent.start, minutes: (new Date(nextEvent.start).getTime() - new Date(event.end).getTime()) / 60_000 }];
    }).filter((gap) => gap.minutes >= (userPreferences.focusDurationMinutes ?? 60));
    const gap = gaps.sort((a, b) => b.minutes - a.minutes)[0];
    insight = gap
      ? (isBg ? `Имаш свободен прозорец между ${formatTime(gap.start, language, timezone)} и ${formatTime(gap.end, language, timezone)} ч. за фокусирана работа.` : `You have a free window from ${formatTime(gap.start, language, timezone)} to ${formatTime(gap.end, language, timezone)} for focused work.`)
      : (isBg ? "Графикът ти е плътен; няма дълъг свободен прозорец между събитията." : "Your schedule is compact, with no long gap between events.");
  } else if (userPreferences.personalPriorities.length) insight = isBg
    ? `Личният ти приоритет е „${translate(userPreferences.personalPriorities[0] ?? "", language)}“. `
    : `Your personal priority is “${translate(userPreferences.personalPriorities[0] ?? "", language)}.”`;
  else insight = isBg ? "Няма достатъчно данни за допълнителен извод." : "There is not enough data for an additional insight.";

  return {
    type: briefingType,
    greeting: briefingType === "morning" ? (isBg ? "Добро утро" : "Good morning") : (isBg ? "Добър вечер" : "Good evening"),
    summary,
    priorities,
    calendar: briefingType === "morning" ? todayEvents : tomorrowEvents.map((event) => ({ ...event, title: translate(event.title, language), ...(event.location ? { location: translate(event.location, language) } : {}), importance: calculateImportance(event, currentDateTime) })),
    weather,
    news,
    insight,
    generatedAt: currentDateTime,
    completedItems,
    unfinishedItems,
    tomorrowPreview,
  };
}

const cacheKey = (input: BriefingInput) => JSON.stringify({
  period: `${toDateKey(input.currentDateTime, input.userPreferences.timezone)}:${input.briefingType}`,
  language: input.userPreferences.language,
  timezone: input.userPreferences.timezone,
  calendarEvents: input.calendarEvents,
  tasks: input.tasks,
  weather: input.weather,
  news: input.news,
  personalPriorities: input.userPreferences.personalPriorities,
});

export function generateBriefing(input: BriefingInput): Briefing {
  return buildBriefing(input);
}

export function generateCachedBriefing(input: BriefingInput): Briefing {
  const key = cacheKey(input);
  const cached = cache.get(key);
  if (cached) return cached;
  const briefing = buildBriefing(input);
  cache.set(key, briefing);
  return briefing;
}

export function clearBriefingCache() {
  cache.clear();
}