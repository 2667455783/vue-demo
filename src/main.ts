import { createApp } from 'vue'
import { createPinia } from 'pinia'
import * as Icons from '@element-plus/icons-vue'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'

import App from './App.vue'
import router from './router'
import './assets/styles/index.scss'

NProgress.configure({ showSpinner: false })

const app = createApp(App)

// IconSelect / 侧栏动态 icon 依赖全局注册；EP 组件走 unplugin 按需，勿再 app.use(ElementPlus)
for (const [key, component] of Object.entries(Icons)) {
  app.component(key, component)
}

app.use(createPinia())
app.use(router)

app.mount('#app')
