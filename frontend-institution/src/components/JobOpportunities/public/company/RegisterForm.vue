<script setup lang="ts">
import RegisterForm from './Form.vue';
</script>

<template>
  <v-row>
    <v-col cols="12" md="7" class="d-flex align-center justify-center">
      <RegisterForm />
    </v-col>
    <v-col cols="12" md="5" class="d-none d-md-flex align-center justify-center m-0">
      <img src="@/assets/images/bg-register-company.jpg" alt="Bolsa Laboral" class="img-fluid"
        style="height: 100vh;"
      />
    </v-col>
  </v-row>
</template>
