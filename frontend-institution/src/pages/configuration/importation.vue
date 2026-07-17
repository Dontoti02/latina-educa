<script setup lang="ts">
import History from '@/components/importations/History.vue'
import MainScreen from '@/components/importations/MainScreen.vue'
import UploadFile from '@/components/importations/UploadFile.vue'
import type { ImportationType } from '@/models/importations'

// Variables
const view = ref<string>('main-screen')
const importationType = ref<ImportationType>()

// Methods
const setScreens = (screen: string, type?: ImportationType) => {
  view.value = screen
  importationType.value = type
}
</script>

<template>
  <div>
    <MainScreen
      v-if="view === 'main-screen'"
      @upload-file="setScreens('upload-screen', $event)"
      @view-history="setScreens('history-screen', $event)"
    />
    <UploadFile
      v-if="view === 'upload-screen'"
      :importation-type="importationType"
      @back="setScreens('main-screen')"
    />
    <History
      v-if="view === 'history-screen'"
      :importation-type="importationType"
      @back="setScreens('main-screen')"
    />
  </div>
</template>

<route lang="yaml">
meta:
  action: read
  subject: Importation
        </route>
