package com.brief.app;

import android.Manifest;
import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.os.Build;
import android.os.Bundle;
import androidx.core.app.NotificationCompat;
import androidx.core.app.NotificationManagerCompat;
import com.getcapacitor.JSObject;
import com.getcapacitor.PermissionState;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.annotation.Permission;
import com.getcapacitor.annotation.PermissionCallback;

/** Live Notification proof of concept: one ongoing notification with a stable ID. No service, no auto-prompt. */
@CapacitorPlugin(
    name = "BriefLiveNotification",
    permissions = { @Permission(alias = "notifications", strings = { Manifest.permission.POST_NOTIFICATIONS }) }
)
public class BriefLiveNotificationPlugin extends Plugin {
    private static final String CHANNEL_ID = "brief_live";
    private static final int NOTIFICATION_ID = 4201;

    private boolean needsRuntimePermission() {
        return Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU;
    }

    private boolean hasPermission() {
        return !needsRuntimePermission() || getPermissionState("notifications") == PermissionState.GRANTED;
    }

    @PluginMethod
    public void requestNotificationPermission(PluginCall call) {
        if (hasPermission()) { resolvePermission(call, "granted"); return; }
        requestPermissionForAlias("notifications", call, "permissionCallback");
    }

    @PermissionCallback
    private void permissionCallback(PluginCall call) {
        resolvePermission(call, hasPermission() ? "granted" : "denied");
    }

    private void resolvePermission(PluginCall call, String state) {
        JSObject r = new JSObject();
        r.put("notifications", state);
        call.resolve(r);
    }

    @PluginMethod
    public void start(PluginCall call) { post(call, "shown"); }

    @PluginMethod
    public void update(PluginCall call) { post(call, "updated"); }

    @PluginMethod
    public void stop(PluginCall call) {
        NotificationManagerCompat.from(getContext()).cancel(NOTIFICATION_ID);
        BriefSchedule.setActive(getContext(), false, null, null, 0);
        status(call, "stopped");
    }

    private void post(PluginCall call, String okStatus) {
        if (!hasPermission()) { call.reject("permission_denied", "PERMISSION_DENIED"); return; }
        String title = call.getString("title", "Brief");
        String text = call.getString("text", "");
        int progress = Math.max(0, Math.min(100, call.getInt("progress", 0)));
        Integer accent = null;
        try { accent = BriefTimeOfDayTheme.resolve(call.getString("period")); } catch (Exception ignored) { accent = null; }
        try {
            Context ctx = getContext();
            ensureChannel(ctx);
            Notification n;
            try {
                n = build(ctx, title, text, progress, accent);
            } catch (Exception themeError) {
                // Theme must never block the notification: rebuild with the exact original appearance.
                n = build(ctx, title, text, progress, null);
            }
            NotificationManagerCompat.from(ctx).notify(NOTIFICATION_ID, n);
            BriefSchedule.setActive(ctx, true, title, text, progress);
            status(call, okStatus);
        } catch (SecurityException e) {
            call.reject("permission_denied", "PERMISSION_DENIED");
        } catch (Exception e) {
            call.reject("error", "ERROR");
        }
    }

    /** Re-posts the same notification (same ID/channel/style) from the period receiver. Never throws. */
    static void repost(Context ctx, String title, String text, int progress) {
        try {
            if (Build.VERSION.SDK_INT >= 33 && ctx.checkSelfPermission(Manifest.permission.POST_NOTIFICATIONS) != android.content.pm.PackageManager.PERMISSION_GRANTED) return;
            ensureChannel(ctx);
            Integer accent = BriefTimeOfDayTheme.resolve(null);
            Notification n;
            try { n = build(ctx, title, text, progress, accent); } catch (Exception e) { n = build(ctx, title, text, progress, null); }
            NotificationManagerCompat.from(ctx).notify(NOTIFICATION_ID, n);
        } catch (Exception ignored) {}
    }

    private static Notification build(Context ctx, String title, String text, int progress, Integer accent) {
        return Build.VERSION.SDK_INT >= 36 ? buildLiveUpdate(ctx, title, text, progress, accent) : buildCompat(ctx, title, text, progress, accent);
    }

    private static void ensureChannel(Context ctx) {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) return;
        NotificationManager nm = ctx.getSystemService(NotificationManager.class);
        if (nm.getNotificationChannel(CHANNEL_ID) != null) return;
        // Live Updates must not use a MIN-importance channel.
        NotificationChannel ch = new NotificationChannel(CHANNEL_ID, "Brief Live", NotificationManager.IMPORTANCE_DEFAULT);
        ch.setDescription("Live briefing status");
        ch.setSound(null, null);
        nm.createNotificationChannel(ch);
    }

    private static PendingIntent contentIntent(Context ctx) {
        Intent intent = new Intent(ctx, MainActivity.class).addFlags(Intent.FLAG_ACTIVITY_SINGLE_TOP);
        return PendingIntent.getActivity(ctx, 0, intent, PendingIntent.FLAG_IMMUTABLE | PendingIntent.FLAG_UPDATE_CURRENT);
    }

    /** Android 16 (API 36): official Live Update — ProgressStyle + promoted ongoing request. */
    private static Notification buildLiveUpdate(Context ctx, String title, String text, int progress, Integer accent) {
        Notification.ProgressStyle style = new Notification.ProgressStyle()
            .setProgress(progress)
            .setStyledByProgress(true);
        Bundle extras = new Bundle();
        SamsungLiveNotificationExtras.apply(extras, title, text);
        Notification.Builder b = new Notification.Builder(ctx, CHANNEL_ID)
            .setSmallIcon(ctx.getApplicationInfo().icon)
            .setContentTitle(title)
            .setContentText(text)
            .setContentIntent(contentIntent(ctx))
            .setOngoing(true)
            .setOnlyAlertOnce(true)
            .setStyle(style)
            .setShortCriticalText("Brief")
            .addExtras(extras);
        // Same effect as Notification.Builder#setRequestPromotedOngoing(true): that setter is not in the
        // compile SDK (android-36 r02), so the documented Notification.EXTRA_REQUEST_PROMOTED_ONGOING key is set directly.
        Bundle promoted = new Bundle();
        promoted.putBoolean("android.requestPromotedOngoing", true);
        b.addExtras(promoted);
        if (accent != null) b.setColor(accent); // official accent/small-icon tint; sparkle shape unchanged
        return b.build();
    }

    /** Older Android: plain ongoing notification (still carries the Samsung hints on One UI). */
    private static Notification buildCompat(Context ctx, String title, String text, int progress, Integer accent) {
        Bundle extras = new Bundle();
        SamsungLiveNotificationExtras.apply(extras, title, text);
        NotificationCompat.Builder b = new NotificationCompat.Builder(ctx, CHANNEL_ID)
            .setSmallIcon(ctx.getApplicationInfo().icon)
            .setContentTitle(title)
            .setContentText(text)
            .setContentIntent(contentIntent(ctx))
            .setOngoing(true)
            .setOnlyAlertOnce(true)
            .setProgress(100, progress, false)
            .addExtras(extras);
        if (accent != null) b.setColor(accent);
        return b.build();
    }

    private void status(PluginCall call, String s) {
        JSObject r = new JSObject();
        r.put("status", s);
        call.resolve(r);
    }
}
