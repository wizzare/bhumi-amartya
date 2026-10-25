package com.bhumiamartya.app;

import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.view.ViewGroup;
import android.webkit.RenderProcessGoneDetail;
import android.webkit.WebView;
import com.bhumiamartya.app.billing.BhumiBillingPlugin;
import com.getcapacitor.BridgeActivity;
import com.getcapacitor.Logger;
import com.getcapacitor.WebViewListener;

public class MainActivity extends BridgeActivity {
    private static final long RELOAD_DELAY_MS = 500;
    private static final long CRASH_LOOP_WINDOW_MS = 30000;
    private static final int MAX_CRASH_COUNT_IN_WINDOW = 2;
    private long lastCrashTimestamp = 0;
    private int consecutiveCrashCount = 0;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        registerPlugin(BhumiBillingPlugin.class);
        registerPlugin(ReviewPlugin.class);
        registerPlugin(AppUpdatePlugin.class);
        super.onCreate(savedInstanceState);

        if (getBridge() != null) {
            getBridge().addWebViewListener(new WebViewListener() {
                @Override
                public boolean onRenderProcessGone(WebView webView, RenderProcessGoneDetail detail) {
                    boolean didCrash = detail != null && detail.didCrash();
                    Logger.warn("WebView render process gone. didCrash=" + didCrash);

                    long now = System.currentTimeMillis();
                    if (now - lastCrashTimestamp < CRASH_LOOP_WINDOW_MS) {
                        consecutiveCrashCount++;
                    } else {
                        consecutiveCrashCount = 1;
                    }
                    lastCrashTimestamp = now;

                    if (consecutiveCrashCount > MAX_CRASH_COUNT_IN_WINDOW) {
                        Logger.error("Excessive WebView crashes detected (" + consecutiveCrashCount + "). Avoiding crash loop.");
                        return false;
                    }

                    if (webView != null) {
                        ViewGroup parent = (ViewGroup) webView.getParent();
                        if (parent != null) {
                            parent.removeView(webView);
                        }
                        webView.destroy();
                    }

                    new Handler(Looper.getMainLooper()).postDelayed(new Runnable() {
                        @Override
                        public void run() {
                            if (!isFinishing() && !isDestroyed()) {
                                recreate();
                            }
                        }
                    }, RELOAD_DELAY_MS);

                    return true;
                }
            });
        }
    }
}
