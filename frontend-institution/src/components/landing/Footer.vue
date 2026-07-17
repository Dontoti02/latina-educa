<script setup lang="ts">
import type { ContactInformation, Institution } from '@/models/landing';
import { ImageUtils } from '@/utils/images';

defineProps<{
  contacts: ContactInformation
  institution: Institution
}>()

const getImages = (path: string) => {
  return ImageUtils.getUrlImage(path)
}
</script>

<template>
  <VCard
    color="#2f3249"
    rounded="t-xl b-0"
  >
    <VContainer>
      <VCardText>
        <VRow>
          <VCol class="d-flex justify-center align-center">
            <div
              class="d-flex"
              style="height: fit-content;"
            >
              <VImg
                height="50"
                width="50"
                :src="getImages(institution.logo)"
                class="mr-4"
              />
              <div>
                <div class="text-h3 text-white">
                  Instituto {{ institution.name }}
                </div>
                <div>
                  © Todos los derechos reservados - {{ new Date().getFullYear() }}
                </div>
              </div>
            </div>
          </VCol>
          <VCol class="d-flex justify-center">
            <div>
              <div class="text-h4 text-white mb-2">
                Contacto
              </div>
              <div class="d-flex flex-md-row flex-column gap-10">
                <div class="d-flex align-center">
                  <VIcon
                    class="mr-3"
                    icon="tabler-phone"
                  />
                  <div>
                    <div
                      v-for="(phone, index) in contacts.phones"
                      :key="`phone-${index}`"
                    >
                      {{ phone }}
                    </div>
                  </div>
                </div>
                <div class="d-flex align-center">
                  <VIcon
                    class="mr-3"
                    icon="tabler-mail"
                  />
                  <div>
                    <div
                      v-for="(email, index) in contacts.emails"
                      :key="`email-${index}`"
                    >
                      {{ email }}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </VCol>
        </VRow>
      </VCardText>
    </VContainer>
  </VCard>
</template>
