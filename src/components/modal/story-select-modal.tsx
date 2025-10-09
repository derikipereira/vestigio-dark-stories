import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Story } from "@/lib/types";
import { useState } from "react";
import { ScrollArea } from "../ui/scroll-area";

interface StorySelectionModalProps {
  isOpen: boolean;
  stories: Story[];
  onOpenChange: (open: boolean) => void;
  onCreateGame: (storyId: number) => void;
  isCreating: boolean;
}

export function StorySelectionModal({
  isOpen,
  stories,
  onOpenChange,
  onCreateGame,
  isCreating
}: StorySelectionModalProps) {
  const [selectedStoryId, setSelectedStoryId] = useState<number | null>(null);

  const handleCreateClick = () => {
    if (selectedStoryId) {
      onCreateGame(selectedStoryId);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-gradient-card border-border/50">
        <DialogHeader>
          <DialogTitle>Selecione um Mistério</DialogTitle>
          <DialogDescription>
            Escolha uma das histórias abaixo para iniciar a partida como Mestre.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <ScrollArea className="h-72">
            <RadioGroup
              value={selectedStoryId?.toString()}
              onValueChange={(value) => setSelectedStoryId(Number(value))}
              className="space-y-2 pr-4"
            >
              {stories ? stories.map((story) => (
                <Label
                  key={story.id}
                  htmlFor={`story-${story.id}`}
                  className="flex flex-col p-3 rounded-md border border-border/50 hover:bg-muted/50 cursor-pointer"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value={story.id.toString()} id={`story-${story.id}`} />
                    <span className="font-semibold">{story.title}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2 pl-6">
                    {story.enigmaticSituation.substring(0, 100)}...
                  </p>
                </Label>
              )) : (
                <p className="text-sm text-muted-foreground">Nenhuma história disponível.</p>
              )}
            </RadioGroup>
          </ScrollArea>
        </div>
        <DialogFooter>
          <Button 
            onClick={handleCreateClick} 
            disabled={!selectedStoryId || isCreating}
          >
            {isCreating ? "Criando sala..." : "Criar Sala"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}