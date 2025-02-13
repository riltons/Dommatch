-- Altera o tamanho da coluna phone para 11 caracteres
ALTER TABLE players
ALTER COLUMN phone TYPE VARCHAR(11);

-- Adiciona restrição UNIQUE se ainda não existir
DO $$ 
BEGIN 
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'players_phone_key'
    ) THEN
        ALTER TABLE players
        ADD CONSTRAINT players_phone_key UNIQUE (phone);
    END IF;
END $$;

-- Remover tabela se existir
DROP TABLE IF EXISTS players CASCADE;

-- Criar tabela de jogadores
CREATE TABLE players (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    nickname TEXT,
    phone TEXT UNIQUE,
    created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Habilitar RLS
ALTER TABLE players ENABLE ROW LEVEL SECURITY;

-- Criar políticas de segurança
CREATE POLICY "players_select_policy"
ON players FOR SELECT
USING (
    created_by = auth.uid() OR
    EXISTS (
        SELECT 1 FROM community_members cm
        JOIN communities c ON c.id = cm.community_id
        WHERE cm.player_id IN (
            SELECT id FROM players WHERE created_by = auth.uid()
        )
        AND EXISTS (
            SELECT 1 FROM community_members
            WHERE community_id = c.id
            AND player_id = players.id
        )
    )
);

CREATE POLICY "players_insert_policy"
ON players FOR INSERT
WITH CHECK (created_by = auth.uid());

CREATE POLICY "players_update_policy"
ON players FOR UPDATE
USING (created_by = auth.uid())
WITH CHECK (created_by = auth.uid());

CREATE POLICY "players_delete_policy"
ON players FOR DELETE
USING (created_by = auth.uid());
