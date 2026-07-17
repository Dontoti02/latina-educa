<script setup lang="ts">
import { SessionStore } from '@/common/store'
import type { SessionDTO } from '@/models/login'
import WelcomeUser from './partials/Student/WelcomeUser.vue'
import { VCardText } from 'vuetify/lib/components/index.mjs'

const sessionStore = SessionStore()
const user = ref<SessionDTO | null>(null)


onMounted(() => {
  user.value = sessionStore.get().user
  console.log({user})
})
</script>

<template>
  <div>

    <VRow
      class="match-height"
      v-if="user"
    >
      <VCol
        cols="12"
        md="5"
        lg="4"
      >
        <WelcomeUser :user="user" />
      </VCol>
      <VCol
        cols="12"
        md="7"
        lg="8"
      >
      <VCard>
        <VCardText>
          <img src="@/assets/images/online-learning.svg" alt="Secretary Dashboard" class="w-100" />
        </VCardText>
      </VCard>
      
      </VCol>

    </VRow>
  </div>
</template>
