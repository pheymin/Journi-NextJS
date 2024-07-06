"use client";
import React, { useEffect, useState } from "react";
import { useGoogleMapsLoader } from "@/utils/googleMapsLoader";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel"
import { PlusIcon } from "@radix-ui/react-icons"
import { supabaseBrowser } from "@/utils/supabase/client";
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

type Props = {
    place_types: string[];
    location: google.maps.LatLngLiteral;
    onPlaceSelected?: (placeId: string) => void;
};

export default function NearbySearch({ place_types, location, onPlaceSelected }: Props) {
    const [places, setPlaces] = useState<google.maps.places.PlaceResult[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const { isLoaded } = useGoogleMapsLoader();

    useEffect(() => {
        if (!isLoaded || !location) return;

        const fetchPlaces = async () => {
            setLoading(true);

            try {
                const dummyElement = document.createElement('div');
                const nearby = new google.maps.places.PlacesService(dummyElement);

                nearby.nearbySearch({
                    location: location,
                    radius: 2000,
                    type: place_types[0],
                    keyword: place_types[1],
                }, (results, status) => {
                    if (status === google.maps.places.PlacesServiceStatus.OK && results) {
                        //store those places to POI table
                        results.forEach(async (place) => {
                            await storePlaceDetails(place);
                        });
                        
                        setPlaces(results);
                    }
                    setLoading(false);
                });
            } catch (error) {
                console.error(error);
                setLoading(false);
            }
        };

        fetchPlaces();
    }, [location, place_types, isLoaded]);

    const storePlaceDetails = async (place: google.maps.places.PlaceResult): Promise<boolean> => {
        const supabase = supabaseBrowser();
        const { data, error } = await supabase.from('POI').upsert({
            place_id: place.place_id,
            name: place.name,
            address: place?.vicinity || null,
            rating: place?.rating || null,
            types: place.types || null,
            geometry: place.geometry,
            image_url: place.photos && place.photos.length > 0 ? place.photos[0].getUrl() : "https://epsmolduras.cl/wp-content/uploads/2022/02/imagen-no-disponible01601774755-1.jpg",
        });

        if (error) {
            console.error("Error storing place details", error);
            return false;
        }

        return true;
    };

    return (
        <div className="flex flex-col gap-2 mt-6">
            {loading ? (
                <div className="flex justify-center min-h-screen items-center">
                    <Loader2 className={cn('h-4 w-4 animate-spin', 'mr-2')} />
                    <p>Loading map...</p>
                </div>
            ) : (
                <>
                    <h4 className="text-sm text-muted-foreground">Recommended places</h4>
                    <Carousel className="w-full">
                        <CarouselContent className="-ml-1">
                            {places.map((place, index) => (
                                <CarouselItem key={index} className="pl-1 basis-1/3">
                                    <div className="p-1">
                                        <div className="grid grid-cols-4 gap-2 rounded-lg border-2 items-center">
                                            <img src={place.photos && place.photos.length > 0 ? place.photos[0].getUrl() : "https://epsmolduras.cl/wp-content/uploads/2022/02/imagen-no-disponible01601774755-1.jpg"} alt="placeholder" className="size-12 object-cover rounded-s col-span-1" />
                                            <p className="truncate col-span-2 text-xs">{place.name}</p>
                                            <PlusIcon className="col-span-1 p-2 size-8 rounded-full bg-muted cursor-pointer hover:bg-muted/70" 
                                            onClick={() => onPlaceSelected && onPlaceSelected(place.place_id ? place.place_id : "")} />
                                        </div>
                                    </div>
                                </CarouselItem>
                            ))}
                        </CarouselContent>
                        <CarouselPrevious />
                        <CarouselNext />
                    </Carousel>
                </>
            )}
        </div>
    );
}