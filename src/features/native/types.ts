import type { BriefingCalendarItem } from "@/features/briefing/types";

export type Platform = "web" | "android" | "ios";

export interface NowBarContent {
  id: string;
  type: "morning" | "evening" | "calendar" | "weather" | "news" | "priority" | "general";
  title: string;
  subtitle?: string;
  /** Brief icon name (see BriefIcon); native code maps it to its own asset. */
  icon?: string;
  timestamp?: string;
  priority?: "low" | "normal" | "high";
  action?: { type: "open_brief" | "open_screen"; target?: string };
  expandable?: boolean;
}

/** Non-sensitive runtime info only — no device identifiers. */
export interface PlatformInfo {
  platform: Platform;
  native: boolean;
  capacitor: boolean;
  androidVersion: string | null;
  androidSdk: number | null;
  appVersion: string | null;
}

export type BriefTimeOfDay = "morning" | "day" | "evening" | "night";
/** period: optional visual accent only; omitted → device local time picks it natively. */
export interface LiveNotificationContent { title: string; text: string; progress?: number /* 0–100 */; period?: BriefTimeOfDay }
export type LiveNotificationStatus = "shown" | "updated" | "stopped" | "unsupported" | "permission_denied" | "error";
export type NotificationPermissionState = "granted" | "denied" | "prompt" | "unsupported";

export type UnsupportedResult = { supported: false; reason: "web_platform" };

export interface NativeBridge {
  isNativeApp(): boolean;
  getPlatform(): Platform;
  getPlatformInfo(): Promise<PlatformInfo>;
  getWidgetAppearance(): Promise<"system" | "light" | "dark">;
  setWidgetAppearance(appearance: "system" | "light" | "dark"): Promise<void>;
  openExternalUrl(url: string): Promise<void>;
  requestPermission(permission: string): Promise<boolean>;
  getDeviceTimezone(): string;
  getDeviceLocale(): string;
  sendNowBarUpdate(data: NowBarContent): Promise<void>;
  clearNowBar(): Promise<void>;
  openNativeScreen(screen: string, params?: Record<string, unknown>): Promise<void>;
  /** Proof-of-concept Live Notification (Android 16 promoted ongoing). Permission is only requested when called explicitly. */
  requestNotificationPermission(): Promise<NotificationPermissionState>;
  startLiveNotification(content: LiveNotificationContent): Promise<LiveNotificationStatus>;
  updateLiveNotification(content: LiveNotificationContent): Promise<LiveNotificationStatus>;
  stopLiveNotification(): Promise<LiveNotificationStatus>;
  /** Gets a fresh device location, requesting location permission only when weather needs it. */
  getCurrentLocation(): Promise<{ latitude: number; longitude: number }>;
  /** Reads the next active alarm already configured on the device; never creates or changes alarms. */
  getNextAlarm(): Promise<{ triggerAt: string; time: string } | null>;
}

export interface NowBarAdapter {
  update(content: NowBarContent): Promise<void>;
  clear(): Promise<void>;
  isSupported(): boolean;
}

export interface HealthSample<T> { value: T; recordedAt: string }
export type HealthResult<T> = { available: true; data: T } | { available: false; reason: "native_health_unavailable" };
export interface HealthDataProvider {
  isAvailable(): boolean;
  getSteps(date: string): Promise<HealthResult<HealthSample<number>>>;
  getSleep(date: string): Promise<HealthResult<HealthSample<{ minutes: number }>>>;
  getHeartRate(date: string): Promise<HealthResult<HealthSample<{ bpm: number }>[]>>;
  getActivity(date: string): Promise<HealthResult<HealthSample<{ activeMinutes: number }>>>;
  getWorkouts(date: string): Promise<HealthResult<HealthSample<{ type: string; minutes: number }>[]>>;
}

/** Read-only calendar event: only the fields Brief needs. */
export interface NativeCalendarEvent {
  id: string;
  title: string;
  startTime: string; // ISO
  endTime: string; // ISO
  allDay: boolean;
  calendarName: string;
}
export type CalendarPermissionState = "granted" | "denied" | "prompt" | "unsupported";
export type CalendarEventsResult =
  | { status: "ok"; events: NativeCalendarEvent[] }
  | { status: "permission_denied" | "unsupported" | "error"; events: [] };

export interface NativeCalendarProvider {
  source: "mock" | "native";
  /** Never prompts. */
  checkPermission(): Promise<CalendarPermissionState>;
  /** Prompts only when called — i.e. after the user explicitly enables Calendar integration. */
  requestPermission(): Promise<CalendarPermissionState>;
  getEvents(from: Date, to: Date): Promise<CalendarEventsResult>;
  getTodayEvents(): Promise<BriefingCalendarItem[]>;
  getUpcomingEvents(): Promise<BriefingCalendarItem[]>;
}

export interface NativeNotification { id: string; title: string; body?: string; action?: NowBarContent["action"] }
export interface NativeNotificationProvider {
  showNotification(notification: NativeNotification): Promise<boolean>;
  cancelNotification(id: string): Promise<void>;
  isSupported(): boolean;
}

export interface PlatformCapabilities {
  isNativeApp: boolean;
  platform: Platform;
  supportsNowBar: boolean;
  supportsNativeNotifications: boolean;
  supportsNativeCalendar: boolean;
  supportsHealthData: boolean;
  supportsHomeWidget: boolean;
}
