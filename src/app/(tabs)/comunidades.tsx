import { View, ScrollView, TouchableOpacity } from "react-native"
import styled from "styled-components/native"
import { colors } from "@/styles/colors"
import { MaterialCommunityIcons } from "@expo/vector-icons"
import { SlideTransition } from "@/components/Transitions"
import { FloatingButton } from "@/components/FloatingButton"
import { Header } from "@/components/Header"

const Container = styled.View`
  flex: 1;
  background-color: ${colors.backgroundDark};
`

const ScrollContent = styled.ScrollView.attrs({
  contentContainerStyle: {
    flexGrow: 1,
    padding: 16,
    paddingBottom: 80,
  },
})`
  flex: 1;
`

const Content = styled.View`
  flex: 1;
`

const CommunityCard = styled.TouchableOpacity`
  background-color: ${colors.secondary};
  border-radius: 8px;
  margin-bottom: 16px;
  padding: 16px;
  flex-direction: row;
  align-items: center;
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
  font-size: 18px;
  font-weight: bold;
  color: ${colors.gray100};
  margin-bottom: 4px;
`

const CommunityGame = styled.Text`
  font-size: 14px;
  color: ${colors.gray300};
  margin-bottom: 8px;
`

const CommunityStats = styled.View`
  flex-direction: row;
  align-items: center;
`

const StatItem = styled.View`
  flex-direction: row;
  align-items: center;
  margin-right: 16px;
`

const StatText = styled.Text`
  font-size: 14px;
  color: ${colors.gray300};
  margin-left: 4px;
`

const StatNumber = styled.Text`
  color: ${colors.gray100};
  font-size: 16px;
  font-weight: bold;
`

const SearchContainer = styled.View`
  padding: 8px 16px;
  background-color: ${colors.secondary};
  border-radius: 8px;
  flex-direction: row;
  align-items: center;
  margin-bottom: 16px;
`;

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
                <Header title="Comunidades" onNotificationPress={() => {}} onProfilePress={() => {}} />
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
                                    </CommunityInfo>
                                </CommunityHeader>
                            </CommunityCard>
                        ))}
                    </Content>
                </ScrollContent>

                <FloatingButton actions={fabActions} />
            </Container>
        </SlideTransition>
    )
}