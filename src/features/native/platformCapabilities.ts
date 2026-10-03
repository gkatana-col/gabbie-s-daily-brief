import { nativeBridge } from "./nativeBridge";
import type { NativeBridge, PlatformCapabilities } from "./types";

/** Capabilities are derived from the bridge; on the web every native capability is false. */
export function getPlatformCapabilities(bridge: NativeBridge = nativeBridge): PlatformCapabilities {
  const isNativeApp = bridge.isNativeApp();
  const platform = bridge.getPlatform();
  const android = isNativeApp && platform === "android";
  return {
    isNativeApp,
    platform,
    supportsNowBar: false, // enabled only once a real, approved Android integration exists
    supportsNativeNotifications: android,
    supportsNativeCalendar: android,
    supportsHealthData: false,
    supportsHomeWidget: android,
  };
}

export const platformCapabilities = { get: getPlatformCapabilities };
