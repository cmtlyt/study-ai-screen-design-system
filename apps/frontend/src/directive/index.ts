import type { App } from 'vue';
import { vTrigger } from './trigger';

export function registerGlobalDirectives(app: App) {
  app.directive('trigger', vTrigger);
}
