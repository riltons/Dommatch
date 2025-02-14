import { Stack } from 'expo-router';
import { useAuth } from '../hooks/useAuth';
import { StatusBar, Platform } from "react-native";
import { SafeAreaView } from 'react-native';
import styled from 'styled-components/native';
import { colors } from '../styles/colors';
import { enGB, registerTranslation } from 'react-native-paper-dates';

registerTranslation('en-GB', enGB);

export default function RootLayout() {
    const { session } = useAuth();
    const statusBarHeight = StatusBar.currentHeight || 0;

    return (
        <SafeContainer statusBarHeight={statusBarHeight}>
            <StatusBar 
                barStyle="light-content"
                backgroundColor={colors.backgroundDark}
                translucent
            />
            <Stack screenOptions={{ headerShown: false }}>
                {!session ? (
                    // Rotas públicas
                    <>
                        <Stack.Screen
                            name="login"
                            options={{
                                title: 'Login'
                            }}
                        />
                        <Stack.Screen
                            name="register"
                            options={{
                                title: 'Criar Conta'
                            }} 
                        />
                    </>
                ) : (
                    // Rotas protegidas
                    <Stack.Screen 
                        name="(tabs)" 
                        options={{ 
                            headerShown: false,
                        }} 
                    />
                )}
            </Stack>
        </SafeContainer>
    );
}

const SafeContainer = styled(SafeAreaView)<{ statusBarHeight: number }>`
    flex: 1;
    background-color: ${colors.backgroundDark};
    padding-top: ${Platform.OS === 'android' ? props => props.statusBarHeight : 0}px;
`;
