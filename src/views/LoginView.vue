<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../composables/useAuth'

const router = useRouter()
const { signIn } = useAuth()

const email = ref('')
const password = ref('')
const loading = ref(false)
const error = ref<string | null>(null)

const handleLogin = async () => {
  loading.value = true
  error.value = null
  try {
    await signIn(email.value, password.value)
    router.push('/')
  } catch (e: any) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="login-container">
    <h1>Login</h1>
    <form @submit.prevent="handleLogin" class="login-form">
      <div class="form-group">
        <label for="email">Email</label>
        <input 
          id="email" 
          v-model="email" 
          type="email" 
          required 
          placeholder="your@email.com"
        />
      </div>
      
      <div class="form-group">
        <label for="password">Password</label>
        <input 
          id="password" 
          v-model="password" 
          type="password" 
          required 
          placeholder="••••••••"
        />
      </div>

      <div v-if="error" class="error-message">
        {{ error }}
      </div>

      <button type="submit" :disabled="loading" class="submit-btn">
        {{ loading ? 'Logging in...' : 'Login' }}
      </button>

      <p class="auth-link">
        Don't have an account? <router-link to="/register">Sign up</router-link>
      </p>
    </form>
  </div>
</template>

<style scoped>
.login-container {
  max-width: 400px;
  margin: 0 auto; /* Center horizontally */
  padding: 2rem;
  /* Center vertically in viewport */
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 100%;
  border-radius: 8px;
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
  background: var(--bg-card);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
}

h1 {
  text-align: center;
  margin-bottom: 2rem;
  color: var(--text-primary);
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

input {
  padding: 0.75rem;
  border: 1px solid var(--border-color);
  background: var(--bg-primary);
  color: var(--text-primary);
  border-radius: 4px;
  font-size: 1rem;
}

input:focus {
  outline: none;
  border-color: var(--primary-color);
}

.submit-btn {
  background-color: var(--primary-color);
  color: var(--primary-text);
  padding: 0.75rem;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.submit-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.submit-btn:hover:not(:disabled) {
  background-color: var(--primary-hover);
}

.error-message {
  color: var(--danger-color);
  font-size: 0.875rem;
  text-align: center;
}

.auth-link {
  text-align: center;
  font-size: 0.875rem;
  color: var(--text-secondary);
}
</style>
