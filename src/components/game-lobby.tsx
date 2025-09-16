import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, Play, Eye, Settings } from "lucide-react";

interface GameLobbyProps {
  onStartGame: () => void;
  onJoinAsMaster: () => void;
  onJoinAsDetective: () => void;
}

export function GameLobby({ onStartGame, onJoinAsMaster, onJoinAsDetective }: GameLobbyProps) {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="text-center mb-8 animate-fade-in">
        <h1 className="text-4xl font-bold text-mystery-red mb-4 animate-mystery-glow">
          🔍 Vestigio
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Desvende mistérios intrigantes através de perguntas estratégicas. 
          Um jogo de dedução social onde cada resposta é uma pista para a verdade.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <Card className="bg-gradient-card border-border/50 shadow-mystery hover:shadow-glow transition-all duration-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-mystery-red">
              <Settings className="h-5 w-5" />
              Mestre do Enigma
            </CardTitle>
            <CardDescription>
              Conduza o mistério, possua a solução e responda às perguntas dos detetives.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="text-sm text-muted-foreground space-y-2 mb-4">
              <li>• Leia a história enigmática</li>
              <li>• Conheça a solução completa</li>
              <li>• Responda apenas "sim", "não" ou "irrelevante"</li>
            </ul>
            <Button 
              onClick={onJoinAsMaster}
              className="w-full bg-mystery-red hover:bg-mystery-red/80 shadow-blood"
            >
              Ser Mestre
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card border-border/50 shadow-mystery hover:shadow-glow transition-all duration-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-mystery-gold">
              <Eye className="h-5 w-5" />
              Detetive
            </CardTitle>
            <CardDescription>
              Use sua intuição e lógica para desvendar o mistério através de perguntas.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="text-sm text-muted-foreground space-y-2 mb-4">
              <li>• Faça perguntas estratégicas</li>
              <li>• Colabore com outros detetives</li>
              <li>• Deduza a solução completa</li>
            </ul>
            <Button 
              onClick={onJoinAsDetective}
              variant="secondary"
              className="w-full"
            >
              Ser Detetive
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-gradient-card border-mystery-gold/30 shadow-mystery">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Como Jogar
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-3 gap-4 text-sm">
            <div className="text-center">
              <Badge variant="outline" className="mb-2">Passo 1</Badge>
              <p className="text-muted-foreground">
                O Mestre lê uma história enigmática para os detetives
              </p>
            </div>
            <div className="text-center">
              <Badge variant="outline" className="mb-2">Passo 2</Badge>
              <p className="text-muted-foreground">
                Os detetives fazem perguntas que só podem ser respondidas com "sim", "não" ou "irrelevante"
              </p>
            </div>
            <div className="text-center">
              <Badge variant="outline" className="mb-2">Passo 3</Badge>
              <p className="text-muted-foreground">
                Através das respostas, os detetives reconstroem a história completa
              </p>
            </div>
          </div>
          
          <div className="text-center pt-4">
            <Button onClick={onStartGame} size="lg" className="bg-mystery-red hover:bg-mystery-red/80 shadow-blood">
              <Play className="h-4 w-4 mr-2" />
              Iniciar Jogo
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}