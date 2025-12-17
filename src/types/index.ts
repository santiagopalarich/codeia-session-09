export interface Todo {
    id: string
    user_id: string
    title: string
    description: string | null
    status: 'todo' | 'in-progress' | 'done'
    created_at: string
    updated_at: string
}
