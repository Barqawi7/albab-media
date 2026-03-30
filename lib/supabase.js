import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://dvklqmoddcqbisnbknsj.supabase.co'
const supabaseKey = 'sb_publishable_UDGMNRiE0N5lAuieFcQPIQ_X6A6xNLe'

export const supabase = createClient(supabaseUrl, supabaseKey)
