<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'
import { useProjects } from '@/composables/useProjects'

const { projects, loading: loadingProjects, fetchProjects, createProject } = useProjects()

const isProjectsOpen = ref(true)
const isAddingProject = ref(false)
const newProjectName = ref('')
const projectInput = ref<HTMLInputElement | null>(null)

onMounted(() => {
  fetchProjects()
})

const startAddProject = async () => {
    isAddingProject.value = true
    await nextTick()
    projectInput.value?.focus()
}

const handleCreateProject = async () => {
    if (!newProjectName.value.trim()) {
        isAddingProject.value = false
        return
    }
    
    // Assign a random color
    const colors = ['#ff7ca3', '#4f46e5', '#84cc16', '#f59e0b', '#06b6d4', '#8b5cf6']
    const randomColor = colors[Math.floor(Math.random() * colors.length)]
    
    try {
        await createProject(newProjectName.value, randomColor)
        newProjectName.value = ''
        isAddingProject.value = false
    } catch (e) {
        console.error(e)
        alert('Failed to create project')
    }
}

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
        <router-link to="/dashboard" class="nav-item" active-class="active">
          <span class="icon">💼</span> Task List
        </router-link>
        <router-link to="/teams" class="nav-item" active-class="active">
          <span class="icon">👥</span> Teams
        </router-link>
      </div>

      <div class="nav-section">
        <div class="section-title clickable" @click="isProjectsOpen = !isProjectsOpen">
          <div class="title-content">
             <span class="icon">📁</span> Projects
          </div>
          <span class="chevron" :class="{ rotated: isProjectsOpen }">⌄</span>
        </div>
        
        <div class="project-list" v-show="isProjectsOpen">
          <div v-if="loadingProjects" class="loading-state">Loading...</div>
          
          <a v-for="project in projects" :key="project.id" href="#" class="nav-item project-item">
            <span class="dot" :style="{ backgroundColor: project.color }"></span>
            {{ project.name }}
          </a>

          <!-- Add New Interaction -->
          <div v-if="isAddingProject" class="add-project-input">
             <input 
                v-model="newProjectName" 
                @keyup.enter="handleCreateProject" 
                @keyup.esc="isAddingProject = false"
                ref="projectInput"
                placeholder="Project Name..." 
                class="mini-input"
             />
          </div>
          <a v-else href="#" class="nav-item add-new" @click.prevent="startAddProject">
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

.clickable {
  cursor: pointer;
}

.clickable:hover {
  background-color: var(--bg-hover);
  border-radius: 6px;
}

.title-content {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.chevron {
  transition: transform 0.2s;
}

.chevron.rotated {
  transform: rotate(180deg);
}

.mini-input {
  width: 100%;
  padding: 0.25rem 0.5rem;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  background: var(--bg-primary);
  color: var(--text-primary);
  font-size: 0.9rem;
}

.add-project-input {
    padding: 0.25rem 0.5rem;
}
</style>
