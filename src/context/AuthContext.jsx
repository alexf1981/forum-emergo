import React, { createContext, useState, useEffect, useContext } from 'react'
import { supabase } from '../services/supabaseClient'

const AuthContext = createContext()

const getRandomName = () => {
    const names = ["Romanus", "Imperator", "Legionarius", "Centurion", "Senator", "Plebeius"];
    const suffix = Math.floor(Math.random() * 10000);
    return `${names[Math.floor(Math.random() * names.length)]} ${suffix}`;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null)
    // Initialize with stored name OR generate one immediately so it's never empty
    const [playerName, setPlayerName] = useState(() => {
        const stored = localStorage.getItem('player_name');
        if (stored) return stored;
        const newName = getRandomName();
        localStorage.setItem('player_name', newName); // Save it right away too
        return newName;
    })
    const [loading, setLoading] = useState(true)

    // Standard Supabase Auth Pattern
    useEffect(() => {
        let mounted = true;

        async function initAuth() {
            try {
                // 1. Get initial session
                const { data: { session } } = await supabase.auth.getSession();

                if (mounted) {
                    await handleSession(session);
                }
            } catch (error) {
                console.error("Auth init error:", error);
                if (mounted) loadLocalName();
            } finally {
                if (mounted) {
                    setLoading(false);
                }
            }
        }

        initAuth();

        // 2. Listen for changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
            if (mounted) {
                // We don't touch loading state here, as initAuth handles the initial load
                await handleSession(session);
            }
        });

        return () => {
            mounted = false;
            subscription.unsubscribe();
        }
    }, [])

    const handleSession = async (session) => {
        const currentUser = session?.user ?? null;
        setUser(currentUser);

        if (currentUser) {
            // SYNC: Keep "last_sign_in_at" in sync with public profile so Admin Dashboard can see it
            if (currentUser.last_sign_in_at) {
                supabase.from('profiles')
                    .update({ last_sign_in_at: currentUser.last_sign_in_at })
                    .eq('id', currentUser.id)
                    .then(({ error }) => {
                        if (error) {
                            // If column missing, try falling back to updated_at just to touch the row
                            if (error.code === '42703') { // Undefined column
                                supabase.from('profiles')
                                    .update({ updated_at: new Date() })
                                    .eq('id', currentUser.id);
                            } else {
                                console.warn("Failed to sync last_sign_in_at:", error);
                            }
                        }
                    });
            }
            await loadProfileName(currentUser.id);
        } else {
            loadLocalName();
        }
    }

    // Track currently fetching user to prevent parallel requests for same ID
    const fetchingRef = React.useRef(null);

    const loadProfileName = async (userId) => {
        if (!userId) return;

        // 1. CACHE HIT: Try to load from user-specific local storage immediately
        const cachedName = localStorage.getItem(`player_name_${userId}`);
        if (cachedName) {
            setPlayerName(cachedName);
            setLoading(false);
        }

        // Deduplication: If already fetching for this user, skip.
        if (fetchingRef.current === userId) {
            return;
        }

        fetchingRef.current = userId;

        try {
            // Force a timeout on the DB query (5 seconds)
            const fetchProfile = supabase
                .from('profiles')
                .select('username')
                .eq('id', userId)
                .single();

            const timeoutPromise = new Promise((_, reject) =>
                setTimeout(() => reject(new Error('Profile fetch timed out')), 1000)
            );

            const { data, error } = await Promise.race([fetchProfile, timeoutPromise]);

            if (error) {
                throw error;
            }

            if (data?.username) {
                setPlayerName(data.username);
                // Update local cache so it's ready for next reload
                localStorage.setItem(`player_name_${userId}`, data.username);
            } else {
                // No name set in profile? Generate one and save it!
                const newName = getRandomName();
                setPlayerName(newName);
                localStorage.setItem(`player_name_${userId}`, newName);

                // Persist it immediately so it sticks
                supabase
                    .from('profiles')
                    .update({ username: newName })
                    .eq('id', userId)
                    .then(({ error }) => {
                        if (error) console.error("Failed to save generated name:", error);
                    });
            }
        } catch (err) {
            if (err.message === 'Profile fetch timed out') {
                return;
            }

            // Fallback: If DB fetch fails and we have NO cache, generate random
            if (!cachedName) {
                const newName = getRandomName();
                setPlayerName(newName);
                // Try to auto-fix the missing profile by upserting
                try {
                    await supabase
                        .from('profiles')
                        .upsert({ id: userId, username: newName });
                } catch (upsertErr) {
                    // silent fail
                }
            }
        } finally {
            // Clear the lock
            fetchingRef.current = null;
        }
    }

    const loadLocalName = () => {
        const stored = localStorage.getItem('player_name');
        if (stored) {
            setPlayerName(stored);
        } else {
            // No local name? Generate one and save it!
            const newName = getRandomName();
            setPlayerName(newName);
            localStorage.setItem('player_name', newName);
        }
    }

    const updatePlayerName = async (newName) => {
        setPlayerName(newName);

        if (user) {
            // Update cache
            localStorage.setItem(`player_name_${user.id}`, newName);

            // Update supabase
            try {
                await supabase
                    .from('profiles')
                    .update({ username: newName })
                    .eq('id', user.id);
            } catch (err) {
                console.error("Failed to update profile name", err);
            }
        } else {
            // Update local storage
            localStorage.setItem('player_name', newName);
        }
    }

    const value = {
        user,
        playerName,
        updatePlayerName,
        loading
    }

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
    return useContext(AuthContext)
}
