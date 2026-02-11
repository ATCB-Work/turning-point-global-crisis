export interface User {
  id: string;
  username: string;
  email: string;
  stats: {
    gamesPlayed: number;
    virusesDefeated: number;
    humanityDefeated: number;
  };
  hasSavedGame: boolean;
}

export interface Player extends User {
    isVirus: boolean | undefined; // Se è il giocatore che controlla il virus (in un multiplayer asimmetrico)
}

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
    deathsCount: number;
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
    baseResistance: number; // 0.1 - 1.0 (Sanità, clima, ecc.)

    // --- PILASTRI GESTIONALI (Risorse) ---
    resources: {
        money: number;        // Budget per azioni e ricerca
        stability: number;    // Salute politica (0 = Anarchia)
        healthcare: number;   // Efficacia ospedaliera e prevenzione
    };

    // --- DEMOGRAFIA REALE (Verità assoluta) ---
    stats: {
        population: number;
        infected: number;
        dead: number;
        recovered: number;
    };

    // --- FOG OF WAR (Quello che il mondo vede) ---
    publicReport: {
        declaredInfected: number; // Può essere falsificato dal Virus
        declaredDead: number;     // Può essere falsificato dal Virus
        alertLevel: 'Green' | 'Yellow' | 'Orange' | 'Red';
    };

    // --- MODIFICATORI DI STATO ---
    policies: {
        airBlock: boolean;
        seaBlock: boolean;
        bordersClosed: boolean;
        lockdownActive: boolean;
    };

    cities: City[];
    neighbors: string[]; // ID delle nazioni confinanti via terra
    climate: 'cold' | 'hot' | 'temperate';
    player?: Player
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
    globalInfected: number;
    virusStats: VirusStats;
    vaccineProgress: number; // 0 - 100%
}

export interface LocationMarker {
  id: string;
  name: string;
  coordinates: [number, number]; // [longitude, latitude]
  type: 'airport' | 'port';
}

export interface HeaderProps {
    playerNation: Nation;
    vaccineProgress: number;
    mutationPoints: number;
    currentDate: Date;
    goToMenu: () => void;
}

export interface ActionProps {
    code: string;
    label: string;
    cost: number;
}

export interface PlayerAction extends Action {
    playerId: string;
    nationId: string;
    payload?: {
        cityId?: string; // Per azioni che targettano una città specifica
        mutationId?: string; // Per azioni che riguardano mutazioni
        investmentAmount?: number; // Per azioni economiche
        targetNationId?: string; // Per azioni che coinvolgono altre nazioni
        tagetCityId?: string; // Per azioni che coinvolgono città di altre nazioni
    }
}

export interface Action {
    actionId: string; // UUID o identificatore univoco dell'azione
    actionName: string; // Es. "Close Airport", "Quarantine City", ecc.
    actionCost: number; // Costo in PR (Pandemic Resources)
    type: string; // Es. "CLOSE_AIRPORT", "QUARANTINE_CITY", ecc.
}

export interface VirusStats {
    id?: string;
    name: string;
    mutationPoints: number;     // Punti a disposizione per evolvere il virus
    
    // --- CARATTERISTICHE PRINCIPALI (Derivate dalle mutazioni) ---
    attributes: {
        infectivity: number;   // R0 base
        lethality: number;     // Tasso di mortalità
        stealth: number;       // Capacità di nascondersi
        adaptability: number;   // Velocità di mutazione
        hotEnvironmentalResistance: number; // Resistenza a climi estremi
        coldEnvironmentalResistance: number; // Resistenza a climi estremi
    };
    
    // --- MODIFICATORI DI TRASMISSIONE ---
    transmission: {
        air: number;
        contact: number;      
        environmental: number;
        special: number;      
    };
    unlockedMutations: string[]; // Lista di ID delle mutazioni sbloccate
}

export interface PlayerVirusAction extends VirusMutation {
    playerId: string;
    nationId: string;
    payload?: {
        cityId?: string; // Per azioni che targettano una città specifica
        nationId?: string; // Per azioni che coinvolgono altre nazioni
    }
}

export interface VirusMutation {
    id: string;
    name: string;
    description: string;
    mutationPointCost: number;
    unlockRequirements?: {
        idPreviousMutation: string; // Per creare catene di mutazioni
    }[],
    effects: {
        // Bonus agli attributi
        infectivity?: number;
        lethality?: number;
        stealth?: number;
        adaptability?: number;
        hotEnvironmentalResistance?: number;
        coldEnvironmentalResistance?: number;
        // Bonus ai vettori di trasmissione
        transmissionAir?: number;
        transmissionContact?: number;
        transmissionEnv?: number;
        transmissionSpecial?: number;
    };
}