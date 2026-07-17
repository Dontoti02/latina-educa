<script setup lang="ts">
import { ref } from 'vue';
export type  DirectionSortType = 'ASC' | 'DESC' | undefined

const mode = ref<{
    index : number,
    icon : string|null,
    direction :DirectionSortType
}[]>([
    {
        index : 0,
        icon : null,
        direction:undefined
    },
    {
        index : 1,
        icon : 'mdi-arrow-down',
        direction: 'ASC'
    }, 
    {
        index : 2,
        icon : 'mdi-arrow-up',
        direction: 'DESC'
    }
])

const item = ref<{
    index : number,
    icon : string|null,
    direction :DirectionSortType
}> ({
    index : 0,
    icon: null,
    direction:undefined
})

const emit = defineEmits<{
    (e: 'direction', direction: DirectionSortType ): void
}>()

const change = (index:number) => {

    const newIndex = index + 1

    let find = mode.value[newIndex]
  
    if (newIndex === 3) {
        find = mode.value[0]
    }

    item.value = find

    emit('direction',find.direction)
}

</script>

<template>
    <th class="text-left pa-0">
        <v-btn
            @click="change(item.index)"
            variant="text"
        >
            <slot />
            <template v-if="item">
                <v-icon v-if="item.icon">{{ item.icon }}</v-icon>
            </template>
        </v-btn>
    </th>
</template>