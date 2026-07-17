<script setup lang="ts">
import { SessionStore } from '@/common/store';
import CapacitationDashboard from '@/components/dashboards/CapacitationDashboard.vue';
import { UserAbility } from '@/plugins/casl/AppAbility';
import { onMounted, computed } from 'vue';

const router = useRouter();
const sessionStore = SessionStore()
const hasRoleCompany = computed(() => {
  return sessionStore.isCompany()
});

onMounted(() => {
  if (!sessionStore.userAbilities) return;

  const isEnableModuleJobs = sessionStore.userAbilities.some(
    (ability: UserAbility) => ability.subject === 'Bolsa Laboral'
  );

  if (hasRoleCompany.value) {
    if (!isEnableModuleJobs) {
      router.push({ name: 'forbidden' });
      return;
    }
    router.push({ path: '/bolsa-laboral-panel/offers' });
  }
})
</script>

<template>
  <div>
    <SecretaryDashboard v-if="sessionStore.isSecretary() || sessionStore.isAdmin()"/>
    <StudentDashboard v-if="sessionStore.isStudent() || sessionStore.isTeacher()" />
    <CapacitationDashboard v-if="sessionStore.isTrainingAdmin() || sessionStore.isTrainingTeacher() || sessionStore.isTrainingStudent() " />
  </div>
</template>

<route lang="yaml">
meta:
  action: manage
  subject: Home
  </route>
