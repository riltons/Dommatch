import { supabase } from '@/lib/supabase';

export const playersService = {
    async listPlayers() {
        const { data, error } = await supabase
            .from('players')
            .select('id, name, avatar_url')
            .order('name');

        if (error) throw error;
        return data;
    },

    async getPlayer(id: string) {
        const { data, error } = await supabase
            .from('players')
            .select('id, name, avatar_url')
            .eq('id', id)
            .single();

        if (error) throw error;
        return data;
    },

    async createPlayer(name: string, avatarUrl?: string) {
        const { data, error } = await supabase
            .from('players')
            .insert([
                { name, avatar_url: avatarUrl }
            ])
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async updatePlayer(id: string, name: string, avatarUrl?: string) {
        const { data, error } = await supabase
            .from('players')
            .update({ name, avatar_url: avatarUrl })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async deletePlayer(id: string) {
        const { error } = await supabase
            .from('players')
            .delete()
            .eq('id', id);

        if (error) throw error;
    }
};
