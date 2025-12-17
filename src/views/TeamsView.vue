<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useTeams } from '../composables/useTeams'
import { useProfiles } from '../composables/useProfiles'
import Sidebar from '../components/layout/Sidebar.vue'
import type { Team } from '@/types'

const { 
  teams, 
  loading, 
  createTeam, 
  fetchTeams, 
  fetchTeamMembers, 
  addMember, 
  currentTeamMembers 
} = useTeams()

const { profiles, fetchProfiles } = useProfiles()

const showCreateModal = ref(false)
const showMembersModal = ref(false)
const selectedTeam = ref<Team | null>(null)
const newTeamName = ref('')
const newTeamDesc = ref('')
const selectedMemberId = ref<string | null>(null)

onMounted(() => {
  fetchTeams()
  fetchProfiles()
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

const openMembersModal = async (team: Team) => {
  selectedTeam.value = team
  selectedMemberId.value = null
  showMembersModal.value = true
  await fetchTeamMembers(team.id)
}

const handleAddMember = async () => {
  if (!selectedTeam.value || !selectedMemberId.value) return
  try {
    await addMember(selectedTeam.value.id, selectedMemberId.value)
    await fetchTeamMembers(selectedTeam.value.id)
    selectedMemberId.value = null
  } catch (e: any) {
    alert('Error adding member: ' + e.message)
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
              <button @click="openMembersModal(team)" class="manage-btn">Manage Members</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Create Team Modal -->
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

       <!-- Members Modal -->
      <div v-if="showMembersModal" class="modal-overlay">
        <div class="modal wide">
          <div class="modal-header">
             <h2>Members of {{ selectedTeam?.name }}</h2>
             <button @click="showMembersModal = false" class="close-btn">×</button>
          </div>
          
          <div class="add-member-section">
             <select v-model="selectedMemberId" class="input">
                <option :value="null">Select user to add...</option>
                <option v-for="profile in profiles" :key="profile.id" :value="profile.id">
                   {{ profile.full_name || profile.email }}
                </option>
             </select>
             <button @click="handleAddMember" class="confirm-btn small">Add</button>
          </div>
          
          <ul class="members-list">
             <li v-for="member in currentTeamMembers" :key="member.user_id" class="member-item">
                <span class="avatar-small">{{ member.profile?.full_name?.[0] || '?' }}</span>
                <span class="member-name">{{ member.profile?.full_name || 'Unknown' }}</span>
                <span class="member-role">{{ member.role }}</span>
             </li>
              <li v-if="currentTeamMembers.length === 0" class="empty-list">No members yet.</li>
          </ul>
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

.modal.wide {
  width: 500px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: var(--text-secondary);
}

.add-member-section {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid var(--border-color);
}

.members-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  max-height: 300px;
  overflow-y: auto;
}

.member-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem;
  background: var(--bg-primary);
  border-radius: 6px;
}

.avatar-small {
  width: 24px;
  height: 24px;
  background: #eee;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: bold;
}

.member-name {
  flex: 1;
  font-size: 0.9rem;
}

.member-role {
  font-size: 0.8rem;
  color: var(--text-secondary);
  background: var(--bg-secondary);
  padding: 0.1rem 0.4rem;
  border-radius: 4px;
}

.empty-list {
    color: var(--text-secondary);
    font-style: italic;
    text-align: center;
}

.confirm-btn.small {
    padding: 0.5rem 0.75rem;
}
</style>
