import { Capacitor, registerPlugin } from "@capacitor/core";
import { setNativeBridge, webNativeBridge, webPlatformInfo, nativeBridge } from "./nativeBridge";
import type { NativeBridge, Platform, PlatformInfo } from "./types";

/** Mirrors android/app/src/main/java/com/brief/app/BriefPlatformPlugin.java. */
interface BriefPlatformPlugin {
  getInfo(): Promise<{ androidVersion: string; androidSdk: number; appVersion: string }>;
}
const BriefPlatform = registerPlugin<BriefPlatformPlugin>("BriefPlatform");

/** Capacitor-backed bridge. Only capabilities that really exist natively are forwarded; the rest keep the safe web behaviour. */
export function createCapacitorBridge(): NativeBridge {
  const platform = Capacitor.getPlatform() as Platform;
  return {
    ...webNativeBridge,
    isNativeApp: () => true,
    getPlatform: () => platform,
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
  if (Capacitor.isNativePlatform()) setNativeBridge(createCapacitorBridge());
  // Development/debug diagnostic: run `await briefNativeDiagnostics()` in the console (or chrome://inspect for the APK).
  if (import.meta.env.DEV || Capacitor.isNativePlatform()) {
    (window as unknown as { briefNativeDiagnostics: () => Promise<PlatformInfo> }).briefNativeDiagnostics = () => nativeBridge.getPlatformInfo();
  }
}
