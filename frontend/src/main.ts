import { createApp } from 'vue'
import App from './modules/app/App.vue'
import { es } from 'vuetify/locale'
import { VNumberInput } from 'vuetify/labs/VNumberInput'

import 'vuetify/styles'
import '@mdi/font/css/materialdesignicons.css'
import './assets/styles/main.css'

import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import { createPinia } from 'pinia'
import mitt from 'mitt'
import router from '@/common/router'
import './assets/styles/main.css'


const vuetify = createVuetify({
  components : {
    ...components,
    VNumberInput
  },
  directives,
  locale: {
    locale: 'es',
    messages: { es }
  }
})
const pinia = createPinia()
const emitter = mitt()
const app = createApp(App)

app.use(vuetify)
app.use(pinia)
app.use(router)
app.provide('emitter', emitter)

app.mount('#app')
