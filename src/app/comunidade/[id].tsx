import React, { useEffect, useState } from 'react';
import { Alert, Modal, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import styled from 'styled-components/native';
import { colors } from '@/styles/colors';
import { Feather } from '@expo/vector-icons';
import { communityService } from '@/services/communityService';
import { communityMembersService } from '@/services/communityMembersService';
import { useAuth } from '@/hooks/useAuth';
import { PlayersList } from '@/components/PlayersList';

type Community = {
    id: string;
    name: string;
    description: string;
    created_at: string;
};

type Member = {
    id: string;
    player_id: string;
    community_id: string;
    players: {
        id: string;
        name: string;
    };
};

export default function CommunityDetails() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const { user } = useAuth();
    const [community, setCommunity] = useState<Community | null>(null);
    const [members, setMembers] = useState<Member[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);

    useEffect(() => {
        loadCommunityAndMembers();
    }, []);

    const loadCommunityAndMembers = async () => {
        try {
            const communityId = params.id as string;
            const [communityData, membersData] = await Promise.all([
                communityService.getCommunity(communityId),
                communityMembersService.listMembers(communityId)
            ]);

            setCommunity(communityData);
            setMembers(membersData);
        } catch (error) {
            Alert.alert('Erro', 'Erro ao carregar dados da comunidade');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddMember = async (playerId: string) => {
        if (!community) return;
        
        try {
            await communityMembersService.addMember(community.id, playerId);
            await loadCommunityAndMembers();
            Alert.alert('Sucesso', 'Jogador adicionado à comunidade');
        } catch (error) {
            Alert.alert('Erro', 'Erro ao adicionar jogador');
            console.error(error);
        }
    };

    const handleRemoveMember = async (playerId: string) => {
        if (!community) return;

        try {
            await communityMembersService.removeMember(community.id, playerId);
            await loadCommunityAndMembers();
            Alert.alert('Sucesso', 'Jogador removido da comunidade');
        } catch (error) {
            Alert.alert('Erro', 'Erro ao remover jogador');
            console.error(error);
        }
    };

    if (loading || !community) {
        return (
            <Container>
                <LoadingText>Carregando...</LoadingText>
            </Container>
        );
    }

    return (
        <Container>
            <PageHeader>
                <BackButton onPress={() => router.back()}>
                    <Feather name="arrow-left" size={24} color={colors.gray100} />
                </BackButton>
                <HeaderTitle>{community.name}</HeaderTitle>
            </PageHeader>

            <Content>
                <SectionHeader>
                    <SectionTitle>Detalhes</SectionTitle>
                </SectionHeader>

                <Description>{community.description}</Description>

                <SectionHeader>
                    <SectionTitle>Membros ({members.length})</SectionTitle>
                    <TouchableOpacity onPress={() => setModalVisible(true)}>
                        <Feather name="user-plus" size={24} color={colors.primary} />
                    </TouchableOpacity>
                </SectionHeader>

                <MembersList
                    data={members}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <MemberCard>
                            <MemberInfo>
                                <MemberName>{item.players.name}</MemberName>
                            </MemberInfo>
                            <TouchableOpacity onPress={() => handleRemoveMember(item.player_id)}>
                                <Feather name="user-minus" size={24} color={colors.error} />
                            </TouchableOpacity>
                        </MemberCard>
                    )}
                    ListEmptyComponent={
                        <EmptyContainer>
                            <EmptyText>Nenhum membro encontrado</EmptyText>
                        </EmptyContainer>
                    }
                />
            </Content>

            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <ModalContainer>
                    <ModalContent>
                        <ModalHeader>
                            <ModalTitle>Adicionar Membro</ModalTitle>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <Feather name="x" size={24} color={colors.gray100} />
                            </TouchableOpacity>
                        </ModalHeader>

                        <PlayersList
                            excludeIds={members.map(m => m.player_id)}
                            onSelectPlayer={(playerId) => {
                                handleAddMember(playerId);
                                setModalVisible(false);
                            }}
                        />
                    </ModalContent>
                </ModalContainer>
            </Modal>
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

const Content = styled.View`
    flex: 1;
    padding: 20px;
`;

const SectionHeader = styled.View`
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
    margin-top: 24px;
`;

const SectionTitle = styled.Text`
    font-size: 18px;
    font-weight: bold;
    color: ${colors.gray100};
`;

const Description = styled.Text`
    font-size: 16px;
    color: ${colors.gray300};
    margin-bottom: 24px;
`;

const MembersList = styled.FlatList`
    flex: 1;
`;

const MemberCard = styled.View`
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    padding: 16px;
    background-color: ${colors.secondary};
    border-radius: 8px;
    margin-bottom: 8px;
`;

const MemberInfo = styled.View`
    flex: 1;
`;

const MemberName = styled.Text`
    font-size: 16px;
    color: ${colors.gray100};
    font-weight: 500;
`;

const LoadingText = styled.Text`
    color: ${colors.gray100};
    font-size: 16px;
    text-align: center;
    margin-top: 20px;
`;

const EmptyContainer = styled.View`
    flex: 1;
    justify-content: center;
    align-items: center;
    padding: 20px;
`;

const EmptyText = styled.Text`
    color: ${colors.gray300};
    font-size: 16px;
    text-align: center;
`;

const ModalContainer = styled.View`
    flex: 1;
    background-color: rgba(0, 0, 0, 0.5);
    justify-content: flex-end;
`;

const ModalContent = styled.View`
    background-color: ${colors.backgroundDark};
    border-top-left-radius: 20px;
    border-top-right-radius: 20px;
    padding: 20px;
    height: 80%;
`;

const ModalHeader = styled.View`
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
`;

const ModalTitle = styled.Text`
    font-size: 20px;
    font-weight: bold;
    color: ${colors.gray100};
`;
