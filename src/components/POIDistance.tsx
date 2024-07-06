"use client";
import React, { useEffect, useState } from "react";
import { useGoogleMapsLoader } from "@/utils/googleMapsLoader";
import { CarFront, Footprints, TrainFront, Bike, Route, ChevronDown } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type TravelMode = 'DRIVING' | 'WALKING' | 'BICYCLING' | 'TRANSIT';

type Props = {
    origin: google.maps.LatLngLiteral;
    destination: google.maps.LatLngLiteral;
    initialTravelMode?: TravelMode;
};

export default function POIDistance({ origin, destination, initialTravelMode = 'DRIVING' }: Props) {
    const [distance, setDistance] = useState<any | null>(null);
    const [travelMode, setTravelMode] = useState<TravelMode>(initialTravelMode);
    const { isLoaded } = useGoogleMapsLoader();

    useEffect(() => {
        if (!isLoaded || !origin || !destination) return;

        const service = new google.maps.DistanceMatrixService();
        service.getDistanceMatrix(
            {
                origins: [origin],
                destinations: [destination],
                travelMode: google.maps.TravelMode[travelMode],
            },
            (response, status) => {
                if (status === google.maps.DistanceMatrixStatus.OK) {
                    console.log(response);
                    setDistance(response?.rows[0].elements[0]);
                }
            }
        );
    }, [origin, destination, travelMode, isLoaded]);

    const getTravelModeIcon = (mode: google.maps.TravelMode) => {
        switch (mode) {
            case google.maps.TravelMode.WALKING:
                return <Footprints className="size-4" />;
            case google.maps.TravelMode.BICYCLING:
                return <Bike className="size-4" />;
            case google.maps.TravelMode.TRANSIT:
                return <TrainFront className="size-4" />;
            case google.maps.TravelMode.DRIVING:
            default:
                return <CarFront className="size-4" />;
        }
    };

    const handleClick = () => {
        const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${origin.lat},${origin.lng}&destination=${destination.lat},${destination.lng}&travelmode=${travelMode.toLowerCase()}`;
        window.open(googleMapsUrl, '_blank');
    };

    const handleTravelModeChange = (value: string) => {
        setTravelMode(value as google.maps.TravelMode);
    };

    return (
        <div className="text-muted-foreground text-xs flex items-center">
            {distance !== null ? (
                <>
                    <p className="flex flex-row items-center cursor-pointer hover:underline mr-2" onClick={handleClick}>
                        <Route className="size-4 mr-2"/>
                        {distance.duration.text} • {distance.distance.text}
                    </p>
                    <Select value={travelMode} onValueChange={handleTravelModeChange}>
                        <SelectTrigger className="w-fit">
                            <SelectValue>{getTravelModeIcon(travelMode as google.maps.TravelMode)}</SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value={google.maps.TravelMode.DRIVING}>
                                <div className="flex items-center">
                                    <CarFront className="size-4 mr-2" /> Driving
                                </div>
                            </SelectItem>
                            <SelectItem value={google.maps.TravelMode.WALKING}>
                                <div className="flex items-center">
                                    <Footprints className="size-4 mr-2" /> Walking
                                </div>
                            </SelectItem>
                            <SelectItem value={google.maps.TravelMode.BICYCLING}>
                                <div className="flex items-center">
                                    <Bike className="size-4 mr-2" /> Bicycling
                                </div>
                            </SelectItem>
                            <SelectItem value={google.maps.TravelMode.TRANSIT}>
                                <div className="flex items-center">
                                    <TrainFront className="size-4 mr-2" /> Transit
                                </div>
                            </SelectItem>
                        </SelectContent>
                    </Select>
                </>
            ) : (
                <p>Loading distance...</p>
            )}
        </div>
    );
}