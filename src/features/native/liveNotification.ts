import { registerPlugin } from "@capacitor/core";
import { getTimeOfDayGreeting } from "@/features/briefing/briefingEngine";
import { conditionFor, getWeatherState } from "@/features/weather/weatherService";
import type { LiveNotificationContent, LiveNotificationStatus, NativeBridge, NotificationPermissionState } from "./types";

/** Mirrors android/.../BriefLiveNotificationPlugin.java. */
export interface BriefLiveNotificationPlugin {
  requestNotificationPermission(): Promise<{ notifications: string }>;
  start(content: LiveNotificationContent): Promise<{ status: string }>;
  update(content: LiveNotificationContent): Promise<{ status: string }>;
  stop(): Promise<{ status: string }>;
}

/** POC test content (development hook only). */
export const LIVE_NOTIFICATION_TEST = {
  updated: { title: "Brief · Обновено", text: "Live briefing е активно", progress: 75 },
} satisfies Record<string, LiveNotificationContent>;

/**
 * Initial test content built at call time from the device's CURRENT LOCAL hour:
 * 05–10 „Добро утро“, 11–16 „Добър ден“, 17–21 „Добър вечер“, 22–04 „Добър вечер“ (night keeps the evening label).
 * Period is omitted so the native side resolves the accent from local time too.
 */
export function buildInitialTestContent(now: Date = new Date()): LiveNotificationContent {
  // Appends live weather only when a fresh real reading exists; otherwise the text is unchanged.
  const { status, reading } = getWeatherState();
  const weather = status === "ok" && reading ? ` · ${reading.temperature}°${reading.unit === "F" ? "F" : ""} ${conditionFor(reading.code, "bg")}` : "";
  return { title: `Brief · ${getTimeOfDayGreeting(now.getHours(), "bg")}`, text: `Твоят ден започва${weather}`, progress: 25 };
}

const STATUSES: LiveNotificationStatus[] = ["shown", "updated", "stopped", "unsupported", "permission_denied", "error"];
const toStatus = (value: unknown): LiveNotificationStatus => (STATUSES.includes(value as LiveNotificationStatus) ? (value as LiveNotificationStatus) : "error");
const toPermission = (value: string | undefined): NotificationPermissionState =>
  value === "granted" ? "granted" : value === "denied" ? "denied" : value ? "prompt" : "unsupported";

type LiveMethods = Pick<NativeBridge, "requestNotificationPermission" | "startLiveNotification" | "updateLiveNotification" | "stopLiveNotification">;

export function createLiveNotificationMethods(
  plugin: BriefLiveNotificationPlugin = registerPlugin<BriefLiveNotificationPlugin>("BriefLiveNotification"),
): LiveMethods {
  const run = async (call: () => Promise<{ status: string }>): Promise<LiveNotificationStatus> => {
    try { return toStatus((await call()).status); } catch (e) {
      return (e as { code?: string })?.code === "PERMISSION_DENIED" ? "permission_denied" : "error";
    }
  };
  return {
    async requestNotificationPermission() {
      try { return toPermission((await plugin.requestNotificationPermission()).notifications); } catch { return "unsupported"; }
    },
    startLiveNotification: (c) => run(() => plugin.start(c)),
    updateLiveNotification: (c) => run(() => plugin.update(c)),
    stopLiveNotification: () => run(() => plugin.stop()),
  };
}
