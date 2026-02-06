import type { City, GameState, Nation, PlayerAction } from "../config/interfaces";

export const processTurn = (currentState: GameState, actions: PlayerAction[]): GameState => {
  // 1. Creiamo una copia profonda per non mutare lo stato originale (Immutabilità)
  const nextState: GameState = JSON.parse(JSON.stringify(currentState));

  // --- FASE 1: RISOLUZIONE AZIONI PLAYER ---
  actions.forEach(action => {
    const nation = nextState.nations[action.nationId];
    if (action.type === 'CLOSE_AIRPORT') {
      const city = nation.cities.find((c: City) => c.id === action.payload.cityId);
      if (city) city.isAirportOpen = false;
    }
    if (action.type === 'CLOSE_PORT') {
      const city = nation.cities.find((c: City) => c.id === action.payload.cityId);
      if (city) city.isPortOpen = false;
    }
    // Aggiungi altre azioni qui...
  });

  // --- FASE 2: CRESCITA E DIFFUSIONE ---
  Object.values(nextState.nations).forEach((nation: Nation) => {
    nation.cities.forEach((city: City) => {
      
      // Se la città è infetta, cresce e prova a diffondere
      if (city.infectedCount > 0) {
        
        // A. Crescita Interna
        // Esempio: crescita del 10% + bonus intensità
        const growth = Math.floor(city.infectedCount * (0.1 + (city.infectionData?.intensity || 0))); 
        city.infectedCount = Math.min(city.population, city.infectedCount + growth);

        // B. Diffusione via Hub (Porti/Aeroporti)
        if (city.isAirportOpen || city.isPortOpen) {
          attemptInternationalSpread(city, nextState);
        }

        // C. Diffusione verso vicini (prossimità)
        attemptLocalSpread(city, nation);
      }
    });
  });

  // --- FASE 3: AGGIORNAMENTO DATI GLOBALI ---
  nextState.turnNumber += 1;
  // Aggiungi qui logica per punti DNA/Risorse guadagnati
  
  return nextState;
};

const attemptInternationalSpread = (sourceCity: City, state: GameState) => {
  const infectionRatio = sourceCity.infectedCount / sourceCity.population;
  
  // Se la città è molto infetta, la probabilità di "esportare" il virus sale
  const spreadChance = infectionRatio * 0.2; // 20% max chance per tick

  if (Math.random() < spreadChance) {
    // Trova una città bersaglio casuale con un hub aperto
    const potentialTargets = findAllOpenHubs(state).filter(c => c.id !== sourceCity.id);
    const target = potentialTargets[Math.floor(Math.random() * potentialTargets.length)];
    
    if (target && target.infectedCount === 0) {
      target.infectedCount = 1; // Il "paziente zero" nella nuova città
      console.log(`Il virus è volato da ${sourceCity.name} a ${target.name}!`);
    }
  }
};

const findAllOpenHubs = (state: GameState): City[] => {
  const hubs: City[] = [];

  // Cicliamo ogni nazione e ogni città
  Object.values(state.nations).forEach(nation => {
    nation.cities.forEach(city => {
      // Se la città ha un'infrastruttura ed è attiva
      if (city.isAirportOpen || city.isPortOpen) {
        hubs.push(city);
      }
    });
  });

  return hubs;
};

const attemptLocalSpread = (sourceCity: City, nation: Nation) => {
  // 1. Calcoliamo la forza del contagio basata sulla percentuale di infetti
  const infectionRatio = sourceCity.infectedCount / sourceCity.population;
  
  // 2. Cerchiamo città della stessa nazione che non sono ancora infette
  const targets = nation.cities.filter(c => c.infectedCount === 0);

  targets.forEach(target => {
    // Calcoliamo la probabilità basata sulla distanza (semplificata)
    // Più il virus è "forte" nella sorgente, più è facile che passi alla vicina
    const baseChance = infectionRatio * 0.15; // Max 15% di probabilità per tick
    
    // Bonus: se la nazione ha bassa resistenza (sanità scarsa), aumenta la probabilità
    const finalChance = baseChance * (1 - nation.baseResistance);

    if (Math.random() < finalChance) {
      target.infectedCount = 1; // Paziente zero nella nuova città
      target.infectionData = { intensity: 0.1, growthRate: 0.05 };
      console.log(`Contagio locale: il virus è passato da ${sourceCity.name} a ${target.name}`);
    }
  });
};