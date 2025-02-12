import { Stack } from 'expo-router';
import { useAuth } from '../hooks/useAuth';
import { StatusBar } from "expo-status-bar"

export default function RootLayout() {
    const { session } = useAuth();

    return (
        <>
            <StatusBar style="light" />
            <Stack screenOptions={{ headerShown: false }}>
                {/* Rotas públicas */}
                <Stack.Screen name="register" options={{ title: 'Criar Conta' }} />
                <Stack.Screen name="login" options={{ title: 'Login' }} />
                
                {/* Rotas protegidas */}
                <Stack.Screen 
                    name="(tabs)" 
                    options={{ 
                        headerShown: false,
                        // Redireciona para login se não estiver autenticado
                        href: session ? undefined : '/login'
                    }} 
                />
            </Stack>
        </>
    );
}
