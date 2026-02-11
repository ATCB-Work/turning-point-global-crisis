import React, { useState } from 'react';
import type { Action, VirusMutation, PlayerAction, PlayerVirusAction } from '../config/interfaces';

interface PlayerConsoleProps {
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

interface ActionButtonProps {
    label: string;
    icon: string;
    onClick: () => void;
    color: string;
}

const PlayerConsole: React.FC<PlayerConsoleProps> = ({ actions, virusActions, unlockedMutations, pendingActions, pendingVirusActions, mutationsPoints, onAction, onVirusAction, onEndTurn, activeLayers, handleLayerToggle, hasFinishedTurn }) => {

    const [showSettings, setShowSettings] = useState(false);
    const [showHealthcareActions, setShowHealthcareActions] = useState(false);
    const [showMilitaryActions, setShowMilitaryActions] = useState(false);
    const [showResearchActions, setShowResearchActions] = useState(false);
    const [showEconomicActions, setShowEconomicActions] = useState(false);
    const [showVirusAbilities, setShowVirusAbilities] = useState(false);
    const [showVirusSymptoms, setShowVirusSymptoms] = useState(false);

    const onActionClick = (action: Action) => onAction(action);
    const onVirusActionClick = (action: VirusMutation) =>  onVirusAction(action);

    return (
        <div className="fixed bottom-0 left-0 w-full p-6 bg-gradient-to-t from-slate-950 via-slate-900/90 to-transparent pointer-events-none">
            <div className="mx-auto flex items-end justify-between pointer-events-auto">
            
                {/* Gruppo Toggle Layers */}
                <button
                    className="bg-slate-800/50 p-2 rounded-xl border border-slate-700 backdrop-blur-md shadow-2xl hover:bg-slate-700/70 transition-all cursor-pointer"
                    onClick={() => setShowSettings(!showSettings)}
                >
                    <span className="text-xl">⚙️</span>
                </button>

                <div className={`absolute bottom-20 left-6 p-4 rounded-2xl flex flex-col gap-2 border border-slate-700 shadow-2xl transition-all bg-slate-900/80 backdrop-blur-md ${showSettings ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
                    <span className="text-sm font-bold text-slate-300 uppercase tracking-widest mb-2">Gestisci Layer Mappa</span>
                    <button
                        onClick={() => handleLayerToggle('cities')}
                        className={`px-3 py-1 rounded-xl text-sm font-bold ${activeLayers.cities ? 'bg-cyan-600 text-white' : 'bg-slate-700 text-slate-300'}`}
                    >
                        Città
                    </button>
                    <button
                        onClick={() => handleLayerToggle('locations')}
                        className={`px-3 py-1 rounded-xl text-sm font-bold ${activeLayers.locations ? 'bg-cyan-600 text-white' : 'bg-slate-700 text-slate-300'}`}
                    >
                        Infrastrutture
                    </button>
                    <button
                        onClick={() => handleLayerToggle('infections')}
                        className={`px-3 py-1 rounded-xl text-sm font-bold ${activeLayers.infections ? 'bg-cyan-600 text-white' : 'bg-slate-700 text-slate-300'}`}
                    >
                        Infezioni
                    </button>
                </div>

                {/* Gruppo Azioni Centrali */}
                <div className="flex gap-4 bg-slate-800/50 p-2 rounded-2xl border border-slate-700 backdrop-blur-md">
                    {actions.healthcare && <ActionButton label="Sanità" icon="🏥" onClick={() => {setShowHealthcareActions(!showHealthcareActions); setShowMilitaryActions(false); setShowResearchActions(false); setShowEconomicActions(false); }} color="border-cyan-500 text-cyan-400 cursor-pointer" />}
                    {actions.military && <ActionButton label="Militare" icon="🛡️" onClick={() => {setShowMilitaryActions(!showMilitaryActions); setShowHealthcareActions(false); setShowResearchActions(false); setShowEconomicActions(false); }} color="border-red-500 text-red-400 cursor-pointer" />}
                    {actions.research && <ActionButton label="Ricerca" icon="🧬" onClick={() => {setShowResearchActions(!showResearchActions); setShowHealthcareActions(false); setShowMilitaryActions(false); setShowEconomicActions(false); }} color="border-purple-500 text-purple-400 cursor-pointer" />}
                    {actions.economy && <ActionButton label="Economia" icon="📈" onClick={() => {setShowEconomicActions(!showEconomicActions); setShowHealthcareActions(false); setShowMilitaryActions(false); setShowResearchActions(false); }} color="border-green-500 text-green-400 cursor-pointer" />}
                    {virusActions.abilities && <ActionButton label="Abilità" icon="🧬" onClick={() => {setShowVirusAbilities(!showVirusAbilities); setShowVirusSymptoms(false);}} color="border-red-500 text-red-400 cursor-pointer" />}
                    {virusActions.symptoms && <ActionButton label="Sintomi" icon="🦠" onClick={() => {setShowVirusSymptoms(!showVirusSymptoms); setShowVirusAbilities(false); }} color="border-yellow-500 text-yellow-400 cursor-pointer" />}
                </div>

                {
                    actions.healthcare && <div className={`absolute bottom-20 left-6 p-4 rounded-2xl flex flex-col gap-2 border border-slate-700 shadow-2xl transition-all bg-slate-900/80 backdrop-blur-md ${showHealthcareActions ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
                        {
                            actions.healthcare.map((action: Action) => (
                                <button
                                    key={action.actionId}
                                    onClick={() => onActionClick(action)}
                                    className={`px-3 py-1 rounded-xl text-sm font-bold bg-cyan-600 text-white cursor-pointer`}
                                >
                                    {action.actionName} - <span className="text-yellow-400 font-bold">{action.actionCost} PR</span>
                                </button>
                            ))
                        }
                    </div>
                }
                {
                    actions.military && <div className={`absolute bottom-20 left-6 p-4 rounded-2xl flex flex-col gap-2 border border-slate-700 shadow-2xl transition-all bg-slate-900/80 backdrop-blur-md ${showMilitaryActions ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
                        {
                            actions.military.map((action: Action) => (
                                <button
                                    key={action.actionId}
                                    onClick={() => onActionClick(action)}
                                    className={`px-3 py-1 rounded-xl text-sm font-bold bg-cyan-600 text-white cursor-pointer`}
                                >
                                    {action.actionName} - <span className="text-yellow-400 font-bold">{action.actionCost} PR</span>
                                </button>
                            ))
                        }
                    </div>
                }
                {
                    actions.research && <div className={`absolute bottom-20 left-6 p-4 rounded-2xl flex flex-col gap-2 border border-slate-700 shadow-2xl transition-all bg-slate-900/80 backdrop-blur-md ${showResearchActions ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
                    {
                        actions.research.map((action: Action) => (
                            <button
                                key={action.actionId}
                                onClick={() => onActionClick(action)}
                                className={`px-3 py-1 rounded-xl text-sm font-bold bg-cyan-600 text-white cursor-pointer`}
                            >
                                {action.actionName} - <span className="text-yellow-400 font-bold">{action.actionCost} PR</span>
                            </button>
                        ))
                    }
                </div>
                }
                {
                    actions.economy && <div className={`absolute bottom-20 left-6 p-4 rounded-2xl flex flex-col gap-2 border border-slate-700 shadow-2xl transition-all bg-slate-900/80 backdrop-blur-md ${showEconomicActions ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
                    {
                        actions.economy.map((action: Action) => (
                            <button
                                key={action.actionId}
                                onClick={() => onActionClick(action)}
                                className={`px-3 py-1 rounded-xl text-sm font-bold bg-cyan-600 text-white cursor-pointer`}
                            >
                                {action.actionName} - <span className="text-yellow-400 font-bold">{action.actionCost} PR</span>
                            </button>
                        ))
                    }
                    </div>
                }
                {
                    virusActions.abilities && <div className={`absolute bottom-20 left-6 p-4 rounded-2xl flex flex-col gap-2 border border-slate-700 shadow-2xl transition-all bg-slate-900/80 backdrop-blur-md ${showVirusAbilities ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
                    {
                        virusActions.abilities.map((action: VirusMutation) => (
                            !(action.unlockRequirements !== undefined && action.unlockRequirements?.some(prereq => !unlockedMutations.includes(prereq.idPreviousMutation))) && <button
                                key={action.id}
                                onClick={() => onVirusActionClick(action)}
                                className={`px-3 py-1 rounded-xl text-sm font-bold  cursor-pointer ${pendingVirusActions && pendingVirusActions.find(pva => pva.id === action.id) ? 'bg-yellow-500 text-slate-950' : 'bg-cyan-600 text-white'}`}
                                disabled={unlockedMutations.includes(action.id!) || (!(pendingVirusActions && pendingVirusActions.find(pva => pva.id === action.id)) && action.mutationPointCost > mutationsPoints)}
                            >
                                {action.name} - <span className={`${pendingVirusActions && pendingVirusActions.find(pva => pva.id === action.id) ? 'text-red-900' : 'text-yellow-400'} font-bold`}>{action.mutationPointCost} MP</span>
                            </button>
                        ))
                    }
                    </div>
                }
                {
                    virusActions.symptoms && <div className={`absolute bottom-20 left-6 p-4 rounded-2xl flex flex-col gap-2 border border-slate-700 shadow-2xl transition-all bg-slate-900/80 backdrop-blur-md ${showVirusSymptoms ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
                    {
                        virusActions.symptoms.map((action: VirusMutation) => (
                            !(action.unlockRequirements !== undefined && action.unlockRequirements?.some(prereq => !unlockedMutations.includes(prereq.idPreviousMutation))) && <button
                                key={action.id}
                                onClick={() => onVirusActionClick(action)}
                                className={`px-3 py-1 rounded-xl text-sm font-bold cursor-pointer ${pendingVirusActions && pendingVirusActions.find(pva => pva.id === action.id) ? 'bg-yellow-500 text-slate-950' : 'bg-cyan-600 text-white'}`}
                                disabled={unlockedMutations.includes(action.id!) || (!(pendingVirusActions && pendingVirusActions.find(pva => pva.id === action.id)) && action.mutationPointCost > mutationsPoints)}
                            >
                                {action.name} - <span className={`${pendingVirusActions && pendingVirusActions.find(pva => pva.id === action.id) ? 'text-red-900' : 'text-yellow-400'} font-bold`}>{action.mutationPointCost} MP</span>
                            </button>
                        )
                        )
                    }
                    </div>
                }

                <button 
                    onClick={onEndTurn}
                    className="bg-red-900 hover:bg-red-700 text-m px-8 py-4 rounded-xl transition-all cursor-pointer disabled:bg-red-700 disabled:cursor-not-allowed"
                    disabled={hasFinishedTurn}
                >
                    FINE TURNO
                </button>
            </div>
        </div>
    );
};

// Sotto-componente per i bottoni delle azioni
const ActionButton = ({ label, icon, onClick, color }: ActionButtonProps) => (
  <button 
    onClick={onClick}
    className={`flex flex-col items-center justify-center w-20 h-20 rounded-xl border-2 bg-slate-900/80 hover:bg-slate-800 transition-all ${color}`}
  >
    <span className="text-2xl">{icon}</span>
    <span className="text-[9px] font-bold uppercase mt-1 tracking-tighter">{label}</span>
  </button>
);

export default PlayerConsole;