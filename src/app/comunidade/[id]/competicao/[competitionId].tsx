import React, { useEffect, useState, useCallback } from 'react';
import { Alert, Modal, TouchableOpacity, ActivityIndicator, Text, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import styled from 'styled-components/native';
import { colors } from '@/styles/colors';
import { Feather } from '@expo/vector-icons';
import { competitionService } from '@/services/competitionService';
import { communityMembersService } from '@/services/communityMembersService';
import { gameService, Game } from '@/services/gameService';
import { playerService } from '@/services/playerService';

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

interface Member {
    id: string;
    player_id: string;
    players: {
        id: string;
        name: string;
    };
}

interface CompetitionResult {
    players: {
        id: string;
        name: string;
        score: number;
        wins: number;
        losses: number;
        buchudas: number;
        buchudasDeRe: number;
    }[];
    pairs: {
        players: string[];
        score: number;
        wins: number;
        losses: number;
        buchudas: number;
        buchudasDeRe: number;
    }[];
}

export default function CompetitionDetails() {
    const router = useRouter();
    const { id: communityId, competitionId } = useLocalSearchParams();
    const [competition, setCompetition] = useState<Competition | null>(null);
    const [games, setGames] = useState<Game[]>([]);
    const [members, setMembers] = useState<Member[]>([]);
    const [communityMembers, setCommunityMembers] = useState<Member[]>([]);
    const [isMembersExpanded, setIsMembersExpanded] = useState(false);
    const [isAddMemberModalVisible, setIsAddMemberModalVisible] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [canFinish, setCanFinish] = useState(false);
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState<CompetitionResult | null>(null);

    const loadCompetitionAndMembers = useCallback(async () => {
        try {
            setIsLoading(true);
            const [competitionData, membersData, communityMembersData] = await Promise.all([
                competitionService.getById(competitionId as string),
                competitionService.listMembers(competitionId as string),
                communityMembersService.listMembers(communityId as string)
            ]);

            setCompetition(competitionData);
            setMembers(membersData);
            setCommunityMembers(communityMembersData);
            await loadGames();
        } catch (error) {
            console.error(error);
            Alert.alert('Erro', 'Não foi possível carregar os dados da competição');
        } finally {
            setIsLoading(false);
        }
    }, [competitionId, communityId]);

    const loadGames = useCallback(async () => {
        try {
            const gamesData = await gameService.listByCompetition(competitionId as string);
            const gamesWithPlayers = await Promise.all(gamesData.map(async (game) => {
                const team1Players = await Promise.all(game.team1.map(async (playerId) => {
                    const player = await playerService.getById(playerId);
                    return player;
                }));
                const team2Players = await Promise.all(game.team2.map(async (playerId) => {
                    const player = await playerService.getById(playerId);
                    return player;
                }));
                return {
                    ...game,
                    team1_players: team1Players,
                    team2_players: team2Players
                };
            }));
            setGames(gamesWithPlayers);
        } catch (error) {
            console.error('Erro ao carregar jogos:', error);
            Alert.alert('Erro', 'Não foi possível carregar os jogos');
        }
    }, [competitionId]);

    useEffect(() => {
        loadCompetitionAndMembers();
        checkCanFinish();
    }, []);

    const checkCanFinish = async () => {
        try {
            const canFinish = await competitionService.canFinishCompetition(competitionId as string);
            setCanFinish(canFinish);
        } catch (error) {
            console.error('Erro ao verificar status:', error);
        }
    };

    const handleFinishCompetition = async () => {
        try {
            setLoading(true);
            const results = await competitionService.finishCompetition(competitionId as string);
            setResults(results);
            loadCompetitionAndMembers(); // Recarrega para atualizar o status
        } catch (error) {
            console.error('Erro ao finalizar competição:', error);
            Alert.alert('Erro', 'Não foi possível finalizar a competição');
        } finally {
            setLoading(false);
        }
    };

    const handleToggleMember = async (playerId: string, isCurrentMember: boolean) => {
        try {
            setIsLoading(true);
            if (isCurrentMember) {
                await competitionService.removeMember(competitionId as string, playerId);
            } else {
                await competitionService.addMember(competitionId as string, playerId);
            }
            await loadCompetitionAndMembers();
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleStartCompetition = async () => {
        try {
            setIsLoading(true);
            await competitionService.startCompetition(competitionId as string);
            await loadCompetitionAndMembers();
        } catch (error) {
            console.error(error);
            Alert.alert('Erro', 'Não foi possível iniciar a competição');
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading || !competition) {
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
                <ContentContainer>
                    <SectionHeader>
                        <SectionTitle>Detalhes</SectionTitle>
                        <CompetitionStatus status={competition?.status || 'pending'}>
                            {competition?.status === 'pending' && 'Aguardando Início'}
                            {competition?.status === 'in_progress' && 'Em Andamento'}
                            {competition?.status === 'finished' && 'Finalizado'}
                        </CompetitionStatus>
                    </SectionHeader>

                    {competition?.status === 'in_progress' && canFinish && (
                        <FinishButton onPress={handleFinishCompetition} disabled={loading}>
                            {loading ? (
                                <ActivityIndicator color={colors.gray100} />
                            ) : (
                                <>
                                    <Feather name="flag" size={24} color={colors.gray100} />
                                    <FinishButtonText>Encerrar Competição</FinishButtonText>
                                </>
                            )}
                        </FinishButton>
                    )}

                    {competition?.status === 'finished' && results ? (
                        <>
                            <Section>
                                <SectionTitle>Classificação Individual</SectionTitle>
                                {results.players.map((player, index) => (
                                    <PlayerCard key={player.id}>
                                        <Position>{index + 1}º</Position>
                                        <PlayerInfo>
                                            <PlayerName>{player.name}</PlayerName>
                                            <PlayerStats>
                                                <StatItem>
                                                    <StatLabel>Pontos:</StatLabel>
                                                    <StatValue>{player.score}</StatValue>
                                                </StatItem>
                                                <StatItem>
                                                    <StatLabel>V/D:</StatLabel>
                                                    <StatValue>{player.wins}/{player.losses}</StatValue>
                                                </StatItem>
                                                {player.buchudas > 0 && (
                                                    <StatItem>
                                                        <StatLabel>Buchudas:</StatLabel>
                                                        <StatValue>{player.buchudas}</StatValue>
                                                    </StatItem>
                                                )}
                                                {player.buchudasDeRe > 0 && (
                                                    <StatItem>
                                                        <StatLabel>Buchudas de Ré:</StatLabel>
                                                        <StatValue>{player.buchudasDeRe}</StatValue>
                                                    </StatItem>
                                                )}
                                            </PlayerStats>
                                        </PlayerInfo>
                                    </PlayerCard>
                                ))}
                            </Section>

                            <Section>
                                <SectionTitle>Classificação por Duplas</SectionTitle>
                                {results.pairs.map((pair, index) => (
                                    <PairCard key={pair.players.join('_')}>
                                        <Position>{index + 1}º</Position>
                                        <PairInfo>
                                            <PairPlayers>
                                                {pair.players.map(playerId => {
                                                    const player = results.players.find(p => p.id === playerId);
                                                    return player?.name;
                                                }).join(' e ')}
                                            </PairPlayers>
                                            <PairStats>
                                                <StatItem>
                                                    <StatLabel>Pontos:</StatLabel>
                                                    <StatValue>{pair.score}</StatValue>
                                                </StatItem>
                                                <StatItem>
                                                    <StatLabel>V/D:</StatLabel>
                                                    <StatValue>{pair.wins}/{pair.losses}</StatValue>
                                                </StatItem>
                                                {pair.buchudas > 0 && (
                                                    <StatItem>
                                                        <StatLabel>Buchudas:</StatLabel>
                                                        <StatValue>{pair.buchudas}</StatValue>
                                                    </StatItem>
                                                )}
                                                {pair.buchudasDeRe > 0 && (
                                                    <StatItem>
                                                        <StatLabel>Buchudas de Ré:</StatLabel>
                                                        <StatValue>{pair.buchudasDeRe}</StatValue>
                                                    </StatItem>
                                                )}
                                            </PairStats>
                                        </PairInfo>
                                    </PairCard>
                                ))}
                            </Section>
                        </>
                    ) : (
                        <>
                            <Description>{competition?.description}</Description>

                            <Section>
                                <SectionHeader>
                                    <TouchableOpacity 
                                        onPress={() => setIsMembersExpanded(!isMembersExpanded)}
                                        style={{ flexDirection: 'row', alignItems: 'center' }}
                                    >
                                        <SectionTitle>Membros ({members.length})</SectionTitle>
                                        <Feather 
                                            name={isMembersExpanded ? "chevron-up" : "chevron-down"} 
                                            size={20} 
                                            color={colors.gray100} 
                                            style={{ marginLeft: 8 }}
                                        />
                                    </TouchableOpacity>
                                    <ManageButton onPress={() => setIsAddMemberModalVisible(true)}>
                                        <ManageButtonText>Gerenciar</ManageButtonText>
                                        <Feather name="users" size={20} color={colors.gray100} />
                                    </ManageButton>
                                </SectionHeader>

                                {isMembersExpanded && (
                                    <MembersScrollView>
                                        <MembersList>
                                            {members.map((member) => (
                                                <MemberItem key={member.id}>
                                                    <MemberInfo>
                                                        <MemberName>{member.players.name}</MemberName>
                                                    </MemberInfo>
                                                </MemberItem>
                                            ))}
                                        </MembersList>
                                    </MembersScrollView>
                                )}
                            </Section>

                            {competition?.status === 'pending' && (
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

                            {competition?.status === 'in_progress' && (
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
                                                <GameCard 
                                                    key={item.id}
                                                    onPress={() => router.push(`/comunidade/${communityId}/competicao/${competitionId}/jogo/${item.id}`)}
                                                >
                                                    <GameTeams>
                                                        <TeamScore>
                                                            <Score>{item.team1_score}</Score>
                                                            <TeamName>
                                                                {item.team1_players?.map((player, index) => (
                                                                    player.name + (index < item.team1_players.length - 1 ? ' e ' : '')
                                                                ))}
                                                            </TeamName>
                                                        </TeamScore>
                                                        
                                                        <Versus>X</Versus>
                                                        
                                                        <TeamScore>
                                                            <Score>{item.team2_score}</Score>
                                                            <TeamName>
                                                                {item.team2_players?.map((player, index) => (
                                                                    player.name + (index < item.team2_players.length - 1 ? ' e ' : '')
                                                                ))}
                                                            </TeamName>
                                                        </TeamScore>
                                                    </GameTeams>

                                                    <GameStatus status={item.status}>
                                                        {item.status === 'pending' && 'Aguardando Início'}
                                                        {item.status === 'in_progress' && 'Em Andamento'}
                                                        {item.status === 'finished' && 'Finalizado'}
                                                    </GameStatus>
                                                </GameCard>
                                            )}
                                        />
                                    )}
                                </>
                            )}
                        </>
                    )}
                </ContentContainer>
            </MainContent>

            {competition?.status === 'in_progress' && (
                <NewGameButton onPress={() => router.push(`/comunidade/${communityId}/competicao/${competitionId}/jogo/novo`)}>
                    <Feather name="plus" size={24} color={colors.white} />
                </NewGameButton>
            )}

            <Modal
                animationType="slide"
                transparent={true}
                visible={isAddMemberModalVisible}
                onRequestClose={() => setIsAddMemberModalVisible(false)}
            >
                <ModalContainer>
                    <ModalContent>
                        <ModalHeader>
                            <ModalTitle>Adicionar Membros</ModalTitle>
                            <TouchableOpacity onPress={() => setIsAddMemberModalVisible(false)}>
                                <Feather name="x" size={24} color={colors.gray100} />
                            </TouchableOpacity>
                        </ModalHeader>

                        <MembersList>
                            {communityMembers.map((member) => {
                                const isCurrentMember = members.some(m => m.player_id === member.player_id);
                                return (
                                    <MemberItem key={member.id}>
                                        <MemberInfo>
                                            <MemberName>{member.players.name}</MemberName>
                                        </MemberInfo>
                                        <TouchableOpacity onPress={() => handleToggleMember(member.player_id, isCurrentMember)}>
                                            <Feather
                                                name={isCurrentMember ? "minus-circle" : "plus-circle"}
                                                size={24}
                                                color={isCurrentMember ? colors.error : colors.success}
                                            />
                                        </TouchableOpacity>
                                    </MemberItem>
                                );
                            })}
                        </MembersList>
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

const MainContent = styled.ScrollView`
    flex: 1;
    padding: 24px;
    background-color: ${colors.backgroundDark};
`;

const ContentContainer = styled.View`
    flex: 1;
`;

const SectionHeader = styled.View`
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
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

const CompetitionStatus = styled.Text<{ status: 'pending' | 'in_progress' | 'finished' }>`
    color: ${props => {
        switch (props.status) {
            case 'pending':
                return colors.gray300;
            case 'in_progress':
                return colors.primary;
            case 'finished':
                return colors.success;
            default:
                return colors.gray300;
        }
    }};
    font-size: 14px;
    font-weight: 500;
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

const Section = styled.View`
    margin-top: 8px;
`;

const MembersScrollView = styled.ScrollView`
    max-height: 300px;
    margin-top: 16px;
`;

const MembersList = styled.View`
    padding-bottom: 8px;
`;

const MemberItem = styled.View`
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    padding: 12px;
    background-color: ${colors.surface};
    border-radius: 8px;
    margin-bottom: 8px;
`;

const MemberInfo = styled.View`
    flex: 1;
`;

const MemberName = styled.Text`
    color: ${colors.gray100};
    font-size: 16px;
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
    background-color: ${colors.surface};
    border-radius: 8px;
    padding: 16px;
    margin-bottom: 8px;
`;

const GameTeams = styled.View`
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 8px;
`;

const TeamScore = styled.View`
    flex: 1;
    align-items: center;
`;

const Score = styled.Text`
    color: ${colors.gray100};
    font-size: 32px;
    font-weight: bold;
`;

const TeamName = styled.Text`
    color: ${colors.gray300};
    font-size: 14px;
    margin-top: 4px;
`;

const Versus = styled.Text`
    color: ${colors.gray300};
    font-size: 20px;
    margin-horizontal: 16px;
`;

const GameStatus = styled.Text<{ status: 'pending' | 'in_progress' | 'finished' }>`
    color: ${props => {
        switch (props.status) {
            case 'pending':
                return colors.gray300;
            case 'in_progress':
                return colors.primary;
            case 'finished':
                return colors.success;
            default:
                return colors.gray300;
        }
    }};
    font-size: 14px;
    text-align: center;
    margin-top: 8px;
`;

const NewGameButton = styled.TouchableOpacity`
    position: absolute;
    bottom: 32px;
    right: 32px;
    width: 56px;
    height: 56px;
    border-radius: 28px;
    background-color: ${colors.primary};
    align-items: center;
    justify-content: center;
    elevation: 8;
    z-index: 999;
`;

const Position = styled.Text`
    font-size: 24px;
    font-weight: bold;
    color: ${colors.primary};
    margin-right: 16px;
`;

const PlayerCard = styled.View`
    background-color: ${colors.backgroundMedium};
    border-radius: 8px;
    padding: 16px;
    margin-bottom: 8px;
    flex-direction: row;
    align-items: center;
`;

const PlayerInfo = styled.View`
    flex: 1;
`;

const PlayerName = styled.Text`
    color: ${colors.gray100};
    font-size: 16px;
    font-weight: bold;
    margin-bottom: 4px;
`;

const PlayerStats = styled.View`
    flex-direction: row;
    flex-wrap: wrap;
`;

const StatItem = styled.View`
    flex-direction: row;
    align-items: center;
    margin-right: 16px;
    margin-top: 4px;
`;

const StatLabel = styled.Text`
    color: ${colors.gray300};
    font-size: 14px;
    margin-right: 4px;
`;

const StatValue = styled.Text`
    color: ${colors.gray100};
    font-size: 14px;
    font-weight: bold;
`;

const PairCard = styled(PlayerCard)``;

const PairInfo = styled(PlayerInfo)``;

const PairPlayers = styled(PlayerName)``;

const PairStats = styled(PlayerStats)``;

const FinishButton = styled.TouchableOpacity<{ disabled?: boolean }>`
    background-color: ${colors.error};
    padding: 16px;
    border-radius: 8px;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    margin-top: 8px;
    margin-bottom: 8px;
    opacity: ${props => props.disabled ? 0.7 : 1};
`;

const FinishButtonText = styled.Text`
    color: ${colors.gray100};
    font-size: 16px;
    font-weight: bold;
    margin-left: 8px;
`;
