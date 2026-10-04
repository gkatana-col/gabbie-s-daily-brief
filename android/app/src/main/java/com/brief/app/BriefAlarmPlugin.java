package com.brief.app;

import android.app.AlarmManager;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

/** Read-only access to the next alarm exposed by Android. Never creates or changes alarms. */
@CapacitorPlugin(name = "BriefAlarm")
public class BriefAlarmPlugin extends Plugin {
    @PluginMethod
    public void getNextAlarm(PluginCall call) {
        Long triggerAt = BriefSchedule.nextAlarmTimestamp(getContext());
        if (triggerAt == null || triggerAt <= System.currentTimeMillis()) {
            call.resolve();
            return;
        }
        JSObject result = new JSObject();
        result.put("triggerAt", java.time.Instant.ofEpochMilli(triggerAt).toString());
        result.put("time", BriefSchedule.formatAlarmTime(triggerAt));
        call.resolve(result);
    }
}
