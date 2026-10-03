import { createMockBriefingInput } from "@/features/briefing/mockData";
import { calculateImportance } from "@/features/briefing/briefingEngine";
import type { BriefingCalendarItem, CalendarEvent } from "@/features/briefing/types";
import { nativeBridge } from "./nativeBridge";
import type { HealthDataProvider, NativeCalendarProvider, NativeNotificationProvider, NowBarAdapter } from "./types";

/** Web Now Bar adapter: records the last state for development, never touches any system surface. */
export class WebNowBarAdapter implements NowBarAdapter {
  lastContent: Parameters<NowBarAdapter["update"]>[0] | null = null;
  isSupported() { return false; }
  async update(content: Parameters<NowBarAdapter["update"]>[0]) { this.lastContent = content; }
  async clear() { this.lastContent = null; }
}

/** Native adapter shape for later: forwards to the bridge only when the platform supports it. */
export class BridgeNowBarAdapter implements NowBarAdapter {
  constructor(private supported: () => boolean) {}
  isSupported() { return this.supported(); }
  async update(content: Parameters<NowBarAdapter["update"]>[0]) { if (this.isSupported()) await nativeBridge.sendNowBarUpdate(content); }
  async clear() { if (this.isSupported()) await nativeBridge.clearNowBar(); }
}

const unavailable = { available: false, reason: "native_health_unavailable" } as const;
/** No permissions requested, no data read. */
export const unavailableHealthDataProvider: HealthDataProvider = {
  isAvailable: () => false,
  getSteps: async () => unavailable,
  getSleep: async () => unavailable,
  getHeartRate: async () => unavailable,
  getActivity: async () => unavailable,
  getWorkouts: async () => unavailable,
};

const toItem = (now: string) => (event: CalendarEvent): BriefingCalendarItem => ({ ...event, importance: calculateImportance(event, now) });
/** Web calendar provider: reuses the existing mock calendar data. */
export const mockNativeCalendarProvider: NativeCalendarProvider = {
  source: "mock",
  async getTodayEvents() {
    const input = createMockBriefingInput("morning", "bg");
    const day = input.currentDateTime.slice(0, 10);
    return input.calendarEvents.filter((e) => e.start.startsWith(day)).map(toItem(input.currentDateTime));
  },
  async getUpcomingEvents() {
    const input = createMockBriefingInput("morning", "bg");
    return input.calendarEvents.filter((e) => e.start >= input.currentDateTime).map(toItem(input.currentDateTime));
  },
};

/** Never shows browser notifications. */
export const unsupportedNotificationProvider: NativeNotificationProvider = {
  isSupported: () => false,
  showNotification: async () => false,
  cancelNotification: async () => undefined,
};

export const nowBarAdapter = new WebNowBarAdapter();
