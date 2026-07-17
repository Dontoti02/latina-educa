<script setup lang="ts">
    import { ref } from 'vue';
    import { toastError, toastSuccess } from '@/common/util/toast.service';

    const props = defineProps<{
        value:string
    }>()

    const loading = ref(false)

    const copyFlag = ref(false) 

    const copyClipboard = async (value:string) => {
        if (!props.value) return
        try {
            copyFlag.value = true
            await navigator.clipboard.writeText(value)
        } catch (error) {
            toastError("Error al copiar")
        } finally {
            toastSuccess('Copiado al portapapeles.')
            setTimeout(() => {
                copyFlag.value = false
            }, 5000);
        }
    }

</script>

<template>

    <v-btn 
        :color="copyFlag ? 'success' : 'indigo'"
        @click="copyClipboard(value)"
        :loading="loading"
        variant="text"
    >
        <v-icon>
            {{ copyFlag ? 'mdi-clipboard-check-multiple-outline' : 'mdi-clipboard-multiple-outline' }}
        </v-icon>
    </v-btn>
</template>