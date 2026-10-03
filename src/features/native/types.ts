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

export type UnsupportedResult = { supported: false; reason: "web_platform" };

export interface NativeBridge {
  isNativeApp(): boolean;
  getPlatform(): Platform;
  openExternalUrl(url: string): Promise<void>;
  requestPermission(permission: string): Promise<boolean>;
  getDeviceTimezone(): string;
  getDeviceLocale(): string;
  sendNowBarUpdate(data: NowBarContent): Promise<void>;
  clearNowBar(): Promise<void>;
  openNativeScreen(screen: string, params?: Record<string, unknown>): Promise<void>;
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

export interface NativeCalendarProvider {
  source: "mock" | "native";
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
