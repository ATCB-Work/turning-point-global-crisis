import { 
  ComposableMap, 
  Geographies, 
  Geography, 
  ZoomableGroup,
  Marker
} from "react-simple-maps";
import { WORLD_LOCATIONS } from "../../data/locations";
import { useEffect, useState } from "react";
import type { City, Nation } from "../../data/nations";

interface Geography {
    svgPath: string | undefined;
    id: string;
    rsmKey: string;
    properties: Record<string, unknown>;
    geometry: unknown;
}
interface GeoCity {
    geometry: {
        coordinates: [number, number]
    };
    properties: {
        name: string;
        featurecla: string;
        scalerank: number;
    };
}

// URL del GeoJSON per i confini mondiali
const geoUrl = "https://raw.githubusercontent.com/lotusms/world-map-data/main/world.json";
const citiesUrl = "https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_110m_populated_places_simple.geojson";

interface MainMapProps {
    nations: Record<string, Nation>;
    selectedNation: Nation | null;
    activeLayers: Record<string, boolean>;
    onNationClick: (id: string | null) => void;
}

function isCapital(city: GeoCity): boolean {
    return city.properties.featurecla.includes('Admin-0 capital');
}
function isLargeCity(city: GeoCity): boolean {
    return city.properties.scalerank <= 2;
}

const CUSTOM_LOCATION_ICONS: Record<string, string> = {
    'airport': '✈️',
    'port': '⚓',
};

const CUSTOM_CITIES_ICONS: Record<string, string> = {
    'capital': '★',
    'large': '●',
    'default': '•',
};

const CUSTOM_CITIES_ICON_COODS: Record<string, [number, number]> = {
    'Vatican City': [0, -0.7],
    'Colombo': [0, -0.5],
    'Sri Jayawardenepura Kotte': [0.2, 0.2],
    'Kuala Lumpur': [0, -0.3],
    'Putrajaya': [0, 0.3],
};

const CUSTOM_CITIES_NAME_COORDS: Record<string, [number, number]> = {
    'Vatican City': [0.2, -0.5],
    'Kingstown': [-6.5, 0],
    'Basseterre': [0.2, -0.2],
    'Santo Domingo': [0, -0.4],
    'Port-au-Prince': [-1.2, 1.5],
    'Buenos Aires': [0.3, -0.1],
    'Valparaíso': [0.5, 0.3],
    'Colombo': [0.5, -0.2],
    'Sri Jayawardenepura Kotte': [0.6, 1.1],
    'Kuala Lumpur': [0.5, 0],
};

export default function MainMap({ nations, selectedNation, activeLayers, onNationClick }: MainMapProps) {
    
    const [currentZoom, setCurrentZoom] = useState(1);
    const [cities, setCities] = useState([]);
    const [geoData, setGeoData] = useState(null); // Stato per i confini

    // Carichiamo le città al mount del componente
    useEffect(() => {
        // Carichiamo i confini del mondo
        fetch(geoUrl)
            .then(res => res.json())
            .then(data => setGeoData(data));

        // Carichiamo le città
        fetch(citiesUrl)
            .then(res => res.json())
            .then(data => setCities(data.features));
    }, []);

    // Se i dati non sono pronti, mostriamo un loader o nulla per evitare il glitch dei marker
    if (!geoData) return <div className="w-full h-full bg-slate-900 animate-pulse" />;

    return (
        <div className="w-full h-full bg-slate-900/50 rounded-lg overflow-hidden map-container border border-slate-800 shadow-inner">
            <ComposableMap 
                width={800} // Da calcolare in base alla size del container
                height={600} // Da calcolare in base alla size del container
                projectionConfig={
                    { 
                        scale: 110,
                        center: [0, 0] 
                    }
                }
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

                    {/* Generazione dinamica dei ClipPath all'interno del defs */}
                    {/* <Geographies 
                        geography={geoData}
                    >
                        {({ geographies }: { geographies: Geography[] }) => 
                            geographies.map((geo) => {
                                const nationId = geo.id || geo.properties.ISO_A3;
                                console.log("Generato clipPath per:", nationId, `clip-${geo.id || geo.properties.ISO_A3}`); // <-- Apri la console (F12) e controlla
                            
                                return (
                                    <clipPath id={`clip-${geo.id || geo.properties.ISO_A3}`} key={`clip-${geo.rsmKey}`}>
                                        <path d={geo.svgPath} />
                                    </clipPath>
                                )
                            }
                        )}
                    </Geographies> */}
                </defs>

                {/* ZoomableGroup permette il drag & zoom */}
                <ZoomableGroup 
                    zoom={1}
                    onMoveEnd={({ zoom }: { zoom: number }) => setCurrentZoom(zoom)}
                    minZoom={1}     // Impedisce di rimpicciolire la mappa oltre la dimensione della board
                    maxZoom={60}     // Impedisce di zoomare troppo perdendo definizione
                    center={[10, 0]} // Centra leggermente meglio il mondo
                >
                    {/* LAYER 1. Geografie (Nazioni) */}
                    <Geographies geography={geoUrl}>
                        {({ geographies, projection }: { geographies: Geography[], projection: (coordinates: [number, number]) => [number, number] }) =>
                        geographies.map((geo) => {
                            const nationId = (geo.id || geo.properties.ISO_A3 || geo.properties.name) as string;
                            const isSelected = selectedNation && selectedNation.id === nationId;
                            const focus = nations[nationId]?.cities.find((c:City) => c.infectionData && c.infectionData.intensity > 0);

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
                                                fill: isSelected ? "#0ea5e9" : "#1e293b", 
                                                stroke: isSelected ? "#67e8f9" : "#334155", 
                                                strokeWidth: 0.2,
                                                outline: "none",
                                                transition: "all 300ms"
                                            },
                                            hover: { 
                                                fill: isSelected ? "#0ea5e9" : "#2d3748", 
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
                                    {activeLayers.infections && focus && focus.infectionData && (
                                    <g>
                                        <defs>
                                            <clipPath id={`clip-local-${nationId}`} clipPathUnits="userSpaceOnUse">
                                                <path d={geo.svgPath} />
                                            </clipPath>
                                        </defs>
                                        
                                        <circle
                                            cx={projection(focus.coordinates)[0]} 
                                            cy={projection(focus.coordinates)[1]}
                                            clipPath={`url(#clip-local-${nationId})`}
                                            r={2 + focus.infectionData.intensity * 20}
                                            fill="url(#infectionGradient)"
                                            className="animate-pulse"
                                            style={{ pointerEvents: 'none' }}
                                        />
                                    </g>)}
                                </g>
                            );
                        })
                    }
                    </Geographies>

                    {/* LAYER 3: Città dal GeoJSON (Visibili solo con zoom > 2) */}
                    {activeLayers.cities &&
                        cities
                        .filter((city: GeoCity) => {
                            // ESEMPIO DI LOGICA DI FILTRAGGIO:
                            // Se zoom < 3, mostra solo città con SCALERANK molto basso (0-2)
                            // Se zoom > 6, mostra quasi tutto

                            if (currentZoom < 2) return isCapital(city); // Mostra solo capitali
                            if (currentZoom < 4) return isLargeCity(city) || isCapital(city); // Mostra città molto grandi o capitali
                            // if (currentZoom < 3) return scalerank <= 2;
                            // if (currentZoom < 5) return scalerank <= 5;
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
                                    
                                    {/* Mostriamo il testo solo se lo zoom è sufficiente */}
                                    { /* se il nome è "Vatican City", mostralo solo a zoom altissimo (> 8) */}
                                    {
                                        currentZoom > 4 && (
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
                                                    pointerEvents: "none", // Fondamentale per non bloccare il drag
                                                    textShadow: "0.5px 0.5px 1px rgba(0,0,0,0.8)" // Rende leggibile il testo su ogni sfondo
                                                }}
                                            >
                                                {cityName}
                                            </text>
                                        )
                                    }
                                </Marker>
                            );
                            
                        })
                    }

                    {/* LAYER 4: Infrastrutture Strategiche (Icone Custom) */}
                    {activeLayers.locations &&
                        WORLD_LOCATIONS.map(loc => (
                            <Marker key={loc.id} coordinates={loc.coordinates}>
                                <g
                                    onClick={() => alert(`Menu Gestione Infrastruttura: ${loc.name}`)}
                                    className="cursor-pointer hover:scale-110 transition-transform"
                                >
                                    
                                    <text 
                                            textAnchor="middle" 
                                            alignmentBaseline="central"
                                            fontSize={1} 
                                    > 
                                        {
                                            /* Mostriamo l'icona in base al tipo */
                                            /* Se è un aeroporto, mostra l'icona di un aereo */
                                            /* Se è un porto, mostra l'icona di un'ancora */
                                            CUSTOM_LOCATION_ICONS[loc.type] || '❓'
                                        }
                                    </text> 
                                </g>
                            </Marker>
                        ))
                    }
                </ZoomableGroup>
            </ComposableMap>
        </div>
    );
}