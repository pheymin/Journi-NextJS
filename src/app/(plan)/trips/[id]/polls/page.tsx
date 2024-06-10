import { createClient } from "@/utils/supabase/server";
import { Button } from "@/components/ui/button";
import AddPollDialog from "./components/AddPollDialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import PollOptions from "./components/PollOptions";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"

export default async function Page({ params }: { params: { id: string } }) {
    return (
        <div>
            <div className="w-full h-full space-y-3">
                <div>
                    <h3 className="font-semibold text-xl leading-none tracking-tight mb-2">Polls</h3>
                    <p className="text-sm text-muted-foreground">Create a poll to help your group narrow down options or answer key questions.</p>
                </div>
                <hr />
                <ActivePolls trip_id={params.id} />
                <hr />
                <ClosedPolls />
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
                <h1>Active Polls ({activePolls})</h1>
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
                        <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 rounded-xl p-4 border-2 space-y-3">
                                <div className="space-y-3 col-span-4">
                                    <div className="flex items-center space-x-2">
                                        <Avatar className="size-8">
                                            <AvatarImage src=
                                                {poll.profiles?.avatar_url ? (
                                                    poll.profiles.avatar_url
                                                ) : (
                                                    `https://source.boringavatars.com/marble/120/${poll.profiles.email}`
                                                )} alt="Avatar" />
                                            <AvatarFallback>JN</AvatarFallback>
                                        </Avatar>
                                        <p className="text-sm text-muted-foreground ">Created by {poll.profiles?.username
                                            ? poll.profiles.username
                                            : poll.profiles.email}</p>
                                    </div>
                                    <h3 className="font-semibold text-xl">{poll.question}</h3>
                                    <hr />
                                    <div>
                                        <p className="text-sm text-muted-foreground mb-3">Select your answer below</p>
                                        <PollOptions poll_id={poll.poll_id} user_id={user.id} />
                                    </div>
                                </div>
                                {user.id == poll.profiles.id &&
                                    <Button variant="secondary" className="col-span-4 md:col-span-1 md:col-start-4">Close Poll</Button>
                                }
                            </div>
                            <VoteRanking poll_id={poll.poll_id} />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

async function VoteRanking({ poll_id }: { poll_id: number }) {
    const supabase = createClient();
    const { data, error } = await supabase
        .from("poll_answer")
        .select(`*,poll_vote(count)`)
        .eq("poll_id", poll_id);

    if (!data) {
        return <div>No data available</div>;
    }

    return (
        <div className="space-y-2">
            {data?.map((answer: any, index: number) => (
                <div key={index} className="grid gap-2">
                    <h3>Rank {index + 1}</h3>
                    <hr />
                    <h3>{answer.answer}</h3>
                    <VotedUsers poll_answer_id={answer.poll_answer_id} />
                    <p className="justify-self-end">{answer.poll_vote[0].count} votes</p>
                </div>
            ))}
        </div>
    );
}

async function VotedUsers({ poll_answer_id }: { poll_answer_id: number }) {
    const supabase = createClient();
    const { data, error } = await supabase
        .from("poll_vote")
        .select(`*, profiles(*)`)
        .eq("poll_answer_id", poll_answer_id);

    if (!data) {
        return <div>No data available</div>;
    }

    return (
        <div className="space-x-2">
            {data?.map((vote: any, index: number) => (
                <TooltipProvider key={index}>
                    <Tooltip>
                        <TooltipTrigger>
                            <Avatar className="size-8">
                                <AvatarImage src=
                                    {vote.profiles?.avatar_url ? (
                                        vote.profiles.avatar_url
                                    ) : (
                                        `https://source.boringavatars.com/marble/120/${vote.profiles.email}`
                                    )} alt="Avatar" />
                                <AvatarFallback>JN</AvatarFallback>
                            </Avatar>
                        </TooltipTrigger>
                        <TooltipContent>
                            <div className="grid gap-2">
                                <p>{vote.profiles?.username ? vote.profiles.username : vote.profiles.email}</p>
                            </div>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            ))}
        </div>
    );
}

async function ClosedPolls() {
    const supabase = createClient();
    const { data, error } = await supabase
        .from("polls")
        .select("*")
        .eq("status", "Closed");

    const closedPolls = data?.length;

    return (
        <div id="closed">
            <h1>Closed Polls ({closedPolls})</h1>
        </div>
    );
}