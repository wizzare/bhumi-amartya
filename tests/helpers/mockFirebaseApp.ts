export class FirebaseApp {
  name: string = "[DEFAULT]";
  options: Record<string, unknown> = {
    projectId: "demo-build110-local",
    apiKey: "mock-api-key",
  };
  container: any = {
    getProvider: (name: string) => ({
      getImmediate: () => ({}),
      isInitialized: () => true,
      initialize: () => ({}),
      setComponent: () => {},
    }),
  };
}

const defaultApp = new FirebaseApp();

export function initializeApp(options?: any, name?: string): FirebaseApp {
  return defaultApp;
}

export function getApps(): FirebaseApp[] {
  return [defaultApp];
}

export function getApp(name?: string): FirebaseApp {
  return defaultApp;
}

export function deleteApp(app: any): Promise<void> {
  return Promise.resolve();
}
