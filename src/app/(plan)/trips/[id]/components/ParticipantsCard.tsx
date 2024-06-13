import { createClient } from "@/utils/supabase/server";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"


type Props = {
    trip_id: string;
};

export default async function ParticipantsCard({ trip_id }: Props) {
    const supabase = createClient();

    const { data, error } = await supabase
        .from("trip_participants")
        .select(`*, profiles(id, username, email, avatar_url)`)
        .eq("trip_id", trip_id);

    if (error) {
        console.error("Error fetching participants", error);
    }

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle>Who will join?</CardTitle>
            </CardHeader>
            <CardContent className="flex space-x-4">
                {data?.length === 0 ? (
                    <CardDescription>No participants yet</CardDescription>
                ) : (
                    data?.map((participant: any) => (
                        <div key={participant.profiles.id}>
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <img
                                            src={participant.profiles?.avatar_url ? (
                                                participant.profiles.avatar_url
                                            ) : (
                                                `https://source.boringavatars.com/marble/120/${participant.profiles.email}`
                                            )}
                                            alt={participant.profiles.username}
                                            className="w-10 h-10 rounded-full ring-2 ring-white cursor-pointer"
                                        />
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>{participant.profiles?.username ?
                                            participant.profiles.username :
                                            participant.profiles.email}</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </div>
                    ))
                )}
            </CardContent>
        </Card>
    )
}