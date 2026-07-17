<script setup lang="ts">
import type { Institution } from '@/models/landing'
import { ImageUtils } from '@/utils/images'

defineProps<{
  images: string[]
  institution: Institution
}>()

const getImages = (path: string) => {
  return ImageUtils.getUrlImage(path)
}
</script>

<template>
  <div style="height: 45rem;">
    <VCard
      height="100%"
      rounded="b-xl t-0"
      elevation="0"
      style="position: relative;"
    >
      <VCarousel
        hide-delimiters
        interval
        cycle
        height="100%"
      >
        <template #prev="{ props }">
          <VBtn
            color="secondary"
            variant="text"
            icon
            class="carrousel-controls"
            @click="props.onClick"
          >
            <VIcon
              size="50"
              icon="tabler-chevron-left"
            />
          </VBtn>
        </template>
        <template #next="{ props }">
          <VBtn
            color="secondary"
            variant="text"
            icon
            class="carrousel-controls"
            @click="props.onClick"
          >
            <VIcon
              size="50"
              icon="tabler-chevron-right"
            />
          </VBtn>
        </template>
        <VCarouselItem
          v-for="(image, index) in images"
          :key="`image-${index}`"
          style="position: relative;"
          cover
        >
          <VImg
            height="100%"
            cover
            :src="getImages(image)"
          />
          <div style="position: absolute; top: 0; left: 0; background: black; height: 100%; width: 100%; opacity: 0.4;" />
        </VCarouselItem>
      </VCarousel>
      <div class="d-flex flex-md-row flex-column brand-overlay">
        <div class="logo-container">
          <VImg
            height="200"
            width="100%"
            :src="getImages(institution.logo)"
          />
        </div>
        <VDivider
          class="mx-10 border-opacity-100"
          color="white"
          vertical
        />
        <VCardText class="text-white">
          <h1
            data-v-59dbb55d=""
            class="hero-title mb-4"
          >
            {{ institution.name }}
          </h1>
          <div class="banner-description">
            {{ institution.description }}
          </div>
        </VCardText>
      </div>
    </VCard>
  </div>
</template>

<style lang="css" scoped>
.hero-title {
  color: #ffffff;
    animation: shine-59dbb55d 2s ease-in-out infinite alternate;
    /* background: linear-gradient(135deg, #28c76f, #65a2fd 47.92%, #b8d7ff);
    -webkit-background-clip: text;
    background-clip: text; */
    font-size: 42px;
    font-weight: 800;
    line-height: 48px;
    /* -webkit-text-fill-color: rgba(0, 0, 0, 0); */
}

.logo-container{
  width: 15rem;
}

.banner-description{
  width: 35rem;
  font-size: 18px;
}

.brand-overlay{
  position: absolute;
  bottom:2rem;
  right: 0
}

.carrousel-controls{
}

@media (max-width: 960px) {
  .hero-title{
    font-size: 32px;
  }

  .banner-description{
    font-size: 16px;
    width: 20rem;
  }

  .brand-overlay{
    right: 50%;
    transform: translateX(50%);
    text-align: center;
  }

  .logo-container{
    display: flex;
    justify-content: center;
    width: 100%;
  }

  .carrousel-controls{
    z-index: 10;
  }
}
</style>
