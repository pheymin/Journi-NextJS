import { createClient } from "@/utils/supabase/server";
import AddPollDialog from "./components/AddPollDialog";
import PollCard from "./components/PollCard";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"

export default async function Page({ params }: { params: { id: string } }) {
    const supabase = createClient();

    const { count: activeCount, error } = await supabase
        .from("polls")
        .select('*', { count: 'exact', head: true })
        .eq("status", "Active");

    const { count: closedCount, error: closedError } = await supabase
        .from("polls")
        .select('*', { count: 'exact', head: true })
        .eq("status", "Closed");

    return (
        <div>
            <div className="w-full h-full space-y-3">
                <div>
                    <h3 className="font-semibold text-xl leading-none tracking-tight mb-2">Polls</h3>
                    <p className="text-sm text-muted-foreground">Create a poll to help your group narrow down options or answer key questions.</p>
                </div>
                <hr />
                <Accordion type="single" collapsible defaultValue="item-1">
                    <AccordionItem value="item-1">
                        <AccordionTrigger>Active Polls ({activeCount})</AccordionTrigger>
                        <AccordionContent>
                            <ActivePolls trip_id={params.id} />
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
                <Accordion type="single" collapsible defaultValue="item-2">
                    <AccordionItem value="item-2">
                        <AccordionTrigger>Closed Polls ({closedCount})</AccordionTrigger>
                        <AccordionContent>
                            <ClosedPolls trip_id={params.id} />
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </div>
        </div>
    );
}

async function ActivePolls({ trip_id }: { trip_id: string }) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        console.error("User not authenticated");
        return;
    }

    const { data, error } = await supabase
        .from("polls")
        .select(`*, profiles(*)`)
        .eq("status", "Active");

    const activePolls = data?.length;

    return (
        <div id="active">
            <div className="flex justify-between">
                <AddPollDialog trip_id={trip_id} user={user} />
            </div>
            {activePolls === 0 ? (
                <div>
                    <img src="/polling.svg " alt="No active polls" className="mx-auto w-1/3" />
                    <p className="text-center">No active polls</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {data?.map((poll: any, index: number) => (
                        <PollCard poll={poll} user={user} trip_id={trip_id} isOwner={user.id == poll.profiles.id} key={index} />
                    ))}
                </div>
            )}
        </div>
    );
}

async function ClosedPolls({ trip_id }: { trip_id: string }) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        console.error("User not authenticated");
        return;
    }

    const { data, error } = await supabase
        .from("polls")
        .select(`*, profiles(*)`)
        .eq("status", "Closed");

    const closedPolls = data?.length;

    return (
        <div id="closed">
            {closedPolls === 0 ? (
                <div>
                    <img src="/polling.svg " alt="No active polls" className="mx-auto w-1/3" />
                    <p className="text-center">No closed polls</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {data?.map((poll: any, index: number) => (
                        <PollCard poll={poll} user={user} trip_id={trip_id} isOwner={user.id == poll.profiles.id} key={index} />
                    ))}
                </div>
            )}
        </div>
    );
}