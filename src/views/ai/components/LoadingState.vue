<script setup lang="ts">
  defineProps<{
    message?: string;
  }>();
</script>

<template>
  <div class="flex items-center justify-center py-12">
    <div class="text-center">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
      <p class="text-sm text-gray-600">{{ message || '正在加载数据...' }}</p>
    </div>
  </div>
</template>