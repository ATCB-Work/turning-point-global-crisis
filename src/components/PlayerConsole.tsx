import React, { useState } from 'react';
import ACTIONS from '../data/actions.json';
import type { Action, PlayerAction } from '../config/interfaces';

interface PlayerConsoleProps {
    onAction: (action: Action, payload: PlayerAction["payload"] | null) => void;
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

const PlayerConsole: React.FC<PlayerConsoleProps> = ({ onAction, onEndTurn, activeLayers, handleLayerToggle, hasFinishedTurn }) => {

    const [showSettings, setShowSettings] = useState(false);
    const [showHealthcareActions, setShowHealthcareActions] = useState(false);
    const [showMilitaryActions, setShowMilitaryActions] = useState(false);
    const [showResearchActions, setShowResearchActions] = useState(false);
    const [showEconomicActions, setShowEconomicActions] = useState(false);

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
                    <ActionButton label="Sanità" icon="🏥" onClick={() => {setShowHealthcareActions(!showHealthcareActions); setShowMilitaryActions(false); setShowResearchActions(false); setShowEconomicActions(false); }} color="border-cyan-500 text-cyan-400 cursor-pointer" />
                    <ActionButton label="Militare" icon="🛡️" onClick={() => {setShowMilitaryActions(!showMilitaryActions); setShowHealthcareActions(false); setShowResearchActions(false); setShowEconomicActions(false); }} color="border-red-500 text-red-400 cursor-pointer" />
                    <ActionButton label="Ricerca" icon="🧬" onClick={() => {setShowResearchActions(!showResearchActions); setShowHealthcareActions(false); setShowMilitaryActions(false); setShowEconomicActions(false); }} color="border-purple-500 text-purple-400 cursor-pointer" />
                    <ActionButton label="Economia" icon="📈" onClick={() => {setShowEconomicActions(!showEconomicActions); setShowHealthcareActions(false); setShowMilitaryActions(false); setShowResearchActions(false); }} color="border-green-500 text-green-400 cursor-pointer" />
                </div>

                <div className={`absolute bottom-20 left-6 p-4 rounded-2xl flex flex-col gap-2 border border-slate-700 shadow-2xl transition-all bg-slate-900/80 backdrop-blur-md ${showHealthcareActions ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
                    {
                        ACTIONS.healthcare.map((action: Action) => (
                            <button
                                key={action.actionId}
                                onClick={() => onAction(action, null)}
                                className={`px-3 py-1 rounded-xl text-sm font-bold bg-cyan-600 text-white cursor-pointer`}
                            >
                                {action.actionName} - <span className="text-yellow-400 font-bold">{action.actionCost} PR</span>
                            </button>
                        ))
                    }
                </div>
                <div className={`absolute bottom-20 left-6 p-4 rounded-2xl flex flex-col gap-2 border border-slate-700 shadow-2xl transition-all bg-slate-900/80 backdrop-blur-md ${showMilitaryActions ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
                    {
                        ACTIONS.military.map((action: Action) => (
                            <button
                                key={action.actionId}
                                onClick={() => onAction(action, null)}
                                className={`px-3 py-1 rounded-xl text-sm font-bold bg-cyan-600 text-white cursor-pointer`}
                            >
                                {action.actionName} - <span className="text-yellow-400 font-bold">{action.actionCost} PR</span>
                            </button>
                        ))
                    }
                </div>
                <div className={`absolute bottom-20 left-6 p-4 rounded-2xl flex flex-col gap-2 border border-slate-700 shadow-2xl transition-all bg-slate-900/80 backdrop-blur-md ${showResearchActions ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
                    {
                        ACTIONS.research.map((action: Action) => (
                            <button
                                key={action.actionId}
                                onClick={() => onAction(action, null)}
                                className={`px-3 py-1 rounded-xl text-sm font-bold bg-cyan-600 text-white cursor-pointer`}
                            >
                                {action.actionName} - <span className="text-yellow-400 font-bold">{action.actionCost} PR</span>
                            </button>
                        ))
                    }
                </div>
                <div className={`absolute bottom-20 left-6 p-4 rounded-2xl flex flex-col gap-2 border border-slate-700 shadow-2xl transition-all bg-slate-900/80 backdrop-blur-md ${showEconomicActions ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
                    {
                        ACTIONS.economy.map((action: Action) => (
                            <button
                                key={action.actionId}
                                onClick={() => onAction(action, null)}
                                className={`px-3 py-1 rounded-xl text-sm font-bold bg-cyan-600 text-white cursor-pointer`}
                            >
                                {action.actionName} - <span className="text-yellow-400 font-bold">{action.actionCost} PR</span>
                            </button>
                        ))
                    }
                </div>

                {/* Bottone Fine Turno */}
                <button 
                    onClick={onEndTurn}
                    className="bg-red-600 hover:bg-red-500 text-white px-8 py-4 rounded-xl font-black italic tracking-tighter shadow-lg shadow-red-900/20 transition-all active:scale-95 border-b-4 border-red-800"
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