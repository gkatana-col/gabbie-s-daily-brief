import { afterEach, describe, expect, it } from "vitest";
import { nativeBridge, resetNativeBridge, setNativeBridge, webNativeBridge } from "@/features/native/nativeBridge";
import { installNativeBridge } from "@/features/native/capacitorBridge";

afterEach(() => resetNativeBridge());

describe("getPlatformInfo", () => {
  it("returns the web state in a browser without throwing", async () => {
    installNativeBridge();
    expect(await nativeBridge.getPlatformInfo()).toEqual({ platform: "web", native: false, capacitor: false, androidVersion: null, androidSdk: null, appVersion: null });
  });
  it("falls back to web info when a native bridge fails", async () => {
    setNativeBridge({ ...webNativeBridge, getPlatformInfo: () => Promise.reject(new Error("missing")) });
    expect((await nativeBridge.getPlatformInfo()).native).toBe(false);
  });
});
