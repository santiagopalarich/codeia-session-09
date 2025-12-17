<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useTeams } from '../composables/useTeams'
import Sidebar from '../components/layout/Sidebar.vue'

const { teams, loading, createTeam, fetchTeams } = useTeams()
const showCreateModal = ref(false)
const newTeamName = ref('')
const newTeamDesc = ref('')

onMounted(() => {
  fetchTeams()
})

const handleCreateTeam = async () => {
  if (!newTeamName.value) return
  try {
    await createTeam(newTeamName.value, newTeamDesc.value)
    showCreateModal.value = false
    newTeamName.value = ''
    newTeamDesc.value = ''
  } catch (e: any) {
    alert('Error creating team: ' + e.message)
  }
}
</script>

<template>
  <div class="app-layout">
    <Sidebar />
    
    <main class="main-content">
      <header class="top-bar">
        <h1>Team Management</h1>
        <button @click="showCreateModal = true" class="create-btn">
          + New Team
        </button>
      </header>

      <div class="content">
        <div v-if="loading" class="loading">Loading teams...</div>
        
        <div class="teams-grid">
          <div v-for="team in teams" :key="team.id" class="team-card">
            <div class="team-header">
              <h3>{{ team.name }}</h3>
              <span class="member-count">Members: 0</span> <!-- Placeholder for now -->
            </div>
            <p class="description">{{ team.description || 'No description' }}</p>
            <div class="actions">
              <button class="manage-btn">Manage Members</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Simple Modal -->
      <div v-if="showCreateModal" class="modal-overlay">
        <div class="modal">
          <h2>Create New Team</h2>
          <input v-model="newTeamName" placeholder="Team Name" class="input" />
          <textarea v-model="newTeamDesc" placeholder="Description" class="input"></textarea>
          <div class="modal-actions">
            <button @click="handleCreateTeam" class="confirm-btn">Create</button>
            <button @click="showCreateModal = false" class="cancel-btn">Cancel</button>
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
  background-color: var(--bg-primary);
}

.main-content {
  flex: 1;
  padding: 2rem;
  overflow-y: auto;
}

.top-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.create-btn {
  background-color: var(--primary-color);
  color: #fff;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
}

.teams-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

.team-card {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 1.5rem;
  transition: transform 0.2s;
}

.team-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
}

.team-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.team-header h3 {
  margin: 0;
  color: var(--text-primary);
}

.member-count {
  font-size: 0.8rem;
  background: var(--bg-secondary);
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
}

.description {
  color: var(--text-secondary);
  margin-bottom: 1.5rem;
  font-size: 0.9rem;
}

.actions {
  display: flex;
  justify-content: flex-end;
}

.manage-btn {
  background: transparent;
  border: 1px solid var(--border-color);
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  color: var(--text-primary);
}

.manage-btn:hover {
  background: var(--bg-hover);
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal {
  background: var(--bg-card);
  padding: 2rem;
  border-radius: 8px;
  width: 400px;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.input {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  background: var(--bg-primary);
  color: var(--text-primary);
}

.modal-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
}

.confirm-btn {
  background: var(--primary-color);
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
}

.cancel-btn {
  background: transparent;
  border: 1px solid var(--border-color);
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
}
</style>
