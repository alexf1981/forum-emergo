import { supabase } from './supabaseClient';

export const AdminService = {
    async getAllUsersStats() {
        // Note: This requires RLS policies to allow the admin user to see this data.
        // For simplicity in this first iteration, we might assume the current user has 'service_role' or we rely on RLS allowing 'public' read for profiles if we want.
        // BUT, better practice: create a specific function or rely on RLS.
        // Let's try fetching profiles and joining game_data.

        try {
            const { data: profiles, error: profileError } = await supabase
                .from('profiles')
                .select('id, username, email, updated_at');

            if (profileError) throw profileError;

            const { data: gameData, error: gameError } = await supabase
                .from('game_data')
                .select('id, data, updated_at');

            if (gameError) throw gameError;

            // Merge data
            const stats = profiles.map(p => {
                const games = gameData.find(g => g.id === p.id);
                const gData = games?.data || {};

                return {
                    id: p.id,
                    username: p.username || 'Anonymous',
                    email: p.email || '-',
                    lastActive: new Date(p.updated_at).toLocaleString(),
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
