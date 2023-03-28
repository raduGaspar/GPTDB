import fs from 'fs';
import util from 'util';
import { createProxy } from './utils';

const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);

type WatcherCallback = (oldValue: any, newValue: any) => void;

type Watcher = {
  path: string;
  callback: WatcherCallback;
  remove: () => void;
};

export const GPTDB = (filePath: string, initialData: object = {}) => {
  const watchers: Watcher[] = [];

  const notify = (path: string, oldValue: any, newValue: any) => {
    watchers.forEach(watcher => {
      if (watcher.path === path) {
        watcher.callback(oldValue, newValue);
      }
    });
  };

  let data = createProxy(initialData, notify);

  async function read(): Promise<void> {
    try {
      const fileContent = await readFile(filePath);
      data = createProxy(JSON.parse(fileContent.toString()), notify);
      return data;
    } catch (error: any) {
      if (error.code === 'ENOENT') {
        await writeFile(filePath, JSON.stringify(data, null, 2));
      } else {
        throw error;
      }
    }
  }

  async function write(): Promise<void> {
    try {
      await writeFile(filePath, JSON.stringify(data, null, 2));
    } catch (error) {
      console.error(`Error writing to the file: ${error}`);
    }
  }

  function find(
    predicate: (value: any, path: string) => boolean
  ): { value: any; path: string }[] {
    const results: { value: any; path: string }[] = [];

    function traverse(obj: any, currentPath: string[] = []) {
      for (const key in obj) {
        const newPath = currentPath.concat(key);
        const value = obj[key];

        if (predicate(value, newPath.join('.'))) {
          results.push({ value, path: newPath.join('.') });
        }

        if (typeof value === 'object' && value !== null) {
          traverse(value, newPath);
        }
      }
    }

    traverse(data);

    return results;
  }

  function get(path: string): any {
    const parts = path.split('.');
    let current = data;

    for (const part of parts) {
      if (current[part] === undefined) {
        return undefined;
      }
      current = current[part];
    }

    return current;
  }

  function watch(
    path: string,
    callback: WatcherCallback
  ): { remove: () => void } {
    const watcher: Watcher = {
      path,
      callback,
      remove: () => {
        const index = watchers.indexOf(watcher);
        if (index !== -1) {
          watchers.splice(index, 1);
        }
      },
    };

    watchers.push(watcher);

    return {
      remove: watcher.remove,
    };
  }

  return {
    data,
    read,
    write,
    find,
    get,
    watch,
  };
};
