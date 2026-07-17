<script setup lang="ts">
import { SessionStore } from '@/common/store'
import { modalConfirmation } from '@/common/util/modal.service'
import { ToastService } from '@/common/util/toast.service'
import ContentResource from '@/components/resources/ResourceItem.vue'
import type { FileResource, ForumPost } from '@/models/forum'
import { CapacitationForumService } from '@/services/capacitation-forum.service'
import { FileService } from '@/services/file.service'
import { DateFormatting } from '@/utils/date-formatting'
import { CHUNK_SIZE, chunkFile } from '@/utils/file-utils'
import { ImageUtils } from '@/utils/images'
import { getTypeResource } from '@/utils/resources'
import laptopGirl from '@images/illustrations/laptop-girl.png'
import { QuillEditor } from '@vueup/vue-quill'
import { uid } from 'uid'
import { VSkeletonLoader } from 'vuetify/labs/VSkeletonLoader'
import EditForum from './modals/EditForum.vue'

// props
const props = defineProps<{
  trainingId: number
}>()

// Timer
let timer = ref<NodeJS.Timeout>()

// Variables
const session = SessionStore()
const quillToolbar = [[{ size: ['small', false, 'large', 'huge'] }], ['bold', 'italic'], [{ list: 'bullet' }, { list: 'ordered' }], ['link', 'image']]

const posts = ref<ForumPost[]>([])
const newPost = ref<ForumPost>()
const showPostEditor = ref(false)
const loading = ref(false)
const loadingDelete = ref<number[]>([])
const scrollLoading = ref(false)
const postSelected = ref<ForumPost>()
const postEditActions = [
  {
    title: 'Editar',
    icon: 'tabler-edit',
    action: (post: ForumPost) => {
      postSelected.value = post
    },
  },
  {
    title: 'Eliminar',
    icon: 'tabler-trash',
    action: (post: ForumPost) => {
      deletePost(post.id)
    },
  },
]

// PaginationVariables
const pagination = ref({
  page: 1,
  totalItems: 0,
})

// Editor Variables
const postEditor = ref<string>()
const commentEditor = ref<string>()
const postEditorLoading = ref(false)
const commentEditorLoading = ref(false)
const commentEditorId = ref(-1)
const fileInput = ref<HTMLElement | null>(null)

const files = ref<{
  file: FileResource
  progress?: number
}[]>([])

// Functions
// Metodos para subir archivos
const formatImages = (p?: string) => {
// Define una expresión regular para encontrar las etiquetas img que no tienen el estilo deseado, y captura los atributos existentes
  const imgRegex = /(<img\b(?![^>]*style=['"]?height:20rem;['"]?)([^>]*?)>)/g

  // Reemplaza todas las ocurrencias de la etiqueta img sin el estilo deseado con una versión que incluye el estilo y los atributos existentes
  return p?.replace(imgRegex, '<img style=\'height:20rem;\'$2>')
}

// const extractBase64 = (richText: string) => {
//   const regex = /<img src="data:image\/\w+;base64,([^"]+)"/g
//   const matches = [...richText.matchAll(regex)]

//   return matches.map(match => match[1])
// }

const openFileInput = () => {
  fileInput?.value?.click()
}

const handleFileUpload = async (event: any) => {
  for (let i = 0; i < event.target.files.length; i++) {
    const file = event.target.files[i]

    // if (!isExtensionPermitted(file.extension, session)) {
    //   await allowedExtensionsMessage(file.name)

    //   return
    // }

    const contentMedia: FileResource = {
      metaData: {
        id: files.value.length + 1,
        uuid: '',
        url: '',
        metadata: {
          type: file.type,
          originalName: file.name,
          extension: file.name.split('.').pop()!,
          size: file.size,
          unit: 'MB',
        },
      },
      file,
    }

    files.value.push({
      file: contentMedia,
    })
  }
}

const getPosts = () => {
  CapacitationForumService.getPostsForum({ training_id: props.trainingId, page: pagination.value.page, size: 20 })
    .then(response => {
      pagination.value.totalItems = response.data.total
      posts.value = response.data.publications.map(p => ({
        ...p,
        files: p.files.map(f => ({ ...f, title: f.metadata!.originalName, type: getTypeResource(f.metadata!.type.split('/')[1].toLowerCase()) })),
        showComments: 1,
      }))
    })
    .catch(error => {
      ToastService.error(error)
    }).finally(() => {
      loading.value = false
      scrollLoading.value = false
    })
}

const addPost = () => {
  if (newPost.value) {
    posts.value.unshift(newPost.value)
    postEditor.value = '<p><br></p>'
    files.value = []
    ToastService.success('Publicación creada con éxito')
    newPost.value = undefined
  }
}

const uploadFiles = async (contentId: number) => {
  if (files.value.length > 0) {
    const promises: Promise<any>[] = []
    let lastData: any = []

    files.value.forEach(file => {
      const chunks = chunkFile(file.file.file, CHUNK_SIZE)
      const chunkUid = uid(16)
      let countResponse = 0
      
      chunks.forEach((chunk, index) => {
        const promise = FileService.uploadFile({
          model: 'training_publication',
          model_id: contentId,
          chunk,
          chunk_uid: chunkUid,
          chunk_number: index + 1,
          chunk_total: chunks.length,
          chunk_name: file.file.file.name,
        }).then(response => {
          countResponse++
          file.progress = Math.round((countResponse) / chunks.length * 100)
          if (Array.isArray(response.data)) {
            lastData = response.data
          }
        }).catch(error => {
          ToastService.error(error)
        })

        promises.push(promise)
      })
    })

    await Promise.all(promises).then(() => {
      files.value = []
      postEditorLoading.value = false
      if(lastData)
        newPost.value!.files = lastData
      if (fileInput.value)
        fileInput.value.value = ''
      addPost()

    })
  }
}

const createPost = async () => {
  if (!postEditor.value || postEditor.value === '<p><br></p>' || postEditor.value === '')
    return ToastService.error('El campo de texto no puede estar vacio')
  postEditorLoading.value = true

  CapacitationForumService.createPostsForum({ training_id: props.trainingId, value: formatImages(postEditor.value)! })
    .then(response => {
      newPost.value = {
        ...response.data,
        showComments: 1,
      }
      if (files.value.length > 0) {
        uploadFiles(response.data.id)
      }
      else {
        postEditorLoading.value = false
        addPost()
      }
    })
    .catch(error => {
      postEditorLoading.value = false
      ToastService.error(error)
    })
}

const deletePost = async (postId: number) => {
  const confirm = await modalConfirmation({
    title: 'Eliminar publicación',
    content: '¿Estás seguro de que deseas eliminar esta publicación?',
  })

  if (!confirm)
    return

  loadingDelete.value.push(postId)
  CapacitationForumService.deletePostsForum(postId)
    .then(() => {
      loading.value = true
      getPosts()
      ToastService.success('Publicación eliminada con éxito')
    })
    .catch(error => {
      ToastService.error(error)
    }).finally(() => {
      loadingDelete.value = loadingDelete.value.filter(id => id !== postId)
    })
}

const createComment = (post: ForumPost) => {
  if (!commentEditor.value || commentEditor.value === '<p><br></p>' || commentEditor.value === '')
    return ToastService.error('El campo de texto no puede estar vacio')

  commentEditorLoading.value = true
  CapacitationForumService.createPostsForumComment({ model: 'training_publication', model_id: post.id, comment: commentEditor.value })
    .then(response => {
      post.comments.unshift(response.data)
      commentEditor.value = '<p><br></p>'
      ToastService.success('Comentario creada con éxito')
    })
    .catch(error => {
      ToastService.error(error)
    }).finally(() => {
      commentEditorLoading.value = false
    })
}

const handleScroll = () => {
  if (((window.innerHeight + window.scrollY) >= document.body.offsetHeight) && !scrollLoading.value && !loading.value && pagination.value.totalItems > posts.value.length) {
    scrollLoading.value = true
    pagination.value.page++
    getPosts()
  }
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll)

  loading.value = true
  getPosts()

  timer.value = setInterval(() => {
    getPosts()
  }, 60000)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
  clearInterval(timer.value!)
})
</script>

<template>
  <template v-if="loading">
    <VSkeletonLoader
      v-for="skeleton in 4"
      :key="skeleton"
      type="list-item-avatar,paragraph"
      class="mb-5"
    />
  </template>
  <template v-else>
    <!-- <template v-if="posts.length !== 0"> -->
    <div class="d-flex justify-end mb-4">
      <!-- @click="showPostEditor = true" -->
      <VBtn
        v-if="!showPostEditor"
        style="padding: 0 50px;"
        text="Publicar"
        variant="elevated"
        @click="showPostEditor = true"
      />
    </div>

    <VCard
      v-if="showPostEditor"
      class="mb-4"
    >
      <VCardTitle class="mt-3">
        Publica un nuevo post
      </VCardTitle>
      <VCardText style="position: relative;">
        <QuillEditor
          v-model:content="postEditor"
          theme="snow"
          :toolbar="quillToolbar"
          style="min-height: 5rem !important;"
          content-type="html"
          placeholder="Escribe una publicación..."
        />
        <!-- Subir Archivos -->

        <p class="text-h6 mt-4">
          Archivos
        </p>
        <VRow>
          <VCol
            v-for="(file, index) in files"
            :key="`file${index}`"
            cols="12"
            md="3"
            sm="6"
          >
            <ContentResource
              :progress="file.progress"
              :content-resource="file.file.metaData"
              removable
              @remove="files.splice(index, 1)"
            />
          </VCol>
          <VCol
            cols="12"
            md="3"
            sm="6"
          >
            <VBtn
              icon="tabler-plus"
              variant="outlined"
              color="primary"
              size="small"
              @click="openFileInput"
            />
            <input
              ref="fileInput"
              type="file"
              style="display: none;"
              multiple
              @change="handleFileUpload"
            >
          </VCol>
        </vRow>

        <div
          v-if="postEditorLoading"
          style="position: absolute; top: 0; width: 100%; height: 100%; background: #ffff; opacity: 0.5;"
        />
      </VCardText>
      <VCardActions class="d-flex justify-end">
        <VBtn
          style="padding: 0 50px;"
          text="Cancelar"
          variant="outlined"
          :loading="postEditorLoading"
          @click="showPostEditor = false; postEditor = ''"
        />

        <VBtn
          style="padding: 0 50px;"
          text="Publicar"
          variant="elevated"
          :loading="postEditorLoading"
          @click="createPost"
        />
      </VCardActions>
    </VCard>
    <VCard
      v-for="(post) in posts"
      :key="post.id"
      class="mb-4"
    >
      <VCardTitle class="d-flex justify-space-between mt-2">
        <div class="d-flex">
          <VAvatar
            v-if="post.photo"
            class="mr-2"
            :image="ImageUtils.getUrlImage(post.photo)"
          />
  
          <VAvatar
            v-else
            class="mr-2"
            color="primary"
            variant="tonal"
            size="large"
          >
            <VIcon
              size="large"
              icon="tabler-user"
            />
          </VAvatar>
  
          <div>
            {{ post.person }}
            <div class="text-caption">
              {{ DateFormatting.formatShort(new Date(post.date)) }}
            </div>
          </div>
        </div>
        <VMenu v-if="post.user_id === session.roles[0].pivot.user_id">
          <template v-slot:activator="{ props }">
            <VBtn 
              color="secondary"
              density="compact"
              icon="tabler-dots-vertical"
              variant="plain"
              v-bind="props"
              :loading="loadingDelete.includes(post.id)"
            />
          </template>
          <v-list>
            <v-list-item
              v-for="(item, index) in postEditActions"
              :key="index"
              :value="index"
            >
              <v-list-item-title
                @click="item.action(post)"
              >{{ item.title }}</v-list-item-title>
            </v-list-item>
          </v-list>
        </VMenu>
      </VCardTitle>
      <VCardText style="padding-left: 70px;">
        <div
          :class="{ 'mb-5': post.files!.length > 0 }"
          v-html="post.value"
        />
        <VRow class="mb-4">
          <VCol
            v-for="contentResource in post.files"
            :key="contentResource.id"
            cols="12"
            md="3"
            sm="6"
          >
            <ContentResource :content-resource="contentResource" />
          </VCol>
        </VRow>

        <div
          class="text-h5"
          :class="{ 'pt-2': post.files!.length === 0 }"
        >
          <div class="d-flex align-center justify-space-between">
            <div>
              Comentarios
            </div>
            <VBtn
              variant="plain"
              color="primary"
              :disabled="loadingDelete.includes(post.id)"
              @click="commentEditorId = post.id, commentEditor = ''"
            >
              Agregar comentario
            </VBtn>
          </div>
          <QuillEditor
            v-if="commentEditorId === post.id"
            v-model:content="commentEditor"
            theme="snow"
            :toolbar="quillToolbar"
            style="min-height: 5rem !important; margin-bottom: 20px;"
            content-type="html"
            placeholder="Escribe un comentario..."
          />
          <div
            v-if="commentEditorId === post.id"
            class="d-flex justify-end"
          >
            <VBtn
              class="mr-2"
              variant="outlined"
              @click="commentEditorId = -1"
            >
              Cancelar
            </VBtn>
            <VBtn @click="createComment(post)">
              Publicar
            </VBtn>
          </div>
          <!-- Comments -->
          <VTimeline
            density="compact"
            align="start"
            truncate-line="both"
            class="v-timeline-density-compact"
          >
            <VTimelineItem
              v-for="comment in post.comments.slice(0, 3 * post.showComments!)"
              :key="comment.id"
            >
              <template #icon>
                <VAvatar
                  v-if="comment.photo"
                  :image="ImageUtils.getUrlImage(comment.photo)"
                  style="background-color: rgb(var(--v-theme-surface));"
                />

                <VAvatar
                  v-else
                  color="primary"
                  size="small"
                >
                  <VIcon
                    size="small"
                    icon="tabler-user"
                  />
                </VAvatar>
              </template>
              <div class="d-flex align-center">
                <div>
                  <div class="text-subtitle-1">
                    {{ comment.person }}
                  </div>
                  <div class="text-caption" />
                </div>
              </div>
              <div>
                <div
                  class="text-body-1 mb-2"
                  v-html="comment.value "
                />
              </div>
            </VTimelineItem>
          </VTimeline>
          <VBtn
            v-if="post.comments?.length > post.showComments! * 3"
            variant="plain"
            class="ml-9"
            @click="post.showComments! += 1"
          >
            Mostrar más comentarios
            <VIcon
              right
              icon="tabler-chevron-down"
            />
          </VBtn>
          <div
            v-if="post.comments?.length === 0"
            class="text-subtitle-2 font-italic"
          >
            Aún no hay comentarios
          </div>
        </div>
      </VCardText>
    </VCard>
    <div
      v-if="scrollLoading"
      class="d-flex justify-center flex-column align-center mt-10"
    >
      <VProgressCircular
        indeterminate
        color="primary"
      />
      Cargando más publicaciones...
    </div>
    <div
      v-else
      class="d-flex justify-center flex-column align-center mt-10"
    >
      <template v-if="posts.length !== 0">
        No hay más publicaciones
      </template>
      <template v-else>
        <VCard
          v-if="!showPostEditor"
          class="w-100"
        >
          <VCardTitle>
            <div class="text-center my-10 text-h5">
              Aun no hay publicaciones disponibles<br>sé el primero en publicar
            </div>
            <VImg
              :src="laptopGirl"
              alt="Laptop girl"
              :max-width="170"
              class="mx-auto mb-10"
            />
          </VCardTitle>
        </VCard>
      </template>
    </div>
    <EditForum 
      v-if="postSelected"
      :post="postSelected"
      :show="!!postSelected"
      @close="postSelected = undefined"
      @updated="postSelected= undefined; loading = true; getPosts()"
    />
  </template>
</template>
