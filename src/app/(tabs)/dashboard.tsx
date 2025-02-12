import { View, ScrollView } from "react-native"
import styled from "styled-components/native"
import { colors } from "@/styles/colors"
import { MaterialCommunityIcons } from "@expo/vector-icons"
import { PageTransition } from "@/components/Transitions"
import { Header } from "@/components/Header"

const Container = styled.View`
    flex: 1;
    background-color: ${colors.primary};
`;

const ScrollContent = styled.ScrollView`
    flex: 1;
`;

const Content = styled.View`
    flex: 1;
    padding-bottom: 20px;
`;

const StatisticsContainer = styled.View`
    flex-direction: row;
    flex-wrap: wrap;
    padding: 20px;
    justify-content: space-between;
`;

const StatCardWrapper = styled.View`
    width: 48%;
    margin-bottom: 16px;
`;

const StatCard = styled.View`
    background-color: ${colors.secondary};
    border-radius: 12px;
    padding: 20px;
    width: 100%;
    align-items: center;
    margin: 0;
    elevation: 3;
    border: 1px solid ${colors.tertiary}40;
`;

const StatValue = styled.Text`
    font-size: 24px;
    font-weight: bold;
    color: ${colors.gray100};
    margin-top: 8px;
`;

const StatLabel = styled.Text`
    font-size: 14px;
    color: ${colors.gray200};
    margin-top: 4px;
`;

const RecentActivityCard = styled.View`
    background-color: ${colors.secondary};
    border-radius: 12px;
    margin: 0 20px 20px;
    padding: 20px;
    border: 1px solid ${colors.tertiary}40;
`;

const ActivityTitle = styled.Text`
    font-size: 20px;
    font-weight: bold;
    color: ${colors.gray100};
    margin-bottom: 16px;
`;

const ActivityItem = styled.View`
    flex-direction: row;
    align-items: center;
    padding: 12px 0;
    border-bottom-width: 1px;
    border-bottom-color: ${colors.tertiary}20;
`;

const ActivityText = styled.Text`
    flex: 1;
    font-size: 14px;
    color: ${colors.gray200};
    margin-left: 12px;
`;

const ActivityTime = styled.Text`
    font-size: 12px;
    color: ${colors.gray400};
    margin-left: 8px;
`;

export default function Dashboard() {
    return (
        <PageTransition>
            <Container>
                <Header />
                <ScrollContent>
                    <Content>
                        <StatisticsContainer>
                            <StatCardWrapper>
                                <StatCard>
                                    <MaterialCommunityIcons 
                                        name="cards-playing-outline" 
                                        size={28} 
                                        color={colors.accent} 
                                    />
                                    <StatValue>12</StatValue>
                                    <StatLabel>Partidas Hoje</StatLabel>
                                </StatCard>
                            </StatCardWrapper>

                            <StatCardWrapper>
                                <StatCard>
                                    <MaterialCommunityIcons 
                                        name="trophy" 
                                        size={28} 
                                        color={colors.accent} 
                                    />
                                    <StatValue>5</StatValue>
                                    <StatLabel>Vitórias</StatLabel>
                                </StatCard>
                            </StatCardWrapper>

                            <StatCardWrapper>
                                <StatCard>
                                    <MaterialCommunityIcons 
                                        name="account-group" 
                                        size={28} 
                                        color={colors.accent} 
                                    />
                                    <StatValue>156</StatValue>
                                    <StatLabel>Jogadores</StatLabel>
                                </StatCard>
                            </StatCardWrapper>

                            <StatCardWrapper>
                                <StatCard>
                                    <MaterialCommunityIcons 
                                        name="star" 
                                        size={28} 
                                        color={colors.accent} 
                                    />
                                    <StatValue>1250</StatValue>
                                    <StatLabel>Pontos</StatLabel>
                                </StatCard>
                            </StatCardWrapper>
                        </StatisticsContainer>

                        <RecentActivityCard>
                            <ActivityTitle>Atividades Recentes</ActivityTitle>
                            
                            <ActivityItem>
                                <MaterialCommunityIcons 
                                    name="cards-playing" 
                                    size={24} 
                                    color={colors.accent} 
                                />
                                <ActivityText>Partida finalizada contra João</ActivityText>
                                <ActivityTime>2h atrás</ActivityTime>
                            </ActivityItem>

                            <ActivityItem>
                                <MaterialCommunityIcons 
                                    name="trophy" 
                                    size={24} 
                                    color={colors.accent} 
                                />
                                <ActivityText>Vitória contra equipe Dominadores</ActivityText>
                                <ActivityTime>3h atrás</ActivityTime>
                            </ActivityItem>

                            <ActivityItem>
                                <MaterialCommunityIcons 
                                    name="star" 
                                    size={24} 
                                    color={colors.accent} 
                                />
                                <ActivityText>+150 pontos conquistados</ActivityText>
                                <ActivityTime>5h atrás</ActivityTime>
                            </ActivityItem>
                        </RecentActivityCard>
                    </Content>
                </ScrollContent>
            </Container>
        </PageTransition>
    )
}
