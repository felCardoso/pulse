"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase/client"
import { useAppStore } from "@/store/app-store"
import type { User as AppUser } from "@/types"
import type { User as SupabaseUser } from "@supabase/supabase-js"

function toAppUser(u: SupabaseUser): AppUser {
  return {
    id: u.id,
    email: u.email!,
    name: u.user_metadata?.name ?? null,
    createdAt: new Date(u.created_at),
    updatedAt: new Date(u.updated_at ?? u.created_at),
  }
}

export function useAuth() {
  const { user, setUser } = useAppStore()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ? toAppUser(session.user) : null)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ? toAppUser(session.user) : null)
    })
    return () => subscription.unsubscribe()
  }, [setUser])

  async function signIn(email: string, password: string) {
    setError(null)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) setError(error.message)
    return !error
  }

  async function signUp(email: string, password: string, name?: string) {
    setError(null)
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } },
    })
    if (error) setError(error.message)
    return !error
  }

  async function signOut() {
    await supabase.auth.signOut()
    setUser(null)
  }

  return { user, loading, error, signIn, signUp, signOut }
}
