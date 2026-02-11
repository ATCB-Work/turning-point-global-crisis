import { useState, useMemo, useCallback } from 'react';
import GameScreen from './components/GameScreen';
import type { Nation, User } from './config/interfaces';
import nationsData from "./data/nations.json";
import userData from "./data/mockUser.json";

// Tipi per la gestione
type Screen = 'LOGIN' | 'MENU' | 'SELECT_NATION' | 'GAME';

function App() {
  
  const [currentScreen, setCurrentScreen] = useState<Screen>('LOGIN');
  const [user, setUser] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [playerNation, setPlayerNation] = useState<Nation | null>({
    id: '',
    name: '',
    stats: {
      infected: 0,
      dead: 0,
      recovered: 0,
      population: 0,
    },
    resources: {
      money: 0,
      stability: 0,
      healthcare: 0,
    },
    policies: {
      airBlock: false,
      seaBlock: false,
      bordersClosed: false,
      lockdownActive: false,
    },
    publicReport: {
      declaredInfected: 0,
      declaredDead: 0,
      alertLevel: 'Green',
    },
    cities: [],
    neighbors: [],
    climate: 'temperate',
    baseResistance: 0.5
  });
  const [virusName, setVirusName] = useState('');
  
  // Carichiamo le nazioni una volta all'avvio
  const [nations, setNations] = useState<Record<string, Nation>>(() => {
    return Object.fromEntries(
      Object.entries(nationsData).map(([key, value]) => [
        key,
        { 
          ...value,
          publicReport: {
            ...value.publicReport,
            alertLevel: (
              value.publicReport.alertLevel === 'Green' ||
              value.publicReport.alertLevel === 'Yellow' ||
              value.publicReport.alertLevel === 'Orange' ||
              value.publicReport.alertLevel === 'Red'
            )
              ? value.publicReport.alertLevel as "Green" | "Yellow" | "Orange" | "Red"
              : "Green"
          }
        } as Nation,
      ])
    );
  });

  // Filtro intelligente: memorizzato per performance
  const filteredNations = useMemo<Nation[]>(() => {
    return Object.values(nations)
      .filter(n => n.name.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [nations, searchTerm]);
  
  const handleLogin = () => {
    // Simuliamo il caricamento dal JSON
    setUser(userData);
    setPlayerNation(prev => prev ? ({
      ...prev,
      player: {
        id: userData.id ?? '',
        username: userData.username ?? '',
        email: userData.email ?? '',
        stats: userData.stats ?? {
          gamesPlayed: 0,
          virusesDefeated: 0,
          humanityDefeated: 0,
        },
        hasSavedGame: userData?.hasSavedGame ?? false,
        isVirus: undefined, // Lo sceglierà nella schermata di selezione
      }
    }) : null);
    setCurrentScreen('MENU');
  };

  const handleSelectNation = useCallback((nation: Nation) => {
    setPlayerNation((prev) => {
      const updatedNation = {
        ...prev,
        ...nation,
      };

      return updatedNation;
    });
  }, []);

  const handleRole = useCallback((role: 'player' | 'virus') => {
    setPlayerNation(prev => prev && prev.player ? ({
      ...prev,
      player: {
        ...prev.player,
        isVirus: role === 'virus',
      }

    }) : null);
  }, []);
  
  const startNewGame = () => {

    console.log("Starting new game with nation:", playerNation);

    if (!playerNation) return;

    setNations(prev => {
      return {
        ...prev,
        [playerNation.id]: {
          ...playerNation
        }
      }
    })
    setCurrentScreen('GAME');
  }

  return (
    <div className="flex flex-col w-screen h-screen bg-slate-950 text-slate-100 overflow-hidden font-sans">

      {/* 1. SCHERMATA LOGIN */}
      {currentScreen === 'LOGIN' && (
        <div className="flex flex-col items-center justify-center h-screen">
          <h1 className="text-5xl font-black mb-8 tracking-tighter text-red-600">PANDEMIC CONTROL</h1>
          <button 
            onClick={handleLogin}
            className="px-8 py-3 bg-blue-600 hover:bg-blue-500 rounded font-bold transition-all"
          >
            ACCEDI (Mock User)
          </button>
        </div>
      )}

      {/* 2. MENU PRINCIPALE */}
      {currentScreen === 'MENU' && (
        <div className="flex flex-col items-center justify-center h-screen space-y-4">
          <h2 className="text-2xl mb-6">Benvenuto, {user?.username}</h2>
          <button 
            onClick={() => setCurrentScreen('SELECT_NATION')}
            className="w-64 py-3 bg-green-700 hover:bg-green-600 rounded font-bold"
          >
            NUOVA PARTITA
          </button>
          <button 
            disabled 
            className="w-64 py-3 bg-slate-800 text-slate-500 rounded font-bold cursor-not-allowed"
          >
            CARICA PARTITA (No Save)
          </button>
        </div>
      )}
      
      {/* 3. SELEZIONE NAZIONE */}
      {currentScreen === 'SELECT_NATION' && (
        <div className="p-8 max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold">Seleziona la tua Nazione</h2>
            <input 
              type="text" 
              placeholder="Cerca nazione..." 
              className="bg-slate-800 border border-slate-700 p-2 rounded w-64 focus:outline-none focus:border-blue-500"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {filteredNations.map(nation => (
              <div 
                key={nation.id}
                id={`nation-${nation.id}`}
                onClick={() => handleSelectNation(nation)}
                className={`bg-slate-900 p-4 rounded-xl border-2 hover:border-blue-500 ${playerNation?.id === nation.id ? 'border-blue-500' : 'border-transparent'} cursor-pointer transition-all flex flex-col items-center text-center `}
              >
                {/* Placeholder per la bandiera */}
                <div className="w-16 h-10 bg-slate-800 rounded mb-2 flex items-center justify-center text-xs text-slate-500 font-bold">
                  {nation.id}
                </div>
                <span className="font-medium">{nation.name}</span>
                <span className="text-xs text-slate-500">{nation.stats.population.toLocaleString()}</span>
              </div>
            ))}
          </div>

          
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold">Scegli il tuo ruolo</h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            <div 
              key="player"
              onClick={() => handleRole('player')}
              data-value={playerNation?.player?.isVirus}
              className={`bg-slate-900 p-4 rounded-xl border-2 ${playerNation?.player?.isVirus !== undefined && !playerNation?.player?.isVirus ? 'border-blue-500' : 'border-transparent'} hover:border-blue-500 cursor-pointer transition-all flex flex-col items-center text-center`}
            >
              <span className="font-medium">Leader Nazione</span>
            </div>
            <div 
              key="virus"
              onClick={() => handleRole('virus')}
              className={`bg-slate-900 p-4 rounded-xl border-2 ${playerNation?.player?.isVirus && playerNation?.player?.isVirus ? 'border-blue-500' : 'border-transparent'} hover:border-blue-500 cursor-pointer transition-all flex flex-col items-center text-center `}
            >
              <span className="font-medium">Virus</span>
            </div>
          </div>
          
          <div className={`flex justify-between items-center mb-8 ${playerNation?.player?.isVirus ? 'opacity-100' : 'opacity-0 pointer-events-none'} transition-all`}>
            <h2 className="text-3xl font-bold">Scegli il nome del virus</h2>
          </div>

          <div className={`grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 ${playerNation?.player?.isVirus ? 'opacity-100' : 'opacity-0 pointer-events-none'} transition-all`}>
            <input
              type='text' 
              placeholder="Nome del virus..." 
              className="bg-slate-800 border border-slate-700 p-2 rounded w-full focus:outline-none focus:border-blue-500" 
              value={virusName}
              onChange={(e) => setVirusName(e.target.value)}
            />
          </div>

          <div className="flex justify-between items-center mb-8">
            <button 
              onClick={startNewGame}
              className="px-8 py-3 bg-blue-600 hover:bg-blue-500 rounded font-bold transition-all"
            >
              AVVIA PARTITA
            </button>
          </div>
        </div>
      )}

      {/* 4. IL GIOCO (La tua Mappa) */}
      {currentScreen === 'GAME' && playerNation && user && (
        <GameScreen virusName={virusName} user={user} playerNation={playerNation} nations={nations} goToMenu={() => setCurrentScreen('MENU')} />
      )}
    </div>
  );
}

export default App;