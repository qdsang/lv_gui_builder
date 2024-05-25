import * as vue from 'vue';
import App from './App.vue';
import { createApp } from 'vue'
import router from '@/router';
import store from '@/store';
import '@/styles/index.less';
import ElementPlus from 'element-plus';
import 'element-plus/dist/index.css';
import 'element-plus/theme-chalk/dark/css-vars.css';


const app = createApp(App);


import * as ElementPlusIconsVue from '@element-plus/icons-vue'

for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component('elIcon' + key, component)
}

// import codeEditor from '@/pages/editor/codeEditor.vue'
// app.component('CodeEditor', codeEditor);


app.use(router);
app.use(store);
app.use(ElementPlus);

app.mount('#app');
