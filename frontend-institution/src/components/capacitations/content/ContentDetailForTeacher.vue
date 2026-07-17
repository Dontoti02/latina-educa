<!-- eslint-disable indent -->
<script setup lang="ts">
import emitter from "@/common/util/emitter.service";
import modalService from "@/common/util/modal.service";
import { ToastService } from "@/common/util/toast.service";
import type { CapacitationContentDetailForTeacher } from "@/models/content";
import { CommentService } from "@/services/comment.service";
import { CapacitationContentService } from "@/services/capacitation-content.service";
import { DateFormatting } from "@/utils/date-formatting";
import { VSkeletonLoader } from "vuetify/labs/VSkeletonLoader";
import ResourceItem from "../../resources/ResourceItem.vue";
import CreateContentModal from "../teacher-panels/modals/CreateContentModal.vue";
import AddComments from "./partials/AddComments.vue";
import CommentsList from "./partials/CommentsList.vue";
import LinkItem from "@/components/resources/LinkItem.vue";

// Inital
const props = defineProps<{
  classroomId: number;
  contentId: number;
}>();

const emit = defineEmits<{
  (e: "toBack"): void;
  (e: "toEvaluation", contentId: number): void;
}>();

const loading = ref<boolean>(false);
const showEditModal = ref<boolean>(false);
const sendingComment = ref<boolean>(false);

const itemsForMenu = ref<
  Array<{
    title: string;
    action: string;
  }>
>([]);

// Data
const contentDetail = ref<CapacitationContentDetailForTeacher | null>(null);

const mapContentDetail = (content: CapacitationContentDetailForTeacher) => {
  contentDetail.value = content;

  itemsForMenu.value = [
    ...(content.type !== "content"
      ? [{ title: "Evaluar", action: "evaluate" }]
      : []),
    { title: "Editar", action: "edit" },
    { title: "Eliminar", action: "delete" },
  ];
};

const getContentDetail = async () => {
  loading.value = true;
  CapacitationContentService.getContentDetailForTeacher(props.contentId)
    .then((response) => {
      mapContentDetail(response.data);

      itemsForMenu.value = [
        ...(contentDetail.value!.type !== "content"
          ? [{ title: "Evaluar", action: "evaluate" }]
          : []),
        { title: "Editar", action: "edit" },
        { title: "Eliminar", action: "delete" },
      ];
    })
    .catch((error) => {
      ToastService.error(error);
      emit("toBack");
    })
    .finally(() => {
      loading.value = false;
    });
};

onBeforeMount(() => {
  getContentDetail();
});

const addComment = (comment: string) => {
  sendingComment.value = true;
  CommentService.addCapacitationComment({
    model: "training_content",
    model_id: props.contentId,
    comment,
  })
    .then((response) => {
      contentDetail.value!.comments.push(response.data);
      ToastService.success("Comentario agregado");
    })
    .catch((error) => {
      ToastService.error(error);
    })
    .finally(() => {
      sendingComment.value = false;
    });
};

// Computed
const publicationDate = computed(() => {
  return DateFormatting.formatDayOfMonth(new Date(contentDetail.value!.date));
});

const initDate = computed(() => {
  return DateFormatting.formatDayOfMonth(
    new Date(contentDetail.value!.date_start!)
  );
});

const finishDate = computed(() => {
  return DateFormatting.formatDayOfMonth(
    new Date(contentDetail.value!.date_limit!)
  );
});

// Actions
const deleteContent = async (contentId: number) => {
  const confirm = await modalService.confirmation({
    title: "Eliminación de contenido",
    content: "¿Estás seguro de que deseas eliminar este contenido?",
  });

  if (confirm) {
    loading.value = true;
    CapacitationContentService.deleteContent(contentId)
      .then(() => {
        ToastService.success("Contenido eliminado correctamente");
        emitter.emit("updateListContent", null);
        emit("toBack");
      })
      .catch((error) => ToastService.error(error))
      .finally(() => {
        loading.value = false;
      });
  }
};

const handleActions = (args: {
  action: string;
  contentDetail: CapacitationContentDetailForTeacher;
}) => {
  switch (args.action) {
    case "evaluate":
      emit("toEvaluation", args.contentDetail.id);
      break;
    case "edit":
      showEditModal.value = true;
      break;
    case "delete":
      deleteContent(args.contentDetail.id);
      break;
  }
};
</script>

<template>
  <VRow v-if="loading || contentDetail === null">
    <VCol cols="12">
      <VSkeletonLoader
        type="list-item,list-item-three-line,list-item-three-line,list-item-three-line,list-item-three-line"
      />
    </VCol>
  </VRow>
  <VCard v-else class="px-6 py-6">
    <VRow>
      <VCol cols="12">
        <VCard class="" variant="text">
          <div class="pb-4">
            <div class="d-flex align-center mb-1">
              <VBtn
                variant="tonal"
                icon="tabler-chevron-left"
                class="mr-2"
                density="compact"
                rounded="sm"
                @click="emit('toBack')"
              />
              <div class="text-h4">
                {{ contentDetail.title }}
              </div>
              <VMenu>
                <template #activator="{ props }">
                  <VBtn
                    style="align-self: flex-start"
                    icon="mdi-dots-vertical"
                    variant="text"
                    v-bind="props"
                    density="compact"
                    size="small"
                  />
                </template>

                <VList>
                  <VListItem
                    v-for="(item, i) in itemsForMenu"
                    :key="i"
                    class="px-0 mx-0 my-0 py-0"
                  >
                    <VBtn
                      variant="text"
                      class="w-100 d-flex justify-start"
                      @click="
                        handleActions({ action: item.action, contentDetail })
                      "
                    >
                      {{ item.title }}
                    </VBtn>
                  </VListItem>
                </VList>
              </VMenu>
            </div>
            <div class="text-body-2">
              Fecha de publicación: {{ publicationDate }}
            </div>
            <div class="text-body-2" v-if="contentDetail.date_start != null">
              Fecha de inicio: {{ initDate }}
            </div>
            <div
              v-if="contentDetail.type === 'task'"
              class="text-body-2 font-weight-bold d-flex w-100 justify-space-between"
            >
              <div>Fecha de entrega: {{ finishDate }}</div>
              <div>{{ contentDetail.score }} puntos</div>
            </div>
          </div>
          <VDivider />
          <div class="pt-2 ql-editor" v-html="contentDetail.description" />
          <VRow class="my-2 mx-1">
            <VCol
              v-for="contentResource in contentDetail.files"
              :key="contentResource.id"
              cols="6"
              lg="3"
              sm="4"
            >
              <ResourceItem :content-resource="contentResource" />
            </VCol>
            <VCol
              v-for="link in contentDetail.links"
              :key="link.id"
              cols="6"
              lg="3"
              sm="4"
            >
              <LinkItem :content-link="link" />
            </VCol>
          </VRow>
          <VRow class="px-0 py-0">
            <VCol cols="12" class="px-0">
              <AddComments
                :loading="sendingComment"
                @add-comment="addComment($event)"
              />
            </VCol>
            <VCol cols="12" class="px-0">
              <CommentsList :comments="contentDetail.comments" />
            </VCol>
          </VRow>
        </VCard>
      </VCol>
    </VRow>
  </VCard>
  <CreateContentModal
    v-if="contentDetail !== null"
    :training-id="classroomId"
    :group-id="contentDetail.training_content_group_id"
    :content-id="contentDetail.id"
    :content-detail="contentDetail"
    :show="showEditModal"
    @close="showEditModal = false"
    @update-content="mapContentDetail"
    @update-files="contentDetail!.files = $event"
    @delete-file="
      contentDetail!.files = contentDetail!.files.filter(
        (file) => file.id !== $event
      )
    "
    @update-links="contentDetail!.links = $event"
    @delete-link="
      contentDetail!.links = contentDetail!.links.filter(
        (link) => link.id !== $event
      )
    "
  />
</template>
