<script setup lang="ts">
import { OptionDTO } from '../../auth/dto';
import { useRoute } from 'vue-router'
import { onMounted } from 'vue';

defineProps<{
    options?:OptionDTO[]
}>()

const route = useRoute()

const setActiveClass = (url:string|null) => {
    if(!url) return false;
    const currentUrl = route.name as string
    return (!!url && currentUrl.includes(url))
}

onMounted(() => {

})

</script>

<template>
    <v-list-group 
        :value="item.id"
        v-for="item in options"
        v-bind:key="item.id"
        :subgroup="item.options === undefined || item.options.length === 0"
    >
        <template v-slot:activator="{ props }">
            <v-list-item
                v-show="item.is_visible"
                v-bind="props"
                :prepend-icon="'mdi ' + item.icon"
                :title="item.name"
                :to="item.name_url !== null ? {name:item.name_url} : undefined"
                :active="setActiveClass(item.name_url)"
            ></v-list-item>
        </template>

        <RecursiveOption
            :options="item.options"
            v-if="item.options"
        />
    </v-list-group>
</template>

<style scoped lang="scss">

    .v-list-group__items .v-list-item {
        padding-inline-start: 2rem !important;
    }

    .v-list-group__items .v-list-item--active{
        background-color: #E0E0E0;
        color: #6200EA;
        border-radius: 10px;
        margin: 0px 5px;
    }
</style>