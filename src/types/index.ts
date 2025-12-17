export interface Profile {
    id: string
    email: string
    full_name: string | null
    avatar_url: string | null
}

export interface Team {
    id: string
    name: string
    description: string | null
    created_by: string
    created_at: string
}

export interface TeamMember {
    team_id: string
    user_id: string
    role: 'admin' | 'member'
    profile?: Profile
}

export interface Todo {
    id: string
    user_id: string
    title: string
    description: string | null
    status: 'todo' | 'in-progress' | 'done'
    created_at: string
    updated_at: string
    // New fields
    team_id?: string | null
    assignee_id?: string | null // Ejecutor
    responsible_id?: string | null // Responsable
    deadline?: string | null
    // Joins
    assignee?: Profile
    responsible?: Profile
    team?: Team
}
