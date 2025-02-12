import { View, ScrollView, TouchableOpacity, TextInput } from "react-native"
import styled from "styled-components/native"
import { colors } from "@/styles/colors"
import { MaterialCommunityIcons } from "@expo/vector-icons"
import { SlideTransition } from "@/components/Transitions"
import { FloatingButton } from "@/components/FloatingButton"
import { Header } from "@/components/Header"

const Container = styled.View`
  flex: 1;
  background-color: ${colors.primary};
`

const ScrollContent = styled.ScrollView`
  flex: 1;
`

const Content = styled.View`
  flex: 1;
  padding-bottom: 80px;
`

const SearchContainer = styled.View`
  margin: 8px;
  padding: 8px;
  background-color: ${colors.secondary};
  border-radius: 8px;
  flex-direction: row;
  align-items: center;
`

const SearchInput = styled.TextInput.attrs({
  placeholderTextColor: colors.tertiary
})`
  flex: 1;
  color: ${colors.accent};
  margin-left: 8px;
  font-size: 16px;
`

const PlayerCard = styled.TouchableOpacity`
  background-color: ${colors.secondary};
  border-radius: 8px;
  margin: 8px;
  padding: 16px;
  flex-direction: row;
  align-items: center;
`

const PlayerAvatar = styled.View`
  width: 50px;
  height: 50px;
  border-radius: 25px;
  background-color: ${colors.tertiary};
  align-items: center;
  justify-content: center;
`

const PlayerInfo = styled.View`
  flex: 1;
  margin-left: 12px;
`

const PlayerName = styled.Text`
  color: ${colors.accent};
  font-size: 18px;
  font-weight: bold;
`

const PlayerTag = styled.Text`
  color: ${colors.tertiary};
  font-size: 14px;
`

const PlayerStats = styled.View`
  flex-direction: row;
  margin-top: 4px;
`

const StatBadge = styled.View`
  background-color: ${colors.primary};
  padding: 4px 8px;
  border-radius: 4px;
  margin-right: 8px;
  flex-direction: row;
  align-items: center;
`

const StatText = styled.Text`
  color: ${colors.accent};
  font-size: 12px;
  margin-left: 4px;
`

export default function Jogadores() {
    const players = [
        {
            id: 1,
            name: "Gabriel Silva",
            tag: "@gsilva",
            rank: "Diamante",
            wins: 128,
            games: ["CS2", "Valorant"]
        },
        {
            id: 2,
            name: "Ana Costa",
            tag: "@anacosta",
            rank: "Platina",
            wins: 85,
            games: ["League of Legends"]
        },
        {
            id: 3,
            name: "Lucas Santos",
            tag: "@lsantos",
            rank: "Ouro",
            wins: 64,
            games: ["CS2", "Valorant", "League of Legends"]
        },
        {
            id: 4,
            name: "Mariana Lima",
            tag: "@mlima",
            rank: "Diamante",
            wins: 156,
            games: ["Valorant"]
        }
    ]

    const fabActions = [
        {
            icon: "account-plus-outline",
            label: "Novo Jogador",
            onPress: () => console.log("Novo Jogador"),
        },
    ];

    return (
        <SlideTransition>
            <Container>
                <Header />
                <ScrollContent>
                    <Content>
                        <SearchContainer>
                            <MaterialCommunityIcons name="magnify" size={24} color={colors.tertiary} />
                            <SearchInput 
                                placeholder="Buscar jogador..."
                            />
                        </SearchContainer>

                        {players.map(player => (
                            <PlayerCard key={player.id}>
                                <PlayerAvatar>
                                    <MaterialCommunityIcons 
                                        name="account" 
                                        size={30} 
                                        color={colors.accent}
                                    />
                                </PlayerAvatar>
                                <PlayerInfo>
                                    <PlayerName>{player.name}</PlayerName>
                                    <PlayerTag>{player.tag}</PlayerTag>
                                    <PlayerStats>
                                        <StatBadge>
                                            <MaterialCommunityIcons 
                                                name="trophy" 
                                                size={12} 
                                                color={colors.accent}
                                            />
                                            <StatText>{player.wins} vitórias</StatText>
                                        </StatBadge>
                                        <StatBadge>
                                            <MaterialCommunityIcons 
                                                name="star" 
                                                size={12} 
                                                color={colors.accent}
                                            />
                                            <StatText>{player.rank}</StatText>
                                        </StatBadge>
                                    </PlayerStats>
                                </PlayerInfo>
                                <MaterialCommunityIcons 
                                    name="chevron-right" 
                                    size={24} 
                                    color={colors.tertiary}
                                />
                            </PlayerCard>
                        ))}
                    </Content>
                </ScrollContent>

                <FloatingButton actions={fabActions} />
            </Container>
        </SlideTransition>
    )
}