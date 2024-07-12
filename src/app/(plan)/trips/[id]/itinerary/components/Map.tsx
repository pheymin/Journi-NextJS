"use client"
import React, { useEffect, useState, useRef } from "react";
import GoogleMap from "@/components/GoogleMap";
import { supabaseBrowser } from "@/utils/supabase/client";
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

type Props = {
    trip_id: string;
};

export default function Map({ trip_id }: Props) {
    const supabase = supabaseBrowser();
    const [POI, setPOI] = useState<any>(null);
    const [itineraries_poi, setItinerariesPoi] = useState<any>(null);

    const fetchPOI = async () => {
        const { data, error } = await supabase
            .from("trips")
            .select(`POI(*)`)
            .eq("trip_id", trip_id)
            .single();

        if (error) {
            console.error("Error fetching POI", error);
        }

        setPOI(data?.POI);
    };

    const fetchItinerariesPoi = async () => {
        const { data, error } = await supabase
            .from("itinerary")
            .select(`itinerary_id,itinerary_poi(sequence_num, POI(*))`)
            .eq("trip_id", trip_id);

        if (error) {
            console.error("Error fetching itinerary_poi", error);
        }
        setItinerariesPoi(data);
        return data;
    };

    useEffect(() => {
        fetchPOI();
        fetchItinerariesPoi().then((data) => {
            if (data && data.length > 0) {
                const itineraryId = data[0].itinerary_id;

                const subscription = supabase
                    .channel(`itinerary_poi_map:${itineraryId}`)
                    .on('postgres_changes', {
                        event: '*',
                        schema: 'public',
                        table: 'itinerary_poi',
                        filter: `itinerary_id=eq.${itineraryId}`
                    }, () => {
                        fetchItinerariesPoi();
                    })
                    .subscribe();

                return () => {
                    subscription.unsubscribe();
                };
            }
        });
    }, [trip_id]);

    if (!POI || !itineraries_poi) {
        return <div className="flex justify-center min-h-screen items-center">
            <Loader2 className={cn('h-4 w-4 animate-spin', 'mr-2')} />
            <p>Loading map...</p>
        </div>;
    }

    return (
        <GoogleMap POI={POI} itinerary_poi={itineraries_poi} />
    );
}