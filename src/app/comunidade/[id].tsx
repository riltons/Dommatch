import React, { useEffect, useState } from 'react';
import { Alert, Modal, TouchableOpacity, ActivityIndicator, Animated } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import styled from 'styled-components/native';
import { colors } from '@/styles/colors';
import { Feather } from '@expo/vector-icons';
import { communityService } from '@/services/communityService';
import { communityMembersService } from '@/services/communityMembersService';
import { playersService } from '@/services/playersService';

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

type Player = {
    id: string;
    name: string;
};

export default function CommunityDetails() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const [community, setCommunity] = useState<Community | null>(null);
    const [members, setMembers] = useState<Member[]>([]);
    const [allPlayers, setAllPlayers] = useState<Player[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);
    const [showMembers, setShowMembers] = useState(false);
    const [rotateAnim] = useState(new Animated.Value(0));

    const toggleMembers = () => {
        setShowMembers(!showMembers);
        Animated.spring(rotateAnim, {
            toValue: showMembers ? 0 : 1,
            useNativeDriver: true,
        }).start();
    };

    const rotate = rotateAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '180deg'],
    });

    useEffect(() => {
        loadCommunityAndMembers();
    }, []);

    const loadCommunityAndMembers = async () => {
        try {
            const communityId = params.id as string;
            const [communityData, membersData, playersData] = await Promise.all([
                communityService.getCommunity(communityId),
                communityMembersService.listMembers(communityId),
                playersService.listPlayers()
            ]);

            setCommunity(communityData);
            setMembers(membersData);
            setAllPlayers(playersData.data || []);
        } catch (error) {
            Alert.alert('Erro', 'Erro ao carregar dados da comunidade');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleToggleMember = async (playerId: string, isCurrentMember: boolean) => {
        if (!community) return;
        
        try {
            setLoading(true);
            if (isCurrentMember) {
                await communityMembersService.removeMember(community.id, playerId);
            } else {
                await communityMembersService.addMember(community.id, playerId);
            }
            await loadCommunityAndMembers();
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    if (loading || !community) {
        return (
            <Container>
                <LoadingContainer>
                    <ActivityIndicator size="large" color={colors.primary} />
                </LoadingContainer>
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

                <MembersSection>
                    <MembersHeader 
                        onPress={toggleMembers}
                        activeOpacity={0.7}
                    >
                        <HeaderLeft>
                            <SectionTitle>Membros ({members.length})</SectionTitle>
                            <AnimatedIcon style={{ transform: [{ rotate }] }}>
                                <Feather name="chevron-down" size={24} color={colors.gray100} />
                            </AnimatedIcon>
                        </HeaderLeft>
                        <ManageButton 
                            onPress={(e) => {
                                e.stopPropagation();
                                setModalVisible(true);
                            }}
                            activeOpacity={0.7}
                        >
                            <ManageButtonText>Gerenciar</ManageButtonText>
                            <Feather name="users" size={20} color={colors.gray100} />
                        </ManageButton>
                    </MembersHeader>

                    {showMembers && (
                        <MembersListContainer>
                            <MembersList
                                data={members}
                                keyExtractor={(item) => item.id}
                                renderItem={({ item }) => (
                                    <MemberCard>
                                        <MemberInfo>
                                            <MemberName>{item.players.name}</MemberName>
                                        </MemberInfo>
                                        <TouchableOpacity 
                                            onPress={() => handleToggleMember(item.player_id, true)}
                                            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                                        >
                                            <Feather name="user-minus" size={20} color={colors.error} />
                                        </TouchableOpacity>
                                    </MemberCard>
                                )}
                                ListEmptyComponent={
                                    <EmptyContainer>
                                        <EmptyText>Nenhum membro encontrado</EmptyText>
                                    </EmptyContainer>
                                }
                            />
                        </MembersListContainer>
                    )}
                </MembersSection>
            </Content>

            <FAB onPress={() => router.push({
                pathname: '/comunidade/[id]/competicao/nova',
                params: { id: community.id }
            })}>
                <Feather name="award" size={24} color={colors.gray100} />
            </FAB>

            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <ModalContainer>
                    <ModalContent>
                        <ModalHeader>
                            <ModalTitle>Adicionar Membros</ModalTitle>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <Feather name="x" size={24} color={colors.gray100} />
                            </TouchableOpacity>
                        </ModalHeader>

                        <PlayersList
                            data={allPlayers.filter(player => 
                                !members.some(member => member.player_id === player.id)
                            )}
                            keyExtractor={(item) => item.id}
                            renderItem={({ item }) => (
                                <PlayerCard onPress={() => handleToggleMember(item.id, false)}>
                                    <PlayerInfo>
                                        <PlayerName>{item.name}</PlayerName>
                                    </PlayerInfo>
                                    <Feather 
                                        name="user-plus" 
                                        size={20} 
                                        color={colors.primary}
                                    />
                                </PlayerCard>
                            )}
                            ListEmptyComponent={
                                <EmptyContainer>
                                    <EmptyText>Nenhum jogador disponível</EmptyText>
                                </EmptyContainer>
                            }
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

const LoadingContainer = styled.View`
    flex: 1;
    justify-content: center;
    align-items: center;
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

const MembersSection = styled.View`
    margin-top: 24px;
`;

const MembersHeader = styled.TouchableOpacity`
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    padding: 12px;
    background-color: ${colors.secondary};
    border-radius: 8px;
`;

const HeaderLeft = styled.View`
    flex-direction: row;
    align-items: center;
`;

const AnimatedIcon = styled(Animated.View)`
    margin-left: 8px;
`;

const MembersListContainer = styled.View`
    margin-top: 8px;
    background-color: ${colors.secondary};
    border-radius: 8px;
    padding: 12px;
`;

const MembersList = styled.FlatList`
    flex-grow: 0;
`;

const MemberCard = styled.View`
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    padding: 12px;
    background-color: ${colors.backgroundDark};
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

const PlayersList = styled.FlatList`
    flex: 1;
`;

const PlayerCard = styled.TouchableOpacity`
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    padding: 16px;
    background-color: ${colors.secondary};
    border-radius: 8px;
    margin-bottom: 8px;
`;

const PlayerInfo = styled.View`
    flex: 1;
`;

const PlayerName = styled.Text`
    font-size: 16px;
    color: ${colors.gray100};
    font-weight: 500;
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

const FAB = styled.TouchableOpacity`
    position: absolute;
    right: 16px;
    bottom: 16px;
    width: 56px;
    height: 56px;
    border-radius: 28px;
    background-color: ${colors.primary};
    align-items: center;
    justify-content: center;
    elevation: 5;
    shadow-color: ${colors.primary};
    shadow-offset: 0px 2px;
    shadow-opacity: 0.25;
    shadow-radius: 3.84px;
`;

const ManageButton = styled.TouchableOpacity`
    flex-direction: row;
    align-items: center;
    background-color: ${colors.primary};
    padding: 8px 16px;
    border-radius: 8px;
`;

const ManageButtonText = styled.Text`
    color: ${colors.gray100};
    font-size: 14px;
    font-weight: 500;
    margin-right: 8px;
`;
