import React, { useMemo, useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { useGameWebSocket } from '../hooks/useGameWebSocket';
import { useAuth } from '../context/AuthContext';
import { Navigation } from '@/components/navigation';
import { GameSession, Story, Move } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Avatar } from '@/components/ui/avatar';

const StoryOptionsGrid: React.FC<{ stories: Story[]; onSelect: (id: number) => void }> = ({ stories, onSelect }) => (
  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
    {stories.map((s) => (
      <Card key={s.id} className="overflow-hidden">
        <CardHeader>
          <CardTitle className="truncate">{s.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4 line-clamp-4">
            {s.enigmaticSituation ?? s.description}
          </p>
          <Button className="w-full" onClick={() => onSelect(s.id)}>Escolher esta história</Button>
        </CardContent>
      </Card>
    ))}
  </div>
);

const MoveCard: React.FC<{
  move: Move;
  isMaster: boolean;
  isPending?: boolean;
  onAnswer: (moveId: number, answer: 'SIM' | 'NAO' | 'IRRELEVANTE') => void;
}> = ({ move, isMaster, isPending = false, onAnswer }) => {
  const author = move.authorName ?? move.player?.username ?? move.player?.name ?? 'Anônimo';
  const questionText = move.question ?? move.questionText ?? move.text ?? '';
  return (
    <Card className="flex flex-col">
      <CardContent className="flex items-start gap-4">
        <Avatar className="h-10 w-10" />
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <div className="text-sm font-medium">{author}</div>
            <div className="text-xs text-muted-foreground">{move.createdAt ? new Date(move.createdAt).toLocaleString() : ''}</div>
          </div>
          <div className="mt-2 text-sm">{questionText}</div>
          {move.answer !== undefined && move.answer !== null && (
            <div className="mt-2 text-xs">
              Resposta: <strong>{move.answer}</strong>
            </div>
          )}
        </div>

        {isMaster && (move.answer === null || move.answer === undefined) && (
          <div className="flex flex-col gap-2">
            <Button size="sm" onClick={() => onAnswer(move.id, 'SIM')} disabled={isPending}>
              {isPending ? 'Respondendo...' : 'SIM'}
            </Button>
            <Button size="sm" onClick={() => onAnswer(move.id, 'NAO')} disabled={isPending}>
              {isPending ? 'Respondendo...' : 'NÃO'}
            </Button>
            <Button size="sm" onClick={() => onAnswer(move.id, 'IRRELEVANTE')} disabled={isPending}>
              {isPending ? 'Respondendo...' : 'IRRELEVANTE'}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const StoryPreviewCard: React.FC<{ story?: Story }> = ({ story }) => {
  if (!story) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>História</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">Nenhuma história selecionada</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{story.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-sm text-slate-200 whitespace-pre-wrap mb-3">{story.enigmaticSituation ?? story.description}</div>
        <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
          <div><strong>Gênero:</strong> {story.genre ?? '—'}</div>
          <div><strong>Dificuldade:</strong> {story.difficulty ?? '—'}</div>
          <div><strong>Criador:</strong> {story.creatorName ?? 'System'}</div>
        </div>
      </CardContent>
    </Card>
  );
};

const GamePage: React.FC = () => {
  const params = useParams<{ roomCode?: string }>();
  const roomCode = params.roomCode;
  const { user, token } = useAuth();
  const { gameSession: wsSession, isConnected, error, actions } = useGameWebSocket(roomCode);
  const [initialSession, setInitialSession] = useState<GameSession | null>(null);
  const hasJoinedRef = useRef(false);

  // estado para o input de pergunta (corrige crash)
  const [questionText, setQuestionText] = useState<string>('');
  const [sendingQuestion, setSendingQuestion] = useState(false);
  const [pendingAnswers, setPendingAnswers] = useState<Record<number, boolean>>({});
  const [pendingPick, setPendingPick] = useState<Record<number, boolean>>({});

  // Faz join via REST somente depois que o STOMP estiver conectado
  useEffect(() => {
    if (!roomCode || !token || hasJoinedRef.current) return;
    // aguarda conexão STOMP para não perder o broadcast do servidor
    if (!isConnected) return;
    hasJoinedRef.current = true;
    (async () => {
      try {
        const s = await actions.joinRoom?.();
        if (s) setInitialSession(s);
      } catch (e) {
        // fallback: tentar GET caso join falhe
        console.warn('join falhou, tentando GET', e);
        try {
          const r = await axios.get<GameSession>(`/api/v1/player/game-sessions/${roomCode}`);
          setInitialSession(r.data);
        } catch {
          // ignore
        }
      }
    })();
  }, [roomCode, token, actions, isConnected]);
  
  const session = wsSession ?? initialSession;
  
  const isMaster = useMemo(() => {
    if (!user || !session) return false;
    if (session.master?.id !== undefined && user.id !== undefined) return user.id === session.master.id;
    return user.username === session.master?.username;
  }, [user, session]);

  if (!token) return <div className="p-8 text-center">Autenticação necessária. Faça login.</div>;

  const handleAsk = async () => {
    if (!questionText.trim()) return;
    if (!isConnected) {
      setQuestionText('');
      return;
    }
    setSendingQuestion(true);
    try {
      const ok = await actions.askQuestion(questionText.trim());
      if (!ok) {
        console.warn('Pergunta não enviada');
      }
      setQuestionText('');
    } catch (e) {
      console.error('Erro ao enviar pergunta', e);
    } finally {
      setSendingQuestion(false);
    }
  };

  const handleAnswer = async (moveId: number, answer: 'SIM' | 'NAO' | 'IRRELEVANTE') => {
    if (!isConnected) return;
    setPendingAnswers(prev => ({ ...prev, [moveId]: true }));
    try {
      const ok = await actions.answerQuestion(moveId, answer);
      if (!ok) {
        console.warn('Falha ao enviar resposta');
      }
    } catch (e) {
      console.error('Erro ao enviar resposta', e);
    } finally {
      setPendingAnswers(prev => {
        const copy = { ...prev };
        delete copy[moveId];
        return copy;
      });
    }
  };

  const handlePickWinner = async (winnerId: number) => {
    if (!isConnected) return;
    setPendingPick(prev => ({ ...prev, [winnerId]: true }));
    try {
      const ok = await actions.pickWinner(winnerId);
      if (!ok) {
        console.warn('Falha ao enviar pick-winner');
        alert('Erro ao escolher vencedor. Verifique conexão.');
      }
      // aguardamos broadcast do servidor para atualizar o estado (session)
    } catch (e) {
      console.error('Erro ao enviar pick-winner', e);
      alert('Erro ao escolher vencedor. Veja console.');
    } finally {
      setPendingPick(prev => {
        const copy = { ...prev };
        delete copy[winnerId];
        return copy;
      });
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      <Navigation />
      <main className="max-w-7xl mx-auto p-6">
        <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold">Sala: <span className="text-indigo-300">{session?.roomCode ?? roomCode}</span></h1>
            <div className="text-sm text-muted-foreground">Status: <strong className="ml-1">{session?.status ?? '—'}</strong></div>
            <div className="text-sm text-muted-foreground">Conexão WS: <strong className={`ml-1 ${isConnected ? 'text-green-300' : 'text-rose-400'}`}>{isConnected ? 'Conectado' : 'Desconectado'}</strong></div>
            {error && <div className="text-rose-400 mt-2 text-sm">Erro: {error}</div>}
          </div>

          <div className="flex items-center gap-2">
            {isMaster && (
              <Button variant="destructive" onClick={() => actions.endGame()}>
                Encerrar Jogo
              </Button>
            )}
            <Button onClick={() => navigator.clipboard?.writeText((session?.roomCode ?? roomCode) || '')}>Copiar código</Button>
          </div>
        </header>

        {/* Story preview: mostra explicitamente qual história será jogada */}
        <div className="mb-6">
          <StoryPreviewCard story={session?.story} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left / Main */}
          <section className="lg:col-span-2 space-y-6">
            {/* Reuse story area for in-game description when story exists */}
            <Card>
              <CardHeader>
                <CardTitle>{session?.story?.title ?? 'Nenhuma história selecionada'}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose max-w-none text-sm text-slate-200 mb-4">
                  {session?.story?.enigmaticSituation ?? 'Aguardando seleção de história...'}
                </div>

                {/* Master sees solution (collapsible) */}
                {isMaster && session?.story?.fullSolution && (
                  <details className="bg-slate-800 p-3 rounded">
                    <summary className="cursor-pointer font-medium">Ver solução (Mestre)</summary>
                    <div className="mt-2 text-sm whitespace-pre-wrap">{session.story.fullSolution}</div>
                  </details>
                )}
              </CardContent>
            </Card>

            {/* Moves */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Movimentos</h2>
                <div className="text-sm text-muted-foreground">{(session?.moves?.length ?? 0)} total</div>
              </div>

              {session?.moves && session.moves.length > 0 ? (
                <div className="space-y-3">
                  {session.moves.map((m) => (
                    <MoveCard
                      key={m.id}
                      move={m}
                      isMaster={isMaster}
                      isPending={!!pendingAnswers[m.id]}
                      onAnswer={handleAnswer}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-sm text-muted-foreground">Nenhum movimento registrado</div>
              )}
            </div>

            {/* Ask form - players & master can submit if allowed */}
            <Card>
              <CardHeader>
                <CardTitle>Fazer uma pergunta</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Input value={questionText} onChange={(e: any) => setQuestionText(e.target.value)} placeholder="Digite sua pergunta..." />
                  <Button onClick={handleAsk} disabled={!isConnected || sendingQuestion || !questionText.trim()}>
                    {sendingQuestion ? 'Enviando...' : 'Enviar pergunta'}
                  </Button>
                </div>
                <div className="mt-2 text-xs text-muted-foreground">As perguntas serão enviadas para o mestre responder.</div>
              </CardContent>
            </Card>
          </section>

          {/* Right / Sidebar */}
          <aside className="space-y-6">
            {/* Players list */}
            <Card>
              <CardHeader>
                <CardTitle>Jogadores</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {session?.players && session.players.length > 0 ? (
                    session.players.map((p) => (
                      <li key={p.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8" />
                          <div>
                            <div className="text-sm">{p.username ?? p.name}</div>
                            {p.host && <div className="text-xs text-muted-foreground">Host</div>}
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          {session?.master?.id === p.id || session?.master?.username === p.username ? (
                            <div className="text-xs text-indigo-300 mr-2">Mestre</div>
                          ) : null}
                          {/* se o servidor já retornou vencedor, highlight */}
                          {(session as any)?.winnerId === p.id || (session as any)?.winner?.id === p.id ? (
                            <div className="px-2 py-1 text-xs bg-green-700 rounded text-white">Vencedor</div>
                          ) : null}
                          {isMaster && (session as any)?.status !== 'WAITING_FOR_PLAYERS' && (
                            <Button size="sm" onClick={() => handlePickWinner(p.id)} disabled={!!pendingPick[p.id]}>
                              {pendingPick[p.id] ? 'Escolhendo...' : 'Escolher vencedor'}
                            </Button>
                          )}
                        </div>
                      </li>
                    ))
                  ) : (
                    <div className="text-sm text-muted-foreground">Aguardando jogadores...</div>
                  )}
                </ul>
              </CardContent>
            </Card>

            {/* Story options (when selecting) */}
            {session?.status === 'WAITING_FOR_STORY_SELECTION' && isMaster && (
              <Card>
                <CardHeader>
                  <CardTitle>Opções de História</CardTitle>
                </CardHeader>
                <CardContent>
                  {session.storyOptions && session.storyOptions.length > 0 ? (
                    <StoryOptionsGrid
                      stories={session.storyOptions}
                      onSelect={(id) => {
                        setSelectedStoryId(id);
                        actions.selectStory(id);
                      }}
                    />
                  ) : (
                    <div className="text-sm text-muted-foreground">Nenhuma opção disponível</div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Game info */}
            <Card>
              <CardHeader>
                <CardTitle>Informações</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm"><strong>Código:</strong> {session?.roomCode ?? roomCode}</div>
                <div className="text-sm mt-1"><strong>Master:</strong> {session?.master?.username ?? session?.master?.id ?? '—'}</div>
                <div className="text-sm mt-1"><strong>Criada em:</strong> {session?.createdAt ? new Date(session.createdAt).toLocaleString() : '—'}</div>
              </CardContent>
            </Card>
          </aside>
        </div>
      </main>
    </div>
  );
};

export default GamePage;