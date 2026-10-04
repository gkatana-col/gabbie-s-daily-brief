package com.brief.app;

import android.Manifest;
import android.app.AlarmManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.content.pm.PackageManager;
import android.database.Cursor;
import android.net.Uri;
import android.content.ContentUris;
import android.provider.CalendarContract;
import java.text.SimpleDateFormat;
import java.util.Calendar;
import java.util.Locale;

/** Period lifecycle (05/11/17/22 boundaries) via one inexact AlarmManager alarm — no service, no extra permission. */
final class BriefSchedule {
    private static final String PREFS = "brief_live";
    private BriefSchedule() {}

    /** Same rule as the web time-of-day logic. There is no Brief during 22:00–04:59. */
    static String greeting(int h) {
        if (h >= 5 && h <= 10) return "Добро утро";
        if (h >= 11 && h <= 16) return "Добър ден";
        if (h >= 17 && h <= 21) return "Добър вечер";
        return "";
    }

    static boolean isActiveHour(int h) { return h >= 5 && h <= 21; }

    static long nextBoundary(long now) {
        Calendar c = Calendar.getInstance();
        c.setTimeInMillis(now);
        int h = c.get(Calendar.HOUR_OF_DAY);
        int[] b = {5, 11, 17, 22};
        int next = -1;
        for (int x : b) if (x > h) { next = x; break; }
        if (next < 0) { c.add(Calendar.DAY_OF_YEAR, 1); next = 5; }
        c.set(Calendar.HOUR_OF_DAY, next); c.set(Calendar.MINUTE, 0); c.set(Calendar.SECOND, 5); c.set(Calendar.MILLISECOND, 0);
        return c.getTimeInMillis();
    }

    static void setActive(Context ctx, boolean active, String title, String text, int progress) {
        SharedPreferences.Editor e = ctx.getSharedPreferences(PREFS, Context.MODE_PRIVATE).edit().putBoolean("active", active);
        if (text != null) e.putString("text", text).putInt("progress", progress);
        e.apply();
        schedule(ctx);
        BriefWidgetProvider.refreshAll(ctx);
    }

    static boolean isActive(Context ctx) { return ctx.getSharedPreferences(PREFS, Context.MODE_PRIVATE).getBoolean("active", false); }

    /** Called at each boundary: end the Brief at night and repost it when the next active period starts. */
    static void onBoundary(Context ctx) {
        SharedPreferences p = ctx.getSharedPreferences(PREFS, Context.MODE_PRIVATE);
        int hour = Calendar.getInstance().get(Calendar.HOUR_OF_DAY);
        if (!isActiveHour(hour)) {
            BriefLiveNotificationPlugin.cancel(ctx);
            p.edit().putBoolean("active", false).apply();
        } else if (p.getString("text", null) != null) {
            String title = "Brief · " + greeting(hour);
            BriefLiveNotificationPlugin.repost(ctx, title, p.getString("text", ""), p.getInt("progress", 25));
            p.edit().putBoolean("active", true).apply();
        }
        BriefWidgetProvider.refreshAll(ctx);
        schedule(ctx);
    }

    static void schedule(Context ctx) {
        try {
            AlarmManager am = (AlarmManager) ctx.getSystemService(Context.ALARM_SERVICE);
            PendingIntent pi = PendingIntent.getBroadcast(ctx, 0, new Intent(ctx, BriefPeriodReceiver.class), PendingIntent.FLAG_IMMUTABLE | PendingIntent.FLAG_UPDATE_CURRENT);
            // Inexact alarm: battery friendly and needs no SCHEDULE_EXACT_ALARM permission.
            am.set(AlarmManager.RTC, nextBoundary(System.currentTimeMillis()), pi);
        } catch (Exception ignored) {}
    }

    /** Next real calendar event (read-only, existing READ_CALENDAR permission); null if none/denied. */
    static String nextEvent(Context ctx) {
        if (ctx.checkSelfPermission(Manifest.permission.READ_CALENDAR) != PackageManager.PERMISSION_GRANTED) return null;
        long now = System.currentTimeMillis();
        Uri.Builder ub = CalendarContract.Instances.CONTENT_URI.buildUpon();
        ContentUris.appendId(ub, now);
        ContentUris.appendId(ub, now + 7L * 24 * 3600 * 1000);
        String[] proj = {CalendarContract.Instances.TITLE, CalendarContract.Instances.BEGIN, CalendarContract.Instances.ALL_DAY};
        try (Cursor c = ctx.getContentResolver().query(ub.build(), proj, null, null, CalendarContract.Instances.BEGIN + " ASC")) {
            while (c != null && c.moveToNext()) {
                long begin = c.getLong(1);
                if (begin < now && c.getInt(2) != 1) continue;
                Calendar eventDate = Calendar.getInstance();
                eventDate.setTimeInMillis(begin);
                Calendar today = Calendar.getInstance();
                boolean tomorrow = eventDate.get(Calendar.YEAR) == today.get(Calendar.YEAR)
                    && eventDate.get(Calendar.DAY_OF_YEAR) == today.get(Calendar.DAY_OF_YEAR) + 1;
                String prefix = tomorrow && today.get(Calendar.HOUR_OF_DAY) >= 17 ? "Утре · " : "";
                String fmt = c.getInt(2) == 1 ? "dd.MM" : "dd.MM · HH:mm";
                return prefix + new SimpleDateFormat(fmt, Locale.getDefault()).format(begin) + " · " + c.getString(0);
            }
        } catch (Exception ignored) {}
        return null;
    }

    static String nextAlarm(Context ctx) {
        try {
            AlarmManager.AlarmClockInfo a = ((AlarmManager) ctx.getSystemService(Context.ALARM_SERVICE)).getNextAlarmClock();
            return a == null ? null : new SimpleDateFormat("HH:mm", Locale.getDefault()).format(a.getTriggerTime());
        } catch (Exception e) { return null; }
    }
}
