export type WatcherCallback = (oldValue: any, newValue: any) => void;
export type Watcher = {
  path: string;
  callback: WatcherCallback;
  remove: () => void;
};
//# sourceMappingURL=types.d.ts.map
