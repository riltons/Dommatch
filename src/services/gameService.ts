import { supabase } from '@/lib/supabase';

export interface Game {
    id: string;
    competition_id: string;
    team1_score: number;
    team2_score: number;
    status: 'pending' | 'in_progress' | 'finished';
    created_at: string;
    team1: string[];
    team2: string[];
}

export interface CreateGameDTO {
    competition_id: string;
    team1: string[];
    team2: string[];
}

export const gameService = {
    async create(data: CreateGameDTO) {
        try {
            console.log('Criando jogo com dados:', data);
            const session = await supabase.auth.getSession();
            console.log('Sessão atual:', session);

            const { data: newGame, error } = await supabase
                .from('games')
                .insert([{
                    ...data,
                    team1_score: 0,
                    team2_score: 0,
                    status: 'pending'
                }])
                .select()
                .single();

            if (error) {
                console.error('Erro detalhado:', error);
                throw error;
            }
            return newGame;
        } catch (error) {
            console.error('Erro ao criar jogo:', error);
            throw error;
        }
    },

    async listByCompetition(competitionId: string) {
        try {
            const { data, error } = await supabase
                .from('games')
                .select(`
                    *,
                    team1,
                    team2
                `)
                .eq('competition_id', competitionId)
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Erro ao listar jogos:', error);
            throw error;
        }
    },

    async getById(id: string) {
        try {
            const { data, error } = await supabase
                .from('games')
                .select(`
                    *,
                    team1,
                    team2
                `)
                .eq('id', id)
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Erro ao buscar jogo:', error);
            throw error;
        }
    },

    async updateScore(id: string, team1Score: number, team2Score: number) {
        try {
            const { data, error } = await supabase
                .from('games')
                .update({
                    team1_score: team1Score,
                    team2_score: team2Score,
                    status: 'in_progress'
                })
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Erro ao atualizar placar:', error);
            throw error;
        }
    },

    async finishGame(id: string) {
        try {
            const { data, error } = await supabase
                .from('games')
                .update({
                    status: 'finished'
                })
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Erro ao finalizar jogo:', error);
            throw error;
        }
    }
};
