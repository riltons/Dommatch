-- Remover tabela se existir
DROP TABLE IF EXISTS public.community_members CASCADE;

-- Criar tabela de membros
CREATE TABLE IF NOT EXISTS public.community_members (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    community_id UUID NOT NULL REFERENCES public.communities(id) ON DELETE CASCADE,
    player_id UUID NOT NULL REFERENCES public.players(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(community_id, player_id)
);

-- Comentários da tabela
comment on table public.community_members is 'Tabela que armazena os membros de cada comunidade';
comment on column public.community_members.id is 'ID único do registro de membro';
comment on column public.community_members.community_id is 'ID da comunidade';
comment on column public.community_members.player_id is 'ID do jogador';
comment on column public.community_members.created_at is 'Data de criação do registro';
comment on column public.community_members.updated_at is 'Data de atualização do registro';

-- Habilitar RLS
ALTER TABLE public.community_members ENABLE ROW LEVEL SECURITY;

-- Criar políticas de segurança
CREATE POLICY "Usuários podem ver membros das comunidades que participam"
ON public.community_members FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.communities c
        WHERE c.id = community_id
        AND (
            c.created_by = auth.uid() OR
            EXISTS (
                SELECT 1 FROM public.community_members cm
                WHERE cm.community_id = c.id
                AND cm.player_id IN (
                    SELECT id FROM public.players WHERE created_by = auth.uid()
                )
            )
        )
    )
);

CREATE POLICY "Usuários podem adicionar seus jogadores às comunidades"
ON public.community_members FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.players p
        WHERE p.id = player_id
        AND p.created_by = auth.uid()
    )
);

CREATE POLICY "Apenas admin pode atualizar membros"
ON public.community_members FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM public.communities c
        WHERE c.id = community_id
        AND c.created_by = auth.uid()
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.communities c
        WHERE c.id = community_id
        AND c.created_by = auth.uid()
    )
);

CREATE POLICY "Usuários podem remover seus jogadores"
ON public.community_members FOR DELETE
USING (
    EXISTS (
        SELECT 1 FROM public.players p
        WHERE p.id = player_id
        AND p.created_by = auth.uid()
    ) OR
    EXISTS (
        SELECT 1 FROM public.communities c
        WHERE c.id = community_id
        AND c.created_by = auth.uid()
    )
);

-- Criar índices para melhor performance
create index if not exists community_members_community_id_idx on public.community_members(community_id);
create index if not exists community_members_player_id_idx on public.community_members(player_id);
