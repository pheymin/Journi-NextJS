"use client";
import { supabaseBrowser } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { Route } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function RouteOptimize({ trip_id }: { trip_id: string }) {
    const supabase = supabaseBrowser();
    const [result, setResult] = useState<any>(null);
    const [data, setData] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchItineraries();

        const subscription = supabase
            .channel(`itinerary_poi:${trip_id}`)
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'itinerary_poi',
            }, () => {
                fetchItineraries();
            })
            .subscribe();

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    const fetchItineraries = async () => {
        setError(null);
        const { data: itineraries, error } = await supabase
            .from('itinerary')
            .select('*, itinerary_poi(*, POI(*))')
            .eq('trip_id', trip_id);

        if (error) {
            setError('Error fetching itineraries');
            console.error('Error fetching itineraries', error);
            return;
        }

        if (!itineraries || itineraries.length === 0) {
            setError('No itineraries found');
            return;
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

        setData(data);
    };

    const optimizedRoute = async () => {
        if (!data) return;
        console.log(data);
        const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_API_URL}/route_optimize`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });

        const result = await res.json();
        console.log("json", result);
        setResult(result);
    };

    if (error) {
        return <p>{error}</p>;
    }

    if (data?.pois?.length < 2) {
        return <></>;
    }

    return (
        <div className="flex justify-between">
            <Button type="submit" variant="link" className="text-[#baff66]" onClick={optimizedRoute}>
                <Route className="size-4 me-2" />
                Optimize route
            </Button>
            {result && (
                <div className="text-xs text-muted-foreground">
                    <div className="grid grid-cols-3 gap-2">
                        <p className="col-span-1">Initial</p>
                        <p className="col-span-2">
                            {result.initial.totalDistance.toFixed(2)}km • {(result.initial.totalDuration * 60).toFixed(2)}min
                        </p>
                        <p className="col-span-1">Optimized</p>
                        <p className="col-span-2">
                            {result.optimized.totalDistance.toFixed(2)}km • {(result.optimized.totalDuration * 60).toFixed(2)}min
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}
