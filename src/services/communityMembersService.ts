import { supabase } from '@/lib/supabase';

export const communityMembersService = {
    async listMembers(communityId: string) {
        const { data, error } = await supabase
            .from('community_members')
            .select(`
                *,
                players (
                    id,
                    name
                )
            `)
            .eq('community_id', communityId);

        if (error) throw error;
        return data;
    },

    async addMember(communityId: string, playerId: string) {
        const { data, error } = await supabase
            .from('community_members')
            .insert([
                { community_id: communityId, player_id: playerId }
            ])
            .select();

        if (error) throw error;
        return data[0];
    },

    async removeMember(communityId: string, playerId: string) {
        const { error } = await supabase
            .from('community_members')
            .delete()
            .eq('community_id', communityId)
            .eq('player_id', playerId);

        if (error) throw error;
    },

    async isMember(communityId: string, playerId: string) {
        const { data, error } = await supabase
            .from('community_members')
            .select('id')
            .eq('community_id', communityId)
            .eq('player_id', playerId)
            .single();

        if (error && error.code !== 'PGRST116') throw error;
        return !!data;
    }
};
