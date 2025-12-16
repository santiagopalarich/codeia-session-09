<script setup lang="ts">
import type { Todo } from '@/types'
import { ref } from 'vue'

const props = defineProps<{
  todo: Todo
}>()

const emit = defineEmits<{
  (e: 'toggle-complete', id: string): void
  (e: 'delete', id: string): void
  (e: 'update', id: string, updates: Partial<Todo>): void
}>()

const isEditing = ref(false)
const editTitle = ref(props.todo.title)

const startEdit = () => {
  editTitle.value = props.todo.title
  isEditing.value = true
}

const cancelEdit = () => {
  isEditing.value = false
  editTitle.value = props.todo.title
}

const saveEdit = () => {
  if (editTitle.value.trim()) {
    emit('update', props.todo.id, { title: editTitle.value })
    isEditing.value = false
  }
}
</script>

<template>
  <div class="todo-item" :class="{ completed: todo.is_completed }">
    <div class="todo-content">
      <input 
        type="checkbox" 
        :checked="todo.is_completed"
        @change="emit('toggle-complete', todo.id)"
        class="checkbox"
      />
      
      <div v-if="!isEditing" class="text-content">
        <h3 :class="{ 'text-through': todo.is_completed }">{{ todo.title }}</h3>
        <p v-if="todo.description" class="description">{{ todo.description }}</p>
      </div>
      
      <div v-else class="edit-mode">
        <input 
          v-model="editTitle" 
          @keyup.enter="saveEdit"
          @keyup.esc="cancelEdit"
          type="text" 
          class="edit-input"
        />
        <div class="edit-actions">
          <button @click="saveEdit" class="save-btn">Save</button>
          <button @click="cancelEdit" class="cancel-btn">Cancel</button>
        </div>
      </div>
    </div>

    <div class="actions" v-if="!isEditing">
      <button @click="startEdit" class="icon-btn edit-btn" aria-label="Edit">
        ✏️
      </button>
      <button @click="emit('delete', todo.id)" class="icon-btn delete-btn" aria-label="Delete">
        🗑️
      </button>
    </div>
  </div>
</template>

<style scoped>
.todo-item {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 1rem;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  margin-bottom: 0.75rem;
  transition: all 0.2s;
}

.todo-item:hover {
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

.todo-item.completed {
  background-color: #f9fafb;
}

.todo-content {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  flex: 1;
}

.checkbox {
  margin-top: 0.3rem;
  cursor: pointer;
  width: 1.2rem;
  height: 1.2rem;
}

.text-content h3 {
  margin: 0;
  font-size: 1rem;
  font-weight: 500;
  color: #1f2937;
}

.text-through {
  text-decoration: line-through;
  color: #9ca3af;
}

.description {
  margin: 0.25rem 0 0 0;
  font-size: 0.875rem;
  color: #6b7280;
}

.actions {
  display: flex;
  gap: 0.5rem;
  margin-left: 1rem;
}

.icon-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.icon-btn:hover {
  background-color: #f3f4f6;
}

.edit-mode {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.edit-input {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 4px;
}

.edit-actions {
  display: flex;
  gap: 0.5rem;
}

.save-btn, .cancel-btn {
  padding: 0.25rem 0.75rem;
  border-radius: 4px;
  border: none;
  cursor: pointer;
  font-size: 0.875rem;
}

.save-btn {
  background-color: #42b883;
  color: white;
}

.cancel-btn {
  background-color: #e5e7eb;
  color: #374151;
}
</style>
