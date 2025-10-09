import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, Settings } from "lucide-react";
import { Story } from "@/lib/types"; // Make sure your types are defined

interface GameLobbyProps {
  roomCode: string;
  isCreating: boolean;
  onRoomCodeChange: (code: string) => void;
  onJoinGame: () => void;
  onOpenCreateModal: () => void;
}

export function GameLobby({
  roomCode,
  isCreating,
  onRoomCodeChange,
  onJoinGame,
  onOpenCreateModal,
}: GameLobbyProps) {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl animate-fade-in">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-mystery-red mb-4 animate-mystery-glow">
          🔍 Vestigio
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Desvende mistérios intrigantes através de perguntas estratégicas. Um jogo de dedução social onde cada resposta é uma pista para a verdade.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        {/* Card for Creating a Game (Master) */}
        <Card className="bg-gradient-card border-border/50 shadow-mystery hover:shadow-glow transition-all duration-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-mystery-red">
              <Settings className="h-5 w-5" />
              Criar Jogo (Ser Mestre)
            </CardTitle>
            <CardDescription>
              Escolha uma história e convide seus amigos para desvendar o mistério.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Logic to select a story would go here */}
            <p className="text-sm text-muted-foreground mb-4">Selecione uma história da lista (a ser implementada) ou use a padrão.</p>
            <Button
              onClick={onOpenCreateModal}
              disabled={isCreating}
              className="w-full bg-mystery-red hover:bg-mystery-red/80 shadow-blood"
            >
              {isCreating ? "Criando sala..." : "Criar Sala como Mestre"}
            </Button>
          </CardContent>
        </Card>

        {/* Card for Joining a Game (Detective) */}
        <Card className="bg-gradient-card border-border/50 shadow-mystery hover:shadow-glow transition-all duration-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-mystery-gold">
              <Eye className="h-5 w-5" />
              Entrar em um Jogo (Ser Detetive)
            </CardTitle>
            <CardDescription>
              Use sua intuição e lógica para desvendar o mistério através de perguntas.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Label htmlFor="room-code-input" className="text-sm font-medium mb-2 block">Código da Sala</Label>
            <div className="flex w-full items-center space-x-2">
              <Input
                id="room-code-input"
                type="text"
                placeholder="Ex: XYZ123"
                value={roomCode}
                onChange={(e) => onRoomCodeChange(e.target.value)}
                className="uppercase"
              />
              <Button onClick={onJoinGame} variant="secondary">
                Entrar na Sala
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Peça o código da sala para o Mestre do Enigma.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}