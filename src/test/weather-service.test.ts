import { describe, expect, it } from "vitest";
import { conditionFor, toWeatherData, unitForLocale } from "@/features/weather/weatherService";

describe("weather service", () => {
  it("uses Celsius for Bulgaria and Fahrenheit for the US", () => {
    expect(unitForLocale("bg-BG")).toBe("C");
    expect(unitForLocale("en-GB")).toBe("C");
    expect(unitForLocale("en-US")).toBe("F");
  });
  it("maps WMO codes to localized conditions", () => {
    expect(conditionFor(0, "bg")).toBe("Ясно");
    expect(conditionFor(61, "en")).toBe("Rain");
  });
  it("converts a live reading to briefing weather input", () => {
    const d = toWeatherData({ temperature: 18, feelsLike: 17, high: 22, low: 9, code: 2, unit: "C", location: "София", fetchedAt: 0 }, "bg");
    expect(d).toMatchObject({ temperature: 18, condition: "Частично облачно", unit: "C", location: "София" });
  });
});
