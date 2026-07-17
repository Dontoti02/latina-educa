<script setup lang="ts">
import NavbarThemeSwitcher from '@/layouts/components/NavbarThemeSwitcher.vue';
import JobSearchAutocomplete from './components/JobSearchAutocomplete.vue';
import { SessionStore } from '@/common/store';
import { RolEnum } from '@/common/enum/rol.enum';
import { computed, ref } from 'vue';

const props = defineProps({
  showSearchBar: {
    type: Boolean,
    default: false,
  },
});

const session = SessionStore();

const isStudentOrDocent = computed(() => {
  return session.roles.some(
    role =>
      role.pivot.rol_id === RolEnum.DOCENT_ID ||
      role.pivot.rol_id === RolEnum.STUDENT_ID
  );
});

const mobileMenu = ref(false);
</script>

<template>
  <v-app-bar
    class="app-navbar"
    color="white"
    flat
    height="64"
    elevation="0"
  >
    <v-container fluid>
      <v-row align="center" justify="space-between" no-gutters>
        <v-col cols="6" md="3">
          <h1 class="app-title font-weight-bold leading-normal text-xl text-capitalize">
            <a href="/bolsa-laboral" class="text-decoration-none text-black">
              Bolsa Laboral
            </a>
          </h1>
        </v-col>

        <v-col cols="" md="5" class="text-center hidden-mobile">
          <JobSearchAutocomplete v-if="props.showSearchBar" />
        </v-col>

        <v-col cols="12" md="4" class="text-end hidden-mobile">
          <v-btn
            class="text-capitalize"
            color="primary"
            @click="$router.push('/bolsa-laboral/empresas')"
            variant="text"
            rounded
          >
            Empresas
          </v-btn>
          <v-btn
            class="text-capitalize"
            color="primary"
            @click="$router.push('/bolsa-laboral-panel/me/postulations')"
            variant="text"
            rounded
            v-if="isStudentOrDocent"
          >
            Mis Postulaciones
          </v-btn>
          <v-btn
            class="text-capitalize"
            color="primary"
            @click="$router.push('/bolsa-laboral/empleos')"
            variant="text"
            rounded
          >
            Empleos
          </v-btn>
          <NavbarThemeSwitcher class="me-1" />
        </v-col>
        <v-row cols="12">
          <v-col cols="6" class="text-start hidden-desktop">
            <NavbarThemeSwitcher />
          </v-col>
          <v-col cols="6" class="text-end hidden-desktop">
            <v-menu
              v-model="mobileMenu"
              :close-on-content-click="true"
              location="bottom end"
              transition="fade-transition"
            >
              <template #activator="{ props: menuProps }">
                <v-btn
                  v-bind="menuProps"
                  class="text-capitalize"
                  color="primary"
                  rounded
                  aria-label="Abrir menú"
                >
                  <v-icon>mdi-menu</v-icon>
                </v-btn>
              </template>

              <v-list density="comfortable" nav>
                <v-list-item
                  title="Empresas"
                  @click="$router.push('/bolsa-laboral/empresas')"
                  prepend-icon="mdi-domain"
                />
                <v-list-item
                  v-if="isStudentOrDocent"
                  title="Mis Postulaciones"
                  @click="$router.push('/bolsa-laboral-panel/me/postulations')"
                  prepend-icon="mdi-clipboard-text-outline"
                />
                <v-list-item
                  title="Empleos"
                  @click="$router.push('/bolsa-laboral/empleos')"
                  prepend-icon="mdi-briefcase-outline"
                />
              </v-list>
            </v-menu>
          </v-col>
        </v-row>
      </v-row>
    </v-container>
  </v-app-bar>

  <v-main fluid>
    <v-container class="job-opportunities-layout">
      <slot name="content" />
    </v-container>
  </v-main>
</template>

<style lang="scss">
@use "@core/scss/template/index.scss";

.job-opportunities-layout {
  min-width: 1450px;
}

@media (max-width: 700px) {
  .job-opportunities-layout {
    min-width: 100%;
  }
  .hidden-mobile {
    display: none !important;
  }
  .app-title {
    font-size: 1rem;
  }

  .hidden-desktop {
    display: block !important;
  }
}

@media (min-width: 701px) {
  .hidden-desktop {
    display: none !important;
  }
}
</style>
