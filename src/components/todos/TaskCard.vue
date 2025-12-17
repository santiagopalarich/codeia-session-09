<script setup lang="ts">
import type { Todo } from '@/types'

defineProps<{
  todo: Todo
}>()

defineEmits(['update', 'delete', 'toggle-complete'])
</script>

<template>
  <div class="task-card">
    <div class="card-header">
      <div class="avatars">
        <div v-if="todo.assignee" class="avatar" :title="'Assignee: ' + todo.assignee.full_name">
           {{ todo.assignee.full_name?.[0] || '?' }}
        </div>
        <div v-if="todo.responsible && todo.responsible.id !== todo.assignee?.id" class="avatar responsible" :title="'Responsible: ' + todo.responsible.full_name">
           {{ todo.responsible.full_name?.[0] || '?' }}
        </div>
      </div>
      <div class="priority-badge" :class="todo.status">
        {{ todo.status === 'done' ? 'Done' : (todo.status === 'in-progress' ? 'WIP' : 'High') }}
      </div>
    </div>
    
    <h3 class="task-title" :class="{ 'completed-text': todo.status === 'done' }">
      {{ todo.title }}
    </h3>
    
    <div class="tags" v-if="todo.team">
      <span class="tag team">{{ todo.team.name }}</span>
    </div>
    
    <div class="card-footer">
      <div class="date" v-if="todo.deadline">
        <span class="icon">⏰</span>
        {{ new Date(todo.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) }}
      </div>
      <div class="date" v-else>
         <span class="icon">📅</span>
         {{ new Date(todo.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) }}
      </div>
      
      <div class="actions">
        <button class="icon-btn delete" @click="$emit('delete', todo.id)" title="Delete">
          🗑️
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.task-card {
  background-color: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
  transition: transform 0.2s, box-shadow 0.2s;
  cursor: grab;
}

.task-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.avatars {
  display: flex;
}

.avatar {
  width: 28px;
  height: 28px;
  background-color: #eee;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
  border: 2px solid var(--bg-card);
  margin-right: -8px;
}

.priority-badge {
  font-size: 0.75rem;
  font-weight: 600;
  color: #fca5a5; /* High = Light red */
}

.priority-badge.done {
  color: #86efac; /* Green */
}

.priority-badge.in-progress {
  color: #fcd34d; /* Yellow */
}

.task-title {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
  line-height: 1.4;
}

.task-title.completed-text {
  text-decoration: line-through;
  color: var(--text-muted);
}

.tags {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.tag {
  font-size: 0.7rem;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-weight: 500;
}

.tag.design {
  color: #6366f1;
  background-color: rgba(99, 102, 241, 0.1);
}

.tag.prototype {
  color: #ec4899;
  background-color: rgba(236, 72, 153, 0.1);
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: auto;
  padding-top: 0.5rem;
  border-top: 1px solid var(--border-color);
}

.date {
  font-size: 0.8rem;
  color: var(--text-secondary);
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.actions {
  display: flex;
  gap: 0.5rem;
}

.icon-btn {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1rem;
  padding: 0.25rem;
  border-radius: 4px;
  transition: background-color 0.2s;
  opacity: 0.7;
}

.icon-btn:hover {
  background-color: var(--bg-hover);
  opacity: 1;
}

.icon-btn.delete:hover {
  background-color: #fee2e2;
}

</style>
