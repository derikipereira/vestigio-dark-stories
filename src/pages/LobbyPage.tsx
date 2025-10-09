import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { GameLobby } from '@/components/game-lobby';
import { Navigation } from '@/components/navigation';
import { useToast } from "@/components/ui/use-toast";
import { Story, StoryResponseDTO } from '@/lib/types';
import { StorySelectionModal } from '@/components/modal/story-select-modal';

axios.defaults.baseURL = 'http://localhost:8080';

const LobbyPage: React.FC = () => {
    const navigate = useNavigate();
    const { toast } = useToast();

    const [roomCode, setRoomCode] = useState<string>('');
    const [isCreating, setIsCreating] = useState(false);
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalStories, setModalStories] = useState<Story[]>([]);

    const [stories, setStories] = useState<StoryResponseDTO[]>([]);
    const [selectedStoryId, setSelectedStoryId] = useState<number | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const handleOpenCreateModal = async () => {
        try {
            const response = await axios.get<Story[]>('/api/player/stories/random?count=3');
            if (response.data.length === 0) {
                toast({ variant: "destructive", title: "Nenhuma história encontrada." });
                return;
            }
            setModalStories(response.data);
            setIsModalOpen(true);
        } catch (error) {
            toast({ variant: "destructive", title: "Erro ao buscar histórias aleatórias." });
        }
    };

    const handleCreateGame = async (storyId: number) => {
        setIsCreating(true);
        try {
            const response = await axios.post('/api/player/game-sessions', { storyId });
            const newRoomCode = response.data.roomCode;
            toast({ title: "Sala criada com sucesso!", description: `Código da sala: ${newRoomCode}` });
            setIsModalOpen(false);
            navigate(`/game/${newRoomCode}`);
        } catch (error) {
            toast({ variant: "destructive", title: "Erro ao criar a partida." });
        } finally {
            setIsCreating(false);
        }
    };


    useEffect(() => {
        const fetchStories = async () => {
            try {
                const response = await axios.get<StoryResponseDTO[]>('/api/player/stories');
                setStories(response.data);
                if (response.data.length > 0) {
                    setSelectedStoryId(response.data[0].id);
                }
            } catch (error) {
                console.error("Erro ao buscar histórias:", error);
                toast({
                    variant: "destructive",
                    title: "Erro ao carregar histórias",
                    description: "Não foi possível buscar os mistérios disponíveis.",
                });
            } finally {
                setIsLoading(false);
            }
        };
        fetchStories();
    }, [toast]);
    
    const handleJoinGame = async () => {
        const trimmedCode = roomCode.trim().toUpperCase();
        if (!trimmedCode) {
            toast({ variant: "destructive", title: "Código da sala inválido!" });
            return;
        }
        
        try {
            await axios.post(`/api/player/game-sessions/${trimmedCode}/join`);
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

    if (isLoading) {
        return <div className="flex items-center justify-center min-h-screen text-white">Carregando Lobby...</div>;
    }

    return (
        <div className="min-h-screen bg-gradient-mystery">
            <Navigation />
            <GameLobby
                roomCode={roomCode}
                onRoomCodeChange={setRoomCode}
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