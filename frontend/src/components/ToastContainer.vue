<template>
  <div class="toast-container">
    <TransitionGroup name="slide">
      <div
        v-for="toast in toasts"
        :key="toast.id"
        :class="['toast', `toast-${toast.type}`]"
      >
        {{ toast.message }}
      </div>
    </TransitionGroup>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useToastStore } from '@/stores/toast';

const store = useToastStore();
const toasts = computed(() => store.toasts);
</script>

<style scoped>
.toast-container {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 10000;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
</style>
