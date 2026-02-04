import { useEffect, useState } from "react";

export function useGeoData(geoUrl: string) {
    const [geoData, setGeoData] = useState(null);

    useEffect(() => {
        fetch(geoUrl)
            .then(res => res.json())
            .then(data => setGeoData(data));
    }, [geoUrl]);

    return geoData;
}
