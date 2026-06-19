"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { trackAppOpen, trackScreenChange, trackSessionDuration } from "@/lib/analytics/activityMonitor";

function getScreenName(pathname: string): string {
  if (!pathname || pathname === "/") return "home";
  // Capture the first path segment
  const segment = pathname.split("/").filter(Boolean)[0];
  if (!segment) return "home";
  
  if (segment === "wellness-assessment") return "kenali_diri";
  return segment;
}

export function ActivityTracker() {
  const auth = useAuth();
  const pathname = usePathname();

  const userRef = useRef<{ uid: string; displayName: string; email: string; lastLogin?: string } | null>(null);
  const lastActiveTimeRef = useRef<number>(Date.now());
  const lastScreenRef = useRef<string | null>(null);
  const sessionTrackedRef = useRef<string | null>(null);

  useEffect(() => {
    console.log("[ActivityTracker] mounted");
  }, []);

  // Sync current user details to ref for access in event listeners
  useEffect(() => {
    if (auth?.user) {
      userRef.current = {
        uid: auth.user.uid,
        displayName: auth.userProfile?.displayName || auth.userProfile?.fullName || auth.user.displayName || "Jiwa",
        email: auth.userProfile?.email || auth.user.email || "",
        lastLogin: auth.user.metadata.lastSignInTime || auth.userProfile?.participationMetrics?.lastLoginAt || undefined,
      };
      console.log("[ActivityTracker] auth user uid", auth.user.uid);
    } else {
      userRef.current = null;
    }
  }, [auth?.user, auth?.userProfile]);

  // Handle Session Start & App Open
  useEffect(() => {
    const activeUser = userRef.current;
    if (!activeUser) return;

    const sessionKey = `bhumi_session_active_${activeUser.uid}`;
    
    // Check if we already initialized this specific user session in this browser tab
    if (sessionTrackedRef.current !== activeUser.uid) {
      const isExistingSession = sessionStorage.getItem(sessionKey) === "true";
      sessionTrackedRef.current = activeUser.uid;

      if (!isExistingSession) {
        sessionStorage.setItem(sessionKey, "true");
        console.log("[ActivityTracker] write attempt", { type: "app_open_new_session", uid: activeUser.uid });
        void trackAppOpen(activeUser, true);
      } else {
        console.log("[ActivityTracker] write attempt", { type: "app_open_existing_session", uid: activeUser.uid });
        void trackAppOpen(activeUser, false);
      }
      
      lastActiveTimeRef.current = Date.now();
    }
  }, [auth?.user]);

  // Handle Screen/Route Change
  useEffect(() => {
    const activeUser = userRef.current;
    if (!activeUser) return;

    const screenName = getScreenName(pathname);
    if (screenName !== lastScreenRef.current) {
      lastScreenRef.current = screenName;
      
      // Flush duration on screen change so it is recorded immediately
      const now = Date.now();
      if (lastActiveTimeRef.current > 0) {
        const elapsed = Math.floor((now - lastActiveTimeRef.current) / 1000);
        if (elapsed > 0) {
          console.log("[ActivityTracker] write attempt flush duration on screen change", { uid: activeUser.uid, elapsed });
          void trackSessionDuration(activeUser, elapsed);
        }
      }
      // Reset anchor time for the new screen
      lastActiveTimeRef.current = now;

      console.log("[ActivityTracker] write attempt", { type: "screen_change", uid: activeUser.uid, screenName });
      void trackScreenChange(activeUser, screenName);
    }
  }, [pathname, auth?.user]);

  // Handle Tab Hide/Close Active Duration Logging
  useEffect(() => {
    const handleVisibilityChange = () => {
      const activeUser = userRef.current;
      if (!activeUser) return;

      if (document.visibilityState === "hidden") {
        const now = Date.now();
        if (lastActiveTimeRef.current > 0) {
          const elapsed = Math.floor((now - lastActiveTimeRef.current) / 1000);
          if (elapsed > 0) {
            console.log("[ActivityTracker] write attempt", { type: "session_duration", uid: activeUser.uid, elapsed });
            void trackSessionDuration(activeUser, elapsed);
          }
          lastActiveTimeRef.current = 0;
        }
      } else if (document.visibilityState === "visible") {
        lastActiveTimeRef.current = Date.now();
        console.log("[ActivityTracker] write attempt", { type: "app_visible", uid: activeUser.uid });
        void trackAppOpen(activeUser, false); // Keep lastSeen fresh
      }
    };

    const handleBeforeUnload = () => {
      const activeUser = userRef.current;
      if (!activeUser) return;

      const now = Date.now();
      if (lastActiveTimeRef.current > 0) {
        const elapsed = Math.floor((now - lastActiveTimeRef.current) / 1000);
        if (elapsed > 0) {
          // Fire-and-forget duration log before close
          console.log("[ActivityTracker] write attempt", { type: "before_unload_duration", uid: activeUser.uid, elapsed });
          void trackSessionDuration(activeUser, elapsed);
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  // Periodic Sync every 15 seconds to catch active sessions without tab switch
  useEffect(() => {
    const interval = setInterval(() => {
      const activeUser = userRef.current;
      if (!activeUser) return;
      
      const now = Date.now();
      if (lastActiveTimeRef.current > 0) {
        const elapsed = Math.floor((now - lastActiveTimeRef.current) / 1000);
        // Sync if at least 5 seconds elapsed, and max out at 5 minutes per tick (in case tab slept)
        if (elapsed >= 5 && elapsed <= 300) { 
          console.log("[ActivityTracker] write attempt", { type: "periodic_sync", uid: activeUser.uid, elapsed });
          void trackSessionDuration(activeUser, elapsed);
          lastActiveTimeRef.current = now; // reset anchor
        } else if (elapsed > 300) {
          // If elapsed is huge (tab woke up from sleep), don't record the sleep time
          lastActiveTimeRef.current = now; 
        }
      }
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  return null;
}
