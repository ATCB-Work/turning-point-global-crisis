import { useEffect, useReducer, useState, useCallback, useMemo } from "react";
import { Header } from "./Header";
import MainMap from "./Map/MainMap";
import { Footer } from "./Footer";
import type { Nation, User, GameState, PlayerAction, Action, VirusMutation, PlayerVirusAction } from "../config/interfaces";
import { initActionsByUserRole, initInfection, initVirusActionsByUserRole, processTurn } from "../hooks/gameEngine";

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
        attributes: {
        infectivity: 10,   // R0 base
        lethality: 5,     // Tasso di mortalità
        stealth: 5,       // Capacità di nascondersi
        adaptability: 5,   // Velocità di mutazione
        hotEnvironmentalResistance: 5, // Resistenza a climi estremi
        coldEnvironmentalResistance: 5, // Resistenza a climi estremi
        },
        transmission: {
            air: 0,
            contact: 0,
            environmental: 0,
            special: 0,
        },
        unlockedMutations: []
    },
    vaccineProgress: 0,
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
    }>(
        () => {
            if (!playerNation.player) {
                console.error("Player data missing in playerNation");
                return {}
            }
            if (playerNation.player.isVirus) {
                return {};
            }
            return initActionsByUserRole();
        }
    );
    const [virusActions] = useState<{
        abilities?: VirusMutation[], 
        symptoms?: VirusMutation[]
    }>(
        () => {
            if (!playerNation.player) {
                console.error("Player data missing in playerNation");
                return {}
            }
            if (!playerNation.player.isVirus) {
                return {};
            }
            return initVirusActionsByUserRole();
        }
    );
    const [pendingActions, setPendingActions] = useState<PlayerAction[]>([]);
    const [pendingVirusActions, setPendingVirusActions] = useState<PlayerVirusAction[]>([]);
    const [currentMutationPoints, setCurrentMutationPoints] = useState<number>(gameState.virusStats.mutationPoints);
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

        const nextState = await processTurn(gameState, allActions, pendingVirusActions);

        setGameState(nextState);
        setCurrentDate((prev) => {
            const newDate = new Date(prev);
            newDate.setDate(newDate.getDate() + 7);
            return newDate;
        });

        setPendingActions([]);
        setPendingVirusActions([]);
        setCurrentMutationPoints(nextState.virusStats.mutationPoints);
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
    
    const handleAction = (action: Action) => {
        const newAction: PlayerAction = {
            playerId: user.id,
            nationId: playerNation.id, // La nazione che controlli
            ...action
        };
        if (pendingActions.find(pa => pa.actionId === newAction.actionId)) {
            setPendingActions(prev => prev.filter(a => !(a.actionId === action.actionId && a.nationId === playerNation.id)));
        } else {
            setPendingActions(prev => [...prev, newAction]);
        }
    }

    const handleVirusAction = (action: VirusMutation) => {
        console.log('handleVirusAction')
        const newAction: PlayerVirusAction = {
            playerId: user.id,
            nationId: playerNation.id, // La nazione che controlli
            ...action
        };
        if (pendingVirusActions.find(pva => pva.id === newAction.id)) {
            console.log('remove')
            setPendingVirusActions(prev => prev.filter(a => !(a.id === action.id && a.nationId === playerNation.id)));
            setCurrentMutationPoints(currentMutationPoints + action.mutationPointCost);
        } else {
            console.log('adding')
            setPendingVirusActions(prev => [...prev, newAction]);
            setCurrentMutationPoints(currentMutationPoints - action.mutationPointCost);
        }
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
            <Header playerNation={playerNation} vaccineProgress={gameState.vaccineProgress} mutationPoints={currentMutationPoints} currentDate={currentDate} goToMenu={goToMenu} />

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
                                <h2 className="text-2xl font-black uppercase tracking-tighter text-cyan-400 flex items-center justify-between">
                                    {selectedNation.name}
                                    <button className="text-slate-500 hover:text-slate-300 transition-all cursor-pointer" onClick={() => setSelectedNationId(null)}>
                                        ✕
                                    </button>
                                </h2>
                                <div className="mt-4 space-y-2 text-sm">
                                    <p className="flex justify-between">
                                        <span>Popolazione iniziale:</span>
                                        <span className="font-mono">
                                            {(selectedNation.stats.population / 1000000).toFixed(1)}M
                                        </span>
                                    </p>
                                    <p className="flex justify-between">
                                        <span>Infetti:</span>
                                        <span className="text-yellow-400 font-mono">
                                            {selectedNation.stats.infected}
                                        </span>
                                    </p>
                                    <p className="flex justify-between">
                                        <span>Morti:</span>
                                        <span className="text-red-400 font-mono">
                                            {selectedNation.stats.dead}
                                        </span>
                                    </p>
                                </div>
                                
                                <hr className="my-4 border-slate-700" />
                                <h5 className="font-black uppercase tracking-tighter text-cyan-400">
                                    Città
                                </h5>
                                <div className="mt-4 space-y-2 text-sm">
                                    {
                                        selectedNation.cities.map((city) => (
                                            <p key={city.id} className={`flex justify-between items-center ${(playerNation.player?.isVirus || playerNation.id === selectedNation.id) ? 'h-12' : ''}`}>
                                                <span>{city.name}</span>
                                                <span>
                                                    {
                                                        playerNation.player?.isVirus ? (
                                                            city.infectedCount > 0 ? (
                                                                <>
                                                                    <span className="text-yellow-400 font-mono">
                                                                        {city.infectedCount || 0}
                                                                    </span>&nbsp;/&nbsp;
                                                                    <span className="text-red-400 font-mono">
                                                                        {city.deathsCount || 0}
                                                                    </span>&nbsp;/&nbsp;
                                                                    <span className="font-mono">
                                                                        {(city.population / 1000000).toFixed(1)}M
                                                                    </span>
                                                                </>
                                                            ) : (
                                                                <button
                                                                    className="bg-slate-800/50 p-2 rounded-xl border border-slate-700 backdrop-blur-md shadow-2xl hover:bg-slate-700/70 transition-all cursor-pointer"
                                                                    onClick={() => alert(`Prova ad infettare ${city.name}`)}
                                                                >
                                                                    <span className="text-xl">🦠</span>
                                                                </button>
                                                            )
                                                        ) : (
                                                            playerNation.id === selectedNation.id ? (
                                                                <>
                                                                    {
                                                                        city.hasAirport && (
                                                                            <button
                                                                                className="bg-slate-800/50 p-2 rounded-xl border border-slate-700 backdrop-blur-md shadow-2xl hover:bg-slate-700/70 transition-all cursor-pointer"
                                                                                onClick={() => alert(`Gestisci aeroporto di ${city.name}`)}
                                                                            >
                                                                                <span className="text-xl">✈️</span>
                                                                            </button>
                                                                        )
                                                                    }
                                                                    {
                                                                        city.hasPort && (
                                                                            <>
                                                                                &nbsp;<button
                                                                                    className="bg-slate-800/50 p-2 rounded-xl border border-slate-700 backdrop-blur-md shadow-2xl hover:bg-slate-700/70 transition-all cursor-pointer"
                                                                                    onClick={() => alert(`Gestisci porto di ${city.name}`)}
                                                                                >
                                                                                    <span className="text-xl">⚓</span>
                                                                                </button>
                                                                            </>
                                                                        )
                                                                    }
                                                                </>) :
                                                                <span className="font-mono">
                                                                    {(city.population / 1000000).toFixed(1)}M
                                                                </span>
                                                        )
                                                    }
                                                </span>
                                            </p>
                                        ))
                                    }
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
                            <div>
                                <h2 className="text-2xl font-black uppercase tracking-tighter text-cyan-400 flex items-center justify-between">
                                    <button className="text-slate-500 hover:text-slate-300 transition-all cursor-pointer ml-auto" onClick={() => setSelectedNationId(null)}>
                                        ✕
                                    </button>
                                </h2>
                                <p className="mt-4 text-slate-500 italic text-center text-sm">
                                    Seleziona una nazione sulla mappa per i dati strategici.
                                </p>
                            </div>
                        )}
                    </div>
                </aside>
            </main>

            <Footer
                actions={actions}
                virusActions={virusActions}
                unlockedMutations={gameState.virusStats.unlockedMutations}
                pendingActions={pendingActions}
                pendingVirusActions={pendingVirusActions}
                mutationsPoints={currentMutationPoints}
                activeLayers={activeLayers}
                onAction={handleAction}
                onVirusAction={handleVirusAction}
                onEndTurn={handleConfirmTurn}
                handleLayerToggle={handleLayerToggle}
                hasFinishedTurn={hasFinishedTurn}
            />
        </div>
    );
}

export default GameScreen;