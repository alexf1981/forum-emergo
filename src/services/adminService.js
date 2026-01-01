import { supabase } from './supabaseClient';

export const AdminService = {
    async getAllUsersStats() {
        // Note: This requires RLS policies to allow the admin user to see this data.
        // For simplicity in this first iteration, we might assume the current user has 'service_role' or we rely on RLS allowing 'public' read for profiles if we want.
        // BUT, better practice: create a specific function or rely on RLS.
        // Let's try fetching profiles and joining game_data.

        try {
            let profiles = [];
            let profileError = null;

            // 1. Try fetching with new column
            const result1 = await supabase
                .from('profiles')
                .select('id, username, email, updated_at, language, last_sign_in_at');

            if (result1.error) {
                console.warn("Admin fetch with last_sign_in_at failed, retrying without...", result1.error);
                // 2. Fallback: fetch without new column
                const result2 = await supabase
                    .from('profiles')
                    .select('id, username, email, updated_at, language');

                if (result2.error) throw result2.error;
                profiles = result2.data;
            } else {
                profiles = result1.data;
            }

            const { data: gameData, error: gameError } = await supabase
                .from('game_data')
                .select('id, data, updated_at');

            if (gameError) throw gameError;

            // Merge data
            const stats = profiles.map(p => {
                const games = gameData.find(g => g.id === p.id);
                const gData = games?.data || {};

                // Determine most recent activity
                // 1. Prefer explicit last_sign_in_at from auth sync
                let lastActiveDate = p.last_sign_in_at ? new Date(p.last_sign_in_at) : null;

                if (!lastActiveDate) {
                    const profileDate = p.updated_at ? new Date(p.updated_at) : new Date(0);
                    const gameDate = games?.updated_at ? new Date(games.updated_at) : new Date(0);
                    // Pick the latest date from update times
                    lastActiveDate = profileDate > gameDate ? profileDate : gameDate;
                }

                // If year is 1970, it means no data found
                const lastActiveStr = lastActiveDate.getFullYear() === 1970
                    ? '-'
                    : lastActiveDate.toLocaleString();

                return {
                    id: p.id,
                    username: p.username || 'Anonymous',
                    email: p.email || '-',
                    language: p.language || 'en',
                    lastActive: lastActiveStr,
                    gold: gData.romestats?.gold || 0,
                    population: gData.romestats?.pop || 0,
                    army: gData.romestats?.army || 0,
                    score: calculateScore(gData.romestats)
                };
            });

            return stats;

        } catch (error) {
            console.error('Admin fetch error:', error);
            return [];
        }
    }
};

const calculateScore = (stats) => {
    if (!stats) return 0;
    return (stats.pop || 0) * 10 + (stats.know || 0) * 5 + (stats.army || 0) * 20 + (stats.gold || 0);
};
