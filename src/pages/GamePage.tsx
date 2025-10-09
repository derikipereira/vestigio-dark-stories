import React from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Navigation } from '@/components/navigation';
import { MasterView } from '@/components/master-view';
import { DetectiveView } from '@/components/detective-view';
import { GameSession, Story } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useGameWebSocket } from '@/hooks/useGameWebSocket';

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
    const { roomCode } = useParams<{ roomCode: string }>();
    const { user, token } = useAuth();
    
    // 👇 Desestruturando 'actions' em vez de 'sendMessage'
    const { gameSession, isConnected, error, actions } = useGameWebSocket(roomCode, token);

    if (error) return <div className="text-red-500 p-4 text-center">{error}</div>;
    if (!isConnected || !gameSession) {
        return <div className="flex items-center justify-center min-h-screen text-white">Conectando e buscando dados da sala {roomCode}...</div>;
    }
    if (!user) return <Navigate to="/login" />;

    const isMaster = user.id === gameSession.master.id;

    const renderGameContent = () => {
        switch (gameSession.status) {
            case 'WAITING_FOR_STORY_SELECTION':
                return isMaster ? (
                    <StorySelectionView 
                        stories={gameSession.storyOptions || []}
                        // 👇 Chamando a função correta do objeto 'actions'
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
                        // 👇 Chamando a função correta do objeto 'actions'
                        onAnswer={actions.answerQuestion}
                    />
                ) : (
                    <DetectiveView
                        mystery={gameSession.story.enigmaticSituation}
                        moves={gameSession.moves}
                        // 👇 Chamando a função correta do objeto 'actions'
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
            <main>{renderGameContent()}</main>
        </div>
    );
};

export default GamePage;