import type { DataSourceSchema } from '@/schema/types';

export const DATA_SOURCE_KEY = Symbol('DATA_SOURCE_KEY') as InjectionKey<Ref<DataSourceSchema[]>>;
