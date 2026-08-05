import { createRecorder } from '@cmtlyt/lingshu-toolkit/shared/change-tracker';
import { withResolvers } from '@cmtlyt/lingshu-toolkit/shared/with-resolvers';
import type { CreateHandlersOption } from './handlers';
import type {
  WorkerDispatchAction,
  WorkerExecResultAction,
  WorkerGetHostCurrContextAction,
  WorkerGetHostCurrContextResultAction,
  WorkerPatchContextAction,
} from './types';
import { deepReadonlyProxy } from './utils';

export function createApi(id: string, context: Record<string, any>, options: CreateHandlersOption) {
  const { actionCtxCtrl, postMessage } = options;

  const getContext = () => structuredClone(context);

  const getCurrContext = () => deepReadonlyProxy(getContext());

  return {
    exec: new Proxy(
      {},
      {
        get(_, key: string) {
          return async (...args: any[]) => {
            const requestId = crypto.randomUUID();

            const resolvers = withResolvers<WorkerExecResultAction['payload']>();
            actionCtxCtrl.setActionCtx(requestId, { resolvers });

            postMessage<WorkerDispatchAction>(id, 'dispatch', { requestId, event: key, args });

            return resolvers.promise.then((payload) => {
              const { success } = payload;
              if (!success) {
                throw new Error(payload.error);
              }
              return payload.result;
            });
          };
        },
      },
    ),
    getCurrContext,
    patchContext(callback: (draft: Record<string, any>) => Promise<void> | void) {
      return navigator.locks.request('sandbox#patchContext', async () => {
        const recorder = createRecorder(context, {});

        await callback(recorder.proxy);

        const patches = recorder.flush();
        recorder.dispose();

        postMessage<WorkerPatchContextAction>(id, 'patchContext', { patches });

        return getCurrContext();
      });
    },
    async getHostCurrContext() {
      const requestId = crypto.randomUUID();
      const resolvers = withResolvers<WorkerGetHostCurrContextResultAction['payload']>();
      actionCtxCtrl.setActionCtx(requestId, { resolvers });

      postMessage<WorkerGetHostCurrContextAction>(id, 'getHostCurrContext', { requestId });

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
