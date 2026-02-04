export interface City {
    id: string;
    name: string;
    population: number;
    infectedCount: number;
    hasAirport: boolean;
    hasPort: boolean;
    isCapital: boolean;
    coordinates: [number, number]; // Per posizionare i Marker/Infezioni

    // Dati dinamici per il rendering sulla mappa
    infectionData?: {
        intensity: number;   // Derivato da (infectedCount / population)
        growthRate: number;  // Quanto velocemente cresce in questo Tick
    };
}

export interface Nation {
    id: string; // ISO_A3 (es. "ITA")
    name: string;
    totalPopulation: number;
    totalInfected: number;
    baseResistance: number; // 0.1 - 1.0 (Sanità, clima, ecc.)
    cities: City[];
    neighbors: string[]; // ID delle nazioni confinanti via terra
    climate: 'cold' | 'hot' | 'temperate';
    isNPC: boolean; // Se è controllata dall'IA
}

export interface GameState {
    nations: Record<string, Nation>;
    mutationPoints: number;
    globalInfected: number;
    globalDead: number;
}

// MOCK DA SPOSTARE

export const INITIAL_NATIONS: Record<string, Nation> = {
  "ITA": {
    id: "ITA",
    name: "Italia",
    totalPopulation: 60000000,
    totalInfected: 0,
    baseResistance: 0.7,
    climate: 'temperate',
    neighbors: ["FRA", "AUT", "CHE", "SVN"],
    cities: [
      { id: "rom", name: "Roma", population: 2800000, infectedCount: 0, hasAirport: true, hasPort: false, isCapital: true, coordinates: [12.4964, 41.9028], infectionData: { intensity: 0.1, growthRate: 0.02 }  },
    ],
    isNPC: false
  },
  "FRA": {
    id: "FRA",
    name: "Francia",
    totalPopulation: 67000000,
    totalInfected: 0,
    baseResistance: 0.75,
    climate: 'temperate',
    neighbors: ["ITA", "ESP", "BEL", "DEU", "CHE"],
    cities: [
      { id: "par", name: "Parigi", population: 2100000, infectedCount: 0, hasAirport: true, hasPort: false, isCapital: true, coordinates: [2.3522, 48.8566] },
      { id: "mrs", name: "Marsiglia", population: 860000, infectedCount: 0, hasAirport: false, hasPort: true, isCapital: false, coordinates: [5.3698, 43.2965] }
    ],
    isNPC: true
  },
  "USA": {
    id: "USA",
    name: "Stati Uniti",
    totalPopulation: 331000000,
    totalInfected: 0,
    baseResistance: 0.8,
    climate: 'temperate',
    neighbors: ["CAN", "MEX"],
    cities: [
      { id: "nyc", name: "New York", population: 8400000, infectedCount: 0, hasAirport: true, hasPort: true, isCapital: false, coordinates: [-74.0060, 40.7128], infectionData: { intensity: 0.4, growthRate: 0.05 }  },
      { id: "atl", name: "Atlanta", population: 500000, infectedCount: 0, hasAirport: true, hasPort: false, isCapital: false, coordinates: [-84.3880, 33.7490] },
      { id: "lax", name: "Los Angeles", population: 3900000, infectedCount: 0, hasAirport: true, hasPort: true, isCapital: false, coordinates: [-118.2437, 34.0522] }
    ],
    isNPC: true
  }
};