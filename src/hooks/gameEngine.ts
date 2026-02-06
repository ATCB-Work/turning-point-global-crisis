import type { City, GameState, Nation, PlayerAction } from "../config/interfaces";

/**
 * Inizializza il primo focolaio nel mondo.
 * @param state Lo stato attuale del gioco (pulito, con 0 infetti)
 * @param targetCityId Opzionale: ID della città da cui partire
 * @returns Il nuovo stato con il Paziente Zero
 */
export const initInfection = (state: GameState, targetCityId?: string): GameState => {
  const nextState: GameState = JSON.parse(JSON.stringify(state));
  let targetCity: City | undefined;

  if (targetCityId) {
    // Cerchiamo la città specifica tra tutte le nazioni
    for (const nation of Object.values(nextState.nations)) {
      targetCity = nation.cities.find(c => c.id === targetCityId);
      if (targetCity) break;
    }
  } else {
    // Selezione casuale: prendiamo una nazione a caso e una sua città a caso
    const nations = Object.values(nextState.nations);
    const randomNation = nations[Math.floor(Math.random() * nations.length)];
    targetCity = randomNation.cities[Math.floor(Math.random() * randomNation.cities.length)];
  }

  if (targetCity) {
    targetCity.infectedCount = 1;
    // Inizializziamo i dati per il primo cerchio sulla mappa
    targetCity.infectionData = {
      intensity: 0.0001, // 1 / popolazione (molto basso all'inizio)
      growthRate: 0.1
    };
    
    console.log(`Paziente Zero identificato a: ${targetCity.name}`);
  }

  console.log("Stato iniziale dopo l'infezione:", nextState);

  return nextState;
};

export const processTurn = async (currentState: GameState, actions: PlayerAction[]): Promise<GameState> => {
    // 1. Creiamo una copia profonda per non mutare lo stato originale (Immutabilità)
    const nextState: GameState = JSON.parse(JSON.stringify(currentState));

    // --- FASE 1: RISOLUZIONE AZIONI PLAYER ---
    actions.forEach(action => {
        const nation = nextState.nations[action.nationId];
        if (!nation) return; // Sicurezza se l'ID nazione è errato

        if (action.type === 'CLOSE_ALL_AIRPORTS') {
            nation.cities.forEach((c: City) => c.isAirportOpen = false);
        }
        if (action.type === 'CLOSE_AIRPORT') {
            const city = nation.cities.find((c: City) => c.id === action.payload?.cityId);
            if (city) city.isAirportOpen = false;
        }
        if (action.type === 'CLOSE_ALL_PORTS') {
            nation.cities.forEach((c: City) => c.isPortOpen = false);
        }
        if (action.type === 'CLOSE_PORT') {
            const city = nation.cities.find((c: City) => c.id === action.payload?.cityId);
            if (city) city.isPortOpen = false;
        }
        // Aggiungi altre azioni qui...
    });

    // --- FASE 2: CRESCITA E DIFFUSIONE ---
    Object.values(nextState.nations).forEach((nation: Nation) => {
        // Usiamo una variabile temporanea per sommare i nuovi infetti della nazione
        let nationInfectedCounter = 0;
        nation.cities.forEach((city: City) => {
            
            // Se la città è infetta, cresce e prova a diffondere
            if (city.infectedCount > 0) {
            
                // A. Crescita Interna
                // Esempio: crescita del 10% + bonus intensità
                const growth = Math.floor(city.infectedCount * (0.5 + (city.infectionData?.intensity || 0)));
                console.log(`Crescita in ${city.name}: (${city.infectionData?.intensity || 0}) +${growth} infetti (da ${city.infectedCount} a ${city.infectedCount + growth})`); 
                city.infectedCount = Math.min(city.population, city.infectedCount + growth);

                // Aggiorniamo l'oggetto infectionData per il rendering
                city.infectionData = {
                    intensity: city.infectedCount / city.population,
                    growthRate: 0.1 + (city.infectionData?.intensity || 0)
                };

                // B. Diffusione via Hub (Porti/Aeroporti)
                if (city.isAirportOpen || city.isPortOpen) {
                    attemptInternationalSpread(city, nextState);
                }

                // C. Diffusione verso vicini (prossimità)
                attemptLocalSpread(city, nation);
            }
            nationInfectedCounter += city.infectedCount;
        });
        // Aggiornamento della nazione
        nation.totalInfected = nationInfectedCounter;
    });

    // --- FASE 3: AGGIORNAMENTO DATI GLOBALI ---
    nextState.turnNumber += 1;

    // Aggiungi qui logica per punti DNA/Risorse guadagnati
    // Ricalcolo Global Infected (somma di tutte le nazioni)
    // Questo serve per i grafici e l'HUD globale
    const globalInfected = Object.values(nextState.nations).reduce((acc, n) => acc + n.totalInfected, 0);
    nextState.globalInfected = globalInfected;

    console.log(`Turno ${nextState.turnNumber} completato. Infetti totali: ${globalInfected}`);

    return nextState;
};

// Funzioni helper rimangono simili ma aggiungiamo la protezione per il "Paziente Zero"
const attemptInternationalSpread = (sourceCity: City, state: GameState) => {
  const infectionRatio = sourceCity.infectedCount / sourceCity.population;
  const spreadChance = infectionRatio * 0.2; 

  if (Math.random() < spreadChance) {
    const potentialTargets = findAllOpenHubs(state).filter(c => c.id !== sourceCity.id);
    const target = potentialTargets[Math.floor(Math.random() * potentialTargets.length)];
    
    // Se il target non è ancora infetto, lo infettiamo
    if (target && target.infectedCount === 0) {
      target.infectedCount = 1; 
      target.infectionData = { intensity: 0.001, growthRate: 0.05 };
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