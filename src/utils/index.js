'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.createProxy = void 0;
var createProxy = function (data, notify, parentPath) {
  if (parentPath === void 0) {
    parentPath = '';
  }
  return new Proxy(data, {
    get: function (target, property) {
      var value = Reflect.get(target, property);
      if (typeof value === 'object' && value !== null) {
        return (0, exports.createProxy)(
          value,
          notify,
          ''
            .concat(parentPath)
            .concat(parentPath ? '.' : '')
            .concat(String(property))
        );
      }
      return value;
    },
    set: function (target, property, value) {
      var fullPath = ''
        .concat(parentPath)
        .concat(parentPath ? '.' : '')
        .concat(String(property));
      var oldValue = target[property];
      var didSet = Reflect.set(target, property, value);
      if (didSet) {
        notify(fullPath, oldValue, value);
      }
      return didSet;
    },
  });
};
exports.createProxy = createProxy;
