import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { useApp } from "@/features/i18n/I18nProvider";
import type { DiscoverPreferences } from "./types";

/** Explicit, user-controlled preferences. Stored in memory only; nothing is tracked or sent anywhere. */
export const mockDiscoverPreferences: Omit<DiscoverPreferences, "language"> = {
  preferredCategories: ["science", "technology", "education", "green"],
  preferredSources: ["Reuters", "Дневник"],
  blockedTopics: [],
  savedStories: [],
  readingHistory: [],
  hiddenStories: [],
  personalizationEnabled: true,
};

interface DiscoverPreferencesValue {
  preferences: DiscoverPreferences;
  toggleSaved: (id: string) => void;
  markRead: (id: string) => void;
  hide: (id: string) => void;
  notInterested: (topicKey: string) => void;
  setPersonalization: (enabled: boolean) => void;
  reset: () => void;
}

const Context = createContext<DiscoverPreferencesValue | null>(null);

export function DiscoverPreferencesProvider({ children }: { children: ReactNode }) {
  const { language } = useApp();
  const [state, setState] = useState(mockDiscoverPreferences);
  const toggle = (list: string[], id: string) => (list.includes(id) ? list.filter((item) => item !== id) : [...list, id]);
  const value = useMemo<DiscoverPreferencesValue>(() => ({
    preferences: { ...state, language },
    toggleSaved: (id) => setState((s) => ({ ...s, savedStories: toggle(s.savedStories, id) })),
    markRead: (id) => setState((s) => (s.readingHistory.includes(id) ? s : { ...s, readingHistory: [...s.readingHistory, id] })),
    hide: (id) => setState((s) => ({ ...s, hiddenStories: [...s.hiddenStories, id] })),
    notInterested: (topicKey) => setState((s) => ({ ...s, blockedTopics: [...s.blockedTopics, topicKey] })),
    setPersonalization: (personalizationEnabled) => setState((s) => ({ ...s, personalizationEnabled })),
    reset: () => setState(mockDiscoverPreferences),
  }), [state, language]);
  return <Context.Provider value={value}>{children}</Context.Provider>;
}

export function useDiscoverPreferences() {
  const value = useContext(Context);
  if (!value) throw new Error("useDiscoverPreferences must be used inside DiscoverPreferencesProvider");
  return value;
}
