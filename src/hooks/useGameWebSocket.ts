import { useEffect, useState, useRef, useCallback } from 'react';
import { Client, IMessage } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { GameSession, AnswerType } from '@/lib/types';

export const useGameWebSocket = (roomCode: string | undefined, token: string | null) => {
    const [gameSession, setGameSession] = useState<GameSession | null>(null);
    const [isConnected, setIsConnected] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const stompClientRef = useRef<Client | null>(null);

    useEffect(() => {
        if (!roomCode || !token) return;

        const client = new Client({
            webSocketFactory: () => new SockJS('/ws'),
            connectHeaders: { Authorization: `Bearer ${token}` },
            onConnect: () => {
                setIsConnected(true);
                setError(null);
                client.subscribe(`/app/game/${roomCode}`, (message: IMessage) => {
                    setGameSession(JSON.parse(message.body) as GameSession);
                });
            },
            onStompError: (frame) => {
                console.error('Broker error:', frame.headers['message'], frame.body);
                setError('Erro na comunicação com o servidor.');
            },
            onDisconnect: () => setIsConnected(false),
        });

        stompClientRef.current = client;
        client.activate();

        return () => {
            if (client) client.deactivate();
        };
    }, [roomCode, token]);

    const publish = useCallback((destination: string, body?: any) => {
        if (stompClientRef.current && stompClientRef.current.connected) {
            stompClientRef.current.publish({
                destination,
                body: body ? JSON.stringify(body) : undefined,
            });
        } else {
            setError("Você não está conectado. Tente recarregar a página.");
        }
    }, []);

    const selectStory = (storyId: number) => publish(`/app/game/${roomCode}/select-story`, storyId);
    const askQuestion = (questionText: string) => publish(`/app/game/${roomCode}/ask`, { questionText });
    const answerQuestion = (moveId: number, answer: AnswerType) => publish(`/app/game/${roomCode}/answer`, { moveId, answer });
    const endGame = () => publish(`/app/game/${roomCode}/end`);

    return { 
        gameSession, 
        isConnected, 
        error, 
        actions: { selectStory, askQuestion, answerQuestion, endGame }
    };
};