"use client";
import { useState, useEffect, useRef } from "react";
import { useJsApiLoader } from "@react-google-maps/api";
import { Library } from "@googlemaps/js-api-loader";
import { Input } from "@/components/ui/input";
import { supabaseBrowser } from "@/utils/supabase/client";

const libs: Library[] = ["places", "maps"];

type AddPOIProps = {
    onPlaceSelected: (placeId: string) => void;
};

export default function AddPOI({ onPlaceSelected }: AddPOIProps) {
    //maps autocomplete
    const [autoComplete, setAutoComplete] = useState<google.maps.places.Autocomplete | null>(null);
    const { isLoaded } = useJsApiLoader({
        googleMapsApiKey: process.env.NEXT_PUBLIC_MAPS_API_KEY as string,
        libraries: libs,
    });
    const placeAutoComplete = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isLoaded && placeAutoComplete.current) {
            //limit the place bound by place id
            const defaultBounds = new google.maps.LatLngBounds(
                new google.maps.LatLng(-90, -180),
                new google.maps.LatLng(90, 180)
            );

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
        if (isLoaded && autoComplete) {
            autoComplete.addListener('place_changed', () => {
                const place = autoComplete.getPlace();

                if (place && place.place_id && place.name) {
                    storePlaceDetails(place);
                    onPlaceSelected(place.place_id);
                }
            });

            // Cleanup listener on component unmount
            return () => {
                google.maps.event.clearInstanceListeners(autoComplete);
            };
        }
    }, [autoComplete, isLoaded]);

    const storePlaceDetails = async (place:any) => {
        const supabase = supabaseBrowser();
        const { data, error } = await supabase.from('POI').upsert({
            place_id: place.place_id,
            name: place.name,
            address: place.formatted_address,
            rating: place?.rating,
            types: place.types,
            google_url: place.url,
            geometry: place.geometry,
            image_url: place.photos[0].getUrl(),
            opening_hours: place?.opening_hours,
        }).select();

        if (error) {
            console.error(error);
        }
    }

    return (
        <div>
            <Input
                ref={placeAutoComplete}
                placeholder="Add a place"
                required
            />
        </div>
    );
}