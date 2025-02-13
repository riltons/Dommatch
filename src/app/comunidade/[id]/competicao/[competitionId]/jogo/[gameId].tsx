import React, { useEffect, useState } from 'react';
import { Alert, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import styled from 'styled-components/native';
import { colors } from '@/styles/colors';
import { Feather } from '@expo/vector-icons';
import { gameService, Game } from '@/services/gameService';
import { competitionService } from '@/services/competitionService';

interface Player {
    id: string;
    name: string;
}

export default function GameDetails() {
    const router = useRouter();
    const { id: communityId, competitionId, gameId } = useLocalSearchParams();
    const [loading, setLoading] = useState(true);
    const [game, setGame] = useState<Game | null>(null);
    const [team1Players, setTeam1Players] = useState<Player[]>([]);
    const [team2Players, setTeam2Players] = useState<Player[]>([]);

    useEffect(() => {
        loadGame();
    }, []);

    const loadGame = async () => {
        try {
            setLoading(true);
            const [gameData, membersData] = await Promise.all([
                gameService.getById(gameId as string),
                competitionService.listMembers(competitionId as string)
            ]);

            setGame(gameData);

            // Mapeando os IDs dos jogadores para seus dados completos
            const playersMap = new Map(
                membersData.map(m => [m.player_id, { id: m.player_id, name: m.players.name }])
            );

            setTeam1Players(gameData.team1.map(id => playersMap.get(id)).filter(Boolean));
            setTeam2Players(gameData.team2.map(id => playersMap.get(id)).filter(Boolean));
        } catch (error) {
            console.error(error);
            Alert.alert('Erro', 'Não foi possível carregar o jogo');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateScore = async (team: 1 | 2, increment: boolean) => {
        if (!game) return;

        const team1Score = team === 1 
            ? increment ? game.team1_score + 1 : Math.max(0, game.team1_score - 1)
            : game.team1_score;

        const team2Score = team === 2
            ? increment ? game.team2_score + 1 : Math.max(0, game.team2_score - 1)
            : game.team2_score;

        try {
            const updatedGame = await gameService.updateScore(
                gameId as string,
                team1Score,
                team2Score
            );
            setGame(updatedGame);
        } catch (error) {
            console.error(error);
            Alert.alert('Erro', 'Não foi possível atualizar o placar');
        }
    };

    const handleFinishGame = async () => {
        if (!game) return;

        Alert.alert(
            'Finalizar Jogo',
            'Tem certeza que deseja finalizar este jogo?',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Confirmar',
                    onPress: async () => {
                        try {
                            const updatedGame = await gameService.finishGame(gameId as string);
                            setGame(updatedGame);
                        } catch (error) {
                            console.error(error);
                            Alert.alert('Erro', 'Não foi possível finalizar o jogo');
                        }
                    }
                }
            ]
        );
    };

    if (loading || !game) {
        return (
            <LoadingContainer>
                <ActivityIndicator size="large" color={colors.primary} />
            </LoadingContainer>
        );
    }

    return (
        <Container>
            <PageHeader>
                <BackButton onPress={() => router.back()}>
                    <Feather name="arrow-left" size={24} color={colors.gray100} />
                </BackButton>
                <HeaderTitle>Detalhes do Jogo</HeaderTitle>
            </PageHeader>

            <MainContent>
                <GameStatus>
                    {game.status === 'pending' && 'Aguardando Início'}
                    {game.status === 'in_progress' && 'Em Andamento'}
                    {game.status === 'finished' && 'Finalizado'}
                </GameStatus>

                <ScoreContainer>
                    <TeamContainer>
                        <TeamTitle>Time 1</TeamTitle>
                        {team1Players.map(player => (
                            <PlayerName key={player.id}>{player.name}</PlayerName>
                        ))}
                        <ScoreControls>
                            <ScoreButton 
                                onPress={() => handleUpdateScore(1, false)}
                                disabled={game.status === 'finished'}
                            >
                                <Feather name="minus" size={24} color={colors.white} />
                            </ScoreButton>
                            <Score>{game.team1_score}</Score>
                            <ScoreButton 
                                onPress={() => handleUpdateScore(1, true)}
                                disabled={game.status === 'finished'}
                            >
                                <Feather name="plus" size={24} color={colors.white} />
                            </ScoreButton>
                        </ScoreControls>
                    </TeamContainer>

                    <Versus>X</Versus>

                    <TeamContainer>
                        <TeamTitle>Time 2</TeamTitle>
                        {team2Players.map(player => (
                            <PlayerName key={player.id}>{player.name}</PlayerName>
                        ))}
                        <ScoreControls>
                            <ScoreButton 
                                onPress={() => handleUpdateScore(2, false)}
                                disabled={game.status === 'finished'}
                            >
                                <Feather name="minus" size={24} color={colors.white} />
                            </ScoreButton>
                            <Score>{game.team2_score}</Score>
                            <ScoreButton 
                                onPress={() => handleUpdateScore(2, true)}
                                disabled={game.status === 'finished'}
                            >
                                <Feather name="plus" size={24} color={colors.white} />
                            </ScoreButton>
                        </ScoreControls>
                    </TeamContainer>
                </ScoreContainer>

                {game.status === 'in_progress' && (
                    <FinishButton onPress={handleFinishGame}>
                        <FinishButtonText>Finalizar Jogo</FinishButtonText>
                    </FinishButton>
                )}
            </MainContent>
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
`;

const MainContent = styled.View`
    flex: 1;
    padding: 20px;
`;

const GameStatus = styled.Text`
    font-size: 18px;
    color: ${colors.primary};
    text-align: center;
    margin-bottom: 24px;
    font-weight: bold;
`;

const ScoreContainer = styled.View`
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 32px;
`;

const TeamContainer = styled.View`
    flex: 1;
    align-items: center;
`;

const TeamTitle = styled.Text`
    font-size: 20px;
    font-weight: bold;
    color: ${colors.gray100};
    margin-bottom: 16px;
`;

const PlayerName = styled.Text`
    font-size: 16px;
    color: ${colors.gray300};
    margin-bottom: 8px;
`;

const ScoreControls = styled.View`
    flex-direction: row;
    align-items: center;
    margin-top: 16px;
`;

const ScoreButton = styled.TouchableOpacity`
    width: 40px;
    height: 40px;
    background-color: ${colors.primary};
    border-radius: 20px;
    align-items: center;
    justify-content: center;
    opacity: ${props => props.disabled ? 0.5 : 1};
`;

const Score = styled.Text`
    font-size: 32px;
    font-weight: bold;
    color: ${colors.gray100};
    margin-horizontal: 16px;
`;

const Versus = styled.Text`
    font-size: 24px;
    font-weight: bold;
    color: ${colors.gray300};
    margin-horizontal: 16px;
`;

const FinishButton = styled.TouchableOpacity`
    background-color: ${colors.primary};
    padding: 16px;
    border-radius: 8px;
    align-items: center;
    justify-content: center;
    margin-top: auto;
`;

const FinishButtonText = styled.Text`
    color: ${colors.white};
    font-size: 16px;
    font-weight: bold;
`;
