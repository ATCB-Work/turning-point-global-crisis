import type { Action, PlayerAction } from "../config/interfaces";
import PlayerConsole from "./PlayerConsole";

interface FooterProps {
  actions: { 
    healthcare?: Action[];
    military?: Action[];
    research?: Action[];
    economy?: Action[];
    virus?: Action[]; 
  };
  onAction: (action: Action, payload: PlayerAction["payload"] | null) => void;
  onEndTurn: () => void;
  activeLayers: Record<string, boolean>;
  handleLayerToggle: (layer: "cities" | "locations" | "infections") => void;
  hasFinishedTurn: boolean;
}

// Extracted Footer component
export function Footer({ actions, onAction, onEndTurn, activeLayers, handleLayerToggle, hasFinishedTurn }: FooterProps) {
  return (
    <footer className="h-32 relative">
      <PlayerConsole
        actions={actions}
        onAction={onAction}
        onEndTurn={onEndTurn}
        activeLayers={activeLayers}
        handleLayerToggle={handleLayerToggle}
        hasFinishedTurn={hasFinishedTurn}
      />
    </footer>
  );
}