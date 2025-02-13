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

-- Cria as políticas de segurança
CREATE POLICY "Usuários autenticados podem visualizar jogadores"
ON players FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Usuários podem criar seus próprios jogadores"
ON players FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar seus próprios jogadores"
ON players FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem deletar seus próprios jogadores"
ON players FOR DELETE
TO authenticated
USING (auth.uid() = user_id);
