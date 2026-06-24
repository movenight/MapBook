import { supabase } from '../supabase'

export const auth = {
  async signUp(email: string, password: string) {
    return supabase.auth.signUp({ email, password })
  },

  async signIn(email: string, password: string) {
    return supabase.auth.signInWithPassword({ email, password })
  },

  async signOut() {
    return supabase.auth.signOut()
  },

  async getUser() {
    return supabase.auth.getUser()
  },

  onAuthStateChange(callback: (event: string, session: unknown) => void) {
    return supabase.auth.onAuthStateChange(callback)
  },
}
