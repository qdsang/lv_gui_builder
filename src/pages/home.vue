<template>
  <div class="home">
    <el-button @click="editorRouter">Editor</el-button>
  </div>
</template>

<script setup lang="ts">
  import { useRouter } from 'vue-router';
  const router = useRouter()
  const editorRouter =()=>{
      router.push('/lv/builder')
  }
  router.push('/lv/builder')
</script>

<style lang="less">
  .home {
    display: flex;
    align-items: center;
    justify-content: center;
    padding-top: 60px;
  }
</style>
