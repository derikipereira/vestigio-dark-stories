import React, { useMemo, useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useGameWebSocket } from '../hooks/useGameWebSocket';
import { useAuth } from '../context/AuthContext';
import { useGame } from '../hooks/useGame';
import { Navigation } from '@/components/navigation';
import { DetectiveView } from '@/components/detective-view';
import { MasterView } from '@/components/master-view';
import { TriviaView } from '@/components/trivia-view';
import { HangmanView } from '@/components/hangman-view';
import { GameSession } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const GamePage: React.FC = () => {
  const params = useParams<{ roomCode?: string }>();
  const navigate = useNavigate();
  const roomCode = params.roomCode;
  const { user, token } = useAuth();
  const { gameSession: wsSession, isConnected, error, actions } = useGameWebSocket(roomCode);
  const { gameType, setGameType, setCurrentGame } = useGame();
  
  const [initialSession, setInitialSession] = useState<GameSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const hasJoinedRef = useRef(false);

  // Faz join via REST somente depois que o STOMP estiver conectado
  useEffect(() => {
    if (!roomCode || !token || hasJoinedRef.current) return;
    if (!isConnected) return;
    
    hasJoinedRef.current = true;
    (async () => {
      try {
        setIsLoading(true);
        const response = await axios.get<GameSession>(`/api/v1/player/game-sessions/${roomCode}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setInitialSession(response.data);
        setCurrentGame(response.data);
        setGameType(response.data.gameType || 'VESTIGIO');
      } catch (e) {
        console.error('Erro ao buscar sessão:', e);
      } finally {
        setIsLoading(false);
      }
    })();
  }, [roomCode, token, actions, isConnected, setGameType, setCurrentGame]);
  
  const session = wsSession || initialSession;
  const currentGameType = session?.gameType || gameType || 'VESTIGIO';
  
  const isMaster = useMemo(() => {
    if (!user || !session) return false;
    if (session.master?.id !== undefined && user.id !== undefined) return user.id === session.master.id;
    return user.username === session.master?.username;
  }, [user, session]);

  if (!token) {
    return <div className="p-8 text-center">Autenticação necessária. Faça login.</div>;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-mystery flex items-center justify-center">
        <div className="text-white text-xl">Carregando jogo...</div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gradient-mystery">
        <Navigation />
        <div className="max-w-2xl mx-auto px-4 py-8">
          <Card className="bg-red-500/10 border-red-500/30">
            <CardContent className="pt-6">
              <p className="text-red-400 text-center mb-4">Erro ao carregara sala</p>
              <Button onClick={() => navigate('/lobby')} className="w-full">
                Voltar ao Lobby
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Renderizar view apropriada baseada no tipo de jogo
  const renderGameView = () => {
    switch (currentGameType) {
      case 'TRIVIA':
        return (
          <TriviaView
            session={session}
            onAnswer={async (questionIndex, answerIndex) => {
              setActionLoading(true);
              try {
                await axios.post(
                  `/api/v1/player/game-sessions/${roomCode}/action`,
                  {
                    actionType: 'ANSWER_QUESTION',
                    payload: { selectedAnswerIndex: answerIndex }
                  },
                  { headers: { Authorization: `Bearer ${token}` } }
                );
              } catch (error) {
                console.error('Erro ao responder pergunta:', error);
              } finally {
                setActionLoading(false);
              }
            }}
            onFinish={() => navigate('/lobby')}
            isLoading={actionLoading}
          />
        );
      case 'HANGMAN':
        return (
          <HangmanView
            session={session}
            onGuessLetter={async (letter) => {
              setActionLoading(true);
              try {
                await axios.post(
                  `/api/v1/player/game-sessions/${roomCode}/action`,
                  {
                    actionType: 'GUESS_LETTER',
                    payload: { letter: letter.toUpperCase() }
                  },
                  { headers: { Authorization: `Bearer ${token}` } }
                );
              } catch (error) {
                console.error('Erro ao chutar letra:', error);
              } finally {
                setActionLoading(false);
              }
            }}
            onRevealHint={async () => {
              setActionLoading(true);
              try {
                console.log('Revelar dica');
                // TODO: Implementar endpoint de dica se existir no backend
              } finally {
                setActionLoading(false);
              }
            }}
            onFinish={() => navigate('/lobby')}
            isLoading={actionLoading}
          />
        );
      case 'VESTIGIO':
      default:
        return isMaster ? (
          <MasterView
            session={session}
            onAnswer={async (moveId, answer) => {
              setActionLoading(true);
              try {
                if (actions.answerQuestion) {
                  await actions.answerQuestion(moveId, answer);
                }
              } finally {
                setActionLoading(false);
              }
            }}
            onFinish={() => navigate('/lobby')}
            isLoading={actionLoading}
            isConnected={isConnected}
          />
        ) : (
          <DetectiveView
            session={session}
            onAskQuestion={async (question) => {
              setActionLoading(true);
              try {
                if (actions.askQuestion) {
                  await actions.askQuestion(question);
                }
              } finally {
                setActionLoading(false);
              }
            }}
            onFinish={() => navigate('/lobby')}
            isLoading={actionLoading}
            isConnected={isConnected}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-mystery">
      <Navigation />
      <main className="max-w-7xl mx-auto p-6">
        <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-mystery-red mb-2">
              {currentGameType === 'VESTIGIO' && '🔍'} 
              {currentGameType === 'TRIVIA' && '🎯'} 
              {currentGameType === 'HANGMAN' && '🔤'} {' '}
              {currentGameType}
            </h1>
            <div className="text-sm text-muted-foreground">
              Sala: <strong>{session?.roomCode || roomCode}</strong>
            </div>
            <div className="text-sm text-muted-foreground">
              Status: <strong>{session?.status}</strong>
            </div>
            <div className={`text-sm ${isConnected ? 'text-green-400' : 'text-red-400'}`}>
              WebSocket: {isConnected ? 'Conectado' : 'Desconectado'}
            </div>
            {error && <div className="text-red-400 text-sm mt-2">Erro: {error}</div>}
          </div>

          <div className="flex items-center gap-2">
            {isMaster && session?.status === 'WAITING_FOR_PLAYERS' && (
              <Button 
                onClick={async () => {
                  try {
                    await axios.post(
                      `/api/v1/player/game-sessions/${roomCode}/start`,
                      {},
                      { headers: { Authorization: `Bearer ${token}` } }
                    );
                  } catch (error) {
                    console.error('Erro ao iniciar jogo:', error);
                  }
                }}
                className="bg-mystery-gold hover:bg-mystery-gold/80 text-black"
              >
                Iniciar Jogo
              </Button>
            )}
            {isMaster && session?.status === 'IN_PROGRESS' && (
              <Button variant="destructive" onClick={async () => {
                try {
                  await axios.post(
                    `/api/v1/player/game-sessions/${roomCode}/finish`,
                    {},
                    { headers: { Authorization: `Bearer ${token}` } }
                  );
                  setTimeout(() => navigate('/lobby'), 1000);
                } catch (error) {
                  console.error('Erro ao finalizar jogo:', error);
                }
              }}>
                Finalizar Jogo
              </Button>
            )}
            <Button 
              onClick={() => navigator.clipboard?.writeText(session?.roomCode || '')}
              variant="outline"
            >
              Copiar Código
            </Button>
            <Button onClick={() => navigate('/lobby')} variant="ghost">
              Voltar
            </Button>
          </div>
        </header>

        {/* Renderizar view apropriada do jogo */}
        {session?.status === 'WAITING_FOR_PLAYERS' ? (
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="text-center text-2xl">
                ⏳ Aguardando jogadores...
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-center text-muted-foreground">
                  Compartilhe o código <strong>{session.roomCode}</strong> com seus amigos!
                </p>
                
                <div className="space-y-2">
                  <h3 className="font-semibold">Jogadores na sala:</h3>
                  <div className="grid gap-2">
                    {session.players?.map((player) => (
                      <div 
                        key={player.id} 
                        className="flex items-center gap-2 p-2 bg-dark/30 rounded"
                      >
                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                        <span>{player.name || player.username}</span>
                        {player.id === session.master?.id && (
                          <span className="text-xs text-mystery-gold">(Master)</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {isMaster && (
                  <div className="pt-4 border-t border-border">
                    <p className="text-sm text-muted-foreground text-center mb-2">
                      Você é o Master. Inicie o jogo quando estiver pronto!
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ) : session?.status === 'COMPLETED' ? (
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="text-center text-2xl">
                🎉 Jogo Finalizado!
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-muted-foreground mb-4">
                Obrigado por jogar!
              </p>
              <Button onClick={() => navigate('/lobby')}>
                Voltar ao Lobby
              </Button>
            </CardContent>
          </Card>
        ) : (
          renderGameView()
        )}
      </main>
    </div>
  );
};

export default GamePage;