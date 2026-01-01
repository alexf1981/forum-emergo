import { supabase } from './supabaseClient';

export const DataService = {
    async loadGameData(userId) {
        try {
            const { data, error } = await supabase
                .from('game_data')
                .select('data')
                .eq('id', userId)
                .single();

            if (error) throw error;
            return data?.data || null;
        } catch (error) {
            console.error('Error loading game data:', error);
            return null;
        }
    },

    async saveGameData(userId, gameData) {
        try {
            const { error } = await supabase
                .from('game_data')
                .upsert({ id: userId, data: gameData, updated_at: new Date() });

            if (error) throw error;
            return true;
        } catch (error) {
            console.error('Error saving game data:', error);
            return false;
        }
    }
};
