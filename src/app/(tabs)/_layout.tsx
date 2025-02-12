import { Tabs } from "expo-router"
import { MaterialCommunityIcons } from "@expo/vector-icons"
import { colors } from "@/styles/colors"

export default function TabRoutesLayout() {
    return (
        <Tabs screenOptions={{
            headerShown: false,
            tabBarStyle: {
                backgroundColor: colors.secondary,
                borderTopWidth: 0,
                height: 75,
                paddingBottom: 12,
                paddingTop: 8,
                shadowColor: colors.primary,
                shadowOffset: {
                    width: 0,
                    height: -2,
                },
                shadowOpacity: 0.1,
                shadowRadius: 3,
                elevation: 8,
            },
            tabBarActiveTintColor: colors.accent,
            tabBarInactiveTintColor: `${colors.accent}80`,
            tabBarLabelStyle: {
                fontWeight: '500',
                marginTop: 4,
                fontSize: 12,
                paddingBottom: 12,
            },
            tabBarIconStyle: {
                marginTop: 4,
            },
        }}>
            <Tabs.Screen
                name="dashboard"
                options={{
                    tabBarLabel: "Dashboard",
                    tabBarIcon: ({ color, size }) => (
                        <MaterialCommunityIcons 
                            name="view-dashboard" 
                            size={size} 
                            color={color}
                        />
                    ),
                }}
            />

            <Tabs.Screen
                name="comunidades"
                options={{
                    tabBarLabel: "Comunidades",
                    tabBarIcon: ({ color, size }) => (
                        <MaterialCommunityIcons 
                            name="account-group" 
                            size={size} 
                            color={color}
                        />
                    ),
                }}
            />

            <Tabs.Screen
                name="competicoes"
                options={{
                    tabBarLabel: "Competições",
                    tabBarIcon: ({ color, size }) => (
                        <MaterialCommunityIcons 
                            name="trophy" 
                            size={size} 
                            color={color}
                        />
                    ),
                }}
            />

            <Tabs.Screen
                name="jogadores"
                options={{
                    tabBarLabel: "Jogadores",
                    tabBarIcon: ({ color, size }) => (
                        <MaterialCommunityIcons 
                            name="account" 
                            size={size} 
                            color={color}
                        />
                    ),
                }}
            />
        </Tabs>
    )
}