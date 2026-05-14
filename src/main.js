import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import './store/style/index.css'

createApp(App).use(createPinia()).mount('#app')
