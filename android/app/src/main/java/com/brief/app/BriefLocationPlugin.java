package com.brief.app;

import android.Manifest;
import android.location.Location;
import android.location.LocationManager;
import com.getcapacitor.JSObject;
import com.getcapacitor.PermissionState;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.annotation.Permission;

/** Provides a fresh device location for weather without exposing native APIs to web code. */
@CapacitorPlugin(
    name = "BriefLocation",
    permissions = { @Permission(alias = "location", strings = { Manifest.permission.ACCESS_COARSE_LOCATION, Manifest.permission.ACCESS_FINE_LOCATION }) }
)
public class BriefLocationPlugin extends Plugin {
    @PluginMethod
    public void getCurrentLocation(PluginCall call) {
        if (getPermissionState("location") != PermissionState.GRANTED) {
            requestPermissionForAlias("location", call, "locationPermissionCallback");
            return;
        }
        resolveLocation(call);
    }

    private void locationPermissionCallback(PluginCall call) {
        if (getPermissionState("location") != PermissionState.GRANTED) {
            call.reject("permission_denied", "PERMISSION_DENIED");
            return;
        }
        resolveLocation(call);
    }

    private void resolveLocation(PluginCall call) {
        LocationManager manager = (LocationManager) getContext().getSystemService(android.content.Context.LOCATION_SERVICE);
        Location best = null;
        for (String provider : new String[] { LocationManager.NETWORK_PROVIDER, LocationManager.GPS_PROVIDER }) {
            try {
                Location candidate = manager.getLastKnownLocation(provider);
                if (candidate != null && (best == null || candidate.getTime() > best.getTime())) best = candidate;
            } catch (SecurityException ignored) {
                call.reject("permission_denied", "PERMISSION_DENIED");
                return;
            }
        }
        if (best == null || System.currentTimeMillis() - best.getTime() > 10 * 60 * 1000L) {
            call.reject("unavailable", "LOCATION_UNAVAILABLE");
            return;
        }
        JSObject result = new JSObject();
        result.put("latitude", best.getLatitude());
        result.put("longitude", best.getLongitude());
        call.resolve(result);
    }
}
