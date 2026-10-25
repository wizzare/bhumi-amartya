import { App } from "@capacitor/app";
import { Capacitor } from "@capacitor/core";

export function observeNativeAnimationState(onChange: (active: boolean) => void, onError: () => void) {
  if (!Capacitor.isNativePlatform()) return () => {};
  let disposed = false;
  let changed = false;
  let remove: (() => Promise<void>) | undefined;
  onChange(false);
  void App.addListener("appStateChange", ({ isActive }) => {
    changed = true;
    if (!disposed) onChange(isActive);
  }).then(async (listener) => {
    if (disposed) {
      await listener.remove();
      return;
    }
    remove = () => listener.remove();
    const state = await App.getState();
    if (!disposed && !changed) onChange(state.isActive);
  }).catch(() => { if (!disposed) onError(); });
  return () => {
    disposed = true;
    void remove?.().catch(() => {});
  };
}
