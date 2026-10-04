import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import type { BriefingCalendarItem } from "@/features/briefing/types";
import { getNativeCalendarProvider, subscribeNativeCalendarProvider } from "./calendarProvider";

export type NativeCalendarStatus = "web" | "loading" | "ok" | "permission_denied" | "error";

export interface NativeCalendarState {
  status: NativeCalendarStatus;
  items: BriefingCalendarItem[];
  /** User-initiated: triggers the standard Android permission prompt, then reloads. */
  requestAccess: () => Promise<void>;
}

/**
 * Reads upcoming events from the active calendar provider.
 * In a normal browser the provider is the mock ("web" status) and the UI keeps its existing behaviour.
 * On Android it reads real events via the existing READ_CALENDAR integration; it never prompts on its own.
 */
export function useNativeCalendarEvents(): NativeCalendarState {
  const provider = useSyncExternalStore(subscribeNativeCalendarProvider, getNativeCalendarProvider, getNativeCalendarProvider);
  const isNative = provider.source === "native";
  const [state, setState] = useState<{ status: NativeCalendarStatus; items: BriefingCalendarItem[] }>({
    status: isNative ? "loading" : "web",
    items: [],
  });

  const load = useCallback(async () => {
    if (!isNative) return;
    const permission = await provider.checkPermission();
    if (permission !== "granted") {
      setState({ status: permission === "denied" || permission === "prompt" ? "permission_denied" : "error", items: [] });
      return;
    }
    try {
      const items = await provider.getUpcomingEvents();
      setState({ status: "ok", items });
    } catch {
      setState({ status: "error", items: [] });
    }
  }, [isNative, provider]);

  useEffect(() => {
    void load();
    if (!isNative) return;
    const refreshWhenVisible = () => {
      if (document.visibilityState === "visible") void load();
    };
    document.addEventListener("visibilitychange", refreshWhenVisible);
    window.addEventListener("focus", refreshWhenVisible);
    return () => {
      document.removeEventListener("visibilitychange", refreshWhenVisible);
      window.removeEventListener("focus", refreshWhenVisible);
    };
  }, [isNative, load]);

  const requestAccess = useCallback(async () => {
    if (!isNative) return;
    await provider.requestPermission();
    await load();
  }, [isNative, provider, load]);

  return { ...state, requestAccess };
}
