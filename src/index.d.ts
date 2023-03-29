import type { WatcherCallback } from './types';
export declare const GPTDB: (
  filePath: string,
  initialData?: object
) => {
  data: any;
  read: () => Promise<void>;
  write: () => Promise<void>;
  find: (predicate: (value: any, path: string) => boolean) => {
    value: any;
    path: string;
  }[];
  get: (path: string) => any;
  watch: (
    path: string,
    callback: WatcherCallback
  ) => {
    remove: () => void;
  };
};
//# sourceMappingURL=index.d.ts.map
