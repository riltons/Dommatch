import { supabase } from "@/lib/supabase";

interface UserStatistics {
    totalGames: number;
    totalCompetitions: number;
    totalPlayers: number;
    averageScore: number;
}

export const statisticsService = {
    async getUserStatistics(userId: string): Promise<UserStatistics> {
        try {
            console.log('Buscando estatísticas para o usuário:', userId);

            // Buscar total de jogos que o usuário participou
            const { data: games, error: gamesError } = await supabase
                .from('games')
                .select('*')
                .or(`team1.cs.{${userId}},team2.cs.{${userId}}`);

            if (gamesError) {
                console.error('Erro ao buscar jogos:', gamesError);
            } else {
                console.log('Jogos encontrados:', games?.length);
            }

            const totalGames = games?.length || 0;

            // Buscar total de competições que o usuário participa
            const { data: competitions, error: competitionsError } = await supabase
                .from('competitions')
                .select('id, community_id');

            if (competitionsError) {
                console.error('Erro ao buscar competições:', competitionsError);
            } else {
                console.log('Competições encontradas:', competitions?.length);
            }

            const totalCompetitions = competitions?.length || 0;

            // Buscar total de jogadores nas comunidades do usuário
            const { data: userCommunities, error: communitiesError } = await supabase
                .from('communities')
                .select('id')
                .eq('created_by', userId);

            if (communitiesError) {
                console.error('Erro ao buscar comunidades:', communitiesError);
            }

            let totalPlayers = 0;
            if (userCommunities && userCommunities.length > 0) {
                const communityIds = userCommunities.map(c => c.id);
                const { data: members, error: membersError } = await supabase
                    .from('community_members')
                    .select('player_id')
                    .in('community_id', communityIds);

                if (membersError) {
                    console.error('Erro ao buscar membros:', membersError);
                } else {
                    // Remover duplicatas (jogadores que estão em múltiplas comunidades)
                    const uniquePlayers = new Set(members?.map(m => m.player_id));
                    totalPlayers = uniquePlayers.size;
                    console.log('Total de jogadores únicos:', totalPlayers);
                }
            }

            // Buscar média de pontos do usuário
            const { data: games_with_scores, error: scoresError } = await supabase
                .from('games')
                .select('*')
                .or(`team1.cs.{${userId}},team2.cs.{${userId}}`)
                .eq('status', 'finished');

            if (scoresError) {
                console.error('Erro ao buscar pontuações:', scoresError);
            } else {
                console.log('Jogos com pontuação encontrados:', games_with_scores?.length);
            }

            let totalScore = 0;
            let gamesWithScore = 0;

            if (games_with_scores) {
                games_with_scores.forEach(game => {
                    let playerScore = null;
                    
                    // Verificar em qual time o jogador está e pegar a pontuação correspondente
                    if (game.team1.includes(userId)) {
                        playerScore = game.team1_score;
                    } else if (game.team2.includes(userId)) {
                        playerScore = game.team2_score;
                    }

                    console.log('Pontuação do jogo:', {
                        gameId: game.id,
                        playerScore,
                        team: game.team1.includes(userId) ? 1 : 2
                    });

                    if (playerScore !== null && playerScore !== undefined) {
                        totalScore += playerScore;
                        gamesWithScore++;
                    }
                });
            }

            const averageScore = gamesWithScore > 0 ? Number((totalScore / gamesWithScore).toFixed(1)) : 0;

            const stats = {
                totalGames,
                totalCompetitions,
                totalPlayers,
                averageScore
            };

            console.log('Estatísticas finais:', stats);

            return stats;
        } catch (error) {
            console.error('Erro ao buscar estatísticas:', error);
            return {
                totalGames: 0,
                totalCompetitions: 0,
                totalPlayers: 0,
                averageScore: 0
            };
        }
    }
};
