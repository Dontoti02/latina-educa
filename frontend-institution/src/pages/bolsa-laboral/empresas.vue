<script setup lang="ts">
import JobOpportunitiesLayout from '@/components/JobOpportunities/public/Layout.vue'
import RegisterCompanyFormView from '@/components/JobOpportunities/public/company/RegisterForm.vue'
</script>

<template>
  <JobOpportunitiesLayout>
    <template #content>
      <RegisterCompanyFormView />
    </template>
  </JobOpportunitiesLayout>
</template>

<style lang="scss">

</style>

<route lang="yaml">
meta:
  layout: blank
  action: read
  subject: Auth
</route>
