import { Capacitor, registerPlugin } from "@capacitor/core";
import { setNativeBridge, webNativeBridge, webPlatformInfo, nativeBridge } from "./nativeBridge";
import { createCapacitorCalendarProvider, setNativeCalendarProvider } from "./calendarProvider";
import { buildInitialTestContent, createLiveNotificationMethods, LIVE_NOTIFICATION_TEST } from "./liveNotification";
import type { NativeBridge, Platform, PlatformInfo } from "./types";

/** Mirrors android/app/src/main/java/com/brief/app/BriefPlatformPlugin.java. */
interface BriefPlatformPlugin {
  getInfo(): Promise<{ androidVersion: string; androidSdk: number; appVersion: string }>;
}
interface BriefLocationPlugin {
  getCurrentLocation(): Promise<{ latitude: number; longitude: number }>;
}
interface BriefAlarmPlugin {
  getNextAlarm(): Promise<{ triggerAt: string; time: string } | null>;
}
const BriefPlatform = registerPlugin<BriefPlatformPlugin>("BriefPlatform");
const BriefLocation = registerPlugin<BriefLocationPlugin>("BriefLocation");
const BriefAlarm = registerPlugin<BriefAlarmPlugin>("BriefAlarm");

/** Capacitor-backed bridge. Only capabilities that really exist natively are forwarded; the rest keep the safe web behaviour. */
export function createCapacitorBridge(): NativeBridge {
  const platform = Capacitor.getPlatform() as Platform;
  return {
    ...webNativeBridge,
    ...(platform === "android" && Capacitor.isPluginAvailable("BriefLiveNotification") ? createLiveNotificationMethods() : {}),
    isNativeApp: () => true,
    getPlatform: () => platform,
    getCurrentLocation: async () => {
      if (platform !== "android" || !Capacitor.isPluginAvailable("BriefLocation")) throw new Error("location_unsupported");
      return BriefLocation.getCurrentLocation();
    },
    getNextAlarm: async () => {
      if (platform !== "android" || !Capacitor.isPluginAvailable("BriefAlarm")) return null;
      return BriefAlarm.getNextAlarm();
    },
    async getPlatformInfo(): Promise<PlatformInfo> {
      const base: PlatformInfo = { ...webPlatformInfo, platform, native: true, capacitor: true };
      if (platform !== "android" || !Capacitor.isPluginAvailable("BriefPlatform")) return base;
      try {
        const info = await BriefPlatform.getInfo();
        return { ...base, androidVersion: info.androidVersion, androidSdk: info.androidSdk, appVersion: info.appVersion };
      } catch {
        return base;
      }
    },
  };
}

let installed = false;
/** Called once on the client at startup. In a normal browser this leaves the web bridge in place. */
export function installNativeBridge() {
  if (installed || typeof window === "undefined") return;
  installed = true;
  if (Capacitor.isNativePlatform()) {
    setNativeBridge(createCapacitorBridge());
    if (Capacitor.getPlatform() === "android" && Capacitor.isPluginAvailable("BriefCalendar")) {
      const provider = createCapacitorCalendarProvider();
      setNativeCalendarProvider(provider);
      void provider.checkPermission(); // reads state only, never prompts
    }
  }
  // Development/debug diagnostic: run `await briefNativeDiagnostics()` in the console (or chrome://inspect for the APK).
  if (import.meta.env.DEV || Capacitor.isNativePlatform()) {
    const w = window as unknown as Record<string, unknown>;
    w["briefNativeDiagnostics"] = () => nativeBridge.getPlatformInfo();
    // Dev/test hook for the Live Notification POC: briefLiveNotificationTest.requestPermission() → .start() → .update() → .stop()
    w["briefLiveNotificationTest"] = {
      requestPermission: () => nativeBridge.requestNotificationPermission(),
      start: () => nativeBridge.startLiveNotification(buildInitialTestContent()),
      update: () => nativeBridge.updateLiveNotification(LIVE_NOTIFICATION_TEST.updated),
      stop: () => nativeBridge.stopLiveNotification(),
    };
  }
}
