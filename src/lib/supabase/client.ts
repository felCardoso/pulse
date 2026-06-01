// Re-export the SSR browser client as the default Supabase client
export { createClient } from "@/utils/supabase/client"

// Singleton for hooks that need a stable reference
import { createClient } from "@/utils/supabase/client"
export const supabase = createClient()
