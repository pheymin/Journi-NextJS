import { createClient } from '@/utils/supabase/server';
import { optimizeRoutes } from '@/utils/algorithm/routeOptimizationService';

export async function POST(request: Request) {
    const supabase = createClient();
    try {
        const body = await request.json();
        const { pois, numDays, trip_id } = body;

        const optimized = optimizeRoutes(pois, numDays);
        //rearrange the pois based on the optimized route and store to the database
        //get the trip start and end date from the trip table first
        const { data: trip, error: tripError } = await supabase
            .from('trips')
            .select('start_date, end_date')
            .eq('trip_id', trip_id)
            .single();

        if (tripError) throw tripError;

        if (!trip) {
            return new Response(JSON.stringify({ error: 'Trip not found' }), { status: 404 });
        }

        const startDate = new Date(trip.start_date);
        const endDate = new Date(trip.end_date);

        // Update itinerary and itinerary_poi tables
        for (let i = 0; i < optimized.routes.length; i++) {
            const currentDate = new Date(startDate);
            currentDate.setDate(startDate.getDate() + i);

            // Skip if the current date is after the end date
            if (currentDate > endDate) break;

            // fetch itinerary on the current date
            const { data: itineraryData, error: itineraryError } = await supabase
                .from('itinerary')
                .select('itinerary_id')
                .eq('trip_id', trip_id)
                .eq('itinerary_date', currentDate.toISOString())
                .single();

            if (itineraryError) throw itineraryError;

            const itineraryId = itineraryData.itinerary_id;

            const { error: deleteError } = await supabase
                    .from('itinerary_poi')
                    .delete()
                    .eq('itinerary_id', itineraryId);

            if (deleteError) throw deleteError;

            // Update itinerary_poi entries
            const optimizedPois = optimized.routes[i].optimized.pois;
            for (let j = 0; j < optimizedPois.length; j++) {
                const poi = optimizedPois[j];
                const { error: poiError } = await supabase
                    .from('itinerary_poi')
                    .upsert({
                        itinerary_id: itineraryId,
                        place_id: poi.place_id,
                        sequence_num: j + 1,
                    });

                if (poiError) throw poiError;
            }
        }

        // Return the optimized route summary
        return new Response(JSON.stringify({
            initial: optimized.initial,
            optimized: optimized.optimized
        }), { status: 200 });
    }
    catch (error) {
        console.error(error);
        return new Response(JSON.stringify({ error }), { status: 500 });
    }
}