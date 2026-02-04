export interface LocationMarker {
  id: string;
  name: string;
  coordinates: [number, number]; // [longitudine, latitudine]
  type: 'airport' | 'port';
}

export const WORLD_LOCATIONS: LocationMarker[] = [  
  // Esempi di Infrastrutture
  { id: "lhr", name: "London Heathrow", coordinates: [-0.5900, 51.4700], type: 'airport' },
  { id: "hkg", name: "Port of Hong Kong", coordinates: [114.1694, 21.9000], type: 'port' },
];