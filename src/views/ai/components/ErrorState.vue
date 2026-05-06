<script setup lang="ts">
  defineProps<{
    error: string;
  }>();

  const emit = defineEmits<{
    retry: [];
  }>();
</script>

<template>
  <div class="flex items-center justify-center py-12">
    <div class="text-center">
      <p class="text-sm text-red-600 mb-4">{{ error }}</p>
      <button @click="emit('retry')" class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"> 重试 </button>
    </div>
  </div>
</template>