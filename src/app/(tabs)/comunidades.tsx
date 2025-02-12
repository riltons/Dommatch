import { View, ScrollView, TouchableOpacity } from "react-native"
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

const CommunityCard = styled.TouchableOpacity`
  background-color: ${colors.secondary};
  border-radius: 8px;
  margin: 8px;
  padding: 16px;
`

const CommunityHeader = styled.View`
  flex-direction: row;
  align-items: center;
  margin-bottom: 12px;
`

const CommunityInfo = styled.View`
  flex: 1;
  margin-left: 12px;
`

const CommunityName = styled.Text`
  color: ${colors.gray100};
  font-size: 18px;
  font-weight: bold;
`

const CommunityGame = styled.Text`
  color: ${colors.gray300};
  font-size: 14px;
  margin-top: 4px;
`

const CommunityStats = styled.View`
  flex-direction: row;
  justify-content: space-around;
  padding-top: 12px;
  border-top-width: 1px;
  border-top-color: ${colors.tertiary}20;
`

const StatItem = styled.View`
  align-items: center;
`

const StatNumber = styled.Text`
  color: ${colors.gray100};
  font-size: 16px;
  font-weight: bold;
`

const StatText = styled.Text`
  color: ${colors.gray300};
  font-size: 12px;
  margin-top: 4px;
`

export default function Comunidades() {
    const communities = [
        {
            id: 1,
            name: "CS Masters",
            game: "Counter-Strike 2",
            members: 45,
            tournaments: 3,
            matches: 12
        },
        {
            id: 2,
            name: "League Legends",
            game: "League of Legends",
            members: 78,
            tournaments: 5,
            matches: 25
        },
        {
            id: 3,
            name: "Valorant Elite",
            game: "Valorant",
            members: 33,
            tournaments: 2,
            matches: 8
        }
    ]

    const fabActions = [
        {
            icon: "account-group-outline",
            label: "Nova Comunidade",
            onPress: () => console.log("Nova Comunidade"),
        },
    ];

    return (
        <SlideTransition>
            <Container>
                <Header />
                <ScrollContent>
                    <Content>
                        {communities.map(community => (
                            <CommunityCard key={community.id}>
                                <CommunityHeader>
                                    <MaterialCommunityIcons 
                                        name="account-group" 
                                        size={40} 
                                        color={colors.accent}
                                    />
                                    <CommunityInfo>
                                        <CommunityName>{community.name}</CommunityName>
                                        <CommunityGame>{community.game}</CommunityGame>
                                    </CommunityInfo>
                                </CommunityHeader>

                                <CommunityStats>
                                    <StatItem>
                                        <StatNumber>{community.members}</StatNumber>
                                        <StatText>Membros</StatText>
                                    </StatItem>
                                    <StatItem>
                                        <StatNumber>{community.tournaments}</StatNumber>
                                        <StatText>Torneios</StatText>
                                    </StatItem>
                                    <StatItem>
                                        <StatNumber>{community.matches}</StatNumber>
                                        <StatText>Partidas</StatText>
                                    </StatItem>
                                </CommunityStats>
                            </CommunityCard>
                        ))}
                    </Content>
                </ScrollContent>

                <FloatingButton actions={fabActions} />
            </Container>
        </SlideTransition>
    )
}