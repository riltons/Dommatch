import React, { useEffect, useState } from 'react';
import { Alert, Modal, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import styled from 'styled-components/native';
import { colors } from '@/styles/colors';
import { Feather } from '@expo/vector-icons';
import { competitionService } from '@/services/competitionService';
import { communityMembersService } from '@/services/communityMembersService';
import { gameService, Game } from '@/services/gameService';

interface Competition {
    id: string;
    name: string;
    description: string;
    status: string;
}

interface CompetitionMember {
    id: string;
    player_id: string;
    players: {
        id: string;
        name: string;
    };
}

export default function CompetitionDetails() {
    const router = useRouter();
    const { id: communityId, competitionId } = useLocalSearchParams();
    const [competition, setCompetition] = useState<Competition | null>(null);
    const [members, setMembers] = useState<CompetitionMember[]>([]);
    const [communityMembers, setCommunityMembers] = useState<any[]>([]);
    const [games, setGames] = useState<Game[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);
    const [showMembers, setShowMembers] = useState(true);

    useEffect(() => {
        loadCompetitionAndMembers();
    }, []);

    const loadCompetitionAndMembers = async () => {
        try {
            setLoading(true);
            const [competitionData, membersData, communityMembersData, gamesData] = await Promise.all([
                competitionService.getById(competitionId as string),
                competitionService.listMembers(competitionId as string),
                communityMembersService.listMembers(communityId as string),
                gameService.listByCompetition(competitionId as string)
            ]);

            setCompetition(competitionData);
            setMembers(membersData);
            setCommunityMembers(communityMembersData);
            setGames(gamesData);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleToggleMember = async (playerId: string, isCurrentMember: boolean) => {
        try {
            setLoading(true);
            if (isCurrentMember) {
                await competitionService.removeMember(competitionId as string, playerId);
            } else {
                await competitionService.addMember(competitionId as string, playerId);
            }
            await loadCompetitionAndMembers();
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleStartCompetition = async () => {
        try {
            setLoading(true);
            await competitionService.startCompetition(competitionId as string);
            await loadCompetitionAndMembers();
        } catch (error) {
            console.error(error);
            Alert.alert('Erro', 'Não foi possível iniciar a competição');
        } finally {
            setLoading(false);
        }
    };

    if (loading || !competition) {
        return (
            <LoadingContainer>
                <ActivityIndicator size="large" color={colors.primary} />
            </LoadingContainer>
        );
    }

    const canStartCompetition = members.length >= 4 && competition.status === 'pending';

    return (
        <Container>
            <PageHeader>
                <BackButton onPress={() => router.back()}>
                    <Feather name="arrow-left" size={24} color={colors.gray100} />
                </BackButton>
                <HeaderTitle>{competition.name}</HeaderTitle>
            </PageHeader>

            <MainContent>
                <SectionHeader>
                    <SectionTitle>Detalhes</SectionTitle>
                </SectionHeader>

                <Description>{competition.description}</Description>

                <StatusContainer>
                    <StatusLabel>Status:</StatusLabel>
                    <StatusText>
                        {competition.status === 'pending' && 'Aguardando Início'}
                        {competition.status === 'in_progress' && 'Em Andamento'}
                        {competition.status === 'finished' && 'Finalizada'}
                    </StatusText>
                </StatusContainer>

                {competition.status === 'pending' && (
                    <StartButton 
                        onPress={handleStartCompetition}
                        disabled={!canStartCompetition}
                        style={{ opacity: canStartCompetition ? 1 : 0.5 }}
                    >
                        <StartButtonText>
                            {members.length < 4 
                                ? `Adicione mais ${4 - members.length} membro${4 - members.length === 1 ? '' : 's'}`
                                : 'Iniciar Competição'
                            }
                        </StartButtonText>
                    </StartButton>
                )}

                {competition.status === 'in_progress' && (
                    <>
                        <SectionHeader>
                            <SectionTitle>Jogos</SectionTitle>
                        </SectionHeader>

                        {games.length === 0 ? (
                            <EmptyContainer>
                                <EmptyText>Nenhum jogo registrado</EmptyText>
                                <EmptyDescription>
                                    Clique no botão + para adicionar um novo jogo
                                </EmptyDescription>
                            </EmptyContainer>
                        ) : (
                            <GamesList
                                data={games}
                                keyExtractor={(item) => item.id}
                                renderItem={({ item }) => (
                                    <GameCard onPress={() => {}}>
                                        <GameInfo>
                                            <GameTeam>
                                                <GameTeamText>Time 1</GameTeamText>
                                                <GameScore>{item.team1_score}</GameScore>
                                            </GameTeam>
                                            <GameVs>x</GameVs>
                                            <GameTeam>
                                                <GameTeamText>Time 2</GameTeamText>
                                                <GameScore>{item.team2_score}</GameScore>
                                            </GameTeam>
                                        </GameInfo>
                                        <GameStatus>
                                            {item.status === 'pending' && 'Aguardando Início'}
                                            {item.status === 'in_progress' && 'Em Andamento'}
                                            {item.status === 'finished' && 'Finalizado'}
                                        </GameStatus>
                                    </GameCard>
                                )}
                            />
                        )}

                        <NewGameButton onPress={() => router.push(`/comunidade/${communityId}/competicao/${competitionId}/jogo/novo`)}>
                            <Feather name="plus" size={24} color={colors.white} />
                        </NewGameButton>
                    </>
                )}

                <SectionHeader>
                    <SectionTitle>Membros ({members.length})</SectionTitle>
                    <ButtonsContainer>
                        <ToggleButton onPress={() => setShowMembers(!showMembers)}>
                            <Feather 
                                name={showMembers ? "chevron-up" : "chevron-down"} 
                                size={20} 
                                color={colors.gray100} 
                            />
                        </ToggleButton>
                        <ManageButton onPress={() => setModalVisible(true)}>
                            <ManageButtonText>Gerenciar</ManageButtonText>
                            <Feather name="users" size={20} color={colors.gray100} />
                        </ManageButton>
                    </ButtonsContainer>
                </SectionHeader>

                {showMembers && (
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
                )}
            </MainContent>

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
                            data={communityMembers.filter(member => 
                                !members.some(m => m.player_id === member.player_id)
                            )}
                            keyExtractor={(item) => item.id}
                            renderItem={({ item }) => (
                                <PlayerCard onPress={() => handleToggleMember(item.player_id, false)}>
                                    <PlayerInfo>
                                        <PlayerName>{item.players.name}</PlayerName>
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

const MainContent = styled.View`
    flex: 1;
    padding: 20px;
`;

const SectionHeader = styled.View`
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    margin-top: 24px;
    margin-bottom: 16px;
`;

const SectionTitle = styled.Text`
    font-size: 20px;
    font-weight: bold;
    color: ${colors.gray100};
`;

const Description = styled.Text`
    font-size: 16px;
    color: ${colors.gray100};
    margin-bottom: 16px;
`;

const StatusContainer = styled.View`
    flex-direction: row;
    align-items: center;
    margin-bottom: 24px;
`;

const StatusLabel = styled.Text`
    font-size: 16px;
    color: ${colors.gray300};
    margin-right: 8px;
`;

const StatusText = styled.Text`
    font-size: 16px;
    color: ${colors.primary};
    font-weight: bold;
`;

const StartButton = styled.TouchableOpacity`
    background-color: ${colors.primary};
    padding: 16px;
    border-radius: 8px;
    align-items: center;
    justify-content: center;
    margin-bottom: 24px;
`;

const StartButtonText = styled.Text`
    color: ${colors.white};
    font-size: 16px;
    font-weight: bold;
`;

const ButtonsContainer = styled.View`
    flex-direction: row;
    align-items: center;
    gap: 8px;
`;

const ToggleButton = styled.TouchableOpacity`
    padding: 8px;
    border-radius: 8px;
    background-color: ${colors.secondary};
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

const MembersList = styled.FlatList`
    flex-grow: 0;
`;

const MemberCard = styled.View`
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    padding: 12px;
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
    max-height: 80%;
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
    flex-grow: 0;
`;

const PlayerCard = styled.TouchableOpacity`
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    padding: 12px;
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
`;

const EmptyContainer = styled.View`
    padding: 24px;
    align-items: center;
    justify-content: center;
`;

const EmptyText = styled.Text`
    font-size: 16px;
    color: ${colors.gray300};
    margin-bottom: 8px;
`;

const EmptyDescription = styled.Text`
    font-size: 14px;
    color: ${colors.gray300};
    text-align: center;
`;

const GamesList = styled.FlatList`
    margin-top: 16px;
`;

const GameCard = styled.TouchableOpacity`
    background-color: ${colors.secondary};
    border-radius: 8px;
    padding: 16px;
    margin-bottom: 16px;
`;

const GameInfo = styled.View`
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 8px;
`;

const GameTeam = styled.View`
    align-items: center;
    flex: 1;
`;

const GameTeamText = styled.Text`
    font-size: 14px;
    color: ${colors.gray300};
    margin-bottom: 4px;
`;

const GameScore = styled.Text`
    font-size: 24px;
    font-weight: bold;
    color: ${colors.gray100};
`;

const GameVs = styled.Text`
    font-size: 16px;
    color: ${colors.gray300};
    margin-horizontal: 16px;
`;

const GameStatus = styled.Text`
    font-size: 14px;
    color: ${colors.primary};
    text-align: center;
`;

const NewGameButton = styled.TouchableOpacity`
    position: absolute;
    right: 16px;
    bottom: 16px;
    width: 56px;
    height: 56px;
    border-radius: 28px;
    background-color: ${colors.primary};
    align-items: center;
    justify-content: center;
    elevation: 4;
`;
