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
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  margin-bottom: 0.75rem;
  transition: all 0.2s;
}

.todo-item:hover {
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  border-color: var(--border-hover);
}

.todo-item.completed {
  background-color: var(--bg-secondary);
  opacity: 0.8;
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
  accent-color: var(--primary-color);
}

.text-content h3 {
  margin: 0;
  font-size: 1rem;
  font-weight: 500;
  color: var(--text-primary);
}

.text-through {
  text-decoration: line-through;
  color: var(--text-muted);
}

.description {
  margin: 0.25rem 0 0 0;
  font-size: 0.875rem;
  color: var(--text-secondary);
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
  font-size: 1.2rem;
}

.icon-btn:hover {
  background-color: var(--bg-hover);
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
  border: 1px solid var(--border-color);
  background: var(--bg-card);
  color: var(--text-primary);
  border-radius: 4px;
}

.edit-input:focus {
  outline: none;
  border-color: var(--primary-color);
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
  background-color: var(--primary-color);
  color: var(--primary-text);
}

.save-btn:hover {
  background-color: var(--primary-hover);
}

.cancel-btn {
  background-color: var(--bg-hover);
  color: var(--text-primary);
}

.cancel-btn:hover {
  background-color: var(--border-color);
}
</style>
