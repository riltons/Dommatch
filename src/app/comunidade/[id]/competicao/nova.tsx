import React, { useState } from 'react';
import { Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import styled from 'styled-components/native';
import { colors } from '@/styles/colors';
import { Feather } from '@expo/vector-icons';
import { competitionService } from '@/services/competitionService';
import { ActivityIndicator } from 'react-native';

export default function NovaCompeticao() {
    const router = useRouter();
    const { id: communityId } = useLocalSearchParams();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
    });

    const handleSave = async () => {
        if (!formData.name.trim()) {
            Alert.alert('Erro', 'O nome da competição é obrigatório');
            return;
        }

        try {
            setLoading(true);
            console.log('Dados do formulário:', {
                ...formData,
                community_id: communityId,
            });

            await competitionService.create({
                name: formData.name.trim(),
                description: formData.description.trim(),
                community_id: communityId as string,
            });
            router.back();
        } catch (error: any) {
            console.error('Erro detalhado:', error);
            Alert.alert(
                'Erro',
                error?.message || 'Erro ao criar competição. Tente novamente.'
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container>
            <PageHeader>
                <BackButton onPress={() => router.back()}>
                    <Feather name="arrow-left" size={24} color={colors.gray100} />
                </BackButton>
                <HeaderTitle>Nova Competição</HeaderTitle>
            </PageHeader>

            <Content>
                <Form>
                    <FormGroup>
                        <Label>Nome</Label>
                        <Input
                            value={formData.name}
                            onChangeText={(text) => setFormData(prev => ({ ...prev, name: text }))}
                            placeholder="Nome da competição"
                            placeholderTextColor={colors.gray300}
                        />
                    </FormGroup>

                    <FormGroup>
                        <Label>Descrição</Label>
                        <Input
                            value={formData.description}
                            onChangeText={(text) => setFormData(prev => ({ ...prev, description: text }))}
                            placeholder="Descrição da competição"
                            placeholderTextColor={colors.gray300}
                            multiline
                            numberOfLines={4}
                            textAlignVertical="top"
                        />
                    </FormGroup>

                    <SaveButton onPress={handleSave} disabled={loading}>
                        {loading ? (
                            <LoadingContainer>
                                <ActivityIndicator color={colors.gray100} />
                            </LoadingContainer>
                        ) : (
                            <SaveButtonText>Criar Competição</SaveButtonText>
                        )}
                    </SaveButton>
                </Form>
            </Content>
        </Container>
    );
}

const Container = styled.View`
    flex: 1;
    background-color: ${colors.backgroundDark};
`;

const PageHeader = styled.View`
    padding: 20px;
    background-color: ${colors.secondary};
    padding-top: 60px;
    flex-direction: row;
    align-items: center;
`;

const BackButton = styled.TouchableOpacity`
    margin-right: 16px;
`;

const HeaderTitle = styled.Text`
    font-size: 24px;
    font-weight: bold;
    color: ${colors.gray100};
    flex: 1;
`;

const Content = styled.ScrollView.attrs({
    contentContainerStyle: {
        flexGrow: 1,
        padding: 20,
    },
})``;

const Form = styled.View`
    flex: 1;
`;

const FormGroup = styled.View`
    margin-bottom: 20px;
`;

const Label = styled.Text`
    font-size: 16px;
    color: ${colors.gray100};
    margin-bottom: 8px;
`;

const Input = styled.TextInput`
    background-color: ${colors.secondary};
    border-radius: 8px;
    padding: 12px;
    font-size: 16px;
    color: ${colors.gray100};
    min-height: ${props => props.multiline ? '120px' : '48px'};
`;

const SaveButton = styled.TouchableOpacity<{ disabled?: boolean }>`
    background-color: ${props => props.disabled ? colors.gray500 : colors.primary};
    padding: 16px;
    border-radius: 8px;
    align-items: center;
    margin-top: 20px;
    opacity: ${props => props.disabled ? 0.7 : 1};
`;

const SaveButtonText = styled.Text`
    color: ${colors.gray100};
    font-size: 16px;
    font-weight: bold;
`;

const LoadingContainer = styled.View`
    height: 24px;
    justify-content: center;
    align-items: center;
`;
