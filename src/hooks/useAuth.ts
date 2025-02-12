import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Session } from '@supabase/supabase-js';

export function useAuth() {
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Verifica a sessão atual
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setLoading(false);
        });

        // Escuta mudanças na autenticação
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            setLoading(false);
        });

        return () => subscription.unsubscribe();
    }, []);

    return {
        session,
        loading,
        user: session?.user ?? null,
        signIn: async (email: string, password: string) => {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });
            return { error };
        },
        signUp: async (email: string, password: string) => {
            const { error } = await supabase.auth.signUp({
                email,
                password,
            });
            return { error };
        },
        signOut: async () => {
            const { error } = await supabase.auth.signOut();
            return { error };
        },
    };
}
