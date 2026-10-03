import type { ResolvedLanguage } from "@/features/briefing/types";

export const translations = {
  bg: {
    brand: "Brief", home: "Начало", today: "Днес", news: "Новини", calendar: "Календар", settings: "Настройки",
    dailySummary: "Твоят дневен обзор", importantToday: "Важно днес", schedule: "График", weather: "Времето", selectedNews: "Подбрани новини",
    personalInsight: "Личен фокус", eveningBrief: "Вечерен Brief", morningBrief: "Сутрешен Brief", generatedNow: "Обновено сега",
    allPriorities: "Всички приоритети", allEvents: "Целият календар", allNews: "Всички новини", minAgo: "мин",
    todayTitle: "Твоят ден", todaySubtitle: "Всичко важно в един спокоен ритъм.", scheduleOverview: "Преглед на деня",
    newsTitle: "За теб", newsSubtitle: "Кратка селекция без излишен шум.", calendarTitle: "Календар", calendarSubtitle: "Ясен поглед към времето ти.",
    settingsTitle: "Настройки", settingsSubtitle: "Направи Brief точно твой.", language: "Език", interfaceLanguage: "Език на интерфейса",
    automatic: "Автоматично", bulgarian: "Български", english: "English", briefingLanguage: "Език на Brief", sameAsInterface: "Като интерфейса",
    theme: "Тема", system: "Системна", light: "Светла", dark: "Тъмна", notifications: "Известия", morningBriefing: "Сутрешен Brief",
    importantUpdates: "Важни промени", eveningRecap: "Вечерен Brief", notificationsHint: "Избери кои моменти заслужават вниманието ти.",
    appearanceHint: "Brief следва системната тема по подразбиране.", aiLabel: "Динамичен Brief", feelsLike: "Усеща се като", high: "Макс.", low: "Мин.",
    events: "събития", noMoreEvents: "Нямаш други събития днес.", focusTime: "Време за фокус", greetingIntro: "Ето какво е важно за теб днес.",
    morningPill: "Добро утро • Твоят ден", eveningPill: "Вечерен обзор", showMorning: "Сутрешен Brief", showEvening: "Вечерен Brief", noWeather: "Няма данни за времето", tomorrow: "Утре",
    widgetPreviewTitle: "Home Screen Widget Preview", widgetPreviewSubtitle: "Визуален PWA преглед на Brief за начален екран.", widgetPreviewModes: "Режим на прегледа", widgetMorning: "Сутрин", widgetEvening: "Вечер", widgetCompact: "Компактен", widgetOpenBrief: "Отвори Brief", widgetPreviewDay: "Събота", widgetPreviewDate: "3 октомври",
  },
  en: {
    brand: "Brief", home: "Home", today: "Today", news: "News", calendar: "Calendar", settings: "Settings",
    dailySummary: "Your daily overview", importantToday: "Important today", schedule: "Schedule", weather: "Weather", selectedNews: "Selected news",
    personalInsight: "Personal focus", eveningBrief: "Evening Brief", morningBrief: "Morning Brief", generatedNow: "Updated now",
    allPriorities: "All priorities", allEvents: "Full calendar", allNews: "All news", minAgo: "min",
    todayTitle: "Your day", todaySubtitle: "Everything important, at a calmer pace.", scheduleOverview: "Day overview",
    newsTitle: "For you", newsSubtitle: "A concise selection without the noise.", calendarTitle: "Calendar", calendarSubtitle: "A clear view of your time.",
    settingsTitle: "Settings", settingsSubtitle: "Make Brief feel just right.", language: "Language", interfaceLanguage: "Interface language",
    automatic: "Automatic", bulgarian: "Български", english: "English", briefingLanguage: "Brief language", sameAsInterface: "Same as interface",
    theme: "Theme", system: "System", light: "Light", dark: "Dark", notifications: "Notifications", morningBriefing: "Morning Brief",
    importantUpdates: "Important updates", eveningRecap: "Evening Brief", notificationsHint: "Choose which moments deserve your attention.",
    appearanceHint: "Brief follows your system theme by default.", aiLabel: "Dynamic Brief", feelsLike: "Feels like", high: "High", low: "Low",
    events: "events", noMoreEvents: "You have no other events today.", focusTime: "Focus time", greetingIntro: "Here’s what matters for you today.",
    morningPill: "Good morning • Your day", eveningPill: "Evening recap", showMorning: "Morning Brief", showEvening: "Evening Brief", noWeather: "Weather unavailable", tomorrow: "Tomorrow",
    widgetPreviewTitle: "Home Screen Widget Preview", widgetPreviewSubtitle: "A visual PWA preview of Brief for your home screen.", widgetPreviewModes: "Preview mode", widgetMorning: "Morning", widgetEvening: "Evening", widgetCompact: "Compact", widgetOpenBrief: "Open Brief", widgetPreviewDay: "Saturday", widgetPreviewDate: "3 October",
  },
} as const;

export type TranslationKey = keyof typeof translations.bg;
export const getTranslation = (language: ResolvedLanguage, key: TranslationKey) => translations[language][key];
