import React, { useEffect, useState, useCallback } from 'react';
import { Alert, Modal, TouchableOpacity, ActivityIndicator, Animated } from 'react-native';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import styled from 'styled-components/native';
import { colors } from '@/styles/colors';
import { Feather } from '@expo/vector-icons';
import { communityService } from '@/services/communityService';
import { communityMembersService } from '@/services/communityMembersService';
import { playersService } from '@/services/playersService';
import { competitionService } from '@/services/competitionService';

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

type Competition = {
    id: string;
    name: string;
    description: string;
    start_date: string;
};

export default function CommunityDetails() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const [community, setCommunity] = useState<Community | null>(null);
    const [members, setMembers] = useState<Member[]>([]);
    const [allPlayers, setAllPlayers] = useState<Player[]>([]);
    const [competitions, setCompetitions] = useState<Competition[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
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

    const loadData = async () => {
        try {
            setLoading(true);
            const communityData = await communityService.getById(params.id as string);
            const membersData = await communityMembersService.listMembers(params.id as string);
            const playersData = await playersService.list();
            const competitionsData = await competitionService.listByCommunity(params.id as string);

            setCommunity(communityData);
            setMembers(membersData);
            setAllPlayers(playersData);
            setCompetitions(competitionsData);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [params.id]);

    useFocusEffect(
        useCallback(() => {
            loadData();
        }, [params.id])
    );

    const handleToggleMember = async (playerId: string, isCurrentMember: boolean) => {
        if (!community) return;
        
        try {
            setLoading(true);
            if (isCurrentMember) {
                await communityMembersService.removeMember(community.id, playerId);
            } else {
                await communityMembersService.addMember(community.id, playerId);
            }
            await loadData();
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

            <MainContent>
                <SectionHeader>
                    <SectionTitle>Detalhes</SectionTitle>
                </SectionHeader>

                <Description>{community.description}</Description>

                <MembersSection>
                    <SectionHeader>
                        <SectionTitle>Membros ({members.length})</SectionTitle>
                        <ManageButton onPress={() => setModalVisible(true)}>
                            <ManageButtonText>Gerenciar</ManageButtonText>
                            <Feather name="users" size={20} color={colors.gray100} />
                        </ManageButton>
                    </SectionHeader>

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

                <SectionHeader>
                    <SectionTitle>Competições</SectionTitle>
                </SectionHeader>

                <CompetitionsList
                    data={competitions}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <CompetitionCard 
                            onPress={() => router.push({
                                pathname: '/comunidade/[id]/competicao/[competitionId]',
                                params: { 
                                    id: community.id,
                                    competitionId: item.id 
                                }
                            })}
                        >
                            <CompetitionInfo>
                                <CompetitionName>{item.name}</CompetitionName>
                                {item.description && (
                                    <CompetitionDescription>
                                        {item.description}
                                    </CompetitionDescription>
                                )}
                                <CompetitionDetails>
                                    <CompetitionDate>
                                        <Feather name="calendar" size={14} color={colors.gray300} />
                                        <CompetitionDateText>
                                            {new Date(item.start_date).toLocaleDateString('pt-BR')}
                                        </CompetitionDateText>
                                    </CompetitionDate>
                                    <CompetitionStatus>
                                        {new Date(item.start_date) > new Date() ? (
                                            <StatusBadge status="upcoming">
                                                <StatusText>Em breve</StatusText>
                                            </StatusBadge>
                                        ) : (
                                            <StatusBadge status="active">
                                                <StatusText>Em andamento</StatusText>
                                            </StatusBadge>
                                        )}
                                    </CompetitionStatus>
                                </CompetitionDetails>
                            </CompetitionInfo>
                            <Feather name="chevron-right" size={24} color={colors.gray300} />
                        </CompetitionCard>
                    )}
                    ListEmptyComponent={
                        <EmptyContainer>
                            <EmptyText>Nenhuma competição encontrada</EmptyText>
                        </EmptyContainer>
                    }
                />
            </MainContent>

            <FAB onPress={() => router.push({
                pathname: '/comunidade/[id]/competicao/nova',
                params: { id: community.id }
            })}>
                <Feather name="plus" size={24} color={colors.gray100} />
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

const MainContent = styled.View`
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

const CompetitionsList = styled.FlatList`
    flex-grow: 0;
    margin-top: 8px;
`;

const CompetitionCard = styled.TouchableOpacity`
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    padding: 16px;
    background-color: ${colors.secondary};
    border-radius: 8px;
    margin-bottom: 8px;
`;

const CompetitionInfo = styled.View`
    flex: 1;
    margin-right: 16px;
`;

const CompetitionName = styled.Text`
    font-size: 16px;
    font-weight: bold;
    color: ${colors.gray100};
`;

const CompetitionDescription = styled.Text`
    font-size: 14px;
    color: ${colors.gray300};
    margin-top: 4px;
`;

const CompetitionDetails = styled.View`
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    margin-top: 8px;
`;

const CompetitionDate = styled.View`
    flex-direction: row;
    align-items: center;
`;

const CompetitionDateText = styled.Text`
    color: ${colors.gray300};
    font-size: 14px;
    margin-left: 4px;
`;

const CompetitionStatus = styled.View`
    margin-left: 16px;
`;

const StatusBadge = styled.View<{ status: 'upcoming' | 'active' }>`
    background-color: ${props => props.status === 'upcoming' ? colors.primary : colors.success};
    padding: 4px 8px;
    border-radius: 4px;
`;

const StatusText = styled.Text`
    color: ${colors.gray100};
    font-size: 12px;
    font-weight: bold;
`;
