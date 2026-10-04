import { registerPlugin } from "@capacitor/core";
import { calculateImportance } from "@/features/briefing/briefingEngine";
import type { BriefingCalendarItem } from "@/features/briefing/types";
import { mockNativeCalendarProvider } from "./providers";
import type { CalendarEventsResult, CalendarPermissionState, NativeCalendarEvent, NativeCalendarProvider } from "./types";

/** Raw shape returned by android/.../BriefCalendarPlugin.java (epoch millis). */
export interface RawNativeCalendarEvent { id: string | number; title?: string | null; begin: number; end: number; allDay: boolean; calendarName?: string | null }
export interface BriefCalendarPlugin {
  checkPermissions(): Promise<{ calendar: string }>;
  requestPermissions(): Promise<{ calendar: string }>;
  getEvents(options: { from: number; to: number }): Promise<{ events: RawNativeCalendarEvent[] }>;
}

let permissionState: CalendarPermissionState = "unsupported";
export const getCalendarPermissionState = () => permissionState;

const toState = (value: string | undefined): CalendarPermissionState =>
  value === "granted" ? "granted" : value === "denied" ? "denied" : value ? "prompt" : "unsupported";

export function mapNativeCalendarEvents(raw: RawNativeCalendarEvent[]): NativeCalendarEvent[] {
  return raw
    .filter((e) => Number.isFinite(e.begin) && Number.isFinite(e.end))
    .map((e) => ({
      id: String(e.id),
      title: e.title?.trim() || "",
      startTime: new Date(e.begin).toISOString(),
      endTime: new Date(e.end).toISOString(),
      allDay: Boolean(e.allDay),
      calendarName: e.calendarName ?? "",
    }))
    .sort((a, b) => a.startTime.localeCompare(b.startTime));
}

const toBriefingItem = (now: string) => (e: NativeCalendarEvent): BriefingCalendarItem => {
  const event = { id: e.id, title: e.title, start: e.startTime, end: e.endTime };
  return { ...event, importance: calculateImportance(event, now) };
};

export function createCapacitorCalendarProvider(plugin: BriefCalendarPlugin = registerPlugin<BriefCalendarPlugin>("BriefCalendar")): NativeCalendarProvider {
  const safeState = async (call: () => Promise<{ calendar: string }>) => {
    try { permissionState = toState((await call()).calendar); } catch { permissionState = "unsupported"; }
    return permissionState;
  };
  const getEvents = async (from: Date, to: Date): Promise<CalendarEventsResult> => {
    if ((await safeState(() => plugin.checkPermissions())) !== "granted") return { status: "permission_denied", events: [] };
    try {
      const { events } = await plugin.getEvents({ from: from.getTime(), to: to.getTime() });
      return { status: "ok", events: mapNativeCalendarEvents(events ?? []) };
    } catch {
      return { status: "error", events: [] };
    }
  };
  const asItems = async (from: Date, to: Date) => {
    const result = await getEvents(from, to);
    return result.events.map(toBriefingItem(new Date().toISOString()));
  };
  return {
    source: "native",
    checkPermission: () => safeState(() => plugin.checkPermissions()),
    requestPermission: () => safeState(() => plugin.requestPermissions()),
    getEvents,
    getTodayEvents() {
      const start = new Date(); start.setHours(0, 0, 0, 0);
      const end = new Date(start); end.setDate(end.getDate() + 1);
      return asItems(start, end);
    },
    getUpcomingEvents() {
      const now = new Date();
      return asItems(now, new Date(now.getTime() + 7 * 864e5));
    },
  };
}

let activeProvider: NativeCalendarProvider = mockNativeCalendarProvider;
const providerListeners = new Set<() => void>();

/** Browser keeps the mock provider; the Capacitor bridge installs the native one on Android. */
export const getNativeCalendarProvider = () => activeProvider;
export const subscribeNativeCalendarProvider = (listener: () => void) => {
  providerListeners.add(listener);
  return () => providerListeners.delete(listener);
};
export function setNativeCalendarProvider(provider: NativeCalendarProvider) {
  activeProvider = provider;
  providerListeners.forEach((listener) => listener());
}
export function resetNativeCalendarProvider() {
  activeProvider = mockNativeCalendarProvider;
  permissionState = "unsupported";
  providerListeners.forEach((listener) => listener());
}
