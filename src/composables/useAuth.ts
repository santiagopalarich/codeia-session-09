import { ref, computed, onMounted } from 'vue'
import { supabase } from '@/lib/supabase'
import type { User, Session } from '@supabase/supabase-js'

const user = ref<User | null>(null)
const session = ref<Session | null>(null)
const loading = ref(true)

export function useAuth() {
    const isAuthenticated = computed(() => !!user.value)

    const initializeAuth = async () => {
        loading.value = true
        const { data } = await supabase.auth.getSession()
        session.value = data.session
        user.value = data.session?.user ?? null
        loading.value = false
    }

    supabase.auth.onAuthStateChange((_event: string, newSession: Session | null) => {
        session.value = newSession
        user.value = newSession?.user ?? null
    })

    const signUp = async (email: string, password: string) => {
        const { data, error } = await supabase.auth.signUp({ email, password })
        if (error) throw error
        return data
    }

    const signIn = async (email: string, password: string) => {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        })
        if (error) throw error
        return data
    }

    const signOut = async () => {
        const { error } = await supabase.auth.signOut()
        if (error) throw error
    }

    onMounted(() => {
        // Only initialize if we haven't already
        if (loading.value) {
            initializeAuth()
        }
    })

    return {
        user: computed(() => user.value),
        session: computed(() => session.value),
        loading: computed(() => loading.value),
        isAuthenticated,
        signUp,
        signIn,
        signOut,
        initializeAuth
    }
}
