import { 
  ComposableMap, 
  Geographies, 
  Geography, 
  ZoomableGroup,
  Marker
} from "react-simple-maps";
import type { City, MainMapProps } from "../../config/interfaces";
import { useGeoData } from "../../hooks/useGeoData";
import { useCitiesData } from "../../hooks/useCitiesData";
import {
    CUSTOM_LOCATION_ICONS,
    CUSTOM_CITIES_ICONS,
    CUSTOM_CITIES_ICON_COODS,
    CUSTOM_CITIES_NAME_COORDS
} from "../../config/constants";
import { useState, useMemo, type ReactNode, useCallback } from "react";
import type { GeoCity, Geography as IGeography } from "../../config/interfaces";

// URL del GeoJSON per i confini mondiali
const geoUrl = "https://raw.githubusercontent.com/lotusms/world-map-data/main/world.json";
const citiesUrl = "https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_110m_populated_places_simple.geojson";

function isCapital(city: GeoCity): boolean {
    return city.properties.featurecla.includes('Admin-0 capital');
}
function isLargeCity(city: GeoCity): boolean {
    return city.properties.scalerank <= 2;
}

const MainMap = ({ nations, playerNation, activeLayers, selectedNationId, onNationClick }: MainMapProps) => {
  const geoData = useGeoData(geoUrl);
  const cities = useCitiesData(citiesUrl);
  const [currentZoom, setCurrentZoom] = useState(1);

  // Debounce zoom updates to reduce frequent state updates
  const debouncedSetZoom = useCallback((zoom: number) => {
    setCurrentZoom(zoom);
  }, []);

  // Utility function to calculate custom coordinates
  const getCustomCoords = useCallback(
    (_: string, defaultCoords: [number, number], offset: [number, number]): [number, number] => {
      return [
        defaultCoords[0] + offset[0],
        defaultCoords[1] + offset[1]
      ];
    },
    []
  );

  // Utility function to generate markers for infrastructure
  const generateInfrastructureMarkers = useCallback(
    (city: City, type: 'airport' | 'port', coords: [number, number]): ReactNode => (
      <Marker key={`${type}-${city.id}`} coordinates={coords}>
          <g
              onClick={() => alert(`Menu Gestione ${type === 'airport' ? 'Aeroporto' : 'Porto'}: ${city.name}`)}
              className="cursor-pointer hover:scale-110 transition-transform"
          >
              <text 
                  textAnchor="middle" 
                  alignmentBaseline="central"
                  fontSize={0.8} 
                  fill="red"
              > 
                  {CUSTOM_LOCATION_ICONS[type]}
              </text> 
          </g>
      </Marker>
    ),
    []
  );

  // Memoize the infrastructure markers to avoid unnecessary re-renders
  const infrastructureMarkers = useMemo(() => {
    if (!activeLayers.locations) return null;

    return Object.values(nations).flatMap((nation) =>
      nation.cities.flatMap((city) => {
        if (!Array.isArray(city.coordinates) || city.coordinates.length !== 2) {
          console.error(`Invalid coordinates for city: ${city.name}`, city.coordinates);
          return [];
        }

        const markers: ReactNode[] = [];

        if (city.hasAirport) {
          const airportCoords = getCustomCoords(city.name, city.coordinates, [-0.3, 0.25]);
          markers.push(generateInfrastructureMarkers(city, 'airport', airportCoords));
        }

        if (city.hasPort) {
          const portCoords = getCustomCoords(city.name, city.coordinates, [-0.3, -0.25]);
          markers.push(generateInfrastructureMarkers(city, 'port', portCoords));
        }

        return markers;
      })
    );
  }, [nations, activeLayers.locations, getCustomCoords, generateInfrastructureMarkers]);

  // Memoize the city markers to avoid unnecessary re-renders
  const cityMarkers = useMemo(() => {
    if (!activeLayers.cities) return null;

    return cities
        .filter((city: GeoCity) => {
            if (currentZoom < 2) return isCapital(city);
            if (currentZoom < 4) return isLargeCity(city) || isCapital(city);
            return true;
        })
        .map((city: GeoCity) => {
            const coords = city.geometry.coordinates;
            const cityName = city.properties.name;

            return (
                <Marker key={`${cityName}-${coords[0]}`} coordinates={coords}>
                    <g
                        onClick={() => alert(`Menu Gestione città: ${cityName}`)}
                        className="cursor-pointer hover:scale-120 transition-transform"
                    >
                        <text 
                            textAnchor="middle" 
                            alignmentBaseline="central"
                            fontSize={1} 
                            fill={ isCapital(city) ? "gold" : isLargeCity(city) ? "lightgreen" : "#fff" }
                            x={
                                CUSTOM_CITIES_ICON_COODS[cityName] ? 
                                    CUSTOM_CITIES_ICON_COODS[cityName][0] : 
                                    0
                            }
                            y={
                                CUSTOM_CITIES_ICON_COODS[cityName] ? 
                                    CUSTOM_CITIES_ICON_COODS[cityName][1] : 
                                    0
                            }
                        > 
                            {
                                CUSTOM_CITIES_ICONS[
                                    isCapital(city) ? 'capital' : 
                                    isLargeCity(city) ? 'large' : 
                                    'default'
                                ]
                            }
                        </text>
                    </g>
                    {currentZoom > 4 && (
                        <text
                            textAnchor="start"
                            x={
                                CUSTOM_CITIES_NAME_COORDS[cityName] ? 
                                    CUSTOM_CITIES_NAME_COORDS[cityName][0] : 
                                    0.5
                            }
                            y={
                                CUSTOM_CITIES_NAME_COORDS[cityName] ? 
                                    CUSTOM_CITIES_NAME_COORDS[cityName][1] : 
                                    1
                            }
                            style={{
                                fontSize: "1.2px",
                                fill: "#e2e8f0",
                                fontWeight: "bold",
                                pointerEvents: "none",
                                textShadow: "0.5px 0.5px 1px rgba(0,0,0,0.8)"
                            }}
                        >
                            {cityName}
                        </text>
                    )}
                </Marker>
            );
        });
  }, [cities, activeLayers.cities, currentZoom]);

  // Se i dati non sono pronti, mostriamo un loader o nulla per evitare il glitch dei marker
  if (!geoData) return <div className="w-full h-full bg-slate-900 animate-pulse" />;

  return (
      <div className="w-full h-full bg-slate-900/50 rounded-lg overflow-hidden map-container border border-slate-800 shadow-inner">
          <ComposableMap 
              width={800} // Da calcolare in base alla size del container
              height={600} // Da calcolare in base alla size del container
              projectionConfig={{ scale: 110, center: [0, 0] }}
              className="w-full h-full outline-none"
              projection="geoMercator"
              onClick={() => onNationClick(null)} // Cliccando sulla mappa fuori dalle nazioni, deseleziona
          >
              <defs>
                  {/* 1. Il gradiente che abbiamo definito prima */}
                  <radialGradient id="infectionGradient">
                      <stop offset="0%" stopColor="rgba(239, 68, 68, 0.8)" />
                      <stop offset="100%" stopColor="rgba(239, 68, 68, 0)" />
                  </radialGradient>
              </defs>

              {/* ZoomableGroup permette il drag & zoom */}
              <ZoomableGroup 
                  zoom={1}
                  onMoveEnd={({ zoom }: { zoom: number }) => debouncedSetZoom(zoom)}
                  minZoom={1}     // Impedisce di rimpicciolire la mappa oltre la dimensione della board
                  maxZoom={60}     // Impedisce di zoomare troppo perdendo definizione
                  center={[10, 0]} // Centra leggermente meglio il mondo
              >
                  {/* LAYER 1. Geografie (Nazioni) */}
                  <Geographies geography={geoUrl}>
                      {({ geographies, projection }: { geographies: IGeography[], projection: (coordinates: [number, number]) => [number, number] }) =>
                          geographies.map((geo) => {
                              const nationId = (geo.id || geo.properties.ISO_A3 || geo.properties.name) as string;
                              const isSelected = selectedNationId === nationId;
                              
                              // 1. Invece di un solo 'focus', prendiamo TUTTE le città infette di questa nazione
                              const infectedCities = nations[nationId]?.cities.filter(
                                  (c: City) => c.infectedCount > 0
                              ) || [];
                              
                              return (
                                  <g key={geo.rsmKey}>
                                  {/* LAYER 1. La Nazione Base */}
                                      <Geography
                                          key={geo.rsmKey}
                                          geography={geo}
                                          onClick={(e: React.MouseEvent<SVGPathElement>) => {
                                              e.stopPropagation();
                                              onNationClick(nationId);
                                          }}
                                          style={{
                                              default: { 
                                                  fill: isSelected ? (playerNation?.id === nationId ? "#91c8e2ff" : "#0ea5e9") : "#1e293b", 
                                                  stroke: isSelected ? (playerNation?.id === nationId ? "#88d0f1ff" : "#67e8f9") : "#334155", 
                                                  strokeWidth: 0.2,
                                                  outline: "none",
                                                  transition: "all 300ms"
                                              },
                                              hover: { 
                                                  fill: isSelected ? (playerNation?.id === nationId ? "#91c8e2ff" : "#0ea5e9") : "#2d3748", 
                                                  stroke: "#0ea5e9",
                                                  strokeWidth: 0.2,
                                                  outline: "none", 
                                                  cursor: "pointer" 
                                              },
                                              pressed: { 
                                                  fill: "#0ea5e9", 
                                                  outline: "none" 
                                              },
                                          }}
                                      />
                                      {/* LAYER 2. Infezioni */}
                                      {activeLayers.infections && infectedCities.map((city) => {
                                          const coords = projection(city.coordinates);
                                          if (!coords) return null;

                                          return (
                                              <g key={`infection-${city.id}`}>
                                                  <defs>
                                                      <clipPath id={`clip-local-${nationId}-${city.id}`}>
                                                          <path d={geo.svgPath} />
                                                      </clipPath>
                                                  </defs>
                                                  
                                                  <circle
                                                      cx={coords[0]} 
                                                      cy={coords[1]}
                                                      // Usiamo un ID univoco per il clipPath se vuoi mantenere l'effetto "dentro i confini"
                                                      clipPath={`url(#clip-local-${nationId}-${city.id})`}
                                                      r={2 + (city.infectionData?.intensity || 0) * 20}
                                                      fill="url(#infectionGradient)"
                                                      className="animate-pulse"
                                                      style={{ pointerEvents: 'none' }}
                                                  />
                                              </g>
                                          );
                                      })}
                                  </g>
                              );
                          })
                      }
                  </Geographies>

                  {cityMarkers}
                  {infrastructureMarkers}
              </ZoomableGroup>
          </ComposableMap>
      </div>
  );
}

export default MainMap;