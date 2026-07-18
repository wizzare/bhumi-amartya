package com.bhumiamartya.app;

import android.os.Bundle;
import com.bhumiamartya.app.billing.BhumiBillingPlugin;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        registerPlugin(BhumiBillingPlugin.class);
        registerPlugin(ReviewPlugin.class);
        registerPlugin(AppUpdatePlugin.class);
        super.onCreate(savedInstanceState);
    }
}
