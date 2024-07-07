"use client";
import { supabaseBrowser } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { Route } from 'lucide-react';
import { useState } from 'react';

export default function RouteOptimize({ trip_id }: { trip_id: string }) {
    const supabase = supabaseBrowser();
    const [result, setResult] = useState<any>(null);

    const optimizedRoute = async () => {
        const { data: itineraries } = await supabase
            .from('itinerary')
            .select('*, itinerary_poi(*, POI(*))')
            .eq('trip_id', trip_id);

        if (!itineraries) {
            return <p>No itineraries found</p>;
        }

        const data = {
            pois: itineraries.flatMap((itinerary: any) =>
                itinerary.itinerary_poi.map((itinerary_poi: any) => ({
                    place_id: itinerary_poi.POI.place_id,
                    name: itinerary_poi.POI.name,
                    location: itinerary_poi.POI.geometry.location,
                }))
            ),
            numDays: itineraries.length,
            trip_id: trip_id,
        };

        const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_API_URL}/route_optimize`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });

        const result = await res.json();
        setResult(result);
    };

    return (
        <div className="flex justify-between">
            <Button type="submit" variant="link" className="text-[#baff66]" onClick={optimizedRoute}><Route className="size-4 me-2" />Optimize route</Button>
            {result && (
                <div className="text-xs text-muted-foreground">
                    <div className="grid grid-cols-3 gap-2">
                        <p className="col-span-1">Initial</p>
                        <p className="col-span-2">{result.initial.totalDistance.toFixed(2)}km • {(result.initial.totalDuration * 60).toFixed(2)}min</p>
                        <p className="col-span-1">Optimized</p>
                        <p className="col-span-2">{result.optimized.totalDistance.toFixed(2)}km • {(result.optimized.totalDuration * 60).toFixed(2)}min</p>
                    </div>
                </div>
            )}
        </div>
    );
}