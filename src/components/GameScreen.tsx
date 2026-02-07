import { useEffect, useReducer, useState, useCallback, useMemo } from "react";
import { Header } from "./Header";
import MainMap from "./Map/MainMap";
import { Footer } from "./Footer";
import type { Nation, User, GameState, PlayerAction, Action } from "../config/interfaces";
import { initActionsByUserRole, initInfection, processTurn } from "../hooks/gameEngine";

// Added types for reducer and components
interface LayerAction {
  type: "TOGGLE_LAYER";
  layer: "cities" | "locations" | "infections";
}

function layersReducer(
  state: Record<string, boolean>,
  action: LayerAction
): Record<string, boolean> {
  if (action.type === "TOGGLE_LAYER") {
    return { ...state, [action.layer]: !state[action.layer] };
  }
  return state;
}

function createInitialState(virusName: string, nations: Record<string, Nation>): GameState {
  return {
    turnNumber: 1,
    nations: nations,
    globalInfected: 0,
    virusStats: {
        name: virusName || "Unknown Virus",
        mutationPoints: 10,
        infectivity: 0,
        lethality: 0,
        resistance: 0,
        transmission: {
            air: 0,
            water: 0,
            land: 0,
        },
        symptoms: [],
        abilities: [],
    },
  };
}

function GameScreen({ virusName, user, playerNation, nations, goToMenu }: { virusName: string, user: User, playerNation: Nation, nations: Record<string, Nation>, goToMenu: () => void }) {
    // Carichiamo tutte le nazioni nello stato del gioco

    const [currentDate, setCurrentDate] = useState<Date>(new Date("01 Jan 2020"));
    const [activeLayers, dispatch] = useReducer(layersReducer, {
        cities: true,
        locations: true,
        infections: true,
    });
    
    const [selectedNationId, setSelectedNationId] = useState<string | null>(null);
    
    // Simuliamo un budget globale per il giocatore (o prendiamolo dalla nazione selezionata)
    const [globalResources] = useState(500);

    // 1. Inserimento nel componente che gestisce lo stato del gioco
    const [gameState, setGameState] = useState<GameState>(() => {
        const initialState = createInitialState(virusName, nations);
        return initInfection(initialState);
    });

    const [actions] = useState<{
        healthcare?: Action[];
        military?: Action[];
        research?: Action[];
        economy?: Action[];
        virus?: Action[];
    }>(
        () => {
            if (!playerNation.player) {
                console.error("Player data missing in playerNation");
                return {}
            }
            return initActionsByUserRole(playerNation.player?.isVirus ?? false);
        }
    );
    const [pendingActions, setPendingActions] = useState<PlayerAction[]>([]);
    const [hasFinishedTurn, setHasFinishedTurn] = useState(false);
    const allPlayersReady = true; // In un multiplayer reale, qui controlleresti se tutti i giocatori hanno confermato il turno

    const handleConfirmTurn = () => {
        setHasFinishedTurn(true);
        
        // In multiplayer qui manderesti 'pendingActions' al server.
        // In locale/mock, chiamiamo la risoluzione direttamente:
        if (allPlayersReady) { 
            triggerProcessTurn();
        }
    }

    // Batch state updates in triggerProcessTurn
    const triggerProcessTurn = async () => {
        const aiActions: [] = []; // Placeholder for AI actions
        const allActions = [...pendingActions, ...aiActions];

        const nextState = await processTurn(gameState, allActions);

        setGameState(nextState);
        setCurrentDate((prev) => {
            const newDate = new Date(prev);
            newDate.setDate(newDate.getDate() + 7);
            return newDate;
        });

        setPendingActions([]);
        setHasFinishedTurn(false);
    };

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
    
    const handleAction = (action: Action, payload: PlayerAction["payload"] | null) => {
        const newAction: PlayerAction = {
            playerId: user.id,
            nationId: playerNation.id, // La nazione che controlli
            ...action
        };

        if (payload) {
            newAction.payload = payload;
        }
        
        setPendingActions(prev => [...prev, newAction]);
    }

    // Memoize handleLayerToggle to prevent unnecessary re-renders
    const handleLayerToggle = useCallback((layer: "cities" | "locations" | "infections") => {
        dispatch({ type: "TOGGLE_LAYER", layer });
    }, []);

    // Memoize handleNationClick to avoid re-renders
    const handleNationClick = useCallback((id: string | null) => {
        setSelectedNationId((prevId) => (prevId === id ? null : id));
    }, []);

    // Add memoization for selectedNation to avoid recalculations
    const selectedNation = useMemo(() => {
        return selectedNationId ? gameState.nations[selectedNationId] : null;
    }, [selectedNationId, gameState.nations]);
    
    return (
        <div className="flex flex-col w-screen h-screen bg-slate-950 text-slate-100 overflow-hidden font-sans">
            <Header playerNation={playerNation} globalResources={globalResources} currentDate={currentDate} goToMenu={goToMenu} />

            {/* 2. MAIN AREA - Mappa e Sidebar */}
            <main className={`flex-1 relative flex overflow-hidden p-4 ${selectedNationId ? "gap-4" : "gap-0"} transition-all duration-500`}>
                {/* La Board della Mappa */}
                <section className="flex-1 relative rounded-xl bg-black/20 border border-slate-800/50 shadow-2xl">
                    <MainMap 
                        nations={gameState.nations}
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
                                    Gestita da:&nbsp;
                                    { 
                                        selectedNation.player?.id ? selectedNation.player.username : "NPC AGENT ACTIVE"
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
                actions={actions}
                activeLayers={activeLayers}
                onAction={handleAction}
                onEndTurn={handleConfirmTurn}
                handleLayerToggle={handleLayerToggle}
                hasFinishedTurn={hasFinishedTurn}
            />
        </div>
    );
}

export default GameScreen;