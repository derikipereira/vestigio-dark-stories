import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useGameWebSocket } from '../hooks/useGameWebSocket';
import { useAuth } from '../context/AuthContext';
import { Navigation } from '@/components/navigation';
import { MasterView } from '@/components/master-view';
import { DetectiveView } from '@/components/detective-view';
import { GameSession, Story } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const StorySelectionView: React.FC<{
    stories: Story[],
    onSelect: (storyId: number) => void
}> = ({ stories, onSelect }) => (
    <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-3xl font-bold text-white mb-4">Escolha o Mistério</h1>
        <div className="grid md:grid-cols-3 gap-6">
            {stories.map(story => (
                <Card key={story.id} className="bg-gradient-card border-border/50 text-left">
                    <CardHeader><CardTitle>{story.title}</CardTitle></CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground text-sm mb-4">{story.enigmaticSituation}</p>
                        <Button className="w-full" onClick={() => onSelect(story.id)}>Escolher</Button>
                    </CardContent>
                </Card>
            ))}
        </div>
    </div>
);

const GamePage: React.FC = () => {
  const params = useParams<{ roomCode?: string }>();
  const roomCode = params.roomCode;
  const { token } = useAuth();

  const { gameSession, isConnected, error, actions } = useGameWebSocket(roomCode);

  const [questionText, setQuestionText] = useState('');
  const [selectedStoryId, setSelectedStoryId] = useState<number | null>(null);

  if (!token) {
    return <div>Autenticação necessária. Faça login.</div>;
  }

  const isMaster = token === gameSession?.master?.id;

  const renderGameContent = () => {
      switch (gameSession.status) {
          case 'WAITING_FOR_STORY_SELECTION':
              return isMaster ? (
                  <StorySelectionView 
                      stories={gameSession.storyOptions || []}
                      onSelect={actions.selectStory} 
                  />
              ) : (
                  <div className="text-center text-white p-8">Aguardando o Mestre escolher a história...</div>
              );

          case 'IN_PROGRESS':
              if (!gameSession.story) return <div>Erro: Jogo em progresso sem história.</div>;
              return isMaster ? (
                  <MasterView
                      mystery={gameSession.story.enigmaticSituation}
                      solution={gameSession.story.fullSolution}
                      moves={gameSession.moves}
                      players={gameSession.players}
                      onAnswer={actions.answerQuestion}
                  />
              ) : (
                  <DetectiveView
                      mystery={gameSession.story.enigmaticSituation}
                      moves={gameSession.moves}
                      onSubmitQuestion={actions.askQuestion}
                  />
              );

          case 'COMPLETED':
              return <div className="text-center text-white p-8"><h1>Fim de Jogo!</h1><p>Solução: {gameSession.story?.fullSolution}</p></div>;

          default:
              return <div className="text-center text-white p-8">Aguardando jogadores... (Status: {gameSession.status})</div>;
      }
  };

  return (
    <div className="min-h-screen bg-gradient-mystery">
      <Navigation />
      <main>
        <div className="p-4">
          <h1 className="text-2xl font-bold">Sala: {roomCode}</h1>
          <p>Conexão WS: {isConnected ? 'Conectado' : 'Desconectado'}</p>
          {error && <p className="text-red-500">Erro: {error}</p>}

          <section className="mt-4">
            <h2 className="font-semibold">Estado do jogo</h2>
            <pre className="bg-gray-100 p-2 rounded">
              {JSON.stringify(
                {
                  status: gameSession?.status,
                  players: gameSession?.players?.map((p: any) => p.name) ?? [],
                },
                null,
                2
              )}
            </pre>
          </section>

          <section className="mt-4">
            <h2 className="font-semibold">Selecionar história</h2>
            {gameSession?.stories && gameSession.stories.length > 0 ? (
              <div className="space-y-2">
                {gameSession.stories.map((s: any) => (
                  <div key={s.id} className="flex items-center gap-2">
                    <div className="flex-1">
                      <strong>{s.title}</strong>
                      <div className="text-sm text-gray-600">{s.description}</div>
                    </div>
                    <button
                      className="btn"
                      onClick={() => {
                        setSelectedStoryId(s.id);
                        actions.selectStory(s.id);
                      }}
                    >
                      Selecionar
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div>Nenhuma história disponível</div>
            )}
          </section>

          <section className="mt-4">
            <h2 className="font-semibold">Perguntar</h2>
            <div className="flex gap-2">
              <input
                className="input"
                value={questionText}
                onChange={(e) => setQuestionText(e.target.value)}
                placeholder="Digite sua pergunta..."
              />
              <button
                className="btn"
                onClick={() => {
                  if (!questionText) return;
                  actions.askQuestion(questionText);
                  setQuestionText('');
                }}
              >
                Enviar
              </button>
            </div>
          </section>

          <section className="mt-4">
            <h2 className="font-semibold">Movimentos / Responder</h2>
            {gameSession?.moves && gameSession.moves.length > 0 ? (
              <div className="space-y-2">
                {gameSession.moves.map((m: any) => (
                  <div key={m.id} className="flex items-center gap-2">
                    <div className="flex-1">
                      <div className="text-sm">{m.questionText ?? m.text}</div>
                      <div className="text-xs text-gray-500">autor: {m.player?.name}</div>
                    </div>
                    <div className="flex gap-1">
                      <button className="btn" onClick={() => actions.answerQuestion(m.id, 'SIM')}>SIM</button>
                      <button className="btn" onClick={() => actions.answerQuestion(m.id, 'NAO')}>NÃO</button>
                      <button className="btn" onClick={() => actions.answerQuestion(m.id, 'IRRELEVANTE')}>IRRELEVANTE</button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div>Nenhum movimento registrado</div>
            )}
          </section>

          <section className="mt-6">
            <button className="btn btn-danger" onClick={() => actions.endGame()}>
              Encerrar jogo
            </button>
          </section>
        </div>
        {renderGameContent()}
      </main>
    </div>
  );
};

export default GamePage;