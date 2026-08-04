import type { MaterialSchema, PageSchema } from '@/schema/types';
import { setDeepProp } from '@/utils';
import { isFunction } from '@cmtlyt/lingshu-toolkit';

type SetHandler = (id: string, key: string, value: any) => void;

export interface RuntimeContext {
  getNode(id: string): MaterialSchema | undefined;
  setAttribute: SetHandler;
  setProp: SetHandler;
  setStyle: SetHandler;
  registerNodeInstance(id: string, instance: Record<string, any>): void;
  trigger: (id: string, event: string, ...args: any[]) => any;
  refreshNodesByDataId(dataId: string, ...args: any[]): void;
}

export function createRuntimeContext(page: Ref<PageSchema>): RuntimeContext {
  const instanceMap = new Map<string, any>();

  const getNode: RuntimeContext['getNode'] = (id) => {
    return page.value.nodes.find((item) => item.id === id);
  };

  const setAttribute: RuntimeContext['setAttribute'] = (id, key, value) => {
    const node = getNode(id);
    if (!node) return console.warn('node not found');
    setDeepProp(node, key, value);
  };

  const setProp: RuntimeContext['setProp'] = (id, key, value) => {
    setAttribute(id, `props.${key}`, value);
  };

  const setStyle: RuntimeContext['setStyle'] = (id, key, value) => {
    setAttribute(id, `style.${key}`, value);
  };

  const registerNodeInstance: RuntimeContext['registerNodeInstance'] = (id, instance) => {
    instanceMap.set(id, instance);
  };

  const trigger: RuntimeContext['trigger'] = (id, event, ...args) => {
    const instance = instanceMap.get(id);
    if (!instance) return console.warn('instance not found');
    if (!isFunction(instance[event])) return console.warn('event not found');
    return Reflect.apply(instance[event], null, args);
  };

  const refreshNodesByDataId: RuntimeContext['refreshNodesByDataId'] = (dataId, ...args) => {
    page.value.nodes.forEach((node) => {
      if (node.props.dataId !== dataId) return;
      trigger(node.id, 'refresh', ...args);
    });
  };

  return {
    getNode,
    setAttribute,
    setProp,
    setStyle,
    registerNodeInstance,
    trigger,
    refreshNodesByDataId,
  };
}
