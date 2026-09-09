import {
  materialSchema,
  type MaterialEvent,
  type MaterialSchema,
  type PageSchema,
} from '@/schema/types';
import { setDeepProp } from '@/utils';
import { schemaToInterface } from '@/utils/zod-utils';
import type { Sandbox } from '@/workers/sandbox';
import type { WorkerExecDispatcher } from '@/workers/sandbox/types';
import { isFunction, isUndef, tryCallFunc } from '@cmtlyt/lingshu-toolkit';

type SetHandler = (id: string, key: string, value: any) => void;

export interface RuntimeUtils {
  nodeIdMap: Record<string, string>;
  dispatcher: Record<string, (...args: any[]) => any>;
}

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

export function getNodeIdMap(nodes: MaterialSchema[]) {
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

export const FUNCTION_TEMPLATE = `/** @param $api {API} */\nasync function main($api) {\n}`;

export function getRuntimeDeclare(nodes: MaterialSchema[]) {
  const dispatcherKeys = getNodeDispatcherKeys(nodes);
  return `interface INodeIdMap {\n${Object.entries(getNodeIdMap(nodes))
    .map(([key, value]) => `  [${JSON.stringify(key)}]: ${JSON.stringify(value)};`)
    .join('\n')}\n};\n
${schemaToInterface(materialSchema, 'MaterialSchema')}\n
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
type IExecEventNames = keyof IContext | ${dispatcherKeys.length ? `${dispatcherKeys.join(' | ')}` : 'never'}
interface CTX {
  node: MaterialSchema;
  nodeIdMap: INodeIdMap;
  args: any[];
}\n
type IExecMap = {
  [K in keyof IContext]: (...args: Parameters<IContext[K]>) => Promise<Awaited<ReturnType<IContext[K]>>>;
} & Record<IExecEventNames, (...args: any[]) => Promise<any>>;\n
interface API {
  exec: IExecMap;
  getCurrContext: () => CTX;
  patchContext(callback: (draft: CTX) => Promise<void> | void): Promise<void>;
  getHostCurrContext: () => Promise<CTX>;
}`;
}

export function createHandlerParams(node: MaterialSchema, utils: RuntimeUtils): HandlerContext {
  return {
    node: node,
    nodeIdMap: utils?.nodeIdMap || {},
  };
}

export function createDispatcher(
  context: RuntimeContext,
  utils: RuntimeUtils,
): WorkerExecDispatcher {
  return (event, ...args) => {
    if (Reflect.has(context, event)) {
      return Reflect.apply(Reflect.get(context, event), null, args);
    }
    if (Reflect.has(utils.dispatcher, event)) {
      return Reflect.apply(Reflect.get(utils.dispatcher, event), null, args);
    }
  };
}

interface HandlerContext {
  node: MaterialSchema;
  nodeIdMap: Record<string, string>;
}

interface CreateHandlersOptions {
  event: MaterialEvent;
  context: HandlerContext;
  sandbox: Sandbox;
  dispatcher: WorkerExecDispatcher;
}

const safeStringify = tryCallFunc(
  <T>(context: T): T => JSON.parse(JSON.stringify(context)),
  console.warn,
);

function parseWorkerContext(context: HandlerContext, args: any[]) {
  const workerContext = safeStringify(context) || {};
  (workerContext as any).args = args.map((item) => {
    const newItem = safeStringify(item);
    if (isUndef(newItem)) console.warn('arg:', item, '->', newItem);
    return newItem;
  });
  return workerContext;
}

export function createEventHandler(options: CreateHandlersOptions) {
  const { event, context, sandbox, dispatcher } = options;
  const { code } = event;

  return (...args: any[]) => {
    return sandbox.exec(code, parseWorkerContext(context, args), dispatcher);
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
