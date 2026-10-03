import { nativeBridge } from "./nativeBridge";
import { getCalendarPermissionState } from "./calendarProvider";
import type { NativeBridge, PlatformCapabilities } from "./types";

/** Capabilities are derived from the bridge; on the web every native capability is false. */
export function getPlatformCapabilities(bridge: NativeBridge = nativeBridge): PlatformCapabilities {
  const isNativeApp = bridge.isNativeApp();
  const platform = bridge.getPlatform();
  return {
    isNativeApp,
    platform,
    supportsNowBar: false, // enabled only once a real, approved Android integration exists
    supportsNativeNotifications: false, // each flag flips only when its native module ships
    supportsNativeCalendar: isNativeApp && platform === "android" && getCalendarPermissionState() === "granted",
    supportsHealthData: false,
    supportsHomeWidget: false,
  };
}

export const platformCapabilities = { get: getPlatformCapabilities };
