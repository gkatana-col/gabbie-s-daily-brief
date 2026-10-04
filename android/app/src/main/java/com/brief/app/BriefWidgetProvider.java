package com.brief.app;

import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.view.View;
import android.widget.RemoteViews;
import java.util.Calendar;

/** Native home-screen widget: sparkle, greeting, next real calendar event, next alarm. */
public class BriefWidgetProvider extends AppWidgetProvider {
    @Override
    public void onUpdate(Context ctx, AppWidgetManager mgr, int[] ids) {
        for (int id : ids) mgr.updateAppWidget(id, views(ctx));
        BriefSchedule.schedule(ctx);
    }

    @Override
    public void onEnabled(Context ctx) {
        BriefSchedule.schedule(ctx);
        refreshAll(ctx);
    }

    @Override
    public void onReceive(Context ctx, Intent intent) {
        super.onReceive(ctx, intent);
        if (AppWidgetManager.ACTION_APPWIDGET_UPDATE.equals(intent.getAction())) {
            refreshAll(ctx);
        }
    }

    @Override
    public void onDeleted(Context ctx, int[] ids) {
        super.onDeleted(ctx, ids);
        if (AppWidgetManager.getInstance(ctx)
                .getAppWidgetIds(new ComponentName(ctx, BriefWidgetProvider.class)).length == 0) {
            BriefSchedule.schedule(ctx);
        }
    }

    @Override
    public void onDisabled(Context ctx) {
        super.onDisabled(ctx);
        BriefSchedule.schedule(ctx);
    }

    @Override
    public void onAppWidgetOptionsChanged(Context ctx, AppWidgetManager mgr, int id, android.os.Bundle options) {
        mgr.updateAppWidget(id, views(ctx));
    }

    static void refreshAll(Context ctx) {
        try {
            AppWidgetManager mgr = AppWidgetManager.getInstance(ctx);
            int[] ids = mgr.getAppWidgetIds(new ComponentName(ctx, BriefWidgetProvider.class));
            for (int id : ids) mgr.updateAppWidget(id, views(ctx));
        } catch (Exception ignored) {}
    }

    private static RemoteViews views(Context ctx) {
        RemoteViews v = new RemoteViews(ctx.getPackageName(), R.layout.brief_widget);
        v.setTextViewText(R.id.widget_greeting, BriefSchedule.greeting(Calendar.getInstance().get(Calendar.HOUR_OF_DAY)));
        String ev = BriefSchedule.nextEvent(ctx);
        v.setTextViewText(R.id.widget_event, ev != null ? ev : "Няма предстоящи събития");
        String alarm = BriefSchedule.nextAlarm(ctx);
        if (alarm != null) { v.setTextViewText(R.id.widget_alarm, "Аларма · " + alarm); v.setViewVisibility(R.id.widget_alarm, View.VISIBLE); }
        else v.setViewVisibility(R.id.widget_alarm, View.GONE);
        Intent open = new Intent(ctx, MainActivity.class).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_SINGLE_TOP);
        v.setOnClickPendingIntent(R.id.widget_root, PendingIntent.getActivity(ctx, 1, open, PendingIntent.FLAG_IMMUTABLE | PendingIntent.FLAG_UPDATE_CURRENT));
        return v;
    }
}
