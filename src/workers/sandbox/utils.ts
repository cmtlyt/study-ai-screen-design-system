export function createActionCtxCtrl<T>() {
  const actionCtxMap = new Map<string, T>();

  return {
    setActionCtx(id: string, ctx: T) {
      actionCtxMap.set(id, ctx);
    },
    getActionCtx<R = T>(id: string): R | undefined {
      return actionCtxMap.get(id) as any;
    },
  };
}

export type ActionCtxCtrl<T = any> = ReturnType<typeof createActionCtxCtrl<T>>;

export function deepReadonlyProxy(target: any, path = '') {
  return new Proxy(target, {
    get(obj, prop: string, receiver) {
      const value = Reflect.get(obj, prop, receiver);

      // 🎯 核心优化：直接返回只读版本的数组变异方法
      if (Array.isArray(obj) && typeof value === 'function') {
        const mutatingMethods = [
          'push',
          'pop',
          'shift',
          'unshift',
          'splice',
          'sort',
          'reverse',
          'fill',
          'copyWithin',
        ];
        if (mutatingMethods.includes(prop)) {
          return () => {
            throw new TypeError(
              `Cannot call mutating method '${String(prop)}' on readonly array at '${path}'`,
            );
          };
        }
      }

      if (value !== null && typeof value === 'object') {
        const currentPath = Array.isArray(obj)
          ? `${path}[${String(prop)}]`
          : path
            ? `${path}.${String(prop)}`
            : String(prop);
        return deepReadonlyProxy(value, currentPath);
      }
      return value;
    },

    set(_, prop, __, ___) {
      throw new TypeError(
        `Cannot modify readonly ${Array.isArray(_) ? 'array element' : 'property'} '${path}.${String(prop)}'`,
      );
    },

    deleteProperty(_, prop) {
      throw new TypeError(
        `Cannot delete readonly ${Array.isArray(_) ? 'array element' : 'property'} '${path}.${String(prop)}'`,
      );
    },
  });
}
