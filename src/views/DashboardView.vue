<script setup lang="ts">
import { useAuth } from '../composables/useAuth'
import { useTodos } from '../composables/useTodos'
import { useRouter } from 'vue-router'
import TodoItem from '../components/todos/TodoItem.vue'
import CreateTodoForm from '../components/todos/CreateTodoForm.vue'
import type { Todo } from '../types'

const { user, signOut } = useAuth()
const router = useRouter()
const { 
  todos, 
  loading, 
  error, 
  createTodo, 
  updateTodo, 
  deleteTodo, 
  toggleComplete 
} = useTodos()

const handleLogout = async () => {
  await signOut()
  router.push('/login')
}

const handleCreate = async (title: string) => {
  try {
    await createTodo(title)
  } catch (e: any) {
    alert('Error creating todo: ' + e.message)
  }
}

const handleUpdate = async (id: string, updates: Partial<Todo>) => {
  try {
    await updateTodo(id, updates)
  } catch (e: any) {
    alert('Error updating todo: ' + e.message)
  }
}

const handleDelete = async (id: string) => {
  if (!confirm('Are you sure you want to delete this task?')) return
  try {
    await deleteTodo(id)
  } catch (e: any) {
    alert('Error deleting todo: ' + e.message)
  }
}

const handleToggle = async (id: string) => {
  try {
    await toggleComplete(id)
  } catch (e: any) {
    alert('Error updating todo: ' + e.message)
  }
}
</script>

<template>
  <div class="dashboard">
    <header class="header">
      <div class="user-info">
        <h1>My Tasks</h1>
        <span class="email">{{ user?.email }}</span>
      </div>
      <button @click="handleLogout" class="logout-btn">Logout</button>
    </header>
    
    <main>
      <CreateTodoForm @create="handleCreate" />

      <div v-if="loading && todos.length === 0" class="loading-state">
        Loading tasks...
      </div>

      <div v-else-if="error" class="error-state">
        {{ error }}
      </div>

      <div v-else-if="todos.length === 0" class="empty-state">
        <div class="empty-icon">📝</div>
        <h3>No tasks yet</h3>
        <p>Add your first task above to get started!</p>
      </div>

      <div v-else class="todo-list">
        <TodoItem 
          v-for="todo in todos" 
          :key="todo.id" 
          :todo="todo"
          @update="handleUpdate"
          @delete="handleDelete"
          @toggle-complete="handleToggle"
        />
      </div>
    </main>
  </div>
</template>

<style scoped>
.dashboard {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 3rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--border-color);
}

.user-info h1 {
  margin: 0;
  font-size: 1.5rem;
  color: var(--text-primary);
}

.email {
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.logout-btn {
  padding: 0.5rem 1rem;
  background-color: var(--bg-card);
  border: 1px solid var(--border-color);
  color: var(--text-primary);
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.logout-btn:hover {
  background-color: var(--danger-color);
  border-color: var(--danger-color);
  color: white;
}

.loading-state, .error-state {
  text-align: center;
  padding: 3rem;
  color: var(--text-secondary);
}

.error-state {
  color: var(--danger-color);
}

.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  background: var(--bg-secondary);
  border-radius: 12px;
  border: 2px dashed var(--border-color);
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.empty-state h3 {
  margin: 0 0 0.5rem 0;
  color: var(--text-primary);
}

.empty-state p {
  margin: 0;
  color: var(--text-secondary);
}

.todo-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
</style>
