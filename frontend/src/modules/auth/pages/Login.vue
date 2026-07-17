<script setup lang="ts">
import { toastError } from '@/common/util/toast.service'
import { ref } from 'vue'
import AuthService from '@/modules/auth/service'
import { SessionStore } from '@/common/store';
import { getUrlImage } from '@/common/util/global';

const session = SessionStore()

const email = ref<string>('')
const password = ref<string>('')
const remember = ref(false)
const showPassword = ref(false)

const rules = ref({
  email: [
    (value: string) => !!value || 'Email es requerido.',
    (value: string) => {
      const pattern =
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      return pattern.test(value) || 'Email inválido.'
    }
  ],
  password: [
    (value: string) => !!value || 'Password es requerido.'
  ]
})

const loading = ref(false)

const formValid = ref(false)

const submit = async () => {
  try {
    loading.value = true

    await AuthService.login({
      email:email.value,
      password: password.value,
      remember: remember.value
    })
    window.location.reload()
  } catch (error) {
    toastError((error as any).message)
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="login-container">
    <v-card class="mx-auto login-card">
      <v-card-text class="text-h5 py-2">
        <div class="card-container">
          <div class="item item-one">
            <v-card width="100%" class="item-one-one" :variant="'flat'">
              <div class="text-left my-2">
                <h3 class="text-h4 font-weight-bold py-4">
                  Inicio de sesión
                </h3>
                <p class="text-title-1 py-4">
                  Bienvenido a, 
                  <template v-if="session.system_parameters">
                    {{ session.system_parameters.app_name }}
                  </template>
                </p>
              </div>

              <v-form ref="form" @submit.prevent="submit()" v-model="formValid">
                <v-text-field
                  v-model="email"
                  type="email"
                  label="Email"
                  class="py-2"
                  variant="outlined"
                  :rules="rules.email"
                ></v-text-field>

                <v-text-field
                  v-model="password"
                  :type="showPassword ? 'text' : 'password'"
                  label="Password"
                  class="py-2"
                  variant="outlined"
                  :append-inner-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
                  @click:append-inner="showPassword = !showPassword"
                  :rules="rules.password"
                ></v-text-field>
 
              <v-row class="justify-space-between items-center">
                <v-col cols="5">
                  <p class="text-subtitle-1">
                    <v-checkbox
                      v-model="remember"
                      color="secondary"
                      label="Recordarme"
                      hide-details
                    ></v-checkbox>
                  </p>
                </v-col>
                <v-col cols="7">
                  <p class="text-subtitle-1 py-2 text-right">
                    <a 
                      href="/forgot-password" 
                      class="text-primary text-none ms-2 mb-1"
                      style="text-decoration: none;"
                    >
                      Olvide mi contraseña
                    </a>
                  </p>
                </v-col>
              </v-row>
              <v-row>
                <v-col>
                  <v-btn
                    :disabled="!formValid"
                    :loading="loading"
                    color="var(--login-blue-color)"
                    size="large"
                    type="submit"
                    variant="elevated"
                    block
                    style="color: white"
                >
                  INICIAR SESIÓN
                </v-btn>
                </v-col>
              </v-row>
            </v-form>
            </v-card>
          </div>
          <div class="item item-two" v-if="session.system_parameters">
            <VImg
              v-if="session.system_parameters.banner !== null && session.system_parameters.banner !== ''"
              :src="getUrlImage(session.system_parameters.banner)"
              aspect-ratio="1.6"
              class="w-100"
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
            </VImg>
            <template v-else>
              <img
                src="@/assets/images/login/brand_2.svg"
                style="height: 80vh; margin: auto"
              />
              <div class="login-badge"></div>
            </template>
          </div>
        </div>
      </v-card-text>
    </v-card>
  </div>
</template>

<style>
.login-container {
  background-color: var(--lwhite);
  height: 100vh;
  width: 100%;
  display: flex;
  background-position: center;
  background-size: cover;
  align-items: center;
  justify-content: center;
}

.login-card {
  height: 100vh;
  width: calc(100vw - 15rem);
  box-shadow: none;
}

.card-container {
  display: flex;
  flex-wrap: nowrap;
  justify-content: center;
  align-items: center;
  align-content: center;
  width: 100%;
  height: 100vh;
  overflow: auto;
  flex-direction: row;
}

.card-container .item {
  width: 50%;
  margin: 4px;
  display: flex;
  align-items: center;
  flex-direction: column;
}

.login-badge {
  background-color:#3768ea;
  height:.6rem;
  width:5rem;
  border-radius:.8rem;
}

@media only screen and (max-width: 600px) {
  .card-container {
    display: block;
  }

  .card-container .item {
    width: 100%;
    margin: 0;
  }
  .login-card {
    width: 100%;
  }
  .item-one {
    background-image: url(/src/assets/images/login/brand_2.svg);
    background-repeat: no-repeat;
    background-size: cover;
    height: auto;
    color: #ffffff;
  }

  .item-one-one {
    background-color: rgb(255 255 255 / 65%) !important;
  }

  .item-two {
    display: none !important;
  }
}

</style>
