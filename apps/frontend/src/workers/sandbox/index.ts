import { withResolvers } from '@cmtlyt/lingshu-toolkit/shared/with-resolvers';
import { createHandlers, type CreateHandlersOption } from './handlers';
import type {
  HostActionContext,
  WorkerData,
  WorkerExecAction,
  WorkerExecDispatcher,
  WorkerExecResultAction,
} from './types';
import { createActionCtxCtrl } from './utils';
import SandboxWorker from './worker?worker';

export function createSandbox() {
  const sandboxWorker = new SandboxWorker();

  const actionCtxCtrl = createActionCtxCtrl<HostActionContext>();

  const postMessage: CreateHandlersOption['postMessage'] = (id, action, payload) => {
    sandboxWorker.postMessage({ id, action, payload });
  };

  const actionHandlerMap = createHandlers({ actionCtxCtrl, postMessage });

  sandboxWorker.addEventListener('message', ({ data }) => {
    const { action } = data as WorkerData;

    actionHandlerMap[action]?.(data);
  });

  return {
    exec: (code: string, context: Record<string, any>, dispatcher: WorkerExecDispatcher) => {
      const id = crypto.randomUUID();

      const resolvers = withResolvers<WorkerExecResultAction['payload']>();
      actionCtxCtrl.setActionCtx(id, { context, resolvers, dispatcher });

      postMessage<WorkerExecAction>(id, 'exec', { code, context, globalWhiteList: ['console'] });

      return resolvers.promise.then((payload) => {
        const { success } = payload;
        if (!success) {
          throw new Error(payload.error);
        }

        return payload.result;
      });
    },
  };
}

export type Sandbox = ReturnType<typeof createSandbox>;
