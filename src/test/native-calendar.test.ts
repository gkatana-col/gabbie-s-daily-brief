import { afterEach, describe, expect, it } from "vitest";
import { createCapacitorCalendarProvider, getNativeCalendarProvider, mapNativeCalendarEvents, resetNativeCalendarProvider, type BriefCalendarPlugin } from "@/features/native/calendarProvider";
import { getPlatformCapabilities } from "@/features/native/platformCapabilities";

afterEach(() => resetNativeCalendarProvider());

const plugin = (state: string, events: unknown[] = []): BriefCalendarPlugin => ({
  checkPermissions: async () => ({ calendar: state }),
  requestPermissions: async () => ({ calendar: state }),
  getEvents: async () => ({ events: events as never }),
});

describe("native calendar", () => {
  it("keeps the mock provider and no calendar capability in the browser", async () => {
    const p = getNativeCalendarProvider();
    expect(p.source).toBe("mock");
    expect(await p.requestPermission()).toBe("unsupported");
    expect((await p.getTodayEvents()).length).toBeGreaterThan(0);
    expect(getPlatformCapabilities().supportsNativeCalendar).toBe(false);
  });

  it("returns a clean permission-denied state without throwing", async () => {
    const p = createCapacitorCalendarProvider(plugin("denied"));
    expect(await p.requestPermission()).toBe("denied");
    expect(await p.getEvents(new Date(0), new Date(1))).toEqual({ status: "permission_denied", events: [] });
    expect(await p.getTodayEvents()).toEqual([]);
  });

  it("maps native events to Brief's fields", async () => {
    const raw = [
      { id: "7:1791025200000", title: " Лекция ", begin: 1791025200000, end: 1791028800000, allDay: false, calendarName: "Университет" },
      { id: 3, title: null, begin: 1790985600000, end: 1791072000000, allDay: true, calendarName: null },
    ];
    expect(mapNativeCalendarEvents(raw)).toEqual([
      { id: "3", title: "", startTime: "2026-10-03T00:00:00.000Z", endTime: "2026-10-04T00:00:00.000Z", allDay: true, calendarName: "" },
      { id: "7:1791025200000", title: "Лекция", startTime: "2026-10-03T11:00:00.000Z", endTime: "2026-10-03T12:00:00.000Z", allDay: false, calendarName: "Университет" },
    ]);
    const p = createCapacitorCalendarProvider(plugin("granted", raw));
    const result = await p.getEvents(new Date(0), new Date(1));
    expect(result.status).toBe("ok");
    expect(result.events).toHaveLength(2);
  });
});
