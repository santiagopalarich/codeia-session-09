import { ref } from 'vue'
import { supabase } from '@/lib/supabase'
import type { Project } from '@/types'

export function useProjects() {
    const projects = ref<Project[]>([])
    const loading = ref(false)
    const error = ref<string | null>(null)

    const fetchProjects = async () => {
        loading.value = true
        const { data, error: dbError } = await supabase
            .from('projects')
            .select('*')
            .order('created_at', { ascending: false })

        if (dbError) {
            error.value = dbError.message
        } else {
            projects.value = data as Project[] || []
        }
        loading.value = false
    }

    const createProject = async (name: string, color: string = '#4f46e5') => {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) throw new Error('Not authenticated')

        const { data, error: dbError } = await supabase
            .from('projects')
            .insert({
                name,
                color,
                created_by: session.user.id
            })
            .select()
            .single()

        if (dbError) throw dbError

        projects.value.unshift(data as Project)
        return data
    }

    return {
        projects,
        loading,
        error,
        fetchProjects,
        createProject
    }
}
