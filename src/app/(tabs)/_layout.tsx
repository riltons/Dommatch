import { Tabs } from 'expo-router';
import { colors } from '@/styles/colors';
import { Feather } from '@expo/vector-icons';

export default function TabRoutesLayout() {
    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarStyle: {
                    backgroundColor: colors.backgroundDark,
                    borderTopWidth: 0,
                    elevation: 0,
                },
                tabBarActiveTintColor: colors.primary,
                tabBarInactiveTintColor: colors.gray300,
            }}
        >
            <Tabs.Screen
                name="dashboard"
                options={{
                    title: 'Dashboard',
                    tabBarIcon: ({ size, color }) => (
                        <Feather name="grid" size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="comunidades"
                options={{
                    title: 'Comunidades',
                    tabBarIcon: ({ size, color }) => (
                        <Feather name="users" size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="competicoes"
                options={{
                    title: 'Competições',
                    tabBarIcon: ({ size, color }) => (
                        <Feather name="award" size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="jogadores"
                options={{
                    title: 'Jogadores',
                    tabBarIcon: ({ size, color }) => (
                        <Feather name="user" size={size} color={color} />
                    ),
                }}
            />
        </Tabs>
    );
}