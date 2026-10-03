package com.brief.app;

import android.os.Build;
import android.os.Bundle;

/**
 * Isolated Samsung One UI hints. These are plain notification extras on top of the official
 * Android notification; non-Samsung devices never receive them and Samsung ignores them unless
 * One UI supports them for this app. No private APIs, no system access, no device identifiers.
 */
final class SamsungLiveNotificationExtras {
    private SamsungLiveNotificationExtras() {}

    static boolean isSamsung() {
        return "samsung".equalsIgnoreCase(Build.MANUFACTURER);
    }

    static void apply(Bundle extras, String title, String text) {
        if (!isSamsung()) return;
        extras.putInt("android.ongoingActivityNoti.style", 1);
        extras.putString("android.ongoingActivityNoti.primaryInfo", title);
        extras.putString("android.ongoingActivityNoti.secondaryInfo", text);
        extras.putString("android.ongoingActivityNoti.nowbarPrimaryInfo", title);
        extras.putString("android.ongoingActivityNoti.nowbarSecondaryInfo", text);
    }
}
