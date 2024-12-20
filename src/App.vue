<template>
  <router-view />
</template>

<script setup lang="ts">

import 'element-plus/theme-chalk/dark/css-vars.css'
import {useDark, useToggle} from '@vueuse/core'

const isDark = useDark()
isDark.value = true;

</script>

<style>
  #app {
    font-family: Inter, Avenir, Helvetica, Arial, sans-serif;
    font-synthesis: none;
    text-rendering: optimizeLegibility;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    -webkit-text-size-adjust: 100%;
  }
</style>
