import cloneDeep from "lodash.clonedeep";
import type { Action, City, GameState, Nation, PlayerAction, PlayerVirusAction, VirusMutation } from "../config/interfaces";
import actions from "../data/actions.json";
import virusAbilities from "../data/virusAbilities.json";
import virusSymptoms from "../data/virusSymptoms.json";

/**
 * Inizializza il primo focolaio nel mondo.
 * @param state Lo stato attuale del gioco (pulito, con 0 infetti)
 * @param targetCityId Opzionale: ID della città da cui partire
 * @returns Il nuovo stato con il Paziente Zero
 */
export const initInfection = (state: GameState, targetCityId?: string): GameState => {
  const nextState: GameState = cloneDeep(state);
  let targetCity: City | undefined;
  let targetNation: Nation | undefined;

  if (targetCityId) {
    // Cerchiamo la città specifica tra tutte le nazioni
    for (const nation of Object.values(nextState.nations)) {
      targetCity = nation.cities.find(c => c.id === targetCityId);
      if (targetCity) {
        targetNation = nation;
        break;
      }
    }
  } else {
    // Selezione casuale: prendiamo una nazione a caso e una sua città a caso
    const nations = Object.values(nextState.nations);
    targetNation = nations[Math.floor(Math.random() * nations.length)];
    targetCity = targetNation.cities[Math.floor(Math.random() * targetNation.cities.length)];
  }

  if (targetCity && targetNation) {
    targetCity.infectedCount = 1;
    // Inizializziamo i dati per il primo cerchio sulla mappa
    targetCity.infectionData = {
      intensity: 0.0001, // 1 / popolazione (molto basso all'inizio)
      growthRate: 0.1
    };
    
    targetNation.stats.infected = (targetNation.stats.infected || 0) + 1;
    
    console.log(`Paziente Zero identificato a: ${targetCity.name}`);
  }

  console.log("Stato iniziale dopo l'infezione:", nextState);

  return nextState;
};

export const initActionsByUserRole = (): { 
      healthcare?: Action[];
      military?: Action[];
      research?: Action[];
      economy?: Action[];
    } => {
      
    // Recupero azioni da DB
    return JSON.parse(JSON.stringify(actions));
}
export const initVirusActionsByUserRole = (): {
    abilities: VirusMutation[], 
    symptoms: VirusMutation[]
  } => {
  
  // Recupero azioni da DB
  const virusActions: {
    abilities: VirusMutation[], 
    symptoms: VirusMutation[]
  } = {
    abilities: [],
    symptoms: []
  };

  const abilitiesData = JSON.parse(JSON.stringify(virusAbilities));
  const symptomsData = JSON.parse(JSON.stringify(virusSymptoms));

  virusActions.abilities = abilitiesData;
  virusActions.symptoms = symptomsData;

  return virusActions;
}

export const processTurn = async (currentState: GameState, actions: PlayerAction[], virusActions: PlayerVirusAction[]): Promise<GameState> => {
    // Creiamo una copia profonda per non mutare lo stato originale (Immutabilità)
    const nextState: GameState = JSON.parse(JSON.stringify(currentState));

    // --- APPLICAZIONE AZIONI VIRUS ---
    virusActions.forEach(virusAction => {
        // Qui applichiamo le mutazioni/sintomi al virus, modificando nextState.virusStats o altri parametri globali
        // Esempio: se il virus guadagna un sintomo che aumenta la diffusione, potremmo aumentare un coefficiente globale

        if (virusAction && nextState.virusStats.mutationPoints >= virusAction.mutationPointCost) {
          // Sottraiamo i punti
          nextState.virusStats.mutationPoints -= virusAction.mutationPointCost;

          // Applichiamo i bonus agli attributi del virus
          if (virusAction.effects.infectivity) nextState.virusStats.attributes.infectivity += virusAction.effects.infectivity;
          if (virusAction.effects.lethality) nextState.virusStats.attributes.lethality += virusAction.effects.lethality;
          if (virusAction.effects.stealth) nextState.virusStats.attributes.stealth += virusAction.effects.stealth;
          if (virusAction.effects.adaptability) nextState.virusStats.attributes.adaptability += virusAction.effects.adaptability;
          if (virusAction.effects.hotEnvironmentalResistance) nextState.virusStats.attributes.hotEnvironmentalResistance += virusAction.effects.hotEnvironmentalResistance;
          if (virusAction.effects.coldEnvironmentalResistance) nextState.virusStats.attributes.coldEnvironmentalResistance += virusAction.effects.coldEnvironmentalResistance;

          // Applichiamo i bonus alla trasmissione
          if (virusAction.effects.transmissionAir) nextState.virusStats.transmission.air += virusAction.effects.transmissionAir;
          if (virusAction.effects.transmissionContact) nextState.virusStats.transmission.contact += virusAction.effects.transmissionContact;
          if (virusAction.effects.transmissionEnv) nextState.virusStats.transmission.environmental += virusAction.effects.transmissionEnv;
          if (virusAction.effects.transmissionSpecial) nextState.virusStats.transmission.special += virusAction.effects.transmissionSpecial;

          nextState.virusStats.unlockedMutations.push(virusAction.id);
        
          console.log(`Virus ha evoluto: ${virusAction.name}. Nuovi attributi:`, nextState.virusStats.attributes);
        }

    });


    // --- RISOLUZIONE AZIONI PLAYER ---
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

    // --- CRESCITA E DIFFUSIONE ---
    Object.values(nextState.nations).forEach((nation: Nation) => {
        // Usiamo una variabile temporanea per sommare i nuovi infetti della nazione
        let nationInfectedCounter = 0;
        nation.cities.forEach((city: City) => {
            
            // Se la città è infetta, cresce e prova a diffondere
            if (city.infectedCount > 0) {
            
                // A. Crescita Interna
                // Esempio: crescita del 10% + bonus intensità
                const growth = Math.floor(city.infectedCount * 10000000000.5 + (city.infectionData?.intensity || 0));
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
        nation.stats.infected = nationInfectedCounter;
    });

    // --- DIFFUSIONE TERRESTRE (IL TUO NUOVO METODO) ---
    // Ora che tutte le nazioni hanno ricalcolato i loro infetti, vediamo se il virus scavalca i confini
    Object.values(nextState.nations).forEach((nation: Nation) => {
        if (nation.stats.infected > 0) {
            console.log(`Verifica diffusione cross-border per ${nation.name} con ${nation.stats.infected} infetti su ${nation.stats.population} abitanti.`);
            attemptCrossBorderSpread(nation, nextState);
        }
    });

    // --- AGGIORNAMENTO DATI GLOBALI ---
    const globalInfected = Object.values(nextState.nations).reduce((acc, n) => acc + n.stats.infected, 0);
    nextState.globalInfected = globalInfected;
    
    // --- AGGIORNAMENTO PUNTI DNA (Prima di chiudere il turno)
    // Passiamo currentState (vecchio) e nextState (nuovo con crescita calcolata)
    const pointsEarned = updateVirusPoints(currentState, nextState);
    
    // Aggiungiamo i punti al portfolio del virus
    nextState.virusStats.mutationPoints += pointsEarned;
    console.log(`Punti guadagnati in questo turno: ${pointsEarned}. Totale Mutation Points: ${nextState.virusStats.mutationPoints}`);

    //--- AVANZAMENTO DEL TURNO ---
    nextState.turnNumber += 1;
    console.log(`Turno ${nextState.turnNumber} completato. Infetti totali: ${globalInfected}`);

    return nextState;
};

// Funzioni helper rimangono simili ma aggiungiamo la protezione per il "Paziente Zero"
const spreadInfection = (_: City, targetCity: City, intensity: number, growthRate: number) => {
  targetCity.infectedCount = 1;
  targetCity.infectionData = { intensity, growthRate };
};

const attemptInternationalSpread = (sourceCity: City, state: GameState) => {
  const infectionRatio = sourceCity.infectedCount / sourceCity.population;
  const spreadChance = infectionRatio * 0.2; 

  if (Math.random() < spreadChance) {
    const potentialTargets = findAllOpenHubs(state).filter(c => c.id !== sourceCity.id);
    const target = potentialTargets[Math.floor(Math.random() * potentialTargets.length)];
    
    // Se il target non è ancora infetto, lo infettiamo
    if (target && target.infectedCount === 0) {
      spreadInfection(sourceCity, target, 0.001, 0.05);
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
      spreadInfection(sourceCity, target, 0.1, 0.05);
    }
  });
};

const attemptCrossBorderSpread = (sourceNation: Nation, state: GameState) => {
    // 1. Se la nazione sorgente è abbastanza infetta (es. > 10%)
    const infectionRatio = sourceNation.stats.infected / sourceNation.stats.population;
    console.log(`Verifica cross-border per ${sourceNation.name}: ${infectionRatio * 100}% infetti.`);
    
    if (infectionRatio > 0.01) { // Soglia minima 1% per iniziare a spargersi fuori
        sourceNation.neighbors.forEach(neighborId => {
            const neighborNation = state.nations[neighborId];

            if (!neighborNation) return; // Sicurezza se ID errato

            console.log(`Verifica diffusione verso ${neighborNation.name} (resistenza: ${neighborNation.baseResistance})`);

            // 2. Se il vicino è sano, c'è una probabilità di infettarlo
            // La probabilità aumenta con l'infettività del virus e il confine terrestre
            const spreadChance = (infectionRatio * 0.1) * (1 - neighborNation.baseResistance);
            
            if (Math.random() < spreadChance) {
                // Infettiamo una città a caso del vicino (preferibilmente una vicina al confine)
                const targetCity = neighborNation.cities[Math.floor(Math.random() * neighborNation.cities.length)];
                if (targetCity && targetCity.infectedCount === 0) {
                  spreadInfection(sourceNation.cities[0], targetCity, 0.0001, 0.1);
                }
            }
        });
    }
};

const updateVirusPoints = (state: GameState, nextState: GameState): number => {
    let earned = 1; // Base
    
    const newInfectedNations = Object.values(nextState.nations).filter(
        n => n.stats.infected > 0 && state.nations[n.id].stats.infected === 0
    ).length;
    
    earned += newInfectedNations * 2; // Bonus nuova nazione
    
    // Bonus per volume (1 punto ogni 100.000 nuovi infetti)
    const totalNewInfected = calculateGlobalInfected(nextState) - calculateGlobalInfected(state);
    earned += Math.floor(totalNewInfected / 100000);
    
    return earned;
};

// Memoize calculateGlobalInfected to avoid redundant computations
export const calculateGlobalInfected = (state: GameState): number => {
    return Object.values(state.nations).reduce((acc, nation) => acc + (nation.stats.infected || 0), 0);
};