import { ref, onMounted } from 'vue'
import { supabase } from '@/lib/supabase'
import type { Todo } from '@/types'

export function useTodos() {
    const todos = ref<Todo[]>([])
    const loading = ref(false)
    const error = ref<string | null>(null)

    const fetchTodos = async () => {
        loading.value = true
        error.value = null

        // We get the session again to ensure we are using the token
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) return

        const { data, error: fetchError } = await supabase
            .from('todos')
            .select('*')
            .order('created_at', { ascending: false })

        if (fetchError) {
            error.value = fetchError.message
        } else {
            todos.value = data as Todo[] || []
        }

        loading.value = false
    }

    const createTodo = async (title: string, description?: string) => {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) throw new Error('Not authenticated')

        const { data, error: insertError } = await supabase
            .from('todos')
            .insert({
                title,
                description,
                user_id: session.user.id
            })
            .select()
            .single()

        if (insertError) throw insertError
        todos.value.unshift(data as Todo)
        return data
    }

    const updateTodo = async (id: string, updates: Partial<Todo>) => {
        const { data, error: updateError } = await supabase
            .from('todos')
            .update(updates)
            .eq('id', id)
            .select()
            .single()

        if (updateError) throw updateError

        const index = todos.value.findIndex((t: Todo) => t.id === id)
        if (index !== -1) todos.value[index] = data as Todo
        return data
    }

    const toggleComplete = async (id: string) => {
        const todo = todos.value.find((t: Todo) => t.id === id)
        if (!todo) return

        return updateTodo(id, { is_completed: !todo.is_completed })
    }

    const deleteTodo = async (id: string) => {
        const { error: deleteError } = await supabase
            .from('todos')
            .delete()
            .eq('id', id)

        if (deleteError) throw deleteError
        todos.value = todos.value.filter((t: Todo) => t.id !== id)
    }

    onMounted(() => {
        fetchTodos()
    })

    return {
        todos,
        loading,
        error,
        fetchTodos,
        createTodo,
        updateTodo,
        toggleComplete,
        deleteTodo
    }
}
