import { useState } from "react";
import { Navigation } from "@/components/navigation";
import { GameLobby } from "@/components/game-lobby";
import { DetectiveView } from "@/components/detective-view";
import { MasterView } from "@/components/master-view";

const sampleMystery = "Um homem é encontrado morto em uma sala trancada por dentro. Não há sinais de violência, armas ou veneno. A janela está fechada e não há outra entrada. Como ele morreu?";

const sampleSolution = "O homem morreu de frio. A sala era na verdade um freezer que foi ligado após ele entrar. A temperatura baixou gradualmente até que ele morreu de hipotermia. A sala ficou trancada porque o mecanismo da porta congelou.";

type ViewType = "lobby" | "game" | "master";

const Index = () => {
  const [currentView, setCurrentView] = useState<ViewType>("lobby");

  const handleStartGame = () => {
    setCurrentView("game");
  };

  const handleJoinAsMaster = () => {
    setCurrentView("master");
  };

  const handleJoinAsDetective = () => {
    setCurrentView("game");
  };

  const handleSubmitQuestion = (question: string) => {
    console.log("Pergunta submetida:", question);
    // In a real implementation, this would send the question to the server/master
  };

  return (
    <div className="min-h-screen bg-gradient-mystery">
      <Navigation currentView={currentView} onViewChange={setCurrentView} />
      
      {currentView === "lobby" && (
        <GameLobby
          onStartGame={handleStartGame}
          onJoinAsMaster={handleJoinAsMaster}
          onJoinAsDetective={handleJoinAsDetective}
        />
      )}
      
      {currentView === "game" && (
        <DetectiveView
          session={{
            id: 1,
            roomCode: "DEMO",
            gameType: "VESTIGIO",
            status: "IN_PROGRESS",
            story: {
              id: 1,
              title: "Mistério de Demo",
              enigmaticSituation: sampleMystery,
              fullSolution: sampleSolution,
            },
            players: [],
            moves: [],
          }}
          onAskQuestion={(question) => {
            console.log("Pergunta submetida:", question);
          }}
        />
      )}
      
      {currentView === "master" && (
        <MasterView
          session={{
            id: 1,
            roomCode: "DEMO",
            gameType: "VESTIGIO",
            status: "IN_PROGRESS",
            story: {
              id: 1,
              title: "Mistério de Demo",
              enigmaticSituation: sampleMystery,
              fullSolution: sampleSolution,
            },
            players: [],
            moves: [],
          }}
          onAnswer={(moveId, answer) => {
            console.log(`Resposta ${answer} para pergunta ${moveId}`);
          }}
        />
      )}
    </div>
  );
};

export default Index;
