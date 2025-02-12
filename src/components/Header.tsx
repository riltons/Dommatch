import { View } from "react-native"
import styled from "styled-components/native"
import { colors } from "@/styles/colors"
import { MaterialCommunityIcons } from "@expo/vector-icons"
import { useAuth } from '../hooks/useAuth';
import { useRouter } from 'expo-router';

const Container = styled.View`
    width: 100%;
    padding: 20px;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    background-color: ${colors.secondary};
`;

const LogoContainer = styled.View`
    flex-direction: row;
    align-items: center;
`;

const LogoIconContainer = styled.View`
    width: 40px;
    height: 40px;
    border-radius: 12px;
    background-color: ${colors.accent};
    align-items: center;
    justify-content: center;
    margin-right: 12px;
`;

const LogoText = styled.Text`
    font-size: 24px;
    font-weight: bold;
    color: ${colors.gray100};
    margin-left: 8px;
`;

const ActionContainer = styled.View`
    flex-direction: row;
    align-items: center;
`;

const IconButton = styled.TouchableOpacity`
    width: 40px;
    height: 40px;
    border-radius: 20px;
    background-color: ${colors.primary}20;
    align-items: center;
    justify-content: center;
    margin-left: 12px;
`;

const NotificationBadge = styled.View`
    position: absolute;
    top: -4px;
    right: -4px;
    background-color: ${colors.error};
    width: 16px;
    height: 16px;
    border-radius: 8px;
    align-items: center;
    justify-content: center;
`;

const BadgeText = styled.Text`
    color: ${colors.gray100};
    font-size: 10px;
    font-weight: bold;
`;

interface HeaderProps {
    onNotificationPress?: () => void;
    onProfilePress?: () => void;
}

export function Header({ onNotificationPress, onProfilePress }: HeaderProps) {
    const { signOut } = useAuth();
    const router = useRouter();

    const handleLogout = async () => {
        await signOut();
        router.push('/login');
    };

    return (
        <Container>
            <LogoContainer>
                <MaterialCommunityIcons 
                    name="cards" 
                    size={32} 
                    color={colors.accent}
                />
                <LogoText>Dominô</LogoText>
            </LogoContainer>

            <ActionContainer>
                <IconButton onPress={onNotificationPress}>
                    <MaterialCommunityIcons 
                        name="bell-outline" 
                        size={24} 
                        color={colors.accent}
                    />
                </IconButton>

                <IconButton onPress={onProfilePress}>
                    <MaterialCommunityIcons 
                        name="account-circle-outline" 
                        size={24} 
                        color={colors.accent}
                    />
                </IconButton>

                <IconButton onPress={handleLogout}>
                    <MaterialCommunityIcons 
                        name="logout" 
                        size={24} 
                        color={colors.gray200}
                    />
                </IconButton>
            </ActionContainer>
        </Container>
    )
}
