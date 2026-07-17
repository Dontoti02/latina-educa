<script setup lang="ts">
import AppTextField from "@/@core/components/app-form-elements/AppTextField.vue";
import { ToastService } from "@/common/util/toast.service";
import { GroupTask } from "@/models/content";
import { CapacitationService } from "@/services/capacitations.service";
import { VCardActions, VSelect } from "vuetify/lib/components/index.mjs";

const props = defineProps<{
  // students: Array<{ id: number; name: string }>;
  trainingId: number;
  taskId?: number | null;
  hasGroups: boolean;
}>();

const emit = defineEmits<{
  (e: "back"): void;
  (e: "save", data: Array<GroupTask>): void;
}>();

const groups = ref<Array<GroupTask>>([]);

const studentsPerGroup = ref<number>();

const freeStudents = ref<Array<{ id: number; name: string }>>([]);

const students = ref<Array<{ id: number; name: string }>>([]);

const loading = ref<boolean>(false);
const softLoading = ref<boolean>(false);

const randomizeStudents = () => {
  const shuffledStudents = [...students.value].sort(() => Math.random() - 0.5);
  groups.value = [];

  var count = 1;
  for (let i = 0; i < shuffledStudents.length; i += +studentsPerGroup.value!) {
    const group = shuffledStudents.slice(i, i + +studentsPerGroup.value!);

    if (group.length === 1) {
      groups.value[groups.value.length - 1].participants.push(group[0]);
    } else {
      groups.value.push({
        name: `${count}`,
        participants: group,
      });
    }
    count++;
  }
};

const deleteStudent = async (
  student: { id: number; name: string; training_participant_id?: number },
  group: Array<{ id: number; name: string }>
) => {
  if (props.taskId) {
    softLoading.value = true;
    await CapacitationService.deleteStudentsTask(student.id)
      .then(() => {
        student.id = student.training_participant_id!;
        freeStudents.value.push(student);
        group.splice(group.indexOf(student), 1);
      })
      .catch((error) => {
        ToastService.error(error);
      })
      .finally(() => {
        softLoading.value = false;
      });
  } else {
    freeStudents.value.push(student);
    group.splice(group.indexOf(student), 1);
  }
};

const deleteGroup = async (groupId: number) => {
  softLoading.value = true;
  await CapacitationService.deleteGroupTask(groupId)
    .then(async () => {
      groups.value = groups.value.filter((group) => group.id !== groupId);
      await getStudentsTask();
      findFreeStudents();
    })
    .catch((error) => {
      ToastService.error(error);
    })
    .finally(() => {
      softLoading.value = false;
    });
};

const addStudent = async (
  student: { id: number; name: string; training_participant_id?: number },
  group: GroupTask
) => {
  if (props.taskId) {
    softLoading.value = true;
    await CapacitationService.addStudentsTask(group.id!, student.id)
      .then(async (response) => {
        freeStudents.value = freeStudents.value.filter(
          (s) => s.id !== student.id
        );
        group.participants.push(response.data);
      })
      .catch((error) => {
        ToastService.error(error);
      })
      .finally(() => {
        softLoading.value = false;
      });
  } else {
    freeStudents.value = freeStudents.value.filter((s) => s.id !== student.id);
    group.participants.push(student);
  }

  // freeStudents.value.splice(freeStudents.value.indexOf(student), 1);
  // group.participants.push(student);
};

const saveGroups = () => {
  const studentsGroup = groups.value.map((group, index) => ({
    name: `${index + 1}`,
    participants: group.participants.map((student) => student),
  }));

  emit("save", studentsGroup);
};

const backToForm = () => {
  emit("back");
};

const getStudents = async () => {
  loading.value = true;
  await CapacitationService.getStudentsTraining(props.trainingId)
    .then(async (response) => {
      students.value = response.data;
    })
    .catch((error) => {
      ToastService.error(error);
    })
    .finally(() => {
      loading.value = false;
    });
};

const getStudentsTask = async () => {
  loading.value = true;
  await CapacitationService.getStudentsTask(props.taskId!)
    .then(async (response) => {
      groups.value = response.data.groups;
    })
    .catch((error) => {
      ToastService.error(error);
    })
    .finally(() => {
      loading.value = false;
    });
};

const createNameGroup = () => {
  const groupNames = groups.value.map((group) => parseInt(group.name));
  const highestGroupNumber = Math.max(...groupNames);
  return (highestGroupNumber + 1).toString();
};

const addGroupTask = async () => {
  softLoading.value = true;
  await CapacitationService.addGroupTask(props.taskId!, createNameGroup())
    .then(async (response) => {
      groups.value.push(response.data);
    })
    .catch((error) => {
      ToastService.error(error);
    })
    .finally(() => {
      softLoading.value = false;
    });
};

const findFreeStudents = () => {
  freeStudents.value = students.value.filter((student) => {
    return !groups.value.some((group) => {
      return group.participants.some(
        (participant) => participant.training_participant_id === student.id
      );
    });
  });

  console.log(freeStudents.value);
};

onMounted(async () => {
  await getStudents();
  if (props.hasGroups) {
    await getStudentsTask();
    findFreeStudents();
  }
});
</script>
<template>
  <VCardText v-if="!loading">
    <VRow>
      <!-- <VCardTitle>Agrupar estudiantes</VCardTitle> -->
      <VCol cols="6" sm="8" md="10" v-if="!taskId || !hasGroups">
        <AppTextField
          v-model="studentsPerGroup"
          placeholder="Estudiantes por grupo"
          type="number"
          :rules="[(value: any) => value >= 2 || 'Debe haber por lo menos 2 estudiantes por grupo']"
          :disabled="softLoading"
        >
        </AppTextField>
      </VCol>
      <VCol cols="6" sm="4" md="2" v-if="!taskId || !hasGroups">
        <VBtn
          class="px-4"
          color="primary"
          variant="flat"
          block
          height="43px"
          :disabled="!studentsPerGroup || studentsPerGroup < 2 || softLoading"
          @click="randomizeStudents"
        >
          Agrupar <VIcon class="ml-1">mdi-dice-5-outline</VIcon>
        </VBtn>
      </VCol>
      <VCol v-if="taskId && hasGroups" cols="auto" sm="8" md="9" class="pa-0" />
      <VCol cols="12" sm="4" md="3" v-if="taskId && hasGroups">
        <VBtn
          class="px-4"
          color="primary"
          variant="flat"
          block
          height="43px"
          :disabled="softLoading"
          @click="addGroupTask"
        >
          Agregar grupo <VIcon class="ml-1">mdi-plus</VIcon>
        </VBtn>
      </VCol>
    </VRow>
    <div class="d-flex" :class="[{ 'justify-end': taskId }]">
      <span
        v-if="studentsPerGroup && +studentsPerGroup >= 2"
        class="text-caption"
        >Estás agrupando {{ 20 }} estudiantes en
        {{ Math.ceil(students.length / studentsPerGroup!) }} grupos</span
      >
      <span v-else class="text-caption"
        >Hay {{ students.length }} estudiantes para agrupar</span
      >
    </div>
    <VRow
      v-if="groups.length > 0"
      class="mt-3"
      style="max-height: 70vh; overflow: auto"
    >
      <VCol cols="12" sm="6" md="4" v-for="(card, index) in groups">
        <VCard flat border height="100%" :disabled="softLoading">
          <VCardTitle class="d-flex justify-space-between align-center"
            >Grupo N° {{ card.name }}
            <VBtn
              v-if="hasGroups"
              color="error"
              icon="mdi-trash-can-outline"
              variant="text"
              size="40px"
              class="ml-auto"
              @click="deleteGroup(card.id!)"
            >
            </VBtn
          ></VCardTitle>
          <VDivider class="py-2" />
          <VCardText class="px-5 pt-0">
            <VSelect
              v-if="freeStudents.length > 0"
              class="mb-5"
              :items="freeStudents"
              item-value="id"
              item-title="name"
              return-object
              @update:modelValue="addStudent($event, card)"
            />
            <VRow v-for="(student, index) in card.participants">
              <VCol cols="9" class="py-2 d-flex align-center">
                {{ `${index + 1}. ${student.name}` }}
              </VCol>
              <VCol cols="3" class="d-flex justify-end py-2">
                <VBtn
                  color="error"
                  icon="mdi-trash-can-outline"
                  variant="tonal"
                  size="40px"
                  @click="deleteStudent(student, card.participants)"
                >
                </VBtn>
              </VCol>
            </VRow>
            <p class="text-center" v-if="card.participants.length === 0">
              Sin estudiantes
            </p>
          </VCardText>
        </VCard>
      </VCol>
    </VRow>
    <VRow v-else>
      <VCol
        cols="12"
        class="d-flex flex-column justify-center align-center py-10"
      >
        <VIcon size="100">mdi-account-group-outline</VIcon>
        <span class="text-center"
          >Elija el numero de estudiantes por grupo<br />y seleccione
          agrupar</span
        >
      </VCol>
    </VRow>
  </VCardText>
  <VCardActions v-if="!loading">
    <VRow>
      <VCol class="d-flex justify-end">
        <VBtn
          variant="flat"
          color="secondary"
          class="px-4"
          @click="backToForm"
          :disabled="softLoading"
          >Volver atras</VBtn
        >
        <VBtn
          variant="flat"
          color="primary"
          class="px-4"
          :disabled="groups.length === 0 || softLoading"
          @click="saveGroups"
          >Guardar</VBtn
        >
      </VCol>
    </VRow>
  </VCardActions>
  <VCardText v-if="loading">
    <div class="d-flex align-center justify-center" style="height: 40vh">
      <VProgressCircular color="primary" size="40" indeterminate />
    </div>
  </VCardText>
</template>
