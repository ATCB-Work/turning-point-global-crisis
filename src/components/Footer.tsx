import type { Action, PlayerAction } from "../config/interfaces";
import PlayerConsole from "./PlayerConsole";

interface FooterProps {
  onAction: (action: Action, payload: PlayerAction["payload"] | null) => void;
  onEndTurn: () => void;
  activeLayers: Record<string, boolean>;
  handleLayerToggle: (layer: "cities" | "locations" | "infections") => void;
  hasFinishedTurn: boolean;
}

// Extracted Footer component
export function Footer({ onAction, onEndTurn, activeLayers, handleLayerToggle, hasFinishedTurn }: FooterProps) {
  return (
    <footer className="h-32 relative">
      <PlayerConsole
        onAction={onAction}
        onEndTurn={onEndTurn}
        activeLayers={activeLayers}
        handleLayerToggle={handleLayerToggle}
        hasFinishedTurn={hasFinishedTurn}
      />
    </footer>
  );
}