<script setup lang="ts">
import { ref } from 'vue'

const emit = defineEmits<{
  (e: 'create', title: string): void
}>()

const title = ref('')
const loading = ref(false)

const handleSubmit = async () => {
  if (!title.value.trim()) return
  
  loading.value = true
  try {
    emit('create', title.value)
    title.value = ''
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <form @submit.prevent="handleSubmit" class="create-form">
    <input 
      v-model="title"
      type="text" 
      placeholder="What needs to be done?"
      class="todo-input"
      :disabled="loading"
    />
    <button type="submit" :disabled="loading || !title.trim()" class="add-btn">
      {{ loading ? 'Adding...' : 'Add Task' }}
    </button>
  </form>
</template>

<style scoped>
.create-form {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
}

.todo-input {
  flex: 1;
  padding: 0.75rem 1rem;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.2s;
}

.todo-input:focus {
  outline: none;
  border-color: #42b883;
  box-shadow: 0 0 0 3px rgba(66, 184, 131, 0.1);
}

.add-btn {
  padding: 0 1.5rem;
  background-color: #42b883;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.add-btn:hover:not(:disabled) {
  background-color: #3aa876;
  transform: translateY(-1px);
}

.add-btn:disabled {
  background-color: #9ca3af;
  cursor: not-allowed;
}

@media (max-width: 640px) {
  .create-form {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .add-btn {
    padding: 0.75rem;
  }
}
</style>
