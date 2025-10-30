import { useEffect, useRef, useState, useCallback } from 'react';
import { Client, IMessage, IFrame, StompSubscription } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import axios from 'axios';
import type { GameSession, AnswerType } from '@/lib/types';
import { useAuth } from '@/context/AuthContext';

export const useGameWebSocket = (roomCode?: string) => {
  const { token } = useAuth();
  const [gameSession, setGameSession] = useState<GameSession | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const stompRef = useRef<Client | null>(null);
  const subTopicRef = useRef<StompSubscription | null>(null);
  const subAppRef = useRef<StompSubscription | null>(null);

  useEffect(() => {
    if (!roomCode || !token) return;

    const client = new Client({
      webSocketFactory: () => new SockJS('/ws'),
      connectHeaders: { Authorization: `Bearer ${token}` },
      reconnectDelay: 5000,
      onConnect: (frame: IFrame) => {
        setIsConnected(true);
        setError(null);

        try {
          if (subTopicRef.current) { subTopicRef.current.unsubscribe(); subTopicRef.current = null; }
          subTopicRef.current = client.subscribe(`/topic/game/${roomCode}`, (msg: IMessage) => {
            try {
              const payload = JSON.parse(msg.body) as GameSession;
              setGameSession(payload);
            } catch (e) {
              console.error('Erro ao parsear /topic message', e);
            }
          });
        } catch (e) {
          console.error('Erro subscrever /topic', e);
        }

        try {
          if (subAppRef.current) { subAppRef.current.unsubscribe(); subAppRef.current = null; }
          // subscribe to /app/game/{roomCode} to trigger @SubscribeMapping (server may return state)
          subAppRef.current = client.subscribe(`/app/game/${roomCode}`, (msg: IMessage) => {
            try {
              const payload = JSON.parse(msg.body) as GameSession;
              setGameSession(payload);
            } catch (e) {
              console.error('Erro ao parsear /app subscription message', e);
            }
          });
        } catch (e) {
          console.error('Erro subscrever /app', e);
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
        if (subTopicRef.current) { subTopicRef.current.unsubscribe(); subTopicRef.current = null; }
        if (subAppRef.current) { subAppRef.current.unsubscribe(); subAppRef.current = null; }
        if (stompRef.current) { stompRef.current.deactivate(); stompRef.current = null; }
      } catch (e) {
        console.warn('Erro ao desconectar STOMP:', e);
      }
    };
  }, [roomCode, token]);

  const publish = useCallback((destination: string, body?: string, headers?: Record<string,string>) => {
    const client = stompRef.current;
    if (!client || !client.connected) {
      setError('Não conectado ao servidor de jogo');
      return false;
    }
    client.publish({
      destination,
      body: body !== undefined ? body : undefined,
      headers: { 'content-type': headers?.['content-type'] ?? 'application/json', ...(headers || {}) }
    });
    return true;
  }, []);

  const selectStory = useCallback((storyId: number) => {
    if (!roomCode) return false;
    return publish(`/app/game/${roomCode}/select-story`, String(storyId), { 'content-type': 'text/plain' });
  }, [publish, roomCode]);

  const askQuestion = useCallback(async (questionText: string): Promise<boolean> => {
    if (!roomCode) return false;
    const dto = { questionText };
    try {
      const ok = publish(`/app/game/${roomCode}/ask`, JSON.stringify(dto));
      return Boolean(ok);
    } catch (e) {
      console.error('Erro ao enviar pergunta via STOMP', e);
      setError('Erro ao enviar pergunta');
      return false;
    }
  }, [publish, roomCode]);

  const answerQuestion = useCallback(async (moveId: number, answer: AnswerType): Promise<boolean> => {
    if (!roomCode) {
      console.debug('[answerQuestion] missing roomCode', { moveId, answer });
      return false;
    }
    const dto = { moveId, answer };
    const payload = JSON.stringify(dto);
    console.debug('[answerQuestion] payload', payload);
    const ok = publish(`/app/game/${roomCode}/answer`, payload);
    return Boolean(ok);
  }, [publish, roomCode]);

  const pickWinner = useCallback(async (winnerId: number): Promise<boolean> => {
    if (!roomCode) {
      console.debug('[pickWinner] missing roomCode', { winnerId });
      return false;
    }
    const dto = { winnerId };
    const payload = JSON.stringify(dto);
    console.debug('[pickWinner] payload', payload);
    const ok = publish(`/app/game/${roomCode}/pick-winner`, payload);
    return Boolean(ok);
  }, [publish, roomCode]);

  const endGame = useCallback(() => {
    if (!roomCode) return false;
    return publish(`/app/game/${roomCode}/end`);
  }, [publish, roomCode]);

  // REST join
  const joinRoom = useCallback(async () => {
    if (!roomCode) throw new Error('roomCode obrigatório');
    try {
      const resp = await axios.post<GameSession>(`/api/v1/player/game-sessions/${roomCode}/join`);
      setGameSession(resp.data);
      return resp.data;
    } catch (e) {
      console.error('Erro ao dar join na sala', e);
      throw e;
    }
  }, [roomCode]);

  return {
    gameSession,
    isConnected,
    error,
    actions: { selectStory, askQuestion, answerQuestion, pickWinner, endGame, joinRoom }
  };
};