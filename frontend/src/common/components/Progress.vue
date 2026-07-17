<template>
    <v-container :style="{'height':height}">
        <v-row
            align-content="center"
            class="fill-height"
            justify="center"
        >
            <v-col
                class="text-subtitle-1 text-center"
                cols="12"
            >
               <div v-html="title"></div>
            </v-col>
            <v-col cols="6">
                <v-progress-linear
                :color="color"
                height="6"
                indeterminate
                rounded
                ></v-progress-linear>
            </v-col>
        </v-row>
    </v-container>
 </template>
 <script lang="ts" setup>

    withDefaults(defineProps<{
        title : string,
        height?:string,
        loading?:boolean
        color?: string
    }>(), {
        title: 'Espere un momento ...',
        height: "400px",
        loading: false,
        color:"deep-purple-darken-4"
    })

</script>
 

