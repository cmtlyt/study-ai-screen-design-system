import type { Resolver } from '@cmtlyt/lingshu-toolkit/shared/with-resolvers';
import { type Patch } from '@cmtlyt/lingshu-toolkit/shared/change-tracker';

export interface WorkerActionContext {
  resolvers: Resolver<any>;
}

export type WorkerExecDispatcher = (event: string, ...args: any[]) => any;

export interface HostActionContext {
  resolvers: Resolver<any>;
  context: Record<string, any>;
  dispatcher: WorkerExecDispatcher;
}

export type QueryPayload =
  | {
      success: true;
      result: any;
    }
  | { success: false; error: string };

export interface WorkerData {
  id: string;
  action: (string & {}) | `${string}#result`;
  payload: any;
}

export interface WorkerExecAction extends WorkerData {
  action: 'exec';
  payload: {
    code: string;
    context: Record<string, any>;
    globalWhiteList?: string[];
  };
}

export interface WorkerExecResultAction extends WorkerData {
  // id -> 父 action id, 用于主线程获取 action 的上下文

  action: 'exec#result';
  payload: QueryPayload;
}

export interface WorkerDispatchAction extends WorkerData {
  // id -> 父 action id, 用于主线程获取 action 的上下文

  action: 'dispatch';
  payload: {
    requestId: string;
    event: string;
    args: any[];
  };
}

export interface WorkerDispatchResultAction extends WorkerData {
  // id -> WorkerDispatchAction.payload.requestId

  action: 'dispatch#result';
  payload: QueryPayload;
}

export interface WorkerPatchContextAction extends WorkerData {
  action: 'patchContext';
  payload: { patches: Patch[] };
}

export interface WorkerGetHostCurrContextAction extends WorkerData {
  action: 'getHostCurrContext';
  payload: { requestId: string };
}

export interface WorkerGetHostCurrContextResultAction extends WorkerData {
  // id -> WorkerGetHostCurrContextAction.payload.requestId
  action: 'getHostCurrContext#result';
  payload: QueryPayload;
}
