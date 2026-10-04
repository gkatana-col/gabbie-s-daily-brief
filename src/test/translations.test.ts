import { describe, expect, it } from "vitest";
import { getTranslation } from "@/features/i18n/translations";

describe("Brief translations", () => {
  it("keeps navigation localized in Bulgarian and English", () => {
    expect(getTranslation("bg", "settings")).toBe("Настройки");
    expect(getTranslation("en", "settings")).toBe("Settings");
    expect(getTranslation("bg", "brand")).toBe("Brief");
    expect(getTranslation("en", "brand")).toBe("Brief");
    expect(getTranslation("bg", "pullToRefresh")).toBe("Издърпай за обновяване");
    expect(getTranslation("en", "pullToRefresh")).toBe("Pull to refresh");
    expect(getTranslation("bg", "refreshing")).toBe("Обновяване…");
    expect(getTranslation("en", "refreshing")).toBe("Refreshing…");
  });
});