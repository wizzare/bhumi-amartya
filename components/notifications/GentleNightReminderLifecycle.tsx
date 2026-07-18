"use client";

import { useEffect } from "react";
import type { PluginListenerHandle } from "@capacitor/core";
import { LocalNotifications } from "@capacitor/local-notifications";
import { refreshGentleNightReminder } from "@/lib/notifications/gentleNightReminder";
import { cancelDailyReminders } from "@/lib/notifications/gentleNightReminder";
import { useAuth } from "@/context/AuthContext";

export function GentleNightReminderLifecycle() {
  const auth = useAuth();
  useEffect(() => {
    let listener: PluginListenerHandle | undefined;
    let notificationListener: PluginListenerHandle | undefined;
    let disposed = false;

    if (auth?.user) void refreshGentleNightReminder();
    else void cancelDailyReminders();
    void LocalNotifications.addListener("localNotificationActionPerformed", () => {
      window.location.href = "/dashboard";
    }).then((handle) => { notificationListener = handle; });

    void import("@capacitor/app").then(async ({ App }) => {
      const action = await App.addListener("appUrlOpen", ({ url }) => {
        if (url.includes("/dashboard") || url.includes("/catatan")) window.location.href = "/dashboard";
      });
      const handle = await App.addListener("appStateChange", ({ isActive }) => {
        if (isActive && auth?.user) void refreshGentleNightReminder();
      });
      if (disposed) { await handle.remove(); await action.remove(); }
      else listener = handle;
    });

    const onVisibilityChange = () => {
      if (document.visibilityState === "visible" && auth?.user) void refreshGentleNightReminder();
    };
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      disposed = true;
      document.removeEventListener("visibilitychange", onVisibilityChange);
      void listener?.remove();
      void notificationListener?.remove();
    };
  }, [auth?.user?.uid]);

  return null;
}
