'use server'
import { createClient } from '@/lib/supabase/server'

export async function getLocations() {
    const supabase = await createClient()

    const { data, error } = await supabase.from('location_pricing').select('location_id, location_name, location_price')

    if (error) {
        return { error }
    }

    return data
}