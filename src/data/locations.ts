// Forced type assertion for locations data
import type { LocationMarker } from "../config/interfaces";
import locations from "./locations.json";

export const WORLD_LOCATIONS: LocationMarker[] = locations.map(location => ({
  ...location,
  type: location.type as 'airport' | 'port',
  coordinates: location.coordinates as [number, number],
}));