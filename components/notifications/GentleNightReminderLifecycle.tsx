"use client";

import { useEffect } from "react";
import type { PluginListenerHandle } from "@capacitor/core";
import { LocalNotifications } from "@capacitor/local-notifications";
import { refreshGentleNightReminder } from "@/lib/notifications/gentleNightReminder";
import { cancelDailyReminders } from "@/lib/notifications/gentleNightReminder";
import { useAuth } from "@/context/AuthContext";

function openDailyNote() {
  try {
    window.location.href = "/profile";
  } catch {
    window.location.href = "/dashboard";
  }
}

export function GentleNightReminderLifecycle() {
  const auth = useAuth();
  const hasUser = Boolean(auth?.user);
  useEffect(() => {
    let listener: PluginListenerHandle | undefined;
    let notificationListener: PluginListenerHandle | undefined;
    let disposed = false;

    if (hasUser) void refreshGentleNightReminder();
    else void cancelDailyReminders();
    void LocalNotifications.addListener("localNotificationActionPerformed", openDailyNote).then((handle) => { notificationListener = handle; });

    void import("@capacitor/app").then(async ({ App }) => {
      const action = await App.addListener("appUrlOpen", ({ url }) => {
        if (url.includes("/dashboard") || url.includes("/catatan") || url.includes("/profile")) openDailyNote();
      });
      const handle = await App.addListener("appStateChange", ({ isActive }) => {
        if (isActive && hasUser) void refreshGentleNightReminder();
      });
      if (disposed) { await handle.remove(); await action.remove(); }
      else listener = handle;
    });

    const onVisibilityChange = () => {
      if (document.visibilityState === "visible" && hasUser) void refreshGentleNightReminder();
    };
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      disposed = true;
      document.removeEventListener("visibilitychange", onVisibilityChange);
      void listener?.remove();
      void notificationListener?.remove();
    };
  }, [auth?.user?.uid, hasUser]);

  return null;
}
