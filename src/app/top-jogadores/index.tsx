import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator } from 'react-native';
import styled from 'styled-components/native';
import { colors } from '@/styles/colors';
import { Header } from '@/components/Header';
import { PageTransition } from '@/components/Transitions';
import { rankingService, PlayerRanking } from '@/services/rankingService';

const Container = styled.View`
    flex: 1;
    background-color: ${colors.backgroundDark};
`;

const Content = styled.View`
    flex: 1;
    padding: 20px;
`;

const PlayerCard = styled.View`
    background-color: ${colors.backgroundMedium};
    border-radius: 12px;
    padding: 16px;
    margin-bottom: 12px;
`;

const CardHeader = styled.View`
    flex-direction: row;
    align-items: center;
    margin-bottom: 12px;
`;

const Position = styled.Text`
    color: ${colors.primary};
    font-size: 24px;
    font-weight: bold;
    min-width: 40px;
`;

const PlayerInfo = styled.View`
    flex: 1;
    margin-left: 12px;
`;

const PlayerName = styled.Text`
    color: ${colors.gray100};
    font-size: 18px;
    font-weight: bold;
`;

const StatsContainer = styled.View`
    flex-direction: row;
    justify-content: space-between;
    padding-top: 12px;
    border-top-width: 1px;
    border-top-color: ${colors.backgroundLight};
`;

const StatItem = styled.View`
    align-items: center;
    flex: 1;
`;

const StatValue = styled.Text`
    color: ${colors.primary};
    font-size: 16px;
    font-weight: bold;
`;

const StatLabel = styled.Text`
    color: ${colors.gray300};
    font-size: 12px;
    margin-top: 4px;
    text-align: center;
`;

const LoadingContainer = styled.View`
    flex: 1;
    justify-content: center;
    align-items: center;
    padding: 20px;
`;

const ErrorContainer = styled.View`
    flex: 1;
    justify-content: center;
    align-items: center;
    padding: 20px;
`;

const ErrorText = styled.Text`
    color: ${colors.error};
    font-size: 16px;
    text-align: center;
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

export default function TopJogadores() {
    console.log('TopJogadores: Componente renderizado');
    const [players, setPlayers] = useState<PlayerRanking[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        console.log('TopJogadores: useEffect iniciado');
        loadPlayers();
    }, []);

    const loadPlayers = async () => {
        try {
            console.log('TopJogadores: Iniciando carregamento...');
            setLoading(true);
            setError(null);
            console.log('TopJogadores: Buscando ranking...');
            const rankings = await rankingService.getTopPlayers();
            console.log('TopJogadores: Rankings recebidos:', rankings);
            console.log('TopJogadores: Exemplo de ranking:', rankings[0]);
            setPlayers(rankings);
        } catch (error) {
            console.error('TopJogadores: Erro ao carregar jogadores:', error);
            setError('Não foi possível carregar o ranking de jogadores');
        } finally {
            console.log('TopJogadores: Finalizando carregamento');
            setLoading(false);
        }
    };

    console.log('TopJogadores: Estado atual:', { loading, error, playersCount: players.length });

    if (loading) {
        return (
            <Container>
                <Header title="Top Jogadores" showBackButton />
                <LoadingContainer>
                    <ActivityIndicator size="large" color={colors.primary} />
                </LoadingContainer>
            </Container>
        );
    }

    if (error) {
        return (
            <Container>
                <Header title="Top Jogadores" showBackButton />
                <ErrorContainer>
                    <ErrorText>{error}</ErrorText>
                </ErrorContainer>
            </Container>
        );
    }

    if (players.length === 0) {
        return (
            <Container>
                <Header title="Top Jogadores" showBackButton />
                <EmptyContainer>
                    <EmptyText>Nenhum jogador encontrado</EmptyText>
                </EmptyContainer>
            </Container>
        );
    }

    const renderPlayer = ({ item, index }: { item: PlayerRanking; index: number }) => (
        <PlayerCard>
            <CardHeader>
                <Position>{index + 1}º</Position>
                <PlayerInfo>
                    <PlayerName>{item.name}</PlayerName>
                </PlayerInfo>
            </CardHeader>
            <StatsContainer>
                <StatItem>
                    <StatValue>{item.winRate.toFixed(1)}%</StatValue>
                    <StatLabel>Taxa de{'\n'}Vitória</StatLabel>
                </StatItem>
                <StatItem>
                    <StatValue>{item.wins}</StatValue>
                    <StatLabel>Vitórias</StatLabel>
                </StatItem>
                <StatItem>
                    <StatValue>{item.totalGames}</StatValue>
                    <StatLabel>Total de{'\n'}Jogos</StatLabel>
                </StatItem>
                <StatItem>
                    <StatValue>{item.buchudas}</StatValue>
                    <StatLabel>Buchudas</StatLabel>
                </StatItem>
                <StatItem>
                    <StatValue>{item.buchudasDeRe}</StatValue>
                    <StatLabel>Buchudas{'\n'}de Ré</StatLabel>
                </StatItem>
            </StatsContainer>
        </PlayerCard>
    );

    return (
        <PageTransition>
            <Container>
                <Header title="Top Jogadores" showBackButton />
                <Content>
                    <FlatList
                        data={players}
                        renderItem={renderPlayer}
                        keyExtractor={item => item.id}
                        showsVerticalScrollIndicator={false}
                    />
                </Content>
            </Container>
        </PageTransition>
    );
}
