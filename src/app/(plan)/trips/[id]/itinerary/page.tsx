import { createClient } from "@/utils/supabase/server";
import Itineraries from "./components/Itineraries";
import Map from "./components/Map";

export default async function Page({ params }: { params: { id: string } }) {
    const supabase = createClient();

    return (
        <div className="grid md:grid-cols-2 gap-2">
            <div className="p-2 md:p-4">
                <div className="w-full h-full space-y-3">
                    <div>
                        <h3 className="font-semibold text-xl leading-none tracking-tight mb-2">Itinerary</h3>
                        <p className="text-sm text-muted-foreground">Plan your trip with a detailed itinerary.</p>
                    </div>
                    <hr />
                    <Itineraries trip_id={params.id} />
                </div>
            </div>
            <div className="h-[400px] md:h-full">
                <Map trip_id={params.id} />
            </div>
        </div>
    );
}