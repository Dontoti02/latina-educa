<script setup lang="ts">
import { SessionStore } from '@/common/store';
import { ref } from 'vue';
import AppContent from '@/modules/app/pages/AppContent.vue';

const session = SessionStore()

const systemParameters = ref(session.get().system_parameters)

</script>

<template>
    <AppContent>
        <div class="d-flex w-full h-full justify-center m-auto flex-column">
          <div v-if="systemParameters">
            <h1>Dashobard de {{ systemParameters.app_name }}</h1>
          </div>
          <div class="text-center">
            <img src="@/assets/svg/welcome.svg">
          </div>
        </div>
    </AppContent>
</template>