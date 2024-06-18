"use client";
import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { supabaseBrowser } from "@/utils/supabase/client";
import { useGoogleMapsLoader } from "@/utils/googleMapsLoader";

type AddPOIProps = {
    onPlaceSelected: (placeId: string) => void;
};

export default function AddPOI({ onPlaceSelected }: AddPOIProps) {
    //maps autocomplete
    const [autoComplete, setAutoComplete] = useState<google.maps.places.Autocomplete | null>(null);
    const { isLoaded, loadError } = useGoogleMapsLoader();
    const placeAutoComplete = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isLoaded && placeAutoComplete.current) {
            //create the autocomplete
            const gautoComplete = new google.maps.places.Autocomplete(placeAutoComplete.current as HTMLInputElement, {
                // bounds: defaultBounds,
                fields: ['place_id', 'name', 'geometry', 'formatted_address', 'opening_hours', 'photos', 'rating', 'types', 'url'],
            });
            setAutoComplete(gautoComplete);
            setTimeout(() => {
                document.body.style.pointerEvents = "";
            }, 0);
        }
    }, [isLoaded]);

    useEffect(() => {
        if (autoComplete) {
            autoComplete.addListener('place_changed', async () => {
                const place = autoComplete.getPlace();

                if (place && place.place_id && place.name) {
                    const storePlace = await storePlaceDetails(place);
                    if (storePlace) {
                        onPlaceSelected(place.place_id);
                    }
                }
            });

            // Cleanup listener on component unmount
            return () => {
                google.maps.event.clearInstanceListeners(autoComplete);
            };
        }
    }, [autoComplete, isLoaded]);

    const storePlaceDetails = async (place: any): Promise<boolean> => {
        const supabase = supabaseBrowser();
        const { data, error } = await supabase.from('POI').upsert({
            place_id: place.place_id,
            name: place.name,
            address: place.formatted_address,
            rating: place?.rating || null,
            types: place.types || null,
            google_url: place.url,
            geometry: place.geometry,
            image_url: place.photos && place.photos.length > 0 ? place.photos[0].getUrl() : "https://epsmolduras.cl/wp-content/uploads/2022/02/imagen-no-disponible01601774755-1.jpg",
            opening_hours: place?.opening_hours || null,
        }).select();

        if (error) {
            console.error(error);
            return false;
        }
        return true;
    }

    return (
        <div>
            <Input
                className="h-12 w-full"
                ref={placeAutoComplete}
                placeholder="Add a place"
                required
            />
        </div>
    );
}