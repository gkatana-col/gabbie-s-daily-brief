import { describe, expect, it } from "vitest";
import { getTranslation } from "@/features/i18n/translations";

describe("Brief translations", () => {
  it("keeps navigation localized in Bulgarian and English", () => {
    expect(getTranslation("bg", "settings")).toBe("Настройки");
    expect(getTranslation("en", "settings")).toBe("Settings");
    expect(getTranslation("bg", "brand")).toBe("Brief");
    expect(getTranslation("en", "brand")).toBe("Brief");
  });
});