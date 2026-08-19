import { createApp } from 'vue'
import { IonicVue } from '@ionic/vue'
import { Capacitor } from '@capacitor/core'
import { CapacitorSQLite } from '@capacitor-community/sqlite'
import { defineCustomElements } from 'jeep-sqlite/loader'
import App from './App.vue'
import router from './router'

import '@ionic/vue/css/core.css'
import '@ionic/vue/css/normalize.css'
import '@ionic/vue/css/structure.css'
import '@ionic/vue/css/typography.css'
import '@ionic/vue/css/padding.css'
import '@ionic/vue/css/float-elements.css'
import '@ionic/vue/css/text-alignment.css'
import '@ionic/vue/css/text-transformation.css'
import '@ionic/vue/css/flex-utils.css'
import '@ionic/vue/css/display.css'
import '@ionic/vue/css/palettes/dark.system.css'
import './theme/variables.css'

async function prepareWebSQLite() {
  if (Capacitor.getPlatform() !== 'web') return
  defineCustomElements(window)
  await customElements.whenDefined('jeep-sqlite')

  const sqliteElement = document.createElement('jeep-sqlite')
  sqliteElement.style.display = 'none'
  document.body.appendChild(sqliteElement)

  await CapacitorSQLite.initWebStore()
}

async function bootstrap() {
  await prepareWebSQLite()

  const app = createApp(App)
    .use(IonicVue)
    .use(router)

  await router.isReady()
  app.mount('#app')
}

void bootstrap()
