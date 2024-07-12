import { createClient } from "@/utils/supabase/server";
import AddPollDialog from "./components/AddPollDialog";
import Cards from "./components/Cards";
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
        .eq("trip_id", params.id)
        .eq("status", "Active");

    const { count: closedCount, error: closedError } = await supabase
        .from("polls")
        .select('*', { count: 'exact', head: true })
        .eq("trip_id", params.id)
        .eq("status", "Closed");

    return (
        <div className="p-2 md:p-4">
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

    return (
        <div id="active">
            <div className="flex justify-end">
                <AddPollDialog trip_id={trip_id} user={user}/>
            </div>
            <Cards user={user} trip_id={trip_id} status="Active" />
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

    return (
        <div id="closed">
            <Cards user={user} trip_id={trip_id} status="Closed" />
        </div>
    );
}