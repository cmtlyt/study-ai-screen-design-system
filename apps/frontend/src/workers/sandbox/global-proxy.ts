interface GlobalPropsConfig {
  globalWhiteList?: string[];
}

export function createGlobalProxy(config: GlobalPropsConfig) {
  const { globalWhiteList } = config;

  const whiteList = new Set([...(globalWhiteList || []), '$$api$$']);

  return new Proxy(
    {},
    {
      has: (_, key: string) => !whiteList.has(key),
      get: (_, key) => console.debug('get global', key),
    },
  );
}
