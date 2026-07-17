<script setup lang="ts">
import { DrawerStore } from '@/common/store/index';
import { SessionStore } from '@/common/store/index';
import router from '@router'
import AuthService from '@/modules/auth/service'
import { getUrlImage } from '@/common/util/global'

const drawerStore = DrawerStore()

const sessionStore = SessionStore()

const itemsSession = [
  { 
    title: 'Mi perfil', 
    icon: 'mdi-account',
    onClick: () => {
      router.push('/profile')
    }
  },
  { 
    title: 'Cerrar sesión', 
    icon: 'mdi-logout',
    onClick: () => {
      AuthService.logout()
      router.push({ name: 'Login' })
    }
  },
]

// Utils

</script>
<template>
  <v-app-bar
    color="var(--white)"
    clipped-left
    :elevation="0"
    class="px-4 pt-4"
  >
    <v-app-bar-nav-icon
      @click.stop="drawerStore.collapse()"
    ></v-app-bar-nav-icon>

    <v-toolbar-title class="d-flex gap-2 text-body-1">
      <v-avatar
        size="40"
        class="mr-2 user-profile-img justify-end"
      >
        <img
            v-if="sessionStore.user?.photo && sessionStore.user?.photo.length > 0"
            :src="getUrlImage(sessionStore.user?.photo)"
            alt="avatar"
            style="width: 100%; object-fit: cover;"
        >
        <v-chip
            v-else
            variant="tonal"
            class="w-100 h-100 d-flex align-center justify-center"
            color="primary"
        >
            <v-icon
                icon="mdi-account-tie"
                size="large"
            />
        </v-chip>
      </v-avatar>
      Bienvenido {{ sessionStore.user?.names }}
    </v-toolbar-title>

    <v-spacer></v-spacer>

  <v-menu>
    <template v-slot:activator="{ props }">
      <v-btn icon="mdi-account-outline" variant="text" v-bind="props"/>
    </template>
      <v-list>
        <v-list-item
          v-for="(item, index) in itemsSession"
          :key="index"
          :value="index"
        >
          <v-list-item-title
            @click="item.onClick"
          >
            <v-icon>{{ item.icon }}</v-icon>
            {{ item.title }}
          </v-list-item-title>
        </v-list-item>
      </v-list>
    </v-menu>

    <!-- <v-btn icon="mdi-bell-outline" variant="text"></v-btn> -->
  </v-app-bar>
</template>
