import { supabase } from '@/lib/supabase';

export interface PlayerRanking {
    id: string;
    name: string;
    wins: number;
    totalGames: number;
    buchudas: number;
    buchudasDeRe: number;
    winRate: number;
}

export interface PairRanking {
    id: string;
    player1: {
        id: string;
        name: string;
    };
    player2: {
        id: string;
        name: string;
    };
    wins: number;
    totalGames: number;
    buchudas: number;
    buchudasDeRe: number;
    winRate: number;
}

export const rankingService = {
    async getTopPlayers(): Promise<PlayerRanking[]> {
        console.log('RankingService: Iniciando busca de jogadores...');

        // Buscar todos os jogadores
        const { data: players, error: playersError } = await supabase
            .from('players')
            .select('*');

        if (playersError) {
            console.error('RankingService: Erro ao buscar jogadores:', playersError);
            return [];
        }

        console.log('RankingService: Resposta do Supabase (players):', { data: players, error: playersError });
        console.log('RankingService: Jogadores encontrados:', players?.length || 0);
        if (players?.[0]) {
            console.log('RankingService: Exemplo de jogador:', players[0]);
        }

        // Se não houver jogadores, retornar array vazio
        if (!players || players.length === 0) {
            return [];
        }

        // Buscar todos os jogos
        const { data: games, error: gamesError } = await supabase
            .from('games')
            .select('*');

        if (gamesError) {
            console.error('RankingService: Erro ao buscar jogos:', gamesError);
            // Mesmo com erro nos jogos, vamos retornar os jogadores com estatísticas zeradas
            return players.map(player => ({
                id: player.id,
                name: player.name,
                wins: 0,
                totalGames: 0,
                winRate: 0,
                buchudas: 0,
                buchudasDeRe: 0
            }));
        }

        console.log('RankingService: Resposta do Supabase (games):', { data: games, error: gamesError });
        console.log('RankingService: Jogos encontrados:', games?.length || 0);
        if (games?.[0]) {
            console.log('RankingService: Exemplo de jogo:', games[0]);
        }

        // Inicializar estatísticas para todos os jogadores
        const playerStats = new Map<string, PlayerRanking>();
        players.forEach(player => {
            playerStats.set(player.id, {
                id: player.id,
                name: player.name,
                wins: 0,
                totalGames: 0,
                winRate: 0,
                buchudas: 0,
                buchudasDeRe: 0
            });
        });

        // Se não houver jogos, retornar todos os jogadores com estatísticas zeradas
        if (!games || games.length === 0) {
            return Array.from(playerStats.values());
        }

        // Processar jogos
        games.forEach(game => {
            // Verificar se o jogo tem jogadores vinculados
            const team1Players = [game.team1_player1_id, game.team1_player2_id].filter(Boolean) as string[];
            const team2Players = [game.team2_player1_id, game.team2_player2_id].filter(Boolean) as string[];

            if (team1Players.length === 0 && team2Players.length === 0) {
                console.log('RankingService: Jogo sem jogadores:', game.id);
                return;
            }

            // Processar time 1
            team1Players.forEach(playerId => {
                const stats = playerStats.get(playerId);
                if (stats) {
                    stats.totalGames++;
                    if (game.winner_team === 1) {
                        stats.wins++;
                        if (game.score_team1 === 6 && game.score_team2 === 0) {
                            stats.buchudas++;
                        }
                        if (game.score_team1 === 6 && game.score_team2 === 5) {
                            stats.buchudasDeRe++;
                        }
                    }
                }
            });

            // Processar time 2
            team2Players.forEach(playerId => {
                const stats = playerStats.get(playerId);
                if (stats) {
                    stats.totalGames++;
                    if (game.winner_team === 2) {
                        stats.wins++;
                        if (game.score_team2 === 6 && game.score_team1 === 0) {
                            stats.buchudas++;
                        }
                        if (game.score_team2 === 6 && game.score_team1 === 5) {
                            stats.buchudasDeRe++;
                        }
                    }
                }
            });
        });

        // Calcular taxa de vitória e ordenar
        const rankings = Array.from(playerStats.values()).map(stats => ({
            ...stats,
            winRate: stats.totalGames > 0 ? (stats.wins / stats.totalGames) * 100 : 0
        }));

        // Ordenar por taxa de vitória (decrescente)
        rankings.sort((a, b) => b.winRate - a.winRate);

        console.log('RankingService: Rankings calculados:', rankings.length);
        return rankings;
    },

    async getTopPairs(): Promise<PairRanking[]> {
        try {
            console.log('RankingService: Iniciando busca de duplas...');
            
            // 1. Buscar todos os jogadores
            const { data: players, error: playersError } = await supabase
                .from('players')
                .select('*');

            console.log('RankingService: Resposta do Supabase (players):', { data: players, error: playersError });

            if (playersError) {
                console.error('RankingService: Erro ao buscar jogadores:', playersError.message);
                throw playersError;
            }

            if (!players || players.length === 0) {
                console.log('RankingService: Nenhum jogador encontrado');
                return [];
            }

            console.log('RankingService: Jogadores encontrados:', players.length);

            // 2. Buscar todos os jogos
            const { data: games, error: gamesError } = await supabase
                .from('games')
                .select('*');

            console.log('RankingService: Resposta do Supabase (games):', { data: games, error: gamesError });

            if (gamesError) {
                console.error('RankingService: Erro ao buscar jogos:', gamesError.message);
                throw gamesError;
            }

            if (!games || games.length === 0) {
                console.log('RankingService: Nenhum jogo encontrado');
                return [];
            }

            console.log('RankingService: Jogos encontrados:', games.length);

            // Processar estatísticas por dupla
            const pairStats = new Map<string, {
                id: string;
                player1: { id: string; name: string; };
                player2: { id: string; name: string; };
                wins: number;
                totalGames: number;
                buchudas: number;
                buchudasDeRe: number;
            }>();

            // Processar jogos
            games.forEach(game => {
                // Extrair IDs dos jogadores dos campos individuais
                const team1Players = [game.team1_player1_id, game.team1_player2_id].filter(Boolean) as string[];
                const team2Players = [game.team2_player1_id, game.team2_player2_id].filter(Boolean) as string[];

                // Processar time 1
                if (team1Players.length === 2) {
                    const [player1Id, player2Id] = team1Players;
                    const player1 = players.find(p => p.id === player1Id);
                    const player2 = players.find(p => p.id === player2Id);

                    if (player1 && player2) {
                        const pairId = [player1Id, player2Id].sort().join('-');
                        const stats = pairStats.get(pairId) || {
                            id: pairId,
                            player1: { id: player1.id, name: player1.name },
                            player2: { id: player2.id, name: player2.name },
                            wins: 0,
                            totalGames: 0,
                            buchudas: 0,
                            buchudasDeRe: 0
                        };

                        stats.totalGames++;
                        if (game.winner_team === 1) {
                            stats.wins++;
                            if (game.score_team1 === 6 && game.score_team2 === 0) {
                                stats.buchudas++;
                            }
                            if (game.score_team1 === 6 && game.score_team2 === 5) {
                                stats.buchudasDeRe++;
                            }
                        }

                        pairStats.set(pairId, stats);
                    }
                }

                // Processar time 2
                if (team2Players.length === 2) {
                    const [player1Id, player2Id] = team2Players;
                    const player1 = players.find(p => p.id === player1Id);
                    const player2 = players.find(p => p.id === player2Id);

                    if (player1 && player2) {
                        const pairId = [player1Id, player2Id].sort().join('-');
                        const stats = pairStats.get(pairId) || {
                            id: pairId,
                            player1: { id: player1.id, name: player1.name },
                            player2: { id: player2.id, name: player2.name },
                            wins: 0,
                            totalGames: 0,
                            buchudas: 0,
                            buchudasDeRe: 0
                        };

                        stats.totalGames++;
                        if (game.winner_team === 2) {
                            stats.wins++;
                            if (game.score_team2 === 6 && game.score_team1 === 0) {
                                stats.buchudas++;
                            }
                            if (game.score_team2 === 6 && game.score_team1 === 5) {
                                stats.buchudasDeRe++;
                            }
                        }

                        pairStats.set(pairId, stats);
                    }
                }
            });

            // Calcular ranking final
            const rankings = Array.from(pairStats.values())
                .filter(stats => stats.totalGames > 0)
                .map(stats => ({
                    ...stats,
                    winRate: (stats.wins / stats.totalGames) * 100
                }))
                .sort((a, b) => b.winRate - a.winRate);

            console.log('RankingService: Rankings de duplas calculados:', rankings.length);
            if (rankings.length > 0) {
                console.log('RankingService: Exemplo de ranking de dupla:', rankings[0]);
            }

            return rankings;
        } catch (error) {
            console.error('RankingService: Erro ao buscar ranking de duplas:', error);
            throw error;
        }
    }
};
