import type { NativeBridge, PlatformInfo } from "./types";

export const webPlatformInfo: PlatformInfo = { platform: "web", native: false, capacitor: false, androidVersion: null, androidSdk: null, appVersion: null };

/** Safe browser implementation. Never throws because a native layer is missing. */
export const webNativeBridge: NativeBridge = {
  isNativeApp: () => false,
  getPlatform: () => "web",
  getPlatformInfo: async () => ({ ...webPlatformInfo }),
  async openExternalUrl(url) {
    if (typeof window === "undefined") return;
    window.open(url, "_blank", "noopener,noreferrer");
  },
  requestPermission: async () => false,
  getDeviceTimezone: () => {
    try { return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC"; } catch { return "UTC"; }
  },
  getDeviceLocale: () => (typeof navigator !== "undefined" && navigator.language) || "bg-BG",
  sendNowBarUpdate: async () => undefined,
  clearNowBar: async () => undefined,
  openNativeScreen: async () => undefined,
  requestNotificationPermission: async () => "unsupported",
  startLiveNotification: async () => "unsupported",
  updateLiveNotification: async () => "unsupported",
  stopLiveNotification: async () => "unsupported",
  getCurrentLocation: async () => { throw new Error("location_unsupported"); },
};

let activeBridge: NativeBridge = webNativeBridge;

/** Dependency-injection point: a future Capacitor/Android wrapper registers its bridge here at startup. */
export function setNativeBridge(bridge: NativeBridge) { activeBridge = bridge; }
export function resetNativeBridge() { activeBridge = webNativeBridge; }
export const nativeBridge: NativeBridge = {
  isNativeApp: () => activeBridge.isNativeApp(),
  getPlatform: () => activeBridge.getPlatform(),
  getPlatformInfo: () => activeBridge.getPlatformInfo().catch(() => ({ ...webPlatformInfo })),
  openExternalUrl: (url) => activeBridge.openExternalUrl(url).catch(() => undefined),
  requestPermission: (permission) => activeBridge.requestPermission(permission).catch(() => false),
  getDeviceTimezone: () => activeBridge.getDeviceTimezone(),
  getDeviceLocale: () => activeBridge.getDeviceLocale(),
  sendNowBarUpdate: (data) => activeBridge.sendNowBarUpdate(data).catch(() => undefined),
  clearNowBar: () => activeBridge.clearNowBar().catch(() => undefined),
  openNativeScreen: (screen, params) => activeBridge.openNativeScreen(screen, params).catch(() => undefined),
  requestNotificationPermission: () => activeBridge.requestNotificationPermission().catch(() => "unsupported" as const),
  startLiveNotification: (c) => activeBridge.startLiveNotification(c).catch(() => "error" as const),
  updateLiveNotification: (c) => activeBridge.updateLiveNotification(c).catch(() => "error" as const),
  stopLiveNotification: () => activeBridge.stopLiveNotification().catch(() => "error" as const),
};
