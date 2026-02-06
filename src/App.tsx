import { useState, useMemo } from 'react';
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
  const [playerNation, setPlayerNation] = useState<Nation | null>(null);
 
  // Carichiamo le nazioni una volta all'avvio
  const nations = useMemo(() => {
    return Object.fromEntries(
      Object.entries(nationsData).map(([key, value]) => [
        key,
        {
          ...value,
          climate: value.climate as 'temperate' | 'cold' | 'hot',
          cities: value.cities.map((city) => ({
            ...city,
            coordinates: city.coordinates.length === 2
              ? ([city.coordinates[0], city.coordinates[1]] as [number, number])
              : ([0, 0] as [number, number]),
          })),
        },
      ])
    );
  }, []);

  // Filtro intelligente: memorizzato per performance
  const filteredNations = useMemo(() => {
    return Object.values(nations).filter(n => 
      n.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [nations, searchTerm]);

  const handleLogin = () => {
    // Simuliamo il caricamento dal JSON
    setUser(userData);
    setCurrentScreen('MENU');
  };

  const startNewGame = (nation: Nation) => {
    setPlayerNation(nation);
    setCurrentScreen('GAME');
  };

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
                onClick={() => startNewGame(nation)}
                className="bg-slate-900 p-4 rounded-xl border-2 border-transparent hover:border-blue-500 cursor-pointer transition-all flex flex-col items-center text-center"
              >
                {/* Placeholder per la bandiera */}
                <div className="w-16 h-10 bg-slate-800 rounded mb-2 flex items-center justify-center text-xs text-slate-500 font-bold">
                  {nation.id}
                </div>
                <span className="font-medium">{nation.name}</span>
                <span className="text-xs text-slate-500">{nation.totalPopulation.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. IL GIOCO (La tua Mappa) */}
      {currentScreen === 'GAME' && playerNation && user && (
        <GameScreen user={user} playerNation={playerNation} nations={nations} goToMenu={() => setCurrentScreen('MENU')} />
      )}
    </div>
  );
}

export default App;