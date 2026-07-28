import type { ObjectDirective } from 'vue';

const CACHE_KEY = Symbol('v-trigger-handler');

export const vTrigger: ObjectDirective = {
  mounted(el, binding) {
    const { arg, value } = binding;
    const key = arg || 'value';

    const handler = () => (value[key] = !value[key]);

    el[CACHE_KEY] = handler;
    el.addEventListener('click', handler);
  },

  unmounted(el) {
    const handler = el[CACHE_KEY];
    if (!handler) return;

    el.removeEventListener('click', handler);
    delete el[CACHE_KEY];
  },
};
