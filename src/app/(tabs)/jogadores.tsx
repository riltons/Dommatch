import React, { useState, useEffect } from 'react';
import { Alert, FlatList, RefreshControl, Modal as RNModal } from 'react-native';
import styled from 'styled-components/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../../styles/colors';
import { Player, playerService } from '../../services/playerService';
import { Header } from '@/components/Header';

export default function Jogadores() {
    const [players, setPlayers] = useState<Player[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        nickname: ''
    });

    const loadPlayers = async () => {
        try {
            const { data, error } = await playerService.listPlayers();
            if (error) throw error;
            setPlayers(data || []);
        } catch (error) {
            console.error('Erro ao carregar jogadores:', error);
            Alert.alert('Erro', 'Não foi possível carregar os jogadores');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const handleSave = async () => {
        if (!formData.name.trim()) {
            Alert.alert('Erro', 'O nome do jogador é obrigatório');
            return;
        }

        try {
            if (selectedPlayer) {
                // Atualizar jogador
                const { error } = await playerService.updatePlayer(selectedPlayer.id, {
                    name: formData.name.trim(),
                    nickname: formData.nickname.trim() || null
                });
                if (error) throw error;
                Alert.alert('Sucesso', 'Jogador atualizado com sucesso');
            } else {
                // Criar novo jogador
                const { error } = await playerService.createPlayer(
                    formData.name.trim(),
                    formData.nickname.trim() || undefined
                );
                if (error) throw error;
                Alert.alert('Sucesso', 'Jogador adicionado com sucesso');
            }

            setFormData({ name: '', nickname: '' });
            setSelectedPlayer(null);
            setShowModal(false);
            loadPlayers();
        } catch (error) {
            console.error('Erro ao salvar jogador:', error);
            Alert.alert('Erro', 'Não foi possível salvar o jogador');
        }
    };

    const handleEdit = (player: Player) => {
        setSelectedPlayer(player);
        setFormData({
            name: player.name,
            nickname: player.nickname || ''
        });
        setShowModal(true);
    };

    const handleDelete = (player: Player) => {
        Alert.alert(
            'Confirmar exclusão',
            `Deseja realmente excluir o jogador ${player.name}?`,
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Excluir',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            const { error } = await playerService.deletePlayer(player.id);
                            if (error) throw error;
                            Alert.alert('Sucesso', 'Jogador excluído com sucesso');
                            loadPlayers();
                        } catch (error) {
                            console.error('Erro ao excluir jogador:', error);
                            Alert.alert('Erro', 'Não foi possível excluir o jogador');
                        }
                    }
                }
            ]
        );
    };

    useEffect(() => {
        loadPlayers();
    }, []);

    const renderItem = ({ item }: { item: Player }) => (
        <PlayerCard>
            <PlayerInfo>
                <PlayerName>{item.name}</PlayerName>
                {item.nickname && <PlayerNickname>({item.nickname})</PlayerNickname>}
            </PlayerInfo>
            <ActionsContainer>
                <ActionButton onPress={() => handleEdit(item)}>
                    <MaterialCommunityIcons 
                        name="pencil" 
                        size={20} 
                        color={colors.gray300}
                    />
                </ActionButton>
                <ActionButton onPress={() => handleDelete(item)}>
                    <MaterialCommunityIcons 
                        name="trash-can-outline" 
                        size={20} 
                        color={colors.error}
                    />
                </ActionButton>
            </ActionsContainer>
        </PlayerCard>
    );

    const handleAddNew = () => {
        setSelectedPlayer(null);
        setFormData({ name: '', nickname: '' });
        setShowModal(true);
    };

    return (
        <Container>
            <Header />
            
            <FlatList
                data={players}
                renderItem={renderItem}
                keyExtractor={item => item.id}
                contentContainerStyle={{ 
                    padding: 16,
                    paddingBottom: 80, // Espaço para o FAB
                    flexGrow: 1,
                    ...(players.length === 0 && { justifyContent: 'center' })
                }}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={() => {
                            setRefreshing(true);
                            loadPlayers();
                        }}
                        colors={[colors.accent]}
                        tintColor={colors.accent}
                    />
                }
                ListEmptyComponent={
                    !loading ? (
                        <EmptyContainer>
                            <MaterialCommunityIcons 
                                name="account-group-outline" 
                                size={48} 
                                color={colors.gray400}
                            />
                            <EmptyMessage>
                                Nenhum jogador cadastrado{'\n'}
                                Toque no + para adicionar
                            </EmptyMessage>
                        </EmptyContainer>
                    ) : null
                }
            />

            <AddButton onPress={handleAddNew}>
                <MaterialCommunityIcons name="plus" size={24} color={colors.gray100} />
            </AddButton>

            <RNModal
                visible={showModal}
                transparent
                animationType="fade"
                onRequestClose={() => setShowModal(false)}
            >
                <Modal>
                    <ModalContent>
                        <ModalTitle>
                            {selectedPlayer ? 'Editar Jogador' : 'Adicionar Jogador'}
                        </ModalTitle>
                        
                        <Input
                            placeholder="Nome do jogador *"
                            value={formData.name}
                            onChangeText={(text) => setFormData(prev => ({ ...prev, name: text }))}
                            placeholderTextColor={colors.gray400}
                        />
                        
                        <Input
                            placeholder="Apelido (opcional)"
                            value={formData.nickname}
                            onChangeText={(text) => setFormData(prev => ({ ...prev, nickname: text }))}
                            placeholderTextColor={colors.gray400}
                        />

                        <ButtonsContainer>
                            <CancelButton onPress={() => {
                                setShowModal(false);
                                setSelectedPlayer(null);
                                setFormData({ name: '', nickname: '' });
                            }}>
                                <ButtonText>Cancelar</ButtonText>
                            </CancelButton>
                            
                            <SaveButton onPress={handleSave}>
                                <ButtonText>Salvar</ButtonText>
                            </SaveButton>
                        </ButtonsContainer>
                    </ModalContent>
                </Modal>
            </RNModal>
        </Container>
    );
}

const Container = styled.View`
    flex: 1;
    background-color: ${colors.backgroundDark};
`;

const PlayerCard = styled.View`
    background-color: ${colors.backgroundLight};
    padding: 16px;
    border-radius: 8px;
    margin-bottom: 8px;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
`;

const PlayerInfo = styled.View`
    flex: 1;
`;

const PlayerName = styled.Text`
    font-size: 16px;
    font-weight: bold;
    color: ${colors.gray100};
`;

const PlayerNickname = styled.Text`
    font-size: 14px;
    color: ${colors.gray300};
    margin-top: 4px;
`;

const ActionsContainer = styled.View`
    flex-direction: row;
    align-items: center;
`;

const ActionButton = styled.TouchableOpacity`
    padding: 8px;
    margin-left: 8px;
`;

const EmptyContainer = styled.View`
    align-items: center;
    justify-content: center;
`;

const EmptyMessage = styled.Text`
    color: ${colors.gray400};
    text-align: center;
    margin-top: 16px;
    font-size: 16px;
    line-height: 24px;
`;

const AddButton = styled.TouchableOpacity`
    position: absolute;
    right: 16px;
    bottom: 16px;
    width: 56px;
    height: 56px;
    border-radius: 28px;
    background-color: ${colors.accent};
    align-items: center;
    justify-content: center;
    elevation: 4;
`;

const Modal = styled.View`
    flex: 1;
    background-color: rgba(0, 0, 0, 0.5);
    justify-content: center;
    align-items: center;
    padding: 20px;
`;

const ModalContent = styled.View`
    background-color: ${colors.backgroundLight};
    padding: 20px;
    border-radius: 8px;
    width: 100%;
`;

const ModalTitle = styled.Text`
    font-size: 20px;
    font-weight: bold;
    color: ${colors.gray100};
    margin-bottom: 16px;
    text-align: center;
`;

const Input = styled.TextInput`
    background-color: ${colors.backgroundDark};
    padding: 16px;
    border-radius: 8px;
    margin-bottom: 16px;
    color: ${colors.gray100};
    font-size: 16px;
`;

const ButtonsContainer = styled.View`
    flex-direction: row;
    justify-content: space-between;
    margin-top: 8px;
`;

const SaveButton = styled.TouchableOpacity`
    background-color: ${colors.accent};
    padding: 16px;
    border-radius: 8px;
    flex: 1;
    margin-left: 8px;
`;

const CancelButton = styled.TouchableOpacity`
    background-color: ${colors.gray700};
    padding: 16px;
    border-radius: 8px;
    flex: 1;
    margin-right: 8px;
`;

const ButtonText = styled.Text`
    color: ${colors.gray100};
    font-size: 16px;
    font-weight: bold;
    text-align: center;
`;