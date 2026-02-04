import { useEffect, useReducer, useState } from "react";
import MainMap from "./components/Map/MainMap";
import nationsData from "./data/nations.json";
import PlayerConsole, { type ActionProps } from "./components/PlayerConsole";
import type { Nation } from "./config/interfaces";

// Added types for reducer and components
interface LayerAction {
  type: "TOGGLE_LAYER";
  layer: "cities" | "locations" | "infections";
}

function layersReducer(
  state: Record<string, boolean>,
  action: LayerAction
): Record<string, boolean> {
  switch (action.type) {
    case "TOGGLE_LAYER":
      return {
        ...state,
        [action.layer]: !state[action.layer],
      };
    default:
      return state;
  }
}

interface HeaderProps {
  globalResources: number;
  currentDate: Date;
}

// Extracted Header component
function Header({ globalResources, currentDate }: HeaderProps) {
  return (
    <header className="h-16 border-b border-slate-800 bg-slate-900/50 flex items-center justify-between px-8 backdrop-blur-md">
      <div className="flex items-center gap-4">
        <div className="h-3 w-3 rounded-full bg-red-500 animate-pulse" />
        <h1 className="font-black italic tracking-tighter text-xl uppercase">
          Turning Point
        </h1>
      </div>
      <div className="">
        {/* Pannello Risorse */}
        <div className="flex flex-col items-center min-w-[120px]">
          <span className="text-[10px] text-cyan-500 font-bold tracking-widest uppercase">
            Budget Disp.
          </span>
          <span className="text-3xl font-black text-yellow-400">
            {globalResources}
            <span className="text-sm ml-1 text-yellow-600">PR</span>
          </span>
        </div>
      </div>
      <div className="flex gap-8 text-sm font-mono">
        <div>
          DATA:{" "}
          <span className="text-cyan-400">
            {currentDate.toLocaleDateString("it-IT", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })}
          </span>
        </div>
        <div>
          MINACCIA:{" "}
          <span className="text-red-500 font-bold underline">LIVELLO 1</span>
        </div>
      </div>
    </header>
  );
}

interface FooterProps {
  onAction: (action: ActionProps) => void;
  onEndTurn: () => void;
  activeLayers: Record<string, boolean>;
  handleLayerToggle: (layer: "cities" | "locations" | "infections") => void;
}

// Extracted Footer component
function Footer({ onAction, onEndTurn, activeLayers, handleLayerToggle }: FooterProps) {
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

function App() {
  // Carichiamo tutte le nazioni nello stato del gioco
  const nations: Record<string, Nation> = Object.fromEntries(
    Object.entries(nationsData).map(([key, value]) => [
      key,
      {
        ...value,
        climate: value.climate as 'temperate' | 'cold' | 'hot',
        cities: value.cities.map((city) => ({
          ...city,
          coordinates: city.coordinates.length === 2
            ? ([city.coordinates[0], city.coordinates[1]] as [number, number])
            : [0, 0],
        })),
      },
    ])
  );

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [currentDate, setCurrentDate] = useState<Date>(new Date("01 Jan 2020"));
  const [activeLayers, dispatch] = useReducer(layersReducer, {
    cities: true,
    locations: true,
    infections: true,
  });

  const [actionsToExecute, setActionsToExecute] = useState<ActionProps[]>([]);

  // Recuperiamo i dati della nazione selezionata
  const selectedNation = selectedId ? nations[selectedId] : null;

  // Simuliamo un budget globale per il giocatore (o prendiamolo dalla nazione selezionata)
  const [globalResources] = useState(500);

  // In App.tsx
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setSelectedId(null);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    // Pulizia del listener quando il componente viene smontato
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleNationClick = (id: string | null) => {
    // Se clicco la nazione già selezionata, deseleziona. Altrimenti seleziona la nuova.
    setSelectedId((prevId) => (prevId === id ? null : id));
  };

  const handleAction = (action: ActionProps) => {
    setActionsToExecute((prev) => [...prev, { code: action.code, label: action.label, cost: action.cost }]);
  };

  const handleEndTurn = () => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      newDate.setDate(newDate.getDate() + 7); // Avanza di una settimana
      return newDate;
    });
    alert("Turno terminato. Il virus si sta diffondendo...");
    console.log("Azioni da eseguire questo turno:");
    actionsToExecute.forEach((action) => {
      console.log(`- ${action.label} (Costo: ${action.cost} PR)`);
    });
    // Qui chiameremo il motore di simulazione
  };

  const handleLayerToggle = (layer: "cities" | "locations" | "infections") => {
    dispatch({ type: "TOGGLE_LAYER", layer });
  };

  return (
    <div className="flex flex-col w-screen h-screen bg-slate-950 text-slate-100 overflow-hidden font-sans">
      <Header globalResources={globalResources} currentDate={currentDate} />

      {/* 2. MAIN AREA - Mappa e Sidebar */}
      <main
        className={`flex-1 relative flex overflow-hidden p-4 ${
          selectedId ? "gap-4" : "gap-0"
        } transition-all duration-500`}
      >
        {/* La Board della Mappa */}
        <section className="flex-1 relative rounded-xl bg-black/20 border border-slate-800/50 shadow-2xl">
          <MainMap
            nations={nations}
            selectedNation={selectedNation}
            onNationClick={(id) => handleNationClick(id)}
            activeLayers={activeLayers}
          />
        </section>

        {/* Sidebar Dettagli Nazione */}
        <aside
          className={`${
            selectedId ? "w-80" : "w-0"
          } transition-all duration-500 ${
            selectedId
              ? "translate-x-0 opacity-100"
              : "translate-x-10 opacity-0 pointer-events-none"
          }`}
        >
          {/* Qui inseriremo il futuro NationPopup o i dettagli della nazione */}
          <div className="h-full bg-slate-900/80 border border-slate-700 p-6 rounded-xl backdrop-blur-xl shadow-2xl">
            {selectedNation ? (
              <div>
                <h2 className="text-2xl font-black italic uppercase tracking-tighter text-cyan-400">
                  {selectedNation.name}
                </h2>
                <div className="mt-4 space-y-2 text-sm">
                  <p className="flex justify-between">
                    <span>POP:</span>{" "}
                    <span className="font-mono">
                      {(selectedNation.totalPopulation / 1000000).toFixed(1)}M
                    </span>
                  </p>
                  <p className="flex justify-between">
                    <span>INFECTED:</span>{" "}
                    <span className="text-red-400 font-bold">
                      {selectedNation.totalInfected}
                    </span>
                  </p>
                </div>
                <hr className="my-4 border-slate-700" />
                <div className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">
                  Status:{" "}
                  {selectedNation.isNPC
                    ? "NPC AGENT ACTIVE"
                    : "LOCAL PLAYER"}
                </div>
              </div>
            ) : (
              <p className="text-slate-500 italic text-center text-sm">
                Seleziona una nazione sulla mappa per i dati strategici.
              </p>
            )}
          </div>
        </aside>
      </main>

      <Footer
        onAction={handleAction}
        onEndTurn={handleEndTurn}
        activeLayers={activeLayers}
        handleLayerToggle={handleLayerToggle}
      />
    </div>
  );
}

export default App;