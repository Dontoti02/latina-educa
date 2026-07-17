<script setup lang="ts">
import type { News } from '@/models/landing'
import 'swiper/css'
import { Swiper, SwiperSlide } from 'swiper/vue'

defineProps<{
  news: News
}>()

const mySwiperRef = ref<any>(null)
const colsContainer = ref<any>(null)
const slidesPerView = ref(3)
const colors = ref(['primary', 'info', 'success', 'accent', 'warning', 'error', 'secondary'])

const changeSlide = (dir: 'prev' | 'next') => {
  if (dir === 'next')
    mySwiperRef.value.slideNext()

  if (dir === 'prev')
    mySwiperRef.value.slidePrev()
}

const onSwiper = (swiper: any) => {
  mySwiperRef.value = swiper
}

const checkResize = () => {
  if (window.innerWidth < 768)
    slidesPerView.value = 1
  else if (window.innerWidth < 992)
    slidesPerView.value = 2
  else
    slidesPerView.value = 3
}

onMounted(() => {
  checkResize()
  window.addEventListener('resize', checkResize)
})

const getColors = (index: number) => {
  return colors.value[index % colors.value.length]
}
</script>

<template>
  <div
    class="rounded-t-xl"
    style="background: white;"
  >
    <VContainer class="px-md-16 px-10 d-flex justify-center py-16">
      <VCard
        elevation="0"
        style="max-width: 90rem;"
      >
        <VRow>
          <VCol
            cols="12"
            md="3"
          >
            <div class="mb-12">
              <VChip
                label
                color="primary"
                class="mb-4"
              >
                Novedades
              </VChip>
              <div class="text-h4 position-relative mb-1">
                <div class="section-title">
                  {{ news.title }}
                </div>
              </div>
              <div class="mb-12">
                {{ news.description }}
              </div>
            </div>
            <div>
              <VBtn
                class="me-4"
                rounded
                variant="tonal"
                icon
                size="small"
                @click="changeSlide('prev')"
              >
                <VIcon
                  size="25"
                  icon="tabler-chevron-left"
                />
              </VBtn>
              <VBtn
                rounded
                variant="tonal"
                icon
                size="small"
                @click="changeSlide('next')"
              >
                <VIcon
                  size="25"
                  icon="tabler-chevron-right"
                />
              </VBtn>
            </div>
          </VCol>
          <VCol
            ref="colsContainer"
            cols="12"
            md="9"
          >
            <Swiper
              ref="mySwiperRef"
              class="py-5 px-5"
              :slides-per-view="slidesPerView"
              :autoplay="{
                delay: 1000,
                disableOnInteraction: false,
              }"
              :space-between="20"
              loop
              @swiper="onSwiper"
            >
              <SwiperSlide
                v-for="(item, index) in news.arrNews"
                :key="`item-${item}`"
                class="swiper-slide"
              >
                <VCard>
                  <VCardTitle class="pb-0">
                    <VIcon
                      :icon="`tabler-${item.icon}`"
                      size="50"
                      :color="getColors(index)"
                    />
                  </VCardTitle>

                  <!--
                    <VCardTitle>
                    {{ item.title }}
                    </VCardTitle>
                  -->
                  <VCardText style="min-height: 8rem;">
                    <div class="text-h5 mb-4 mt-2">
                      {{ item.title }}
                    </div>
                    <div>
                      {{ item.description }}
                    </div>
                  </VCardText>
                </VCard>
              </SwiperSlide>
            </Swiper>
          </VCol>
        </VRow>
      </VCard>
    </VContainer>
  </div>
</template>

<style scoped>
.section-title::after{
    position: absolute;
    background: url(data:image/png;base64,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) no-repeat left bottom;
    background-size: contain;
    block-size: 100%;
    content: "";
    inline-size: 120%;
    inset-block-end: 0;
    inset-inline-start: -12%;
    height: 0.8rem;
    bottom: -0.3rem;
}

.section-title{
  font-weight: 800;
}
</style>
