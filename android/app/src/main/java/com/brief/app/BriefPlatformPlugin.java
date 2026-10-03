package com.brief.app;

import android.content.pm.PackageInfo;
import android.os.Build;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

/** Reports non-sensitive runtime info only (OS version, app version). No identifiers, no permissions. */
@CapacitorPlugin(name = "BriefPlatform")
public class BriefPlatformPlugin extends Plugin {
    @PluginMethod
    public void getInfo(PluginCall call) {
        JSObject result = new JSObject();
        result.put("androidVersion", Build.VERSION.RELEASE);
        result.put("androidSdk", Build.VERSION.SDK_INT);
        String appVersion = "";
        try {
            PackageInfo info = getContext().getPackageManager().getPackageInfo(getContext().getPackageName(), 0);
            appVersion = info.versionName != null ? info.versionName : "";
        } catch (Exception ignored) { }
        result.put("appVersion", appVersion);
        call.resolve(result);
    }
}
