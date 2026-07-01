package com.bhumiamartya.app;

import android.os.Bundle;
import com.bhumiamartya.app.billing.BhumiBillingPlugin;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        registerPlugin(BhumiBillingPlugin.class);
        super.onCreate(savedInstanceState);
    }
}
