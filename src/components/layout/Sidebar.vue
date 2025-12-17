<script setup lang="ts">
import { ref } from 'vue'

const projects = ref([
  { id: 1, name: 'Meridian', color: '#ff7ca3' },
  { id: 2, name: 'Risen', color: '#4f46e5' },
  { id: 3, name: 'Skillex', color: '#84cc16' },
  { id: 4, name: 'Statra Insurance', color: '#f59e0b' },
])

const activeItem = ref('Task List')

defineEmits(['create'])
</script>

<template>
  <aside class="sidebar">
    <div class="sidebar-header">
      <div class="logo">
        <span class="logo-icon">✤</span>
        <span class="logo-text">Flows list</span>
      </div>
    </div>

    <div class="create-task-btn-container">
      <button class="create-btn" @click="$emit('create')">
        <span class="plus">+</span> Add new task
      </button>
    </div>

    <nav class="sidebar-nav">
      <div class="nav-section">
        <a href="#" class="nav-item" :class="{ active: activeItem === 'Plan' }" @click.prevent="activeItem = 'Plan'">
          <span class="icon">📅</span> Plan
        </a>
        <a href="#" class="nav-item" :class="{ active: activeItem === 'Task List' }" @click.prevent="activeItem = 'Task List'">
          <span class="icon">💼</span> Task List
        </a>
      </div>

      <div class="nav-section">
        <div class="section-title">
          <span class="icon">📁</span> Projects
          <span class="chevron">⌄</span>
        </div>
        <div class="project-list">
          <a v-for="project in projects" :key="project.id" href="#" class="nav-item project-item">
            <span class="dot" :style="{ backgroundColor: project.color }"></span>
            {{ project.name }}
          </a>
          <a href="#" class="nav-item add-new">
            <span class="plus-small">+</span> Add New
          </a>
        </div>
      </div>

      <div class="nav-section">
        <div class="section-title">
          <span class="icon">🏷️</span> Tags
        </div>
      </div>
    </nav>
    
    <div class="sidebar-footer">
       <a href="#" class="nav-item">
          <span class="icon">🔌</span> Free Plan
        </a>
    </div>
  </aside>
</template>

<style scoped>
.sidebar {
  width: 260px;
  background-color: var(--bg-card);
  border-right: 1px solid var(--border-color);
  height: 100vh;
  display: flex;
  flex-direction: column;
  padding: 1.5rem;
  flex-shrink: 0;
}

.sidebar-header {
  margin-bottom: 2rem;
}

.logo {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 700;
  font-size: 1.1rem;
  color: var(--text-primary);
}

.logo-icon {
  font-size: 1.5rem;
}

.create-task-btn-container {
  margin-bottom: 2rem;
}

.create-btn {
  width: 100%;
  background-color: #d2f476; /* Lime/Green from reference */
  color: #1a1a1a;
  border: none;
  padding: 0.75rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: opacity 0.2s;
}

.create-btn:hover {
  opacity: 0.9;
}

.sidebar-nav {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  flex: 1;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.6rem 0.5rem;
  color: var(--text-secondary);
  text-decoration: none;
  border-radius: 6px;
  transition: all 0.2s;
  font-weight: 500;
}

.nav-item:hover, .nav-item.active {
  color: var(--text-primary);
  background-color: var(--bg-hover);
}

.section-title {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem;
  color: var(--text-primary);
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.project-item {
  font-size: 0.95rem;
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.add-new {
  color: var(--text-muted);
  font-size: 0.9rem;
}

.plus-small {
  font-weight: bold;
}

.sidebar-footer {
    border-top: 1px solid var(--border-color);
    padding-top: 1rem;
}
</style>
