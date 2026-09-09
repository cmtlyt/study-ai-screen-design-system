import type { Setter } from '@/materials';

export interface FormInfo {
  formData: Record<string, any>;
  setters: Setter[];
  ignoreHistory?: boolean;
}

export interface FormFieldProps<T> {
  setter: Setter;
  modelValue: T;
  [key: string]: any;
}

export const formFieldPropsOption = ['setter', 'modelValue'];
