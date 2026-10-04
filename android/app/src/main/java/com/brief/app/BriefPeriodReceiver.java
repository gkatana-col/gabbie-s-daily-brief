package com.brief.app;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;

public class BriefPeriodReceiver extends BroadcastReceiver {
    @Override
    public void onReceive(Context context, Intent intent) { BriefSchedule.onBoundary(context); }
}
