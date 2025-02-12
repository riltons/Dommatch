import React, { useState } from 'react';
import { Alert } from 'react-native';
import { useRouter } from 'expo-router';
import styled from 'styled-components/native';
import { colors } from '../styles/colors';
import { useAuth } from '../hooks/useAuth';

export default function Login() {
    const router = useRouter();
    const { signIn } = useAuth();
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({
        email: '',
        password: ''
    });

    const handleLogin = async () => {
        if (!form.email || !form.password) {
            Alert.alert('Erro', 'Por favor, preencha todos os campos');
            return;
        }

        setLoading(true);
        try {
            const { error } = await signIn(form.email, form.password);
            if (error) throw error;

            router.push('/dashboard');
        } catch (error) {
            Alert.alert('Erro', 'E-mail ou senha inválidos');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container>
            <Title>Entrar</Title>
            
            <Input
                placeholder="E-mail"
                value={form.email}
                onChangeText={(text) => setForm(prev => ({ ...prev, email: text }))}
                keyboardType="email-address"
                autoCapitalize="none"
                placeholderTextColor={colors.gray400}
            />
            
            <Input
                placeholder="Senha"
                value={form.password}
                onChangeText={(text) => setForm(prev => ({ ...prev, password: text }))}
                secureTextEntry
                placeholderTextColor={colors.gray400}
            />
            
            <LoginButton onPress={handleLogin} disabled={loading}>
                <ButtonText>{loading ? 'Entrando...' : 'Entrar'}</ButtonText>
            </LoginButton>

            <RegisterLink onPress={() => router.push('/register')}>
                <LinkText>Não tem uma conta? Cadastre-se</LinkText>
            </RegisterLink>
        </Container>
    );
}

const Container = styled.View`
    flex: 1;
    padding: 20px;
    background-color: ${colors.backgroundDark};
    justify-content: center;
`;

const Title = styled.Text`
    font-size: 24px;
    font-weight: bold;
    color: ${colors.gray100};
    margin-bottom: 24px;
    text-align: center;
`;

const Input = styled.TextInput`
    background-color: ${colors.backgroundLight};
    padding: 16px;
    border-radius: 8px;
    margin-bottom: 16px;
    color: ${colors.gray100};
    font-size: 16px;
`;

const LoginButton = styled.TouchableOpacity`
    background-color: ${colors.accent};
    padding: 16px;
    border-radius: 8px;
    margin-top: 8px;
    opacity: ${props => props.disabled ? 0.7 : 1};
`;

const ButtonText = styled.Text`
    color: ${colors.gray100};
    font-size: 16px;
    font-weight: bold;
    text-align: center;
`;

const RegisterLink = styled.TouchableOpacity`
    margin-top: 16px;
`;

const LinkText = styled.Text`
    color: ${colors.gray200};
    font-size: 14px;
    text-align: center;
`;
