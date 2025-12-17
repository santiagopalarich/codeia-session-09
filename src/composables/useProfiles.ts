import { ref, onMounted } from 'vue'
import { supabase } from '@/lib/supabase'
import type { Profile } from '@/types'

export function useProfiles() {
    const profiles = ref<Profile[]>([])
    const loading = ref(false)

    const fetchProfiles = async () => {
        loading.value = true
        const { data, error } = await supabase
            .from('profiles')
            .select('*')

        if (!error && data) {
            profiles.value = data as Profile[]
        }
        loading.value = false
    }

    onMounted(() => {
        fetchProfiles()
    })

    return {
        profiles,
        loading,
        fetchProfiles
    }
}
