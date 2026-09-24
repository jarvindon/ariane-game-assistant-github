export {};

declare global {
  interface Window {
    electronAPI?: {
      getApiKey: () => Promise<string>;
      saveApiKey: (key: string) => Promise<void>;
      deleteApiKey: () => Promise<void>;
    };
  }
}
