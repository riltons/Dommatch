import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import styled from 'styled-components/native';
import { colors } from '../styles/colors';
import { userService } from '../services/userService';
import { useAuth } from '../hooks/useAuth';

export default function Register() {
    const router = useRouter();
    const { signUp } = useAuth();
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({
        email: '',
        password: '',
        fullName: '',
        phoneNumber: '',
        nickname: ''
    });

    const handleRegister = async () => {
        if (!form.email || !form.password || !form.fullName || !form.phoneNumber) {
            Alert.alert('Erro', 'Por favor, preencha todos os campos obrigatórios');
            return;
        }

        setLoading(true);
        try {
            // Verificar se o usuário já existe pelo número de telefone
            const { data: existingUser } = await userService.findByPhoneNumber(form.phoneNumber);

            if (existingUser) {
                // Se já existe como jogador, permite criar conta de admin/organizador
                const { error: signUpError } = await signUp(form.email, form.password);
                if (signUpError) throw signUpError;

                Alert.alert(
                    'Bem-vindo de volta!',
                    'Identificamos que você já é um jogador. Sua conta foi atualizada com privilégios de administrador.'
                );
                router.push('/dashboard');
            } else {
                // Criar novo usuário
                const { error: signUpError } = await signUp(form.email, form.password);
                if (signUpError) throw signUpError;

                // Criar perfil do usuário
                const { error: profileError } = await userService.createProfile(
                    form.email, // temporário até ter o userId da auth
                    form.fullName,
                    form.phoneNumber,
                    form.nickname
                );
                if (profileError) throw profileError;

                Alert.alert('Sucesso', 'Conta criada com sucesso!');
                router.push('/dashboard');
            }
        } catch (error) {
            Alert.alert('Erro', 'Não foi possível criar sua conta. Tente novamente.');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container>
            <Title>Criar Conta</Title>
            
            <Input
                placeholder="Nome completo *"
                value={form.fullName}
                onChangeText={(text) => setForm(prev => ({ ...prev, fullName: text }))}
                placeholderTextColor={colors.gray400}
            />
            
            <Input
                placeholder="E-mail *"
                value={form.email}
                onChangeText={(text) => setForm(prev => ({ ...prev, email: text }))}
                keyboardType="email-address"
                autoCapitalize="none"
                placeholderTextColor={colors.gray400}
            />
            
            <Input
                placeholder="Senha *"
                value={form.password}
                onChangeText={(text) => setForm(prev => ({ ...prev, password: text }))}
                secureTextEntry
                placeholderTextColor={colors.gray400}
            />
            
            <Input
                placeholder="Telefone *"
                value={form.phoneNumber}
                onChangeText={(text) => setForm(prev => ({ ...prev, phoneNumber: text }))}
                keyboardType="phone-pad"
                placeholderTextColor={colors.gray400}
            />
            
            <Input
                placeholder="Apelido (opcional)"
                value={form.nickname}
                onChangeText={(text) => setForm(prev => ({ ...prev, nickname: text }))}
                placeholderTextColor={colors.gray400}
            />
            
            <RegisterButton onPress={handleRegister} disabled={loading}>
                <ButtonText>{loading ? 'Criando conta...' : 'Criar Conta'}</ButtonText>
            </RegisterButton>

            <LoginLink onPress={() => router.push('/login')}>
                <LinkText>Já tem uma conta? Faça login</LinkText>
            </LoginLink>
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

const RegisterButton = styled.TouchableOpacity`
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

const LoginLink = styled.TouchableOpacity`
    margin-top: 16px;
`;

const LinkText = styled.Text`
    color: ${colors.gray200};
    font-size: 14px;
    text-align: center;
`;
