-- Drop existing table if exists
-- DROP TABLE IF EXISTS communities;

-- Create the communities table
-- CREATE TABLE communities (
--     id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
--     name TEXT NOT NULL,
--     description TEXT,
--     owner_id UUID REFERENCES auth.users(id) NOT NULL,
--     created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
--     updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
--     members_count INTEGER DEFAULT 0,
--     games_count INTEGER DEFAULT 0
-- );

-- Add updated_at column if not exists
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'communities' 
        AND column_name = 'updated_at'
    ) THEN
        ALTER TABLE communities 
        ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW());
    END IF;
END $$;

-- Drop existing trigger and function
DROP TRIGGER IF EXISTS update_communities_updated_at ON communities;
DROP FUNCTION IF EXISTS update_updated_at_column CASCADE;

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'UPDATE') THEN
        NEW.updated_at = CURRENT_TIMESTAMP;
        RETURN NEW;
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updating timestamps
CREATE TRIGGER update_communities_updated_at
    BEFORE UPDATE ON communities
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Drop existing policies
DROP POLICY IF EXISTS "Communities are viewable by everyone" ON communities;
DROP POLICY IF EXISTS "Users can create communities" ON communities;
DROP POLICY IF EXISTS "Users can update their own communities" ON communities;
DROP POLICY IF EXISTS "Users can delete their own communities" ON communities;

-- Enable RLS
ALTER TABLE communities ENABLE ROW LEVEL SECURITY;

-- Policy for viewing communities (everyone can view)
CREATE POLICY "Communities are viewable by everyone" ON communities
    FOR SELECT USING (true);

-- Policy for inserting communities (authenticated users can create)
CREATE POLICY "Users can create communities" ON communities
    FOR INSERT WITH CHECK (auth.uid() = owner_id);

-- Policy for updating communities (only owner can update)
CREATE POLICY "Users can update their own communities" ON communities
    FOR UPDATE USING (auth.uid() = owner_id);

-- Policy for deleting communities (only owner can delete)
CREATE POLICY "Users can delete their own communities" ON communities
    FOR DELETE USING (auth.uid() = owner_id);
