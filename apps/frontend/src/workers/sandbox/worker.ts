import { createHandlers } from './handlers';
import type { WorkerActionContext, WorkerData } from './types';
import { createActionCtxCtrl } from './utils';

const actionCtxCtrl = createActionCtxCtrl<WorkerActionContext>();

function postMessage(id: string, action: string, payload: any) {
  self.postMessage({ id, action, payload });
}

const actionHandlerMap = createHandlers({ actionCtxCtrl, postMessage });

self.addEventListener('message', ({ data }) => {
  const { action } = data as WorkerData;

  actionHandlerMap[action]?.(data);
});
