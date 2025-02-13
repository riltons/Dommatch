import React, { useState, useEffect } from 'react';
import {
    View,
    TouchableOpacity,
    Alert,
    ScrollView,
    ActivityIndicator
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import styled from 'styled-components/native';
import { colors } from '@/styles/colors';
import { Feather } from '@expo/vector-icons';
import { gameService, VictoryType } from '@/services/gameService';
import { competitionService } from '@/services/competitionService';

interface VictoryOption {
    type: VictoryType;
    label: string;
    points: number;
    description: string;
}

interface Player {
    id: string;
    name: string;
}

const victoryOptions: VictoryOption[] = [
    {
        type: 'simple',
        label: 'Vitória Simples',
        points: 1,
        description: 'Vitória normal (1 ponto)'
    },
    {
        type: 'carroca',
        label: 'Vitória de Carroça',
        points: 2,
        description: 'Vitória com carroça (2 pontos)'
    },
    {
        type: 'la_e_lo',
        label: 'Vitória de Lá-e-lô',
        points: 3,
        description: 'Vitória de lá-e-lô (3 pontos)'
    },
    {
        type: 'cruzada',
        label: 'Vitória de Cruzada',
        points: 4,
        description: 'Vitória de cruzada (4 pontos)'
    },
    {
        type: 'contagem',
        label: 'Vitória por Contagem',
        points: 1,
        description: 'Vitória por contagem de pontos (1 ponto)'
    },
    {
        type: 'empate',
        label: 'Empate',
        points: 0,
        description: 'Empate (0 pontos + 1 ponto bônus na próxima)'
    }
];

export default function RegisterResult() {
    const router = useRouter();
    const { id: communityId, competitionId, gameId } = useLocalSearchParams();
    const [selectedType, setSelectedType] = useState<VictoryType | null>(null);
    const [selectedTeam, setSelectedTeam] = useState<1 | 2 | null>(null);
    const [game, setGame] = useState<any>(null);
    const [team1Players, setTeam1Players] = useState<Player[]>([]);
    const [team2Players, setTeam2Players] = useState<Player[]>([]);

    useEffect(() => {
        loadGame();
    }, []);

    const loadGame = async () => {
        try {
            const data = await gameService.getById(gameId as string);
            setGame(data);
            
            // Carregar jogadores dos times
            const players = await Promise.all(
                [...data.team1, ...data.team2].map(async (playerId) => {
                    const playerData = await competitionService.getPlayerById(playerId);
                    return playerData;
                })
            );

            setTeam1Players(players.slice(0, data.team1.length));
            setTeam2Players(players.slice(data.team1.length));
        } catch (error) {
            console.error(error);
            Alert.alert('Erro', 'Não foi possível carregar o jogo');
        }
    };

    const handleRegister = async () => {
        if (!selectedType) {
            Alert.alert('Erro', 'Selecione o tipo de vitória');
            return;
        }

        if (selectedType !== 'empate' && !selectedTeam) {
            Alert.alert('Erro', 'Selecione o time vencedor');
            return;
        }

        try {
            const updatedGame = await gameService.registerRound(
                gameId as string,
                selectedType,
                selectedType === 'empate' ? null : selectedTeam
            );

            if (updatedGame.status === 'finished') {
                let message = 'Jogo finalizado!';
                if (updatedGame.is_buchuda) {
                    message = 'BUCHUDA! 🎉\nUma dupla venceu sem que a adversária marcasse pontos!';
                } else if (updatedGame.is_buchuda_de_re) {
                    message = 'BUCHUDA DE RÉ! 🎉🔄\nIncrível virada! A dupla venceu após estar perdendo de 5x0!';
                }
                Alert.alert('Parabéns!', message, [
                    { text: 'OK', onPress: () => router.back() }
                ]);
            } else {
                router.back();
            }
        } catch (error) {
            console.error(error);
            Alert.alert('Erro', 'Não foi possível registrar o resultado');
        }
    };

    return (
        <Container>
            <PageHeader>
                <BackButton onPress={() => router.back()}>
                    <Feather name="arrow-left" size={24} color={colors.gray100} />
                </BackButton>
                <HeaderTitle>Registrar Resultado</HeaderTitle>
            </PageHeader>

            <MainContent>
                <SectionTitle>Tipo de Vitória</SectionTitle>
                {victoryOptions.map(option => (
                    <VictoryOption
                        key={option.type}
                        onPress={() => setSelectedType(option.type)}
                        selected={selectedType === option.type}
                    >
                        <VictoryOptionContent>
                            <VictoryOptionTitle>{option.label}</VictoryOptionTitle>
                            <VictoryOptionDescription>
                                {option.description}
                            </VictoryOptionDescription>
                        </VictoryOptionContent>
                        {selectedType === option.type && (
                            <Feather name="check" size={24} color={colors.primary} />
                        )}
                    </VictoryOption>
                ))}

                {selectedType && selectedType !== 'empate' && (
                    <>
                        <SectionTitle>Time Vencedor</SectionTitle>
                        <TeamOptions>
                            <TeamOption
                                onPress={() => setSelectedTeam(1)}
                                selected={selectedTeam === 1}
                            >
                                <TeamOptionContent>
                                    {team1Players.map((player, index) => (
                                        <TeamPlayerName key={player.id}>
                                            {player.name}
                                            {index < team1Players.length - 1 ? ' e ' : ''}
                                        </TeamPlayerName>
                                    ))}
                                </TeamOptionContent>
                            </TeamOption>
                            <TeamOption
                                onPress={() => setSelectedTeam(2)}
                                selected={selectedTeam === 2}
                            >
                                <TeamOptionContent>
                                    {team2Players.map((player, index) => (
                                        <TeamPlayerName key={player.id}>
                                            {player.name}
                                            {index < team2Players.length - 1 ? ' e ' : ''}
                                        </TeamPlayerName>
                                    ))}
                                </TeamOptionContent>
                            </TeamOption>
                        </TeamOptions>
                    </>
                )}

                <RegisterButton 
                    onPress={handleRegister}
                    disabled={!selectedType || (selectedType !== 'empate' && !selectedTeam)}
                    style={{ opacity: (!selectedType || (selectedType !== 'empate' && !selectedTeam)) ? 0.5 : 1 }}
                >
                    <RegisterButtonText>Registrar Resultado</RegisterButtonText>
                </RegisterButton>
            </MainContent>
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
`;

const MainContent = styled.ScrollView`
    flex: 1;
    padding: 20px;
`;

const SectionTitle = styled.Text`
    font-size: 18px;
    font-weight: bold;
    color: ${colors.gray100};
    margin-bottom: 16px;
    margin-top: 24px;
`;

const VictoryOption = styled.TouchableOpacity<{ selected: boolean }>`
    background-color: ${colors.secondary};
    border-radius: 8px;
    padding: 16px;
    margin-bottom: 8px;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    border: 2px solid ${props => props.selected ? colors.primary : colors.secondary};
`;

const VictoryOptionContent = styled.View`
    flex: 1;
    margin-right: 16px;
`;

const VictoryOptionTitle = styled.Text`
    font-size: 16px;
    font-weight: bold;
    color: ${colors.gray100};
    margin-bottom: 4px;
`;

const VictoryOptionDescription = styled.Text`
    font-size: 14px;
    color: ${colors.gray300};
`;

const TeamOptions = styled.View`
    flex-direction: row;
    justify-content: space-between;
    margin-bottom: 24px;
`;

const TeamOption = styled.TouchableOpacity<{ selected: boolean }>`
    flex: 1;
    background-color: ${colors.secondary};
    border-radius: 8px;
    padding: 16px;
    margin-horizontal: 4px;
    align-items: center;
    border: 2px solid ${props => props.selected ? colors.primary : colors.secondary};
`;

const TeamOptionContent = styled.View`
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: center;
`;

const TeamPlayerName = styled.Text`
    font-size: 16px;
    font-weight: bold;
    color: ${colors.gray100};
    text-align: center;
`;

const RegisterButton = styled.TouchableOpacity`
    background-color: ${colors.primary};
    padding: 16px;
    border-radius: 8px;
    align-items: center;
    justify-content: center;
    margin-top: 32px;
`;

const RegisterButtonText = styled.Text`
    color: ${colors.white};
    font-size: 16px;
    font-weight: bold;
`;
