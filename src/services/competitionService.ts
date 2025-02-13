import { supabase } from '@/lib/supabase';

export interface Competition {
    id: string;
    name: string;
    description: string;
    community_id: string;
    start_date: string;
    created_at: string;
}

export const competitionService = {
    async create(data: Omit<Competition, 'id' | 'created_at'>) {
        try {
            console.log('Criando competição:', data);
            const { data: newCompetition, error } = await supabase
                .from('competitions')
                .insert([{
                    ...data,
                    start_date: new Date().toISOString()
                }])
                .select('*')
                .single();

            if (error) {
                console.error('Erro Supabase:', error);
                throw error;
            }
            
            console.log('Competição criada:', newCompetition);
            return newCompetition;
        } catch (error) {
            console.error('Erro ao criar competição:', error);
            throw error;
        }
    },

    async listByCommunity(communityId: string) {
        try {
            const { data, error } = await supabase
                .from('competitions')
                .select('*')
                .eq('community_id', communityId)
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Erro ao listar competições:', error);
            throw error;
        }
    },

    async getById(id: string) {
        try {
            const { data, error } = await supabase
                .from('competitions')
                .select('*')
                .eq('id', id)
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Erro ao buscar competição:', error);
            throw error;
        }
    },

    async listMembers(competitionId: string) {
        try {
            const { data, error } = await supabase
                .from('competition_members')
                .select(`
                    id,
                    player_id,
                    players (
                        id,
                        name
                    )
                `)
                .eq('competition_id', competitionId);

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Erro ao listar membros da competição:', error);
            throw error;
        }
    },

    async addMember(competitionId: string, playerId: string) {
        try {
            console.log('Adicionando membro:', { competitionId, playerId });
            const { data, error } = await supabase
                .from('competition_members')
                .insert([{
                    competition_id: competitionId,
                    player_id: playerId
                }])
                .select();

            console.log('Resposta:', { data, error });

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Erro ao adicionar membro à competição:', error);
            throw error;
        }
    },

    async removeMember(competitionId: string, playerId: string) {
        try {
            const { error } = await supabase
                .from('competition_members')
                .delete()
                .eq('competition_id', competitionId)
                .eq('player_id', playerId);

            if (error) throw error;
        } catch (error) {
            console.error('Erro ao remover membro da competição:', error);
            throw error;
        }
    }
};
