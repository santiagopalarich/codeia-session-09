import { ref } from 'vue'
import { supabase } from '@/lib/supabase'
import type { Team, TeamMember } from '@/types'

export function useTeams() {
    const teams = ref<Team[]>([])
    const currentTeamMembers = ref<TeamMember[]>([])
    const loading = ref(false)
    const error = ref<string | null>(null)

    const fetchTeams = async () => {
        loading.value = true
        const { data, error: dbError } = await supabase
            .from('teams')
            .select('*')
            .order('created_at', { ascending: false })

        if (dbError) {
            error.value = dbError.message
        } else {
            teams.value = data as Team[]
        }
        loading.value = false
    }

    const createTeam = async (name: string, description?: string) => {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) throw new Error('Not authenticated')

        const { data, error: dbError } = await supabase
            .from('teams')
            .insert({
                name,
                description,
                created_by: session.user.id
            })
            .select()
            .single()

        if (dbError) throw dbError

        // Auto-add creator as admin
        await addMember(data.id, session.user.id, 'admin')

        teams.value.unshift(data as Team)
        return data
    }

    const fetchTeamMembers = async (teamId: string) => {
        const { data, error: dbError } = await supabase
            .from('team_members')
            .select('*, profile:profiles(*)')
            .eq('team_id', teamId)

        if (dbError) throw dbError
        currentTeamMembers.value = data as unknown as TeamMember[]
        return data
    }

    const addMember = async (teamId: string, userId: string, role: string = 'member') => {
        const { error: dbError } = await supabase
            .from('team_members')
            .insert({
                team_id: teamId,
                user_id: userId,
                role
            })

        if (dbError) throw dbError
    }

    return {
        teams,
        currentTeamMembers,
        loading,
        error,
        fetchTeams,
        createTeam,
        fetchTeamMembers,
        addMember
    }
}
