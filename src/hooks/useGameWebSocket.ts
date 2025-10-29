import { useEffect, useRef, useState, useCallback } from 'react';
import { Client, IMessage } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { useAuth } from '../context/AuthContext';
import type { GameSession, AnswerType } from '../lib/types';

export const useGameWebSocket = (roomCode?: string) => {
    const { token } = useAuth();
    const [gameSession, setGameSession] = useState<GameSession | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const stompRef = useRef<Client | null>(null);
    const subRef = useRef<any>(null);

    useEffect(() => {
        if (!roomCode || !token) return;

        const client = new Client({
            webSocketFactory: () => new SockJS('/ws'),
            connectHeaders: {
                Authorization: `Bearer ${token}`,
            },
            reconnectDelay: 5000,
            debug: () => {}, // silencioso
            onConnect: () => {
                setIsConnected(true);
                setError(null);
                try {
                    if (subRef.current) {
                        subRef.current.unsubscribe();
                        subRef.current = null;
                    }
                    subRef.current = client.subscribe(`/topic/game/${roomCode}`, (msg: IMessage) => {
                        try {
                            const payload = JSON.parse(msg.body) as GameSession;
                            setGameSession(payload);
                        } catch (e) {
                            console.error('Erro ao parsear mensagem STOMP:', e);
                        }
                    });
                } catch (e) {
                    console.error('Erro ao subscrever tópico:', e);
                }
            },
            onStompError: (frame) => {
                console.error('STOMP broker error', frame.headers, frame.body);
                setError(frame.headers?.message || 'Erro na comunicação STOMP');
            },
            onWebSocketClose: () => setIsConnected(false),
            onDisconnect: () => setIsConnected(false),
        });

        stompRef.current = client;
        client.activate();

        return () => {
            try {
                if (subRef.current) {
                    subRef.current.unsubscribe();
                    subRef.current = null;
                }
                if (stompRef.current) {
                    stompRef.current.deactivate();
                    stompRef.current = null;
                }
            } catch (e) {
                console.warn('Erro ao desconectar STOMP:', e);
            }
        };
    }, [roomCode, token]);

    const publish = useCallback((destination: string, body?: any) => {
        const client = stompRef.current;
        if (!client || !client.connected) {
            setError('Não conectado ao servidor de jogo');
            return;
        }
        client.publish({
            destination,
            body: body !== undefined ? JSON.stringify(body) : undefined,
            headers: { 'content-type': 'application/json' },
        });
    }, []);

    const selectStory = useCallback((storyId: number) => {
        if (!roomCode) return;
        publish(`/app/game/${roomCode}/select-story`, { storyId });
    }, [publish, roomCode]);

    const askQuestion = useCallback((questionText: string) => {
        if (!roomCode) return;
        publish(`/app/game/${roomCode}/ask`, { questionText });
    }, [publish, roomCode]);

    const answerQuestion = useCallback((moveId: number, answer: AnswerType) => {
        if (!roomCode) return;
        publish(`/app/game/${roomCode}/answer`, { moveId, answer });
    }, [publish, roomCode]);

    const endGame = useCallback(() => {
        if (!roomCode) return;
        publish(`/app/game/${roomCode}/end`);
    }, [publish, roomCode]);

    return {
        gameSession,
        isConnected,
        error,
        actions: { selectStory, askQuestion, answerQuestion, endGame },
    };
};