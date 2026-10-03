package com.brief.app;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(BriefPlatformPlugin.class);
        registerPlugin(BriefCalendarPlugin.class);
        super.onCreate(savedInstanceState);
    }
}
