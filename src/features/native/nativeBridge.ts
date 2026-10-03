import type { NativeBridge } from "./types";

/** Safe browser implementation. Never throws because a native layer is missing. */
export const webNativeBridge: NativeBridge = {
  isNativeApp: () => false,
  getPlatform: () => "web",
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
};

let activeBridge: NativeBridge = webNativeBridge;

/** Dependency-injection point: a future Capacitor/Android wrapper registers its bridge here at startup. */
export function setNativeBridge(bridge: NativeBridge) { activeBridge = bridge; }
export function resetNativeBridge() { activeBridge = webNativeBridge; }
export const nativeBridge: NativeBridge = {
  isNativeApp: () => activeBridge.isNativeApp(),
  getPlatform: () => activeBridge.getPlatform(),
  openExternalUrl: (url) => activeBridge.openExternalUrl(url).catch(() => undefined),
  requestPermission: (permission) => activeBridge.requestPermission(permission).catch(() => false),
  getDeviceTimezone: () => activeBridge.getDeviceTimezone(),
  getDeviceLocale: () => activeBridge.getDeviceLocale(),
  sendNowBarUpdate: (data) => activeBridge.sendNowBarUpdate(data).catch(() => undefined),
  clearNowBar: () => activeBridge.clearNowBar().catch(() => undefined),
  openNativeScreen: (screen, params) => activeBridge.openNativeScreen(screen, params).catch(() => undefined),
};
