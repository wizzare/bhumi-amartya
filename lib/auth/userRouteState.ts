"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import type { User } from "firebase/auth";
import type { UserBlueprint } from "@/lib/firebase/service";
import { useAuth } from "@/context/AuthContext";
import { storageProvider } from "@/lib/storage/storageProvider";

export type UserRouteState = "loading" | "login" | "setup" | "dashboard" | "error";
const BLUEPRINT_LOAD_TIMEOUT_MS = 5000;

type RouteStateInput = {
  authReady: boolean;
  authUser: User | null | undefined;
  profile: { uid?: string | null; setupCompleted?: boolean | null } | null | undefined;
  blueprint: Partial<UserBlueprint> | null | undefined;
  profileLoading?: boolean;
  blueprintLoading?: boolean;
  error?: boolean;
};

export function getUserRouteState({
  authReady,
  authUser,
  profile,
  blueprint,
  profileLoading = false,
  blueprintLoading = false,
  error = false,
}: RouteStateInput): UserRouteState {
  if (error) return "error";
  if (!authReady || profileLoading || blueprintLoading) return "loading";
  if (!authUser) return "login";
  if (!profile) return "setup";
  if (!blueprint) return "setup";
  if (profile.setupCompleted !== true) return "setup";
  return "dashboard";
}

export function routeStateToPath(routeState: UserRouteState): string | null {
  if (routeState === "login") return "/login";
  if (routeState === "setup") return "/setup";
  if (routeState === "dashboard") return "/dashboard";
  if (routeState === "error") return "/login";
  return null;
}

function withBlueprintTimeout(blueprintPromise: Promise<UserBlueprint | null>) {
  return Promise.race([
    blueprintPromise,
    new Promise<UserBlueprint | null>((_, reject) => {
      window.setTimeout(() => reject(new Error("Blueprint loading timed out.")), BLUEPRINT_LOAD_TIMEOUT_MS);
    }),
  ]);
}

export function useUserRouteDecision(currentPathOverride?: string) {
  const auth = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const currentPath = currentPathOverride || pathname || "/";
  const lastRedirectRef = useRef<string | null>(null);
  const [blueprint, setBlueprint] = useState<UserBlueprint | null>(null);
  const [blueprintLoading, setBlueprintLoading] = useState(false);
  const [routeError, setRouteError] = useState(false);

  const authReady = Boolean(auth?.authStateResolved) && !auth?.authLoading;
  const authUser = auth?.user ?? null;
  const profile = auth?.userProfile ?? null;
  const profileLoading = Boolean(authUser && auth?.profileLoading);

  useEffect(() => {
    let cancelled = false;

    if (!authReady || !authUser || profileLoading) {
      setBlueprint(null);
      setBlueprintLoading(false);
      return;
    }

    setBlueprintLoading(true);
    setRouteError(false);

    withBlueprintTimeout(storageProvider.getUserBlueprint())
      .then((loadedBlueprint) => {
        if (cancelled) return;
        if (loadedBlueprint && loadedBlueprint.uid !== authUser.uid) {
          console.error("[USER DATA MISMATCH BLOCKED]", {
            reason: "route_blueprint_uid_mismatch",
            authUid: authUser.uid,
            blueprintUid: loadedBlueprint.uid,
          });
          setBlueprint(null);
          setRouteError(true);
          return;
        }
        setBlueprint(loadedBlueprint);
      })
      .catch((error) => {
        if (cancelled) return;
        console.error("[ROUTE STATE ERROR]", {
          currentPath,
          uid: authUser.uid,
          error,
        });
        setBlueprint(null);
        setRouteError(true);
      })
      .finally(() => {
        if (!cancelled) setBlueprintLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [authReady, authUser, currentPath, profileLoading]);

  const routeState = useMemo(
    () =>
      getUserRouteState({
        authReady,
        authUser,
        profile,
        blueprint,
        profileLoading,
        blueprintLoading,
        error: routeError || Boolean(auth?.profileError),
      }),
    [authReady, authUser, profile, blueprint, profileLoading, blueprintLoading, routeError, auth?.profileError],
  );

  const targetRoute = routeStateToPath(routeState);

  useEffect(() => {
    console.log("[ROUTE STATE]", {
      currentPath,
      authReady,
      hasUser: Boolean(authUser),
      uid: authUser?.uid ?? null,
      hasProfile: Boolean(profile),
      hasBlueprint: Boolean(blueprint),
      setupCompleted: profile?.setupCompleted ?? null,
      routeState,
      targetRoute,
    });
  }, [authReady, authUser, blueprint, currentPath, profile, routeState, targetRoute]);

  const redirectToTarget = (reason: string) => {
    if (!targetRoute || targetRoute === currentPath || lastRedirectRef.current === targetRoute) return;
    lastRedirectRef.current = targetRoute;
    console.log("[ROUTE REDIRECT]", {
      from: currentPath,
      to: targetRoute,
      reason,
    });
    router.replace(targetRoute);
  };

  return {
    auth,
    profile,
    blueprint,
    routeState,
    targetRoute,
    redirectToTarget,
  };
}
