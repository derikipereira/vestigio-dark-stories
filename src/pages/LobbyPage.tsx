import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { GameLobby } from '@/components/game-lobby';
import { Navigation } from '@/components/navigation';
import { useToast } from "@/components/ui/use-toast";
import { GameType, Story, GameConfigParams } from '@/lib/types';
import { StorySelectionModal } from '@/components/modal/story-select-modal';
import { useGameWebSocket } from '../hooks/useGameWebSocket';
import { useAuth } from '../context/AuthContext';
import { useGame } from '../hooks/useGame';

axios.defaults.baseURL = 'http://localhost:8080';

const LobbyPage: React.FC = () => {
    const navigate = useNavigate();
    const { toast } = useToast();
    const params = useParams<{ roomCode?: string }>();
    const roomCode = params.roomCode;
    const { token } = useAuth();
    const { setGameType, setCurrentGame } = useGame();

    const { gameSession, isConnected, error } = useGameWebSocket(roomCode);

    const [inputRoomCode, setInputRoomCode] = useState<string>(roomCode || '');
    const [isCreating, setIsCreating] = useState(false);
    const [selectedGameType, setSelectedGameType] = useState<GameType | null>(null);
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalStories, setModalStories] = useState<Story[]>([]);

    const [stories, setStories] = useState<any[]>([]);
    const [selectedStoryId, setSelectedStoryId] = useState<number | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleGameTypeSelect = (type: GameType) => {
        setSelectedGameType(type);
        setGameType(type);
    };

    const handleOpenCreateModal = async () => {
        if (!selectedGameType) {
            toast({ variant: "destructive", title: "Selecione um tipo de jogo" });
            return;
        }

        try {
            if (selectedGameType === 'VESTIGIO') {
                const response = await axios.get<Story[]>('/api/v1/player/stories/random?count=3');
                if (response.data.length === 0) {
                    toast({ variant: "destructive", title: "Nenhuma história encontrada." });
                    return;
                }
                setModalStories(response.data);
                setIsModalOpen(true);
            } else {
                // Para TRIVIA e HANGMAN, criar diretamente sem modal de seleção
                await handleCreateGameDirect();
            }
        } catch (error) {
            toast({ variant: "destructive", title: "Erro ao preparar o jogo." });
        }
    };

    const handleCreateGameDirect = async () => {
        if (!selectedGameType) return;
        
        setIsCreating(true);
        try {
            let configParams: any = {};
            
            if (selectedGameType === 'TRIVIA') {
                configParams = {
                    questionCount: 10,
                    category: 'GENERAL',
                    difficulty: 'MEDIUM'
                };
            } else if (selectedGameType === 'HANGMAN') {
                configParams = {
                    difficulty: 'MEDIUM',
                    maxAttempts: 6
                };
            }

            const response = await axios.post('/api/v1/player/game-sessions', {
                gameType: selectedGameType,
                configParams
            });
            
            const newRoomCode = response.data.roomCode;
            setCurrentGame(response.data);
            setGameType(selectedGameType);
            toast({ title: "Sala criada com sucesso!", description: `Código da sala: ${newRoomCode}` });
            setIsModalOpen(false);
            navigate(`/game/${newRoomCode}`);
        } catch (error) {
            console.error('Erro ao criar jogo:', error);
            toast({ variant: "destructive", title: "Erro ao criar a partida." });
        } finally {
            setIsCreating(false);
        }
    };

    const handleCreateGame = async (storyId: number) => {
        setIsCreating(true);
        try {
            const response = await axios.post('/api/v1/player/game-sessions', { 
                gameType: 'VESTIGIO',
                configParams: {
                    storyId: storyId
                }
            });
            
            const newRoomCode = response.data.roomCode;
            setCurrentGame(response.data);
            setGameType('VESTIGIO');
            toast({ title: "Sala criada com sucesso!", description: `Código da sala: ${newRoomCode}` });
            setIsModalOpen(false);
            navigate(`/game/${newRoomCode}`);
        } catch (error) {
            console.error('Erro ao criar jogo:', error);
            toast({ variant: "destructive", title: "Erro ao criar a partida." });
        } finally {
            setIsCreating(false);
        }
    };

    useEffect(() => {
        const fetchStories = async () => {
            try {
                const response = await axios.get<any[]>('/api/v1/player/stories');
                setStories(response.data);
                if (response.data.length > 0) {
                    setSelectedStoryId(response.data[0].id);
                }
            } catch (error) {
                console.error("Erro ao buscar histórias:", error);
            }
        };
        fetchStories();
    }, []);
    
    const handleJoinGame = async () => {
        const trimmedCode = inputRoomCode.trim().toUpperCase();
        if (!trimmedCode) {
            toast({ variant: "destructive", title: "Código da sala inválido!" });
            return;
        }
        
        try {
            const response = await axios.post(`/api/v1/player/game-sessions/${trimmedCode}/join`);
            setCurrentGame(response.data);
            setGameType(response.data.gameType || 'VESTIGIO');
            toast({ title: "Entrando na sala..." });
            navigate(`/game/${trimmedCode}`);
        } catch (error) {
            console.error("Erro ao entrar na sala:", error);
            toast({
                variant: "destructive",
                title: "Erro ao entrar na sala",
                description: "Verifique o código e tente novamente.",
            });
        }
    };

    if (!token) {
        return <div>Autenticação necessária. Faça login.</div>;
    }

    return (
        <div className="min-h-screen bg-gradient-mystery">
            <Navigation />
            <GameLobby
                roomCode={inputRoomCode}
                selectedGameType={selectedGameType}
                onGameTypeSelect={handleGameTypeSelect}
                onRoomCodeChange={setInputRoomCode}
                onOpenCreateModal={handleOpenCreateModal}
                onJoinGame={handleJoinGame}
                isCreating={isCreating}
            />
            <StorySelectionModal
                isOpen={isModalOpen}
                stories={modalStories}
                onOpenChange={setIsModalOpen}
                onCreateGame={handleCreateGame}
                isCreating={isCreating}
            />
        </div>
    );
};

export default LobbyPage;