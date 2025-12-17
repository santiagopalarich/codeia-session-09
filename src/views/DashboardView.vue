<script setup lang="ts">
import { computed, ref } from 'vue'
import { useAuth } from '../composables/useAuth'
import { useTodos } from '../composables/useTodos'
import { useRouter } from 'vue-router'
import Sidebar from '../components/layout/Sidebar.vue'
import TaskCard from '../components/todos/TaskCard.vue'
import ThemeToggle from '../components/ThemeToggle.vue'
import type { Todo } from '../types'

const { user, signOut } = useAuth()
const router = useRouter()
const { 
  todos, 
  loading, 
  error, 
  createTodo, 
  updateStatus, 
  deleteTodo 
} = useTodos()

const handleLogout = async () => {
  await signOut()
  router.push('/login')
}

const handleCreate = async () => {
  const title = prompt('Enter task title:')
  if (!title) return
  try {
    await createTodo(title)
  } catch (e: any) {
    alert('Error creating todo: ' + e.message)
  }
}

// Kanban Columns
const todoTasks = computed(() => todos.value.filter(t => t.status === 'todo'))
const inProgressTasks = computed(() => todos.value.filter(t => t.status === 'in-progress'))
const doneTasks = computed(() => todos.value.filter(t => t.status === 'done'))

// Drag and Drop Logic
const activeDropZone = ref<string | null>(null)

const onDragStart = (event: DragEvent, task: Todo) => {
  if (event.dataTransfer) {
    event.dataTransfer.dropEffect = 'move'
    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.setData('taskId', task.id)
  }
}

const onDragOver = (event: DragEvent) => {
  if (event.dataTransfer) {
    event.dataTransfer.dropEffect = 'move'
  }
}

const onDragEnter = (zone: string) => {
  activeDropZone.value = zone
}

const onDragLeave = (zone: string) => {
  if (activeDropZone.value === zone) {
    activeDropZone.value = null
  }
}

const onDrop = async (event: DragEvent, targetStatus: Todo['status']) => {
  activeDropZone.value = null
  const taskId = event.dataTransfer?.getData('taskId')
  
  if (!taskId) return

  const task = todos.value.find(t => t.id === taskId)
  if (!task) return

  if (task.status !== targetStatus) {
    await updateStatus(taskId, targetStatus)
  }
}
</script>

<template>
  <div class="app-layout">
    <Sidebar @create="handleCreate" />
    
    <main class="main-content">
      <header class="top-bar">
        <div class="project-info">
          <span class="star-icon">★</span>
          <h1>Statra Insurance</h1>
          <span class="chevron">⌄</span>
        </div>
        
        <div class="top-actions">
           <div class="user-profile">
            <span class="email">{{ user?.email }}</span>
             <button @click="handleLogout" class="logout-btn">Logout</button>
           </div>
           <ThemeToggle />
        </div>
      </header>

      <div class="view-controls">
        <div class="tabs">
          <a href="#" class="tab">Backlog</a>
          <a href="#" class="tab">Priority Chart</a>
          <a href="#" class="tab active">
            <span class="icon">📊</span> Kanban Workflow
          </a>
        </div>
      </div>

      <div class="kanban-board">
        <!-- To Do Column -->
        <div 
          class="kanban-column"
          :class="{ 'drag-active': activeDropZone === 'todo' }"
          @dragover.prevent="onDragOver"
          @dragenter.prevent="onDragEnter('todo')"
          @dragleave.prevent="onDragLeave('todo')"
          @drop="onDrop($event, 'todo')"
        >
          <div class="column-header">
            <h3>To Do</h3>
            <button class="more-options">⋮</button>
          </div>
          <div class="task-list">
             <div v-if="loading" class="loading-state">Loading...</div>
             <div 
               v-for="task in todoTasks" 
               :key="task.id"
               draggable="true"
               class="draggable-item"
               @dragstart="onDragStart($event, task)"
             >
               <TaskCard 
                  :todo="task" 
                  @delete="deleteTodo(task.id)"
               />
             </div>
             <div class="add-new-placeholder" @click="handleCreate">
               + Add new task
             </div>
          </div>
        </div>

        <!-- In Progress Column -->
        <div 
          class="kanban-column"
          :class="{ 'drag-active': activeDropZone === 'in-progress' }"
          @dragover.prevent="onDragOver"
          @dragenter.prevent="onDragEnter('in-progress')"
          @dragleave.prevent="onDragLeave('in-progress')"
          @drop="onDrop($event, 'in-progress')"
        >
           <div class="column-header">
            <h3>In Progress</h3>
            <button class="more-options">⋮</button>
          </div>
          <div class="task-list">
             <div 
               v-for="task in inProgressTasks" 
               :key="task.id"
               draggable="true"
               class="draggable-item"
               @dragstart="onDragStart($event, task)"
             >
                <TaskCard 
                    :todo="task" 
                    @delete="deleteTodo(task.id)"
                />
             </div>
             <div v-if="inProgressTasks.length === 0" class="empty-placeholder">
               No tasks
             </div>
          </div>
        </div>

        <!-- Done Column -->
        <div 
          class="kanban-column"
          :class="{ 'drag-active': activeDropZone === 'done' }"
          @dragover.prevent="onDragOver"
          @dragenter.prevent="onDragEnter('done')"
          @dragleave.prevent="onDragLeave('done')"
          @drop="onDrop($event, 'done')"
        >
           <div class="column-header">
            <h3>Done</h3>
            <button class="more-options">⋮</button>
          </div>
           <div class="task-list">
             <div 
               v-for="task in doneTasks" 
               :key="task.id"
               draggable="true"
               class="draggable-item"
               @dragstart="onDragStart($event, task)"
             >
                <TaskCard 
                    :todo="task" 
                    @delete="deleteTodo(task.id)"
                />
             </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<style scoped>
.app-layout {
  display: flex;
  height: 100vh;
  width: 100vw;
  overflow: hidden;
  background-color: var(--bg-primary);
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  padding: 0;
}

.top-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 2.5rem;
  background-color: var(--bg-primary);
}

.project-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.project-info h1 {
  font-size: 1.5rem;
  margin: 0;
  font-weight: 700;
  color: var(--text-primary);
}

.star-icon {
  color: #f59e0b;
  font-size: 1.25rem;
  background-color: #fef3c7;
  padding: 4px;
  border-radius: 4px;
}

.top-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.user-profile {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.email {
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.logout-btn {
  padding: 0.4rem 0.8rem;
  font-size: 0.8rem;
  border: 1px solid var(--border-color);
  background: transparent;
  border-radius: 4px;
  color: var(--text-secondary);
  cursor: pointer;
}

.view-controls {
  padding: 0 2.5rem;
  margin-bottom: 2rem;
  border-bottom: 1px solid var(--border-color);
}

.tabs {
  display: flex;
  gap: 2rem;
}

.tab {
  padding: 1rem 0;
  text-decoration: none;
  color: var(--text-secondary);
  font-weight: 500;
  border-bottom: 2px solid transparent;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.tab.active {
  color: var(--text-primary);
  border-bottom-color: #d2f476; /* The green accent */
}

.kanban-board {
  display: flex;
  gap: 2rem;
  padding: 0 2.5rem 2rem 2.5rem;
  overflow-x: auto;
  height: 100%;
}

.kanban-column {
  flex: 1;
  min-width: 300px;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  background: transparent;
  border-radius: 8px;
  transition: background-color 0.2s;
  height: 100%;
}

.kanban-column.drag-active {
  background-color: var(--bg-hover);
  box-shadow: inset 0 0 0 2px var(--primary-color);
}

.task-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  overflow-y: auto;
  padding-bottom: 2rem;
  flex: 1; /* Make task list fill remaining space */
  min-height: 200px; /* Ensure drop zone exists */
}

.column-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 0.5rem;
}

.column-header h3 {
  margin: 0;
  font-size: 1rem;
  color: var(--text-secondary);
  font-weight: 500;
}

.more-options {
  background: none;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  font-size: 1.25rem;
}

.task-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  overflow-y: auto;
  padding-bottom: 2rem;
}

.add-new-placeholder {
  color: var(--text-muted);
  padding: 0.5rem;
  cursor: pointer;
  border-radius: 6px;
  transition: background 0.2s;
}

.add-new-placeholder:hover {
  background-color: var(--bg-hover);
  color: var(--text-primary);
}

.empty-placeholder {
  color: var(--text-muted);
  font-style: italic;
  font-size: 0.9rem;
  text-align: center;
  margin-top: 2rem;
}
</style>
