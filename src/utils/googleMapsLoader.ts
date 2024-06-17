import { useJsApiLoader } from "@react-google-maps/api";
import { Library } from "@googlemaps/js-api-loader";
//create a singleton loader
const libs: Library[] = ["places", "maps", "core", "marker", "geometry", "routes"];

export const useGoogleMapsLoader = () => {
    const { isLoaded, loadError } = useJsApiLoader({
        googleMapsApiKey: process.env.NEXT_PUBLIC_MAPS_API_KEY as string,
        libraries: libs,
    });

    return { isLoaded, loadError };
};