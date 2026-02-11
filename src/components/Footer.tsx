import type { Action, VirusMutation, PlayerAction, PlayerVirusAction } from "../config/interfaces";
import PlayerConsole from "./PlayerConsole";

interface FooterProps {
  // Lista fissa
  actions: { 
    healthcare?: Action[];
    military?: Action[];
    research?: Action[];
    economy?: Action[];
  };
  // Lista fissa
  virusActions: {
    abilities?: VirusMutation[]; 
    symptoms?: VirusMutation[]; 
  };
  // Lista dinamica
  unlockedMutations: string[];
  // Lista dinamica
  pendingActions: PlayerAction[];
  // Lista dinamica
  pendingVirusActions: PlayerVirusAction[];
  mutationsPoints: number;
  onAction: (action: Action) => void;
  onVirusAction: (action: VirusMutation) => void;
  onEndTurn: () => void;
  activeLayers: Record<string, boolean>;
  handleLayerToggle: (layer: "cities" | "locations" | "infections") => void;
  hasFinishedTurn: boolean;
}

// Extracted Footer component
export function Footer({ actions, virusActions, unlockedMutations, pendingActions, pendingVirusActions, mutationsPoints, onAction, onVirusAction, onEndTurn, activeLayers, handleLayerToggle, hasFinishedTurn }: FooterProps) {

  console.log(unlockedMutations);

  return (
    <footer className="h-32 relative">
      <PlayerConsole
        actions={actions}
        virusActions={virusActions}
        unlockedMutations={unlockedMutations}
        pendingActions={pendingActions}
        pendingVirusActions={pendingVirusActions}
        mutationsPoints={mutationsPoints}
        onAction={onAction}
        onVirusAction={onVirusAction}
        onEndTurn={onEndTurn}
        activeLayers={activeLayers}
        handleLayerToggle={handleLayerToggle}
        hasFinishedTurn={hasFinishedTurn}
      />
    </footer>
  );
}