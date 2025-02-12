-- Remover políticas existentes
DROP POLICY IF EXISTS "Usuários podem ver todos os perfis" ON user_profiles;
DROP POLICY IF EXISTS "Usuários só podem editar seu próprio perfil" ON user_profiles;

-- Criar novas políticas
CREATE POLICY "Usuários podem criar seu próprio perfil"
    ON user_profiles 
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar seu próprio perfil"
    ON user_profiles 
    FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Todos podem ver perfis"
    ON user_profiles 
    FOR SELECT
    USING (true);

-- Habilitar RLS na tabela
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
