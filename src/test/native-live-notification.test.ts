import { afterEach, describe, expect, it } from "vitest";
import { nativeBridge, resetNativeBridge, setNativeBridge, webNativeBridge } from "@/features/native/nativeBridge";
import { buildInitialTestContent, createLiveNotificationMethods, LIVE_NOTIFICATION_TEST, type BriefLiveNotificationPlugin } from "@/features/native/liveNotification";

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
    expect(await nativeBridge.startLiveNotification(buildInitialTestContent())).toBe("unsupported");
    expect(await nativeBridge.updateLiveNotification(LIVE_NOTIFICATION_TEST.updated)).toBe("unsupported");
    expect(await nativeBridge.stopLiveNotification()).toBe("unsupported");
  });

  it("starts, updates and stops through the bridge", async () => {
    let last: unknown;
    setNativeBridge({ ...webNativeBridge, ...createLiveNotificationMethods(plugin({ update: async (c) => { last = c; return { status: "updated" }; } })) });
    expect(await nativeBridge.startLiveNotification(buildInitialTestContent())).toBe("shown");
    expect(await nativeBridge.updateLiveNotification(LIVE_NOTIFICATION_TEST.updated)).toBe("updated");
    expect(last).toMatchObject({ title: "Brief · Обновено", text: "Live briefing е активно" });
    expect(await nativeBridge.stopLiveNotification()).toBe("stopped");
  });

  it("returns permission_denied cleanly", async () => {
    const denied = Object.assign(new Error("permission_denied"), { code: "PERMISSION_DENIED" });
    const m = createLiveNotificationMethods(plugin({ requestNotificationPermission: async () => ({ notifications: "denied" }), start: () => Promise.reject(denied) }));
    expect(await m.requestNotificationPermission()).toBe("denied");
    expect(await m.startLiveNotification(buildInitialTestContent())).toBe("permission_denied");
  });
});

describe("live notification time-of-day greeting", () => {
  const at = (h: number, m: number) => buildInitialTestContent(new Date(2026, 9, 3, h, m)).title;
  it("uses the device local hour, never a hardcoded greeting", () => {
    expect(at(5, 0)).toBe("Brief · Добро утро");
    expect(at(10, 59)).toBe("Brief · Добро утро");
    expect(at(11, 0)).toBe("Brief · Добър ден");
    expect(at(16, 59)).toBe("Brief · Добър ден");
    expect(at(17, 0)).toBe("Brief · Добър вечер");
    expect(at(21, 59)).toBe("Brief · Добър вечер");
    expect(at(23, 30)).toBe("Brief · Добър вечер");
  });
});
