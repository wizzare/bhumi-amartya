import { FirebaseApp, getApp } from "./mockFirebaseApp";

export class Functions {
  app: FirebaseApp;
  constructor(app: FirebaseApp) {
    this.app = app;
  }
}

const defaultFunctions = new Functions(getApp());

export function getFunctions(app?: any, regionOrCustomDomain?: string): Functions {
  return defaultFunctions;
}

export function httpsCallable(functions: any, name: string) {
  return async (data?: any) => ({ data: {} });
}

export function connectFunctionsEmulator(functions: any, host: string, port: number) {}
