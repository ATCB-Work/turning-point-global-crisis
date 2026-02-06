import type { ActionProps } from "../config/interfaces";
import PlayerConsole from "./PlayerConsole";

interface FooterProps {
  onAction: (action: ActionProps) => void;
  onEndTurn: () => void;
  activeLayers: Record<string, boolean>;
  handleLayerToggle: (layer: "cities" | "locations" | "infections") => void;
}

// Extracted Footer component
export function Footer({ onAction, onEndTurn, activeLayers, handleLayerToggle }: FooterProps) {
  return (
    <footer className="h-32 relative">
      <PlayerConsole
        onAction={onAction}
        onEndTurn={onEndTurn}
        activeLayers={activeLayers}
        handleLayerToggle={handleLayerToggle}
      />
    </footer>
  );
}