package com.brief.app;

import android.Manifest;
import android.location.Location;
import android.location.LocationListener;
import android.location.LocationManager;
import android.os.Handler;
import android.os.Looper;
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

        // Prefer a recent fix, but actively ask Android for one when the cached fix is absent or old.
        if (best != null && System.currentTimeMillis() - best.getTime() <= 5 * 60 * 1000L) {
            resolve(call, best);
            return;
        }

        final LocationListener[] listenerRef = new LocationListener[1];
        final Handler handler = new Handler(Looper.getMainLooper());
        final Runnable timeout = () -> {
            try { manager.removeUpdates(listenerRef[0]); } catch (SecurityException ignored) { }
            if (!call.isReleased()) call.reject("unavailable", "LOCATION_UNAVAILABLE");
        };
        LocationListener listener = location -> {
            handler.removeCallbacks(timeout);
            try { manager.removeUpdates(listenerRef[0]); } catch (SecurityException ignored) { }
            if (!call.isReleased()) resolve(call, location);
        };
        listenerRef[0] = listener;

        try {
            boolean requested = false;
            for (String provider : new String[] { LocationManager.NETWORK_PROVIDER, LocationManager.GPS_PROVIDER }) {
                if (manager.isProviderEnabled(provider)) {
                    manager.requestLocationUpdates(provider, 0L, 0f, listener, Looper.getMainLooper());
                    requested = true;
                }
            }
            if (!requested) {
                call.reject("unavailable", "LOCATION_UNAVAILABLE");
                return;
            }
            handler.postDelayed(timeout, 15_000L);
        } catch (SecurityException ignored) {
            call.reject("permission_denied", "PERMISSION_DENIED");
        }
    }

    private void resolve(PluginCall call, Location location) {
        JSObject result = new JSObject();
        result.put("latitude", location.getLatitude());
        result.put("longitude", location.getLongitude());
        call.resolve(result);
    }
}
