package com.bhumiamartya.app;

import android.app.Activity;
import android.content.Context;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.google.android.play.core.review.ReviewInfo;
import com.google.android.play.core.review.ReviewManager;
import com.google.android.play.core.review.ReviewManagerFactory;
import com.google.android.gms.tasks.Task;

@CapacitorPlugin(name = "Review")
public class ReviewPlugin extends Plugin {

    @PluginMethod
    public void requestReview(PluginCall call) {
        try {
            Context context = getContext();
            Activity initialActivity = getActivity();
            if (context == null || initialActivity == null || initialActivity.isFinishing() || initialActivity.isDestroyed()) {
                JSObject result = new JSObject();
                result.put("flowCompleted", false);
                result.put("submittedReviewKnown", false);
                result.put("reason", "activity_unavailable");
                call.resolve(result);
                return;
            }

            ReviewManager manager = ReviewManagerFactory.create(context);
            Task<ReviewInfo> request = manager.requestReviewFlow();
            request.addOnCompleteListener(task -> {
                try {
                    Activity activity = getActivity();
                    if (!task.isSuccessful() || activity == null || activity.isFinishing() || activity.isDestroyed()) {
                        JSObject result = new JSObject();
                        result.put("flowCompleted", false);
                        result.put("submittedReviewKnown", false);
                        result.put("reason", task.isSuccessful() ? "activity_unavailable" : "request_flow_unavailable");
                        call.resolve(result);
                        return;
                    }

                    ReviewInfo reviewInfo = task.getResult();
                    if (reviewInfo == null) {
                        JSObject result = new JSObject();
                        result.put("flowCompleted", false);
                        result.put("submittedReviewKnown", false);
                        result.put("reason", "review_info_null");
                        call.resolve(result);
                        return;
                    }

                    Task<Void> flow = manager.launchReviewFlow(activity, reviewInfo);
                    flow.addOnCompleteListener(reviewTask -> {
                        // Play In-App Review API never indicates whether the user rated or dismissed.
                        JSObject result = new JSObject();
                        result.put("flowCompleted", reviewTask.isSuccessful());
                        result.put("submittedReviewKnown", false);
                        call.resolve(result);
                    });
                } catch (Throwable innerError) {
                    JSObject result = new JSObject();
                    result.put("flowCompleted", false);
                    result.put("submittedReviewKnown", false);
                    result.put("reason", "launch_exception");
                    call.resolve(result);
                }
            });
        } catch (Throwable outerError) {
            JSObject result = new JSObject();
            result.put("flowCompleted", false);
            result.put("submittedReviewKnown", false);
            result.put("reason", "plugin_exception");
            call.resolve(result);
        }
    }
}
