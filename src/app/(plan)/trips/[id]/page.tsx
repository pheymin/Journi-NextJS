import ParticipantsCard from "./components/ParticipantsCard";
import BudgetCard from "./components/BudgetCard";
import Sections from "./components/Sections";
import GoogleMap from "@/components/GoogleMap";
import { createClient } from "@/utils/supabase/server";

export default async function Page({ params }: { params: { id: string } }) {
    const supabase = createClient();
    const { data: POI, error: POIError } = await supabase
        .from("trips")
        .select(`POI(*)`)
        .eq("trip_id", params.id)
        .single();

    if (POIError) {
        console.error(POIError);
        return <p>Error loading data</p>;
    }

    const { data, error } = await supabase
        .from("section")
        .select(`section_poi(sequence_num, POI(*))`)
        .eq("trip_id", params.id);

    return (
        <div className="grid md:grid-cols-2 gap-2">
            <div className="flex flex-col p-2 md:p-4">
                <div className="flex flex-row gap-2 w-full">
                    <ParticipantsCard trip_id={params.id} />
                    <BudgetCard trip_id={params.id} />
                </div>
                <Sections trip_id={params.id} />
            </div>
            <div className="h-[400px] md:h-full">
                <GoogleMap POI={POI?.POI} sections_poi={data}/>
            </div>
        </div>
    );
}