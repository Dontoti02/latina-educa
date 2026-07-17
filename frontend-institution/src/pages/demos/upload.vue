<script setup lang="ts">
import { onMounted, ref } from 'vue'
import TestFileService from './service'

const files = ref<File[]>([])

const testResponse = async () => {
  const data = await TestFileService.test()

  console.log({ data })
}

const sendFiles = async () => {
  try {
    const response = await TestFileService.classroomUpdateImage({
      classroomId: 1,
      files: files.value,
    })

    console.log({ response })
  }
  catch (error) {

  }
  finally {
    console.log({ fileS: files.value })
  }
}

onMounted(async () => {
  await testResponse()
})
</script>

<template>
  <div>
    <VCard>
      <VCardText>
        <VFileInput
          v-model="files"
          label="File input"
          variant="outlined"
        />
      </VCardText>
      <VCardActions>
        <VBtn @click="sendFiles">
          ENVIAR ARCHIVOS
        </VBtn>
      </VCardActions>
    </VCard>
  </div>
</template>
