<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import type { Todo, Team, Profile } from '@/types'
import { useTeams } from '@/composables/useTeams'
import { useProfiles } from '@/composables/useProfiles'

const props = defineProps<{
    isOpen: boolean
    task?: Todo | null // If provided, we are editing
}>()

const emit = defineEmits(['close', 'save'])

const { teams, fetchTeams } = useTeams()
const { profiles, fetchProfiles } = useProfiles()

onMounted(() => {
    fetchTeams()
    fetchProfiles()
})

const form = ref<Partial<Todo>>({
    title: '',
    description: '',
    status: 'todo',
    team_id: null,
    assignee_id: null,
    responsible_id: null,
    deadline: null
})

// Initialize form when opening
const initForm = () => {
    if (props.task) {
        form.value = { ...props.task }
        // Fix dates for input type="datetime-local" if needed, simplified for now
    } else {
        form.value = {
            title: '',
            description: '',
            status: 'todo',
            team_id: null,
            assignee_id: null,
            responsible_id: null,
            deadline: null
        }
    }
}

// Watch for open change to init form? 
// Better: parent handles key or v-if, or we watch props.isOpen
import { watch } from 'vue'
watch(() => props.isOpen, (newVal) => {
    if (newVal) initForm()
})

const save = () => {
    emit('save', form.value)
}
</script>

<template>
  <div v-if="isOpen" class="modal-overlay">
    <div class="modal">
      <div class="modal-header">
        <h2>{{ task ? 'Edit Task' : 'New Task' }}</h2>
        <button @click="$emit('close')" class="close-btn">×</button>
      </div>
      
      <div class="modal-body">
        <div class="form-group">
            <label>Title</label>
            <input v-model="form.title" class="input" placeholder="What needs to be done?" />
        </div>

        <div class="form-group">
            <label>Description</label>
            <textarea v-model="form.description" class="input" rows="3"></textarea>
        </div>

        <div class="form-row">
            <div class="form-group half">
                <label>Status</label>
                <select v-model="form.status" class="input">
                    <option value="todo">To Do</option>
                    <option value="in-progress">In Progress</option>
                    <option value="done">Done</option>
                </select>
            </div>
             <div class="form-group half">
                <label>Deadline</label>
                <input type="datetime-local" v-model="form.deadline" class="input" />
            </div>
        </div>

        <div class="form-group">
            <label>Team</label>
            <select v-model="form.team_id" class="input">
                <option :value="null">No Team</option>
                <option v-for="team in teams" :key="team.id" :value="team.id">
                    {{ team.name }}
                </option>
            </select>
        </div>

         <div class="form-row">
            <div class="form-group half">
                <label>Assignee (Executor)</label>
                <select v-model="form.assignee_id" class="input">
                    <option :value="null">Unassigned</option>
                    <option v-for="p in profiles" :key="p.id" :value="p.id">
                        {{ p.full_name || p.email }}
                    </option>
                </select>
            </div>
             <div class="form-group half">
                <label>Responsible (Accountable)</label>
                <select v-model="form.responsible_id" class="input">
                    <option :value="null">Unassigned</option>
                    <option v-for="p in profiles" :key="p.id" :value="p.id">
                        {{ p.full_name || p.email }}
                    </option>
                </select>
            </div>
        </div>

      </div>

      <div class="modal-footer">
        <button @click="$emit('close')" class="cancel-btn">Cancel</button>
        <button @click="save" class="save-btn">Save Task</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  backdrop-filter: blur(2px);
}

.modal {
  background: var(--bg-card);
  width: 500px;
  max-width: 90%;
  border-radius: 12px;
  border: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

.modal-header {
  padding: 1.5rem;
  border-bottom: 1px solid var(--border-color);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h2 {
  margin: 0;
  font-size: 1.25rem;
  color: var(--text-primary);
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  color: var(--text-secondary);
  cursor: pointer;
}

.modal-body {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.form-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.form-row {
    display: flex;
    gap: 1rem;
}

.half {
    flex: 1;
}

label {
    font-size: 0.875rem;
    font-weight: 500;
    color: var(--text-secondary);
}

.input {
    padding: 0.6rem;
    border-radius: 6px;
    border: 1px solid var(--border-color);
    background: var(--bg-primary);
    color: var(--text-primary);
    font-size: 0.9rem;
}

.input:focus {
    outline: none;
    border-color: var(--primary-color);
    box-shadow: 0 0 0 2px rgba(210, 244, 118, 0.2);
}

textarea.input {
    resize: vertical;
}

.modal-footer {
    padding: 1.5rem;
    border-top: 1px solid var(--border-color);
    display: flex;
    justify-content: flex-end;
    gap: 1rem;
}

.cancel-btn {
    background: transparent;
    border: 1px solid var(--border-color);
    padding: 0.6rem 1.2rem;
    border-radius: 6px;
    cursor: pointer;
    color: var(--text-primary);
    font-weight: 500;
}

.save-btn {
    background: var(--primary-color);
    color: #1a1a1a;
    border: none;
    padding: 0.6rem 1.2rem;
    border-radius: 6px;
    cursor: pointer;
    font-weight: 600;
}

.save-btn:hover {
    opacity: 0.9;
}

.cancel-btn:hover {
    background: var(--bg-hover);
}
</style>
