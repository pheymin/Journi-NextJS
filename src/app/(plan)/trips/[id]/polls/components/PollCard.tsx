import { createClient } from "@/utils/supabase/server";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from 'date-fns';
import PollOptions from './PollOptions';
import VoteRanking from './VoteRanking';
import { SubmitButton } from "@/components/submit-button";
import { redirect } from "next/navigation";

type Props = {
    poll: any;
    user: any;
    trip_id: string;
    isOwner: boolean;
};

export default function PollCard ({ poll, user, trip_id, isOwner}: Props) {
    const updateStatus = async (formData: FormData) => {
        "use server";
        const supabase = createClient();
        const poll_id = formData.get("poll_id");

        const { error } = await supabase
            .from("polls")
            .update({ status: "Closed" })
            .eq("poll_id", poll_id);

        if (error) {
            console.error("Error updating poll status", error);
            return redirect(`/trips/${trip_id}/polls?message=Error updating poll status`);
        }

        return redirect(`/trips/${trip_id}/polls`);
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 rounded-xl p-4 border-2 space-y-3">
                <div className="space-y-3 col-span-4">
                    <div className="flex items-center space-x-2">
                        <Avatar className="size-8">
                            <AvatarImage src={poll.profiles?.avatar_url || `https://source.boringavatars.com/marble/120/${poll.profiles.email}`} alt="Avatar" />
                            <AvatarFallback>JN</AvatarFallback>
                        </Avatar>
                        <div>
                            <p className="text-sm">{poll.profiles?.username || poll.profiles.email}</p>
                            <p className="text-muted-foreground text-xs">{format(new Date(poll.created_at), 'PPpp')}</p>
                        </div>
                    </div>
                    <h3 className="font-semibold text-xl">{poll.question}</h3>
                    <hr />
                    <div>
                        <p className="text-sm text-muted-foreground mb-3">Select your answer below</p>
                        <PollOptions poll_id={poll.poll_id} user_id={user.id} status={poll.status === "Active"} />
                    </div>
                </div>
                {isOwner && poll.status === "Active" &&
                    <form className="col-span-4 md:col-span-1 md:col-start-4">
                        <input type="hidden" name="poll_id" value={poll.poll_id} />
                        <SubmitButton
                            formAction={updateStatus}
                            className="w-full inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80 h-9 px-4 py-2"
                            pendingText={'Closing...'}
                        >
                            Close Poll
                        </SubmitButton>
                    </form>
                }
            </div>
            <VoteRanking poll_id={poll.poll_id} trip_id={trip_id} />
        </div>
    );
};