export interface Geography {
    svgPath: string | undefined;
    id: string;
    rsmKey: string;
    properties: Record<string, unknown>;
    geometry: unknown;
}

export interface GeoCity {
    geometry: {
        coordinates: [number, number]
    };
    properties: {
        name: string;
        featurecla: string;
        scalerank: number;
    };
}

export interface MainMapProps {
    nations: Record<string, Nation>;
    playerNation: Nation;
    activeLayers: Record<string, boolean>;
    selectedNationId: string | null;
    onNationClick: (id: string | null) => void;
}

/**
 * Represents a city within a nation.
 * @property id - Unique identifier for the city.
 * @property name - Name of the city.
 * @property population - Total population of the city.
 * @property infectedCount - Number of infected individuals in the city.
 * @property hasAirport - Whether the city has an airport.
 * @property hasPort - Whether the city has a port.
 * @property isCapital - Whether the city is the capital of the nation.
 * @property coordinates - Geographical coordinates of the city.
 * @property infectionData - Optional data about infection intensity and growth rate.
 */
export interface City {
    id: string;
    name: string;
    population: number;
    infectedCount: number;
    hasAirport: boolean;
    hasPort: boolean;
    isAirportOpen: boolean;
    isPortOpen: boolean;
    isCapital: boolean;
    coordinates: [number, number]; // Per posizionare i Marker/Infezioni

    // Dati dinamici per il rendering sulla mappa
    infectionData?: {
        intensity: number;   // Derivato da (infectedCount / population)
        growthRate: number;  // Quanto velocemente cresce in questo Tick
    };
}

/**
 * Represents a nation in the game.
 * @property id - ISO_A3 code for the nation.
 * @property name - Name of the nation.
 * @property totalPopulation - Total population of the nation.
 * @property totalInfected - Total number of infected individuals in the nation.
 * @property baseResistance - Resistance level of the nation (0.1 - 1.0).
 * @property cities - List of cities within the nation.
 * @property neighbors - List of neighboring nations by ID.
 * @property climate - Climate type of the nation.
 * @property isNPC - Whether the nation is controlled by AI.
 */
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

/**
 * Represents the global game state.
 * @property nations - Record of all nations in the game.
 * @property mutationPoints - Points available for mutations.
 * @property globalInfected - Total number of infected individuals globally.
 * @property globalDead - Total number of deaths globally.
 */
export interface GameState {
    turnNumber: number;
    nations: Record<string, Nation>;
    virusStats: {
        name: string;
        mutationPoints: number;
        transmissionAir: number;
        transmissionWater: number;
        transmissionLand: number;
        symptoms: string[];
        abilities: string[];
    };
}

export interface LocationMarker {
  id: string;
  name: string;
  coordinates: [number, number]; // [longitude, latitude]
  type: 'airport' | 'port';
}

export interface HeaderProps {
    playerNation: Nation;
    globalResources: number;
    currentDate: Date;
    goToMenu: () => void;
}

export interface ActionProps {
    code: string;
    label: string;
    cost: number;
}

export interface PlayerAction {
    playerId: string;
    nationId: string;
    type: string; // Es. "CLOSE_AIRPORT", "QUARANTINE_CITY", ecc.
    payload: {
        cityId?: string; // Per azioni che targettano una città specifica
        mutationId?: string; // Per azioni che riguardano mutazioni
        investmentAmount?: number; // Per azioni economiche
        targetNationId?: string; // Per azioni che coinvolgono altre nazioni
        tagetCityId?: string; // Per azioni che coinvolgono città di altre nazioni
    }
}