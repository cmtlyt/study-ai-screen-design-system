import type { DataSourceSchema } from '@/schema/types';

export const DATA_SOURCE_KEY = Symbol('DATA_SOURCE_KEY') as InjectionKey<Ref<DataSourceSchema[]>>;

export const STAGE_SCALE_KEY = Symbol('STAGE_SCALE_KEY') as InjectionKey<Ref<number>>;
