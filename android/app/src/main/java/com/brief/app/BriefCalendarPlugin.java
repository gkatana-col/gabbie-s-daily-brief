package com.brief.app;

import android.Manifest;
import android.content.ContentUris;
import android.database.Cursor;
import android.net.Uri;
import android.provider.CalendarContract;
import com.getcapacitor.JSArray;
import com.getcapacitor.JSObject;
import com.getcapacitor.PermissionState;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.annotation.Permission;

/** Read-only access to CalendarContract.Instances. Never writes; permission is requested only when JS asks. */
@CapacitorPlugin(
    name = "BriefCalendar",
    permissions = { @Permission(alias = "calendar", strings = { Manifest.permission.READ_CALENDAR }) }
)
public class BriefCalendarPlugin extends Plugin {
    @PluginMethod
    public void getEvents(PluginCall call) {
        if (getPermissionState("calendar") != PermissionState.GRANTED) {
            call.reject("permission_denied", "PERMISSION_DENIED");
            return;
        }
        Long from = call.getLong("from");
        Long to = call.getLong("to");
        if (from == null || to == null || to < from) {
            call.reject("invalid_range", "INVALID_RANGE");
            return;
        }
        Uri.Builder builder = CalendarContract.Instances.CONTENT_URI.buildUpon();
        ContentUris.appendId(builder, from);
        ContentUris.appendId(builder, to);
        String[] projection = {
            CalendarContract.Instances.EVENT_ID,
            CalendarContract.Instances.TITLE,
            CalendarContract.Instances.BEGIN,
            CalendarContract.Instances.END,
            CalendarContract.Instances.ALL_DAY,
            CalendarContract.Instances.CALENDAR_DISPLAY_NAME
        };
        JSArray events = new JSArray();
        try (Cursor c = getContext().getContentResolver().query(builder.build(), projection, null, null, CalendarContract.Instances.BEGIN + " ASC")) {
            while (c != null && c.moveToNext()) {
                JSObject e = new JSObject();
                e.put("id", c.getString(0) + ":" + c.getLong(2));
                e.put("title", c.getString(1));
                e.put("begin", c.getLong(2));
                e.put("end", c.getLong(3));
                e.put("allDay", c.getInt(4) == 1);
                e.put("calendarName", c.getString(5));
                events.put(e);
            }
        } catch (Exception ex) {
            call.reject("read_failed", "READ_FAILED");
            return;
        }
        JSObject result = new JSObject();
        result.put("events", events);
        call.resolve(result);
    }
}
