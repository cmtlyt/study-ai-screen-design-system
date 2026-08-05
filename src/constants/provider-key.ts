import type { RuntimeContext, RuntimeUtils } from '@/runtime/context';
import type { DataSourceSchema } from '@/schema/types';
import type { Sandbox } from '@/workers/sandbox';

export const DATA_SOURCE_KEY = Symbol('DATA_SOURCE_KEY') as InjectionKey<Ref<DataSourceSchema[]>>;

export const STAGE_SCALE_KEY = Symbol('STAGE_SCALE_KEY') as InjectionKey<Ref<number>>;

export const RUNTIME_CONTEXT_KEY = Symbol('RUNTIME_CONTEXT_KEY') as InjectionKey<RuntimeContext>;

export const RUNTIME_UTILS_KEY = Symbol('RUNTIME_UTILS_KEY') as InjectionKey<RuntimeUtils>;

export const RUNTIME_SANDBOX = Symbol('RUNTIME_SANDBOX') as InjectionKey<{ sandbox: Sandbox }>;
