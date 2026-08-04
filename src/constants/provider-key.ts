import type { RuntimeContext } from '@/runtime/context';
import type { DataSourceSchema } from '@/schema/types';

export const DATA_SOURCE_KEY = Symbol('DATA_SOURCE_KEY') as InjectionKey<Ref<DataSourceSchema[]>>;

export const STAGE_SCALE_KEY = Symbol('STAGE_SCALE_KEY') as InjectionKey<Ref<number>>;

export const RUNTIME_CONTEXT_KEY = Symbol('RUNTIME_CONTEXT_KEY') as InjectionKey<RuntimeContext>;
