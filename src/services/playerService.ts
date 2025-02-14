import { supabase } from '@/lib/supabase';

export interface Player {
    id: string;
    name: string;
    email: string;
    created_at: string;
}

interface CreatePlayerDTO {
    name: string;
    email: string;
}

class PlayerService {
    private players: Player[] = [];

    async getByEmail(email: string) {
        try {
            const { data, error } = await supabase
                .from('players')
                .select('*')
                .eq('email', email)
                .single();

            if (error && error.code !== 'PGRST116') { // PGRST116 é o código para "não encontrado"
                console.error('Erro ao buscar jogador por email:', error);
                throw new Error('Erro ao buscar jogador por email');
            }

            return data;
        } catch (error) {
            console.error('Erro ao buscar jogador por email:', error);
            throw error;
        }
    }

    async create(data: CreatePlayerDTO) {
        try {
            // Verifica se já existe jogador com este email
            const existingPlayer = await this.getByEmail(data.email);
            if (existingPlayer) {
                throw new Error('Já existe um jogador cadastrado com este email');
            }

            const { data: userData, error: userError } = await supabase.auth.getUser();
            if (userError) throw userError;

            const { data: newPlayer, error } = await supabase
                .from('players')
                .insert([{
                    ...data,
                    created_by: userData.user.id
                }])
                .select()
                .single();

            if (error) {
                if (error.code === '23505') { // Código do PostgreSQL para violação de UNIQUE
                    throw new Error('Já existe um jogador cadastrado com este email');
                }
                console.error('Erro ao criar jogador:', error);
                throw new Error('Erro ao criar jogador');
            }

            // Atualiza a lista de jogadores em memória
            await this.list();

            return newPlayer;
        } catch (error) {
            console.error('Erro ao criar jogador:', error);
            throw error;
        }
    }

    async list() {
        try {
            const { data, error } = await supabase
                .from('players')
                .select('*')
                .order('name');

            if (error) {
                console.error('Erro ao listar jogadores:', error);
                throw new Error('Erro ao listar jogadores');
            }

            this.players = data;
            return data;
        } catch (error) {
            console.error('Erro ao listar jogadores:', error);
            throw error;
        }
    }

    async getById(id: string) {
        try {
            const { data, error } = await supabase
                .from('players')
                .select('*')
                .eq('id', id)
                .single();

            if (error) {
                console.error('Erro ao buscar jogador:', error);
                throw new Error('Erro ao buscar jogador');
            }

            return data;
        } catch (error) {
            console.error('Erro ao buscar jogador:', error);
            throw error;
        }
    }

    async update(id: string, data: Partial<CreatePlayerDTO>) {
        try {
            const { data: updatedPlayer, error } = await supabase
                .from('players')
                .update(data)
                .eq('id', id)
                .select()
                .single();

            if (error) {
                console.error('Erro ao atualizar jogador:', error);
                throw new Error('Erro ao atualizar jogador');
            }

            // Atualiza a lista de jogadores em memória
            await this.list();

            return updatedPlayer;
        } catch (error) {
            console.error('Erro ao atualizar jogador:', error);
            throw error;
        }
    }

    async delete(id: string) {
        try {
            const { error } = await supabase
                .from('players')
                .delete()
                .eq('id', id);

            if (error) {
                console.error('Erro ao excluir jogador:', error);
                throw new Error('Erro ao excluir jogador');
            }

            // Atualiza a lista de jogadores em memória
            await this.list();
        } catch (error) {
            console.error('Erro ao excluir jogador:', error);
            throw error;
        }
    }
}

export const playerService = new PlayerService();
