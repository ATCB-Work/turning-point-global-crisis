import { useEffect, useState } from "react";

interface GeoCity {
    geometry: {
        coordinates: [number, number];
    };
    properties: {
        name: string;
        featurecla: string;
        scalerank: number;
    };
}

export function useCitiesData(citiesUrl: string) {
    const [cities, setCities] = useState<GeoCity[]>([]);

    useEffect(() => {
        fetch(citiesUrl)
            .then(res => res.json())
            .then(data => setCities(data.features));
    }, [citiesUrl]);

    return cities;
}
