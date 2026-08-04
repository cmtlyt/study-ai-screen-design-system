import type { RuntimeUtils } from '@/constants/provider-key';
import {
  materialSchema,
  type MaterialEvent,
  type MaterialSchema,
  type PageSchema,
} from '@/schema/types';
import { setDeepProp } from '@/utils';
import { schemaToInterface } from '@/utils/zod-utils';
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
  dispatch(id: string, eventName: string, ...args: any[]): any;
}

export function getNodeMap(nodes: MaterialSchema[]) {
  if (!nodes) return {};
  const nameCounter = new Map<string, number>();
  return nodes.reduce(
    (prev, curr) => {
      const counter = nameCounter.get(curr.name) || 0;
      nameCounter.set(curr.name, counter + 1);
      prev[`${curr.name}${counter > 0 ? `_${counter}` : ''}`] = curr.id;
      return prev;
    },
    {} as Record<string, string>,
  );
}

export function getNodeDispatcherKeys(nodes: MaterialSchema[]) {
  if (!nodes) return [];
  const nameCounter = new Map<string, number>();
  return nodes.reduce((prev, curr) => {
    const counter = nameCounter.get(curr.name) || 0;
    nameCounter.set(curr.name, counter + 1);
    if (!curr.events?.length) return prev;
    curr.events.forEach((event) => {
      prev.push(JSON.stringify(`${curr.name}${counter > 0 ? `_${counter}` : ''}_${event.name}`));
    });
    return prev;
  }, [] as string[]);
}

export function getNodeDispatcherMap(nodes: MaterialSchema[], ctx: RuntimeContext) {
  if (!nodes) return {};
  const nameCounter = new Map<string, number>();
  return nodes.reduce(
    (prev, curr) => {
      const counter = nameCounter.get(curr.name) || 0;
      nameCounter.set(curr.name, counter + 1);
      if (!curr.events?.length) return prev;
      curr.events.forEach((event) => {
        prev[`${curr.name}${counter > 0 ? `_${counter}` : ''}_${event.name}`] = (...args: any[]) =>
          ctx.dispatch(curr.id, event.name, ...args);
      });
      return prev;
    },
    {} as Record<string, any>,
  );
}

export function getRuntimeDeclare(nodes: MaterialSchema[], eventType: 'event' | 'custom') {
  const dispatcherKeys = getNodeDispatcherKeys(nodes);
  return `interface INodeIdMap {\n${Object.entries(getNodeMap(nodes))
    .map(([key, value]) => `  [${JSON.stringify(key)}]: ${JSON.stringify(value)};`)
    .join('\n')}\n};\n
${schemaToInterface(materialSchema, 'MaterialSchema')}\n
type INodeDispatcherMap = Record<${dispatcherKeys.length ? `${dispatcherKeys.join(' | ')}` : 'never'}, (...args: any[]) => any>;\n
type INode = MaterialSchema;\n
type SetHandler = (id: string, key: string, value: any) => void;\n
interface IContext {
  getNode(id: string): MaterialSchema | undefined;
  setAttribute: SetHandler;
  setProp: SetHandler;
  setStyle: SetHandler;
  registerNodeInstance(id: string, instance: Record<string, any>): void;
  trigger: (id: string, event: string, ...args: any[]) => any;
  refreshNodesByDataId(dataId: string, ...args: any[]): void;
  dispatch(id: string, eventName: string, ...args: any[]): any;
}\n
interface CTX {
  $context: IContext;
  $node: INode;
  $nodeIdMap: INodeIdMap;
  $dispatcher: INodeDispatcherMap;
  ${eventType === 'event' ? '$event: Event;' : '$args: any[];'}
}\n
declare type Main = (ctx: CTX) => any;`;
}

export function createHandlerParams(
  context: RuntimeContext,
  node: MaterialSchema,
  utils: RuntimeUtils,
) {
  return {
    $context: context,
    $node: node,
    $nodeMap: utils?.nodeMap || {},
    $dispatcher: utils?.dispatcher || {},
  };
}

export function createHandlers(event: MaterialEvent, $$ctx: Record<string, any>) {
  const handler = new Function(
    '$$ctx',
    `${event.code}\nreturn typeof main === 'function' ? main($$ctx) : undefined;`,
  );

  return {
    eventHandler: (event: Event) => {
      return Reflect.apply(handler, null, [{ ...$$ctx, $event: event }]);
    },
    handler: (...args: any[]) => {
      return Reflect.apply(handler, null, [{ ...$$ctx, $args: args }]);
    },
  };
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

  const dispatch: RuntimeContext['dispatch'] = (id, eventName, ...args) => {
    const node = getNode(id);
    if (!node) return;
    if (!node.events) return console.warn('node events not found');
    const event = node.events.find((item) => item.name === eventName);
    if (!event || !event.handler) return console.warn('event not found');
    return Reflect.apply(event.handler, null, args);
  };

  return {
    getNode,
    setAttribute,
    setProp,
    setStyle,
    registerNodeInstance,
    trigger,
    refreshNodesByDataId,
    dispatch,
  };
}
