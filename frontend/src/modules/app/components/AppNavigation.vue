<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { DrawerStore } from '@/common/store/index';
import { SessionStore } from '@/common/store/index';
import RecursiveOption from '@/modules/app/components/RecursiveOption.vue'
import { getUrlImage } from '@/common/util/global';
import { nextTick } from 'vue';

const drawerStore = DrawerStore()

const sessionStore = SessionStore()

const menu = ref(sessionStore.menu)

const  onResize = () => {
  if (window.innerWidth > 600) return

  if (!drawerStore.drawer) return
  
  drawerStore.collapse()
}

onMounted(() => {
  onResize()
  nextTick(() => {
      window.addEventListener('resize', onResize);
    })
})

</script>
 
<template>
  <v-navigation-drawer
    color="var(--navigation-background-color)"
    v-model="drawerStore.drawer"
    :location="$vuetify.display.mobile ? 'bottom' : undefined"
    rounded="2"
    class="navigation custom-drawer"
    :width="300"
  >
  
    <v-card
      :variant="'text'"
      class="text-center my-6 mx-2"
      :height="90"
    >
      <v-card-text>
        <v-img 
          v-if="sessionStore.system_parameters?.logo && sessionStore.system_parameters?.logo !== ''" 
          :src="getUrlImage(sessionStore.system_parameters?.logo)" 
          style="max-width: 100%; max-height: 70px; min-width: 50%; min-height: 50px;"
        >
          <template #placeholder>
            <VRow
              align="center"
              class="fill-height ma-0"
              justify="center"
            >
              <VProgressCircular
                color="grey-lighten-5"
                indeterminate
              />
            </VRow>
          </template>
          <template #error>
            <div class="w-100 h-100 d-flex flex-column align-center justify-center border-sm rounded">
              <VIcon
                icon="mdi-close-box-outline"
                size="xxx-large"
              />
              Error al cargar la imagen
            </div>
          </template>
        </v-img>
        <img v-else src="@/assets/images/login/school.svg" style="width: 100%; height: 70px" />
      </v-card-text>
    </v-card>

    <v-list 
      v-for="item in menu" 
      v-bind:key="item.id"
      class="px-2"
    >

      <v-list-subheader
        color="deep-purple font-weight-bold"
      >
        {{ item.name }}
      </v-list-subheader>


      <RecursiveOption
          :options="item.options"
      />
    </v-list>

    <div class="collapse-fixed">
      <v-btn variant="text" @click.stop="drawerStore.collapse()">
        <v-icon>mdi-menu-close</v-icon>&nbsp;cerrar
      </v-btn>
    </div>
  </v-navigation-drawer>
</template>

<style scoped lang="scss">
  .navigation {
    margin: 20px;
    padding: 0px 5px 0px 5px;
    border-radius: 20px;
    box-shadow: none;
    border: none;
  }
  .custom-drawer {
    height: 95vh !important;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }

  .collapse-fixed {
    position: fixed;
    bottom: 10px;
  }
</style>  