import { supabase } from '@/lib/supabase';
import { AuthError } from '@supabase/supabase-js';

export interface AuthResponse {
    success: boolean;
    error?: string;
    data?: any;
}

class AuthService {
    private getErrorMessage(error: AuthError): string {
        switch (error.message) {
            case 'Invalid login credentials':
                return 'E-mail ou senha incorretos';
            case 'Email not confirmed':
                return 'E-mail não confirmado. Por favor, verifique sua caixa de entrada';
            case 'User not found':
                return 'Usuário não encontrado';
            case 'Invalid email':
                return 'E-mail inválido';
            case 'Password should be at least 6 characters':
                return 'A senha deve ter pelo menos 6 caracteres';
            default:
                return 'Erro ao realizar operação. Tente novamente.';
        }
    }

    async signIn(email: string, password: string): Promise<AuthResponse> {
        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email: email.trim().toLowerCase(),
                password
            });

            if (error) {
                console.error('Erro no login:', error);
                return {
                    success: false,
                    error: this.getErrorMessage(error)
                };
            }

            return {
                success: true,
                data
            };
        } catch (error: any) {
            console.error('Erro inesperado no login:', error);
            return {
                success: false,
                error: 'Erro inesperado ao fazer login. Tente novamente.'
            };
        }
    }

    async signUp(email: string, password: string): Promise<AuthResponse> {
        try {
            const { data, error } = await supabase.auth.signUp({
                email: email.trim().toLowerCase(),
                password
            });

            if (error) {
                console.error('Erro no cadastro:', error);
                return {
                    success: false,
                    error: this.getErrorMessage(error)
                };
            }

            return {
                success: true,
                data
            };
        } catch (error: any) {
            console.error('Erro inesperado no cadastro:', error);
            return {
                success: false,
                error: 'Erro inesperado ao criar conta. Tente novamente.'
            };
        }
    }

    async signOut(): Promise<AuthResponse> {
        try {
            const { error } = await supabase.auth.signOut();

            if (error) {
                console.error('Erro ao sair:', error);
                return {
                    success: false,
                    error: this.getErrorMessage(error)
                };
            }

            return {
                success: true
            };
        } catch (error: any) {
            console.error('Erro inesperado ao sair:', error);
            return {
                success: false,
                error: 'Erro inesperado ao sair. Tente novamente.'
            };
        }
    }

    async resetPassword(email: string): Promise<AuthResponse> {
        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase());

            if (error) {
                console.error('Erro ao resetar senha:', error);
                return {
                    success: false,
                    error: this.getErrorMessage(error)
                };
            }

            return {
                success: true
            };
        } catch (error: any) {
            console.error('Erro inesperado ao resetar senha:', error);
            return {
                success: false,
                error: 'Erro inesperado ao resetar senha. Tente novamente.'
            };
        }
    }
}

export const authService = new AuthService();
