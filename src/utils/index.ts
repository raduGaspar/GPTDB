export const createProxy = (
  data: any,
  notify: (path: string, oldValue: any, newValue: any) => void,
  parentPath = ''
): any => {
  return new Proxy(data, {
    get: (target, property) => {
      const value = Reflect.get(target, property);
      if (typeof value === 'object' && value !== null) {
        return createProxy(
          value,
          notify,
          `${parentPath}${parentPath ? '.' : ''}${String(property)}`
        );
      }
      return value;
    },
    set: (target, property, value) => {
      const fullPath = `${parentPath}${parentPath ? '.' : ''}${String(
        property
      )}`;
      const oldValue = target[property];
      const didSet = Reflect.set(target, property, value);
      if (didSet) {
        notify(fullPath, oldValue, value);
      }
      return didSet;
    },
  });
};
