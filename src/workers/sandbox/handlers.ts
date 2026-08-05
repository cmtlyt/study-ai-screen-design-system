import { replay } from '@cmtlyt/lingshu-toolkit/shared/change-tracker';
import type {
  WorkerActionContext,
  HostActionContext,
  WorkerData,
  WorkerDispatchAction,
  WorkerDispatchResultAction,
  WorkerExecAction,
  WorkerExecResultAction,
  WorkerPatchContextAction,
  WorkerGetHostCurrContextAction,
  WorkerGetHostCurrContextResultAction,
} from './types';
import { type ActionCtxCtrl } from './utils';
import { createApi } from './api';
import { createGlobalProxy } from './global-proxy';

export interface CreateHandlersOption {
  actionCtxCtrl: ActionCtxCtrl;
  postMessage: <T extends WorkerData>(
    id: T['id'],
    action: T['action'],
    payload: T['payload'],
  ) => void;
}

export function createHandlers(options: CreateHandlersOption) {
  const { actionCtxCtrl, postMessage } = options;

  async function exec(data: WorkerExecAction) {
    const { id, payload } = data;
    const { code, context, globalWhiteList } = payload;

    const globalProxy = createGlobalProxy({ globalWhiteList });

    const api = createApi(id, context, options);

    const handler = new Function(
      '$$globalProxy$$',
      '$$api$$',
      `with ($$globalProxy$$) {\n${code}\nreturn main($$api$$);}\n`,
    );

    const result = await Reflect.apply(handler, null, [globalProxy, api]);

    postMessage<WorkerExecResultAction>(id, 'exec#result', { success: true, result });
  }

  async function execResult(data: WorkerExecResultAction) {
    const { id, payload } = data;
    actionCtxCtrl.getActionCtx<HostActionContext>(id)?.resolvers.resolve(payload);
  }

  function dispatchResult(data: WorkerDispatchResultAction) {
    const { id, payload } = data;
    actionCtxCtrl.getActionCtx<WorkerActionContext>(id)?.resolvers.resolve(payload);
  }

  async function dispatch(data: WorkerDispatchAction) {
    const { id, payload } = data;
    const actionCtx = actionCtxCtrl.getActionCtx<HostActionContext>(id);
    if (!actionCtx) {
      postMessage<WorkerDispatchResultAction>(id, 'dispatch#result', {
        success: false,
        error: `actionCtx not found: ${id}`,
      });
      return;
    }
    const { requestId, event, args } = payload;
    const result = await actionCtx.dispatcher(event, ...args);

    postMessage<WorkerDispatchResultAction>(requestId, 'dispatch#result', {
      success: true,
      result,
    });
  }

  async function patchContext(data: WorkerPatchContextAction) {
    const { id, payload } = data;
    const actionCtx = actionCtxCtrl.getActionCtx<HostActionContext>(id);
    if (!actionCtx) return;
    const { patches } = payload;
    replay(actionCtx.context, patches, { mutate: true });
  }

  async function getHostCurrContext(data: WorkerGetHostCurrContextAction) {
    const { id, payload } = data;
    const { requestId } = payload;
    const actionCtx = actionCtxCtrl.getActionCtx<HostActionContext>(id);
    if (!actionCtx) {
      postMessage<WorkerGetHostCurrContextResultAction>(requestId, 'getHostCurrContext#result', {
        success: false,
        error: `actionCtx not found: ${id}`,
      });
      return;
    }
    const result = actionCtx.context;
    postMessage<WorkerGetHostCurrContextResultAction>(requestId, 'getHostCurrContext#result', {
      success: true,
      result,
    });
  }

  async function getHostCurrContextResult(data: WorkerGetHostCurrContextResultAction) {
    const { id, payload } = data;
    actionCtxCtrl.getActionCtx<WorkerActionContext>(id)?.resolvers.resolve(payload);
  }

  return {
    exec,
    'exec#result': execResult,
    dispatch,
    'dispatch#result': dispatchResult,
    patchContext,
    getHostCurrContext,
    'getHostCurrContext#result': getHostCurrContextResult,
  } as Record<string, (data: WorkerData) => void>;
}
