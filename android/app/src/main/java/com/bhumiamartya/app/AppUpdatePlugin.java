package com.bhumiamartya.app;

import com.android.billingclient.api.BillingClient;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.google.android.play.core.appupdate.AppUpdateInfo;
import com.google.android.play.core.appupdate.AppUpdateManager;
import com.google.android.play.core.appupdate.AppUpdateManagerFactory;
import com.google.android.play.core.install.model.AppUpdateType;
import com.google.android.play.core.install.model.UpdateAvailability;

@CapacitorPlugin(name = "AppUpdate")
public class AppUpdatePlugin extends Plugin {
    private static final int UPDATE_REQUEST_CODE = 7201;
    private AppUpdateManager manager;

    @Override
    public void load() {
        manager = AppUpdateManagerFactory.create(getContext());
    }

    @PluginMethod
    public void check(PluginCall call) {
        if (manager == null) { call.resolve(); return; }
        manager.getAppUpdateInfo().addOnSuccessListener(info -> {
            boolean available = info.updateAvailability() == UpdateAvailability.UPDATE_AVAILABLE;
            boolean flexible = available && info.isUpdateTypeAllowed(AppUpdateType.FLEXIBLE);
            boolean immediate = available && info.isUpdateTypeAllowed(AppUpdateType.IMMEDIATE);
            com.getcapacitor.JSObject result = new com.getcapacitor.JSObject();
            result.put("available", available);
            result.put("flexibleAllowed", flexible);
            result.put("immediateAllowed", immediate);
            result.put("downloading", info.installStatus() == 2);
            result.put("downloaded", info.installStatus() == 11);
            call.resolve(result);
        }).addOnFailureListener(error -> call.resolve());
    }

    @PluginMethod
    public void startFlexible(PluginCall call) {
        if (manager == null) { call.resolve(); return; }
        manager.getAppUpdateInfo().addOnSuccessListener(info -> {
            if (!info.isUpdateTypeAllowed(AppUpdateType.FLEXIBLE)) { call.resolve(); return; }
            try {
                manager.startUpdateFlowForResult(info, AppUpdateType.FLEXIBLE, getActivity(), UPDATE_REQUEST_CODE);
                call.resolve();
            } catch (Exception error) {
                call.resolve();
            }
        }).addOnFailureListener(error -> call.resolve());
    }

    @PluginMethod
    public void complete(PluginCall call) {
        if (manager == null) { call.resolve(); return; }
        manager.completeUpdate().addOnCompleteListener(result -> call.resolve());
    }
}
