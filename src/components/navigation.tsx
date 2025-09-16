import { Button } from "@/components/ui/button";
import { Eye, Users, Settings, LogOut } from "lucide-react";

interface NavigationProps {
  currentView: "lobby" | "game" | "master";
  onViewChange: (view: "lobby" | "game" | "master") => void;
}

export function Navigation({ currentView, onViewChange }: NavigationProps) {
  return (
    <nav className="flex items-center justify-between p-4 bg-gradient-card border-b border-border/50">
      <div className="flex items-center gap-2">
        <h1 className="text-2xl font-bold text-mystery-red">
          Vestigio
        </h1>
        <span className="text-sm text-muted-foreground">
          Jogo de Mistérios
        </span>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant={currentView === "lobby" ? "default" : "ghost"}
          size="sm"
          onClick={() => onViewChange("lobby")}
          className={currentView === "lobby" ? "bg-mystery-red hover:bg-mystery-red/80" : ""}
        >
          <Users className="h-4 w-4 mr-2" />
          Lobby
        </Button>

        <Button
          variant={currentView === "game" ? "default" : "ghost"}
          size="sm"
          onClick={() => onViewChange("game")}
          className={currentView === "game" ? "bg-mystery-red hover:bg-mystery-red/80" : ""}
        >
          <Eye className="h-4 w-4 mr-2" />
          Detetive
        </Button>

        <Button
          variant={currentView === "master" ? "default" : "ghost"}
          size="sm"
          onClick={() => onViewChange("master")}
          className={currentView === "master" ? "bg-mystery-red hover:bg-mystery-red/80" : ""}
        >
          <Settings className="h-4 w-4 mr-2" />
          Mestre
        </Button>

        <Button
          variant="ghost"
          size="sm"
          className="text-muted-foreground hover:text-mystery-red"
        >
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    </nav>
  );
}