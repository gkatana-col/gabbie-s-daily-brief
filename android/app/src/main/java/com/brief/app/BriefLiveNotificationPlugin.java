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
        status(call, "stopped");
    }

    private void post(PluginCall call, String okStatus) {
        if (!hasPermission()) { call.reject("permission_denied", "PERMISSION_DENIED"); return; }
        String title = call.getString("title", "Brief");
        String text = call.getString("text", "");
        int progress = Math.max(0, Math.min(100, call.getInt("progress", 0)));
        try {
            Context ctx = getContext();
            ensureChannel(ctx);
            Notification n = Build.VERSION.SDK_INT >= 36 ? buildLiveUpdate(ctx, title, text, progress) : buildCompat(ctx, title, text, progress);
            NotificationManagerCompat.from(ctx).notify(NOTIFICATION_ID, n);
            status(call, okStatus);
        } catch (SecurityException e) {
            call.reject("permission_denied", "PERMISSION_DENIED");
        } catch (Exception e) {
            call.reject("error", "ERROR");
        }
    }

    private void ensureChannel(Context ctx) {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) return;
        NotificationManager nm = ctx.getSystemService(NotificationManager.class);
        if (nm.getNotificationChannel(CHANNEL_ID) != null) return;
        // Live Updates must not use a MIN-importance channel.
        NotificationChannel ch = new NotificationChannel(CHANNEL_ID, "Brief Live", NotificationManager.IMPORTANCE_DEFAULT);
        ch.setDescription("Live briefing status");
        ch.setSound(null, null);
        nm.createNotificationChannel(ch);
    }

    private PendingIntent contentIntent(Context ctx) {
        Intent intent = new Intent(ctx, MainActivity.class).addFlags(Intent.FLAG_ACTIVITY_SINGLE_TOP);
        return PendingIntent.getActivity(ctx, 0, intent, PendingIntent.FLAG_IMMUTABLE | PendingIntent.FLAG_UPDATE_CURRENT);
    }

    /** Android 16 (API 36): official Live Update — ProgressStyle + promoted ongoing request. */
    private Notification buildLiveUpdate(Context ctx, String title, String text, int progress) {
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
        return b.build();
    }

    /** Older Android: plain ongoing notification (still carries the Samsung hints on One UI). */
    private Notification buildCompat(Context ctx, String title, String text, int progress) {
        Bundle extras = new Bundle();
        SamsungLiveNotificationExtras.apply(extras, title, text);
        return new NotificationCompat.Builder(ctx, CHANNEL_ID)
            .setSmallIcon(ctx.getApplicationInfo().icon)
            .setContentTitle(title)
            .setContentText(text)
            .setContentIntent(contentIntent(ctx))
            .setOngoing(true)
            .setOnlyAlertOnce(true)
            .setProgress(100, progress, false)
            .addExtras(extras)
            .build();
    }

    private void status(PluginCall call, String s) {
        JSObject r = new JSObject();
        r.put("status", s);
        call.resolve(r);
    }
}
