import { supabase } from '@/lib/supabase';

export const playersService = {
    async listPlayers() {
        const { data, error } = await supabase
            .from('players')
            .select('id, name')
            .order('name');

        if (error) throw error;
        return { data, error: null };
    },

    async getPlayer(id: string) {
        const { data, error } = await supabase
            .from('players')
            .select('id, name')
            .eq('id', id)
            .single();

        if (error) throw error;
        return data;
    },

    async createPlayer(name: string) {
        const { data, error } = await supabase
            .from('players')
            .insert([{ name }])
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async updatePlayer(id: string, name: string) {
        const { data, error } = await supabase
            .from('players')
            .update({ name })
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
