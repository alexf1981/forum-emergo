import { supabase } from './supabaseClient';

export const UserService = {
    async getProfile(userId) {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error fetching profile:', error);
            return null;
        }
    },

    async updateProfile(userId, updates) {
        try {
            const { error } = await supabase
                .from('profiles')
                .update(updates)
                .eq('id', userId);

            if (error) throw error;
            return true;
        } catch (error) {
            console.error('Error updating profile:', error);
            return false;
        }
    }
};
