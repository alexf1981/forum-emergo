import { supabase } from './supabaseClient'

export const signUp = async (email, password) => {
    // Dynamically determine the redirect URL based on where the user is currently running the app
    // This ensures it works for both localhost:5173 and alexf1981.github.io/forum-emergo/
    const redirectTo = window.location.origin + window.location.pathname;

    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            emailRedirectTo: redirectTo
        }
    })
    return { data, error }
}

export const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    })
    return { data, error }
}

export const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    return { error }
}

export const getCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    return user
}
