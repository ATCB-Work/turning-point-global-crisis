import { useEffect, useReducer, useState } from "react";
import { Header } from "./Header";
import MainMap from "./Map/MainMap";
import { Footer } from "./Footer";
import type { Nation, ActionProps } from "../config/interfaces";

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

function GameScreen({ playerNation, nations, goToMenu }: { playerNation: Nation, nations: Record<string, Nation>, goToMenu: () => void }) {
    // Carichiamo tutte le nazioni nello stato del gioco

    const [currentDate, setCurrentDate] = useState<Date>(new Date("01 Jan 2020"));
    const [activeLayers, dispatch] = useReducer(layersReducer, {
        cities: true,
        locations: true,
        infections: true,
    });

    const [selectedNationId, setSelectedNationId] = useState<string | null>(null);
    const [actionsToExecute, setActionsToExecute] = useState<ActionProps[]>([]);

    // Simuliamo un budget globale per il giocatore (o prendiamolo dalla nazione selezionata)
    const [globalResources] = useState(500);

    // In App.tsx
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                setSelectedNationId(null);
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        // Pulizia del listener quando il componente viene smontato
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, []);


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

    const handleNationClick = (id: string | null) => {
        // Se clicco la nazione già selezionata, deseleziona. Altrimenti seleziona la nuova.
        setSelectedNationId((prevId) => (prevId === id ? null : id));
    };

    // Recuperiamo i dati della nazione selezionata
    const selectedNation = selectedNationId ? nations[selectedNationId] : null;

    return (
        <div className="flex flex-col w-screen h-screen bg-slate-950 text-slate-100 overflow-hidden font-sans">
            <Header playerNation={playerNation} globalResources={globalResources} currentDate={currentDate} goToMenu={goToMenu} />

            {/* 2. MAIN AREA - Mappa e Sidebar */}
            <main className={`flex-1 relative flex overflow-hidden p-4 ${selectedNationId ? "gap-4" : "gap-0"} transition-all duration-500`}>
                {/* La Board della Mappa */}
                <section className="flex-1 relative rounded-xl bg-black/20 border border-slate-800/50 shadow-2xl">
                    <MainMap
                        nations={nations}
                        playerNation={playerNation}
                        selectedNationId={selectedNationId}
                        onNationClick={handleNationClick}
                        activeLayers={activeLayers}
                    />
                </section>

                {/* Sidebar Dettagli Nazione */}
                <aside className={`${selectedNationId ? "w-80" : "w-0"} transition-all duration-500 ${selectedNationId ? "translate-x-0 opacity-100": "translate-x-10 opacity-0 pointer-events-none"}`}>
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
                                    { 
                                        selectedNation.isNPC ? "NPC AGENT ACTIVE" : "LOCAL PLAYER"
                                    }
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
                activeLayers={activeLayers}
                onAction={handleAction}
                onEndTurn={handleEndTurn}
                handleLayerToggle={handleLayerToggle}
            />
        </div>
    );
}

export default GameScreen;