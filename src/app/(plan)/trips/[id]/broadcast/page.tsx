import { createClient } from "@/utils/supabase/server";
import AddBroadcastDialog from "./components/AddBroadcastDialog";
import BroadcastCard from "./components/BroadcastCard";

export default async function Page({ params }: { params: { id: string } }) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        console.error("User not authenticated");
        return;
    }

    //join user with profile
    const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

    const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

    const { data: broadcasts, error: broadcastError } = await supabase
        .from("broadcast")
        .select(`*, profiles(*)`)
        .eq("trip_id", params.id)
        .order("created_at", { ascending: false });

    const broadcastsLength = broadcasts?.length;

    return (
        <div className="p-2 md:p-4">
            <div className="w-full h-full space-y-3">
                <div className="w-full md:w-3/5 m-auto">
                    <h3 className="font-semibold text-xl leading-none tracking-tight mb-2">Broadcast</h3>
                    <p className="text-sm text-muted-foreground">Send a message to all members of the group.</p>
                </div>
                <hr />
                <div className="w-full h-full">
                    <div className="w-full md:w-3/5 m-auto mb-2 flex justify-between items-center">
                        <p>All Broadcasts ({broadcastsLength})</p>
                        <AddBroadcastDialog trip_id={params.id} user={data} />
                    </div>
                    {broadcastsLength === 0 ? (
                        <div>
                            {/* <img src="/polling.svg " alt="No active polls" className="mx-auto w-1/3" /> */}
                            <p className="text-center">No broadcasts yet</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {broadcasts?.map((broadcast: any, index: number) => (
                                <BroadcastCard key={index} broadcast={broadcast} user={profile} />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}