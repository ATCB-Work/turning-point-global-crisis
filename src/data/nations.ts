export interface NationStats {
  economy: number;    // 0-100: Capacità di generare Punti Risorsa
  healthcare: number; // 0-100: Resistenza passiva al virus
  stability: number;  // 0-100: Se scende troppo, la nazione collassa
}

export interface Nation {
  id: string;         // ISO_A3 (es: "ITA", "USA")
  name: string;
  population: number;
  stats: NationStats;
  infected: number;    // Numero reale di persone contagiate
  isNPC: boolean;      // Se true, sarà gestita dall'IA Gemini
  resources: number;   // "Soldi" attuali per fare azioni
}

export const INITIAL_NATIONS: Record<string, Nation> = {
  "ITA": {
    id: "ITA",
    name: "Italy",
    population: 60000000,
    stats: { economy: 75, healthcare: 80, stability: 90 },
    infected: 0,
    isNPC: false, // Sarà il giocatore umano per i test
    resources: 100,
  },
  "USA": {
    id: "USA",
    name: "United States",
    population: 331000000,
    stats: { economy: 95, healthcare: 65, stability: 70 },
    infected: 0,
    isNPC: true, // Gestita dall'IA
    resources: 150,
  },
  // Possiamo aggiungere altre nazioni qui
};