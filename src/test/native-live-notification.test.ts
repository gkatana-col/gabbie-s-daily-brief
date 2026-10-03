import { afterEach, describe, expect, it } from "vitest";
import { nativeBridge, resetNativeBridge, setNativeBridge, webNativeBridge } from "@/features/native/nativeBridge";
import { createLiveNotificationMethods, LIVE_NOTIFICATION_TEST, type BriefLiveNotificationPlugin } from "@/features/native/liveNotification";

afterEach(() => resetNativeBridge());

const plugin = (overrides: Partial<BriefLiveNotificationPlugin> = {}): BriefLiveNotificationPlugin => ({
  requestNotificationPermission: async () => ({ notifications: "granted" }),
  start: async () => ({ status: "shown" }),
  update: async () => ({ status: "updated" }),
  stop: async () => ({ status: "stopped" }),
  ...overrides,
});

describe("live notification POC", () => {
  it("is unsupported in the browser and never throws", async () => {
    expect(await nativeBridge.requestNotificationPermission()).toBe("unsupported");
    expect(await nativeBridge.startLiveNotification(LIVE_NOTIFICATION_TEST.initial)).toBe("unsupported");
    expect(await nativeBridge.updateLiveNotification(LIVE_NOTIFICATION_TEST.updated)).toBe("unsupported");
    expect(await nativeBridge.stopLiveNotification()).toBe("unsupported");
  });

  it("starts, updates and stops through the bridge", async () => {
    let last: unknown;
    setNativeBridge({ ...webNativeBridge, ...createLiveNotificationMethods(plugin({ update: async (c) => { last = c; return { status: "updated" }; } })) });
    expect(await nativeBridge.startLiveNotification(LIVE_NOTIFICATION_TEST.initial)).toBe("shown");
    expect(await nativeBridge.updateLiveNotification(LIVE_NOTIFICATION_TEST.updated)).toBe("updated");
    expect(last).toMatchObject({ title: "Brief · Обновено", text: "Live briefing е активно" });
    expect(await nativeBridge.stopLiveNotification()).toBe("stopped");
  });

  it("returns permission_denied cleanly", async () => {
    const denied = Object.assign(new Error("permission_denied"), { code: "PERMISSION_DENIED" });
    const m = createLiveNotificationMethods(plugin({ requestNotificationPermission: async () => ({ notifications: "denied" }), start: () => Promise.reject(denied) }));
    expect(await m.requestNotificationPermission()).toBe("denied");
    expect(await m.startLiveNotification(LIVE_NOTIFICATION_TEST.initial)).toBe("permission_denied");
  });
});
