<script setup lang="ts">
import { computed, useSlots, ref, onMounted, watch } from 'vue';
import IrePagination from '@/common/components/pagination/Index.vue'
import {Pagination} from '@/modules/app/domain/pagination'
import Sort from './Sort.vue'
import { DirectionSortType } from './Sort.vue';
import { Sort as SortType } from '../../modules/app/domain/pagination';
import { camelCaseToSnakeCase } from '../util/snakeCase';


interface TaBleProps{
    table: {
        config?: {
            height?:number,
            fixed?:boolean,
            sort?:boolean
        },
        header:Array<{
            key:string
            value:string
        }>,
        body : Array<{
            [key:string] : unknown
        }>
        actions?: Array<{
            callback : (item:any) => void | Promise<void>,
            icon:string
            title:string
        }>
    }
    overlay?:boolean,
    pagination?: Pagination
}

const slots = useSlots()

const props = defineProps<TaBleProps>();

const hasHeadSlot = computed(() =>   slots.head)

const hasBodySlot = computed(() =>   slots.body)

const sort = ref<SortType[]>([])
const emit = defineEmits<{
    (e: 'fetch', params: { page: number }): void,
    (e: 'sort', sort?:SortType[]): void
}>()


const fetch  = async ({page}:{page:number}) => {
    emit('fetch', { page })
}

const getHeightInPixels = () => {
  const pixelHeader = 80;
  const heightTable =  (window.innerHeight - pixelHeader)
  return heightTable;
}

const configTable = ref<{
    height?:number,
    fixed?:boolean,
    sort?:boolean
}>({
    height : getHeightInPixels(),
    fixed : true,
    sort: false
})



const applySort = (direction:DirectionSortType,column:string)  => {

    if (direction === undefined) {
        sort.value = sort.value.filter( item => item.column === column)
        emit('sort', sort.value)
        return
    }

    const find = sort.value.find(item => item.column === column)

    if (!find) {
        sort.value = sort.value.map((item,index) => ({
            ...item,
            priority:item.priority = 2 + index
        }))
        sort.value.unshift({
            column,
            direction,
            priority:1
        })
    } else {
        sort.value.forEach((item) => {
            if (item.column === column) {
                item.priority = 1
                item.direction = direction
            } else {
                item.priority = item.priority + 1
            }
        })
    }

    emit('sort', sort.value)
}

onMounted(()=> {
    if (props.table.config) {

        if (props.table.config.height)
            configTable.value.height = props.table.config.height

        if (props.table.config.fixed)
            configTable.value.fixed = props.table.config.fixed

        if (props.table.config.sort)
            configTable.value.sort = props.table.config.sort
    }
    getHeightInPixels()
})

watch(() => props.table.config?.height, (newVal: number | undefined) => {
  configTable.value.height = newVal;
});

</script>
<template>
  <div style="position:relative">
    <v-table
        :height="configTable.height"
        :fixed-header="configTable.fixed"
    >
        <thead>
            <slot v-if="hasHeadSlot" name="head" />
            <tr v-else>
                <template 
                    v-if="configTable.sort"
                >
                    <Sort
                        v-for="{key,value} in props.table.header"
                        v-bind:key="'head_' + key"
                        @direction="applySort($event,camelCaseToSnakeCase(key))"
                    >
                        {{ value }}
                    </Sort>
                </template>
                <template v-else>
                    <th 
                        class="text-left"
                        v-for="{key,value} in props.table.header"
                        v-bind:key="'head_' + key"
                    >
                        {{ value }}
                    </th>
                </template>

                <th class="text-right" v-if="props.table.actions">
                    ACCIONES
                </th>
            </tr>
        </thead>
        <tbody>
            <slot v-if="hasBodySlot" name="body"></slot>
            <template v-else>
                <tr
                    v-for="(item,key) in props.table.body"
                    v-bind:key="'body_' + key"
                >
                    <td 
                        v-for="{key} in props.table.header"
                        v-bind:key="'td_' + key"
                    >
                        <slot
                            v-if="slots[key]"
                            :name="key" 
                            :item="item" 
                        />

                        <template v-else>
                            {{ item[key] ?? '---'}}
                        </template>
                    </td>
                    <td class="text-right" v-if="props.table.actions">
                        <slot 
                            v-if="slots.actions"
                            name="actions" 
                            :item="item"  
                        />
                        <template v-else>
                            <v-menu
                                transition="slide-y-transition"
                            >
                                <template v-slot:activator="{ props }">
                                    <v-btn
                                        icon
                                        variant="text"
                                        v-bind="props"
                                    >
                                        <v-icon> mdi-dots-vertical</v-icon>
                                    </v-btn>
                                </template>
                                <v-list>
                                    <v-list-item
                                        v-for="(action,key) in props.table.actions"
                                        @click="action.callback(item)"
                                        v-bind:key="'actions_' + key"
                                    >
                                        <template v-slot:prepend>
                                            <v-icon :icon="action.icon"></v-icon>
                                        </template>
                                        <v-list-item-title>{{ action.title }}</v-list-item-title>
                                    </v-list-item>
                                </v-list>
                            </v-menu>
                        </template>
                    </td>
                </tr>
            </template>
        </tbody>
    </v-table>
    <IrePagination
        v-if="props.pagination"
        :pagination="props.pagination"
        @update="fetch($event)"
    />
    <v-overlay
        v-model="props.overlay!"
        class="align-center justify-center"
        contained
    >
        <v-progress-circular
            color="primary"
            size="64"
            indeterminate
        ></v-progress-circular>
    </v-overlay>
  </div>
</template>
