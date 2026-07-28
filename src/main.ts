import { createApp } from 'vue';
import { createPinia } from 'pinia';

import App from './app.vue';
import router from './router';

import { Icon } from '@iconify/vue';
import { registerGlobalDirectives } from './directive/index.ts';

import 'element-plus/theme-chalk/dark/css-vars.css';
import './styles/global.css';

const app = createApp(App);

registerGlobalDirectives(app);

app.use(createPinia());
app.use(router);
app.component('vue-icon', Icon);

app.mount('#app');
