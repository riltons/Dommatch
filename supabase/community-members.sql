-- Criar a tabela de membros da comunidade
create table if not exists public.community_members (
    id uuid default gen_random_uuid() primary key,
    community_id uuid not null references public.communities(id) on delete cascade,
    player_id uuid not null references public.players(id) on delete cascade,
    created_at timestamptz default now(),
    unique (community_id, player_id)
);

-- Comentários da tabela
comment on table public.community_members is 'Tabela que armazena os membros de cada comunidade';
comment on column public.community_members.id is 'ID único do registro de membro';
comment on column public.community_members.community_id is 'ID da comunidade';
comment on column public.community_members.player_id is 'ID do jogador';
comment on column public.community_members.created_at is 'Data de criação do registro';

-- Políticas de segurança RLS
alter table public.community_members enable row level security;

-- Política para select: usuários autenticados podem ver membros de comunidades
create policy "Usuários autenticados podem ver membros de comunidades"
on public.community_members
for select
to authenticated
using (true);

-- Política para insert: usuários autenticados podem adicionar membros
create policy "Usuários autenticados podem adicionar membros"
on public.community_members
for insert
to authenticated
with check (true);

-- Política para delete: usuários autenticados podem remover membros
create policy "Usuários autenticados podem remover membros"
on public.community_members
for delete
to authenticated
using (true);

-- Criar índices para melhor performance
create index if not exists community_members_community_id_idx on public.community_members(community_id);
create index if not exists community_members_player_id_idx on public.community_members(player_id);
