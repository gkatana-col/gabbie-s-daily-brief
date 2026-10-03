package com.brief.app;

import java.util.Calendar;

/**
 * Single source of the Live Notification time-of-day accent. Visual only.
 * DEFAULT = null → no accent is set, i.e. the exact pre-theme appearance.
 */
final class BriefTimeOfDayTheme {
    // Soft, restrained accents (used via the official Notification#setColor accent / small-icon tint).
    static final int MORNING = 0xFFE8907A; // sunrise coral-peach
    static final int DAY     = 0xFF5FA8D3; // soft sky blue
    static final int EVENING = 0xFFC9787F; // sunset coral-mauve
    static final int NIGHT   = 0xFF4A5A9C; // calm indigo
    static final Integer DEFAULT = null;

    private BriefTimeOfDayTheme() {}

    /** Explicit Brief period wins; null/absent → local device hour; unknown value → DEFAULT. Never throws. */
    static Integer resolve(String period) {
        try {
            if (period == null || period.isEmpty()) return forHour(Calendar.getInstance().get(Calendar.HOUR_OF_DAY));
            switch (period) {
                case "morning": return MORNING;
                case "day": return DAY;
                case "evening": return EVENING;
                case "night": return NIGHT;
                default: return DEFAULT;
            }
        } catch (Exception e) {
            return DEFAULT;
        }
    }

    static Integer forHour(int h) {
        if (h < 0 || h > 23) return DEFAULT;
        if (h >= 5 && h <= 10) return MORNING;
        if (h >= 11 && h <= 16) return DAY;
        if (h >= 17 && h <= 21) return EVENING;
        return NIGHT;
    }
}
