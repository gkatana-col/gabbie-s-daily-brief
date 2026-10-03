import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { mockUser } from "@/features/briefing/mockData";
import type { BriefingType, LanguagePreference, ResolvedLanguage, ThemePreference, User } from "@/features/briefing/types";
import { getTranslation, type TranslationKey } from "./translations";

interface AppContextValue {
  language: ResolvedLanguage;
  briefingLanguage: ResolvedLanguage;
  briefingType: BriefingType;
  user: User;
  setBriefingType: (value: BriefingType) => void;
  setInterfaceLanguage: (value: LanguagePreference) => void;
  setBriefingLanguage: (value: User["briefingLanguage"]) => void;
  setTheme: (value: ThemePreference) => void;
  setNotification: (key: keyof User["notificationPreferences"], value: boolean) => void;
  t: (key: TranslationKey) => string;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User>(mockUser);
  const [systemLanguage, setSystemLanguage] = useState<ResolvedLanguage>("bg");
  const [briefingType, setBriefingType] = useState<BriefingType>("morning");

  useEffect(() => {
    setSystemLanguage(navigator.language.toLowerCase().startsWith("bg") ? "bg" : "en");
  }, []);

  const language: ResolvedLanguage = user.preferredLanguage === "auto" ? systemLanguage : user.preferredLanguage;
  const briefingLanguage: ResolvedLanguage = user.briefingLanguage === "same" ? language : user.briefingLanguage;
  useEffect(() => { document.documentElement.lang = language === "bg" ? "bg-BG" : "en"; }, [language]);
  useEffect(() => {
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    document.documentElement.classList.toggle("dark", user.theme === "dark" || (user.theme === "system" && prefersDark));
  }, [user.theme]);

  const value = useMemo<AppContextValue>(() => ({
    language,
    briefingLanguage,
    briefingType,
    user,
    setBriefingType,
    setInterfaceLanguage: (preferredLanguage) => setUser((current) => ({ ...current, preferredLanguage })),
    setBriefingLanguage: (briefingLanguage) => setUser((current) => ({ ...current, briefingLanguage })),
    setTheme: (theme) => setUser((current) => ({ ...current, theme })),
    setNotification: (key, enabled) => setUser((current) => ({ ...current, notificationPreferences: { ...current.notificationPreferences, [key]: enabled } })),
    t: (key) => getTranslation(language, key),
  }), [briefingLanguage, briefingType, language, user]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used inside AppProvider");
  return context;
}
