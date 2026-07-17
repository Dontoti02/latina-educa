<template>
    <ModalBasic :visible="show" is-persistent width="1000" is-scrollable>
        <VCard class="form-card">
            <VToolbar class="form-toolbar">
                <VToolbarTitle class="text-center">Editar Fechas del Periodo</VToolbarTitle>
            </VToolbar>
            <VCardText class="form-body">
                <VForm ref="form">
                    <VRow>
                        <VCol cols="12" sm="6">
                            <VTextField
                                label="Fecha Inicial"
                                type="date"
                                v-model="startDate"
                                :rules="[dateRules.startDate]"
                            />
                        </VCol>
                        <VCol cols="12" sm="6">
                            <VTextField
                                label="Fecha Final"
                                type="date"
                                v-model="endDate"
                                :rules="[dateRules.endDate]"
                            />
                        </VCol>
                    </VRow>
                </VForm>
            </VCardText>
            <VCardActions class="form-actions" style="justify-content: end;">
                <div class="action-buttons">
                    <VBtn class="px-4" color="primary" variant="outlined" @click="closeModal">
                        Cancelar
                    </VBtn>
                    <VBtn
                        variant="elevated"
                        class="px-4"
                        color="success"
                        :disabled="!startDate || !endDate || !isValidDates"
                        @click="saveDates"
                    >
                        Guardar
                    </VBtn>
                </div>
            </VCardActions>
        </VCard>
    </ModalBasic>
</template>

<script setup lang="ts">
import { ref, computed, defineProps, defineEmits } from 'vue';
import ModalBasic from "@/common/components/Modal.vue";
import type { AcademicPeriod } from '@/models/academic-periods'
//props
const props = defineProps({
    show: {
        type: Boolean,
        required: true
    },
    period: {
        type: Object as () => AcademicPeriod,
        required: true
    }
});


//emits
const emit = defineEmits(['update:show', 'save','close']);

//data
const formatDate = (date: string) => {
    const d = new Date(date);
    const month = ('0' + (d.getMonth() + 1)).slice(-2);
    const day = ('0' + d.getDate()).slice(-2);
    const year = d.getFullYear();
    return `${year}-${month}-${day}`;
};
import type { VForm } from 'vuetify/components';

const form = ref<VForm | null>(null);
const startDate = ref<string>(props.period ? formatDate(props.period.start_date) : '');
const endDate = ref<string>(props.period ? formatDate(props.period.end_date) : '');

const dateRules = {
    startDate: [
        (v: string) => !!v || 'Seleccione una fecha inicial',
        (v: string) => !endDate.value || new Date(v) <= new Date(endDate.value) || 'La fecha inicial debe ser menor que la fecha final'
    ],
    endDate: [
        (v: string) => !!v || 'Seleccione una fecha final',
        (v: string) => !startDate.value || new Date(v) >= new Date(startDate.value) || 'La fecha final debe ser mayor que la fecha inicial'
    ]
};

const isValidDates = computed(() => {
    return new Date(startDate.value) <= new Date(endDate.value);
});

const closeModal = () => {
    emit('update:show', false);
};

//methods

const saveDates = () => {
    if (form.value && form.value.validate()) {
        emit('save', { period_id: props.period.id, start_date: startDate.value, end_date: endDate.value });
        closeModal();
    }
};

watch(() => props.period, (newValue) => {
    startDate.value = newValue.start_date ? formatDate(newValue.start_date) : '';
    endDate.value = newValue.end_date ? formatDate(newValue.end_date) : '';
});



</script>

<style scoped>
.form-card {
    padding: 20px;
}

.form-body {
    margin-top: 20px;
}
.form-actions {
    margin-top: 20px;
}
</style>