<script lang="ts" setup>
import { ref } from 'vue';
const timer = ref<NodeJS.Timeout>()

const props = withDefaults(defineProps<{
    value?:string|null,
    label:string,
    loading:boolean
}>(), {
    input: null,
    label: "Buscar",
    loading: false
})

const search = ref<string|null>(props.value || null)

const handleInput = async () => {
    if (timer.value) {
        clearTimeout(timer.value);
    }
    timer.value = setTimeout(async () => {
        emit('input',search.value)
    }, 500);
}

const emit = defineEmits<{
    (e: 'input', input:string|null): void
}>()

</script>

<template>
    <v-text-field
        :loading="loading"
        :disabled="loading"
        append-inner-icon="mdi-magnify"
        density="compact"
        :label="label"
        variant="outlined"
        hide-details
        single-line
        v-model="search"
        @input="handleInput"
        @click:append-inner="emit('input',search)"
    ></v-text-field>
</template>
<style>

</style>
