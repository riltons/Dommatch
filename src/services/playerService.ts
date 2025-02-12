import { supabase } from '../lib/supabase';

export interface Player {
    id: string;
    user_id: string;
    name: string;
    nickname?: string;
    created_at: string;
}

export const playerService = {
    async listPlayers(): Promise<{ data: Player[] | null; error: Error | null }> {
        try {
            const { data, error } = await supabase
                .from('players')
                .select('*')
                .order('name');

            if (error) {
                console.error('Erro SQL ao listar jogadores:', error);
                throw error;
            }
            return { data, error: null };
        } catch (error) {
            console.error('Erro ao listar jogadores:', error);
            return { data: null, error: error as Error };
        }
    },

    async createPlayer(name: string, nickname?: string): Promise<{ data: Player | null; error: Error | null }> {
        try {
            const { data: userData, error: userError } = await supabase.auth.getUser();
            
            if (userError) {
                console.error('Erro ao obter usuário:', userError);
                throw userError;
            }

            if (!userData.user) {
                throw new Error('Usuário não autenticado');
            }

            console.log('Criando jogador:', { name, nickname, user_id: userData.user.id });

            const { data, error } = await supabase
                .from('players')
                .insert({
                    user_id: userData.user.id,
                    name,
                    nickname
                })
                .select()
                .single();

            if (error) {
                console.error('Erro SQL ao criar jogador:', error);
                throw error;
            }

            console.log('Jogador criado com sucesso:', data);
            return { data, error: null };
        } catch (error) {
            console.error('Erro ao criar jogador:', error);
            return { data: null, error: error as Error };
        }
    },

    async updatePlayer(id: string, updates: Partial<Player>): Promise<{ data: Player | null; error: Error | null }> {
        try {
            const { data, error } = await supabase
                .from('players')
                .update(updates)
                .eq('id', id)
                .select()
                .single();

            if (error) {
                console.error('Erro SQL ao atualizar jogador:', error);
                throw error;
            }
            return { data, error: null };
        } catch (error) {
            console.error('Erro ao atualizar jogador:', error);
            return { data: null, error: error as Error };
        }
    },

    async deletePlayer(id: string): Promise<{ error: Error | null }> {
        try {
            const { error } = await supabase
                .from('players')
                .delete()
                .eq('id', id);

            if (error) {
                console.error('Erro SQL ao deletar jogador:', error);
                throw error;
            }
            return { error: null };
        } catch (error) {
            console.error('Erro ao deletar jogador:', error);
            return { error: error as Error };
        }
    }
};
