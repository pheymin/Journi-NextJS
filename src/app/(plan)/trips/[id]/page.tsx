import ParticipantsCard from "./components/ParticipantsCard";
import BudgetCard from "./components/BudgetCard";
import Sections from "./components/Sections";
import Map from "./components/Map";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export default async function Page({ params }: { params: { id: string } }) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return redirect("/login");
    }

    //check if user is member in the trip
    const { count: member, error } = await supabase
        .from("trip_participants")
        .select("*")
        .eq("trip_id", params.id)
        .eq("user_id", user.id);

    const { count: trip, error: tripError } = await supabase
        .from("trips")
        .select("*")
        .eq("trip_id", params.id)
        .eq("user_id", user.id);

    if (member === 0 && trip === 0) {
        return redirect("/dashboard");
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <div className="flex flex-col p-2 md:p-4 px-4">
                <div className="flex flex-col md:flex-row gap-2 w-full">
                    <ParticipantsCard trip_id={params.id} />
                    <BudgetCard trip_id={params.id} />
                </div>
                <Sections trip_id={params.id} />
            </div>
            <div className="h-[400px] md:h-full">
                <Map trip_id={params.id} />
            </div>
        </div>
    );
}