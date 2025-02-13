import { supabase } from '@/lib/supabase';

export interface Community {
    id: string;
    name: string;
    description: string;
    owner_id: string;
    created_at: string;
    updated_at: string;
    members_count: number;
    games_count: number;
}

export interface CreateCommunityDTO {
    name: string;
    description: string;
}

export interface UpdateCommunityDTO {
    name?: string;
    description?: string;
}

class CommunityService {
    async listCommunities() {
        try {
            const { data, error } = await supabase
                .from('communities')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Erro ao listar comunidades:', error);
                throw error;
            }

            return { data, error: null };
        } catch (error) {
            console.error('Erro ao listar comunidades:', error);
            return { data: null, error };
        }
    }

    async getById(id: string) {
        try {
            const { data, error } = await supabase
                .from('communities')
                .select('*')
                .eq('id', id)
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Erro ao buscar comunidade:', error);
            throw error;
        }
    }

    async createCommunity(community: CreateCommunityDTO) {
        try {
            const { data: userData, error: userError } = await supabase.auth.getUser();
            if (userError) throw userError;

            const now = new Date().toISOString();
            const { data, error } = await supabase
                .from('communities')
                .insert({
                    ...community,
                    owner_id: userData.user.id,
                    created_at: now,
                    updated_at: now
                })
                .select()
                .single();

            if (error) {
                console.error('Erro ao criar comunidade:', error);
                throw error;
            }

            return { data, error: null };
        } catch (error) {
            console.error('Erro ao criar comunidade:', error);
            return { data: null, error };
        }
    }

    async updateCommunity(id: string, updates: UpdateCommunityDTO) {
        try {
            const { data, error } = await supabase
                .from('communities')
                .update(updates)
                .eq('id', id)
                .select()
                .single();

            if (error) {
                console.error('Erro ao atualizar comunidade:', error);
                throw error;
            }

            return { data, error: null };
        } catch (error) {
            console.error('Erro ao atualizar comunidade:', error);
            return { data: null, error };
        }
    }

    async deleteCommunity(id: string) {
        try {
            const { error } = await supabase
                .from('communities')
                .delete()
                .eq('id', id);

            if (error) {
                console.error('Erro ao excluir comunidade:', error);
                throw error;
            }

            return { error: null };
        } catch (error) {
            console.error('Erro ao excluir comunidade:', error);
            return { error };
        }
    }

    async searchCommunities(query: string) {
        try {
            const { data, error } = await supabase
                .from('communities')
                .select('*')
                .ilike('name', `%${query}%`)
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Erro ao pesquisar comunidades:', error);
                throw error;
            }

            return { data, error: null };
        } catch (error) {
            console.error('Erro ao pesquisar comunidades:', error);
            return { data: null, error };
        }
    }
}

export const communityService = new CommunityService();
