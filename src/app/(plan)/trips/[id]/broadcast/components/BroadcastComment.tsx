import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"
import { createClient } from "@/utils/supabase/server";
import { SubmitButton } from "@/components/submit-button";
import { Input } from "@/components/ui/input"
import Comments from "./Comments";

type Broadcast = {
    broadcast_id: string;
    content: string;
    created_at: string;
    user_id: string;
    trip_id: string;
    likes: number;
    profiles: User;
};

type User = {
    id: string;
    avatar_url: string;
    username: string;
    email: string;
    full_name: string;
};

type Props = {
    broadcast: Broadcast;
    user: User;
};

export default async function BroadcastComment({ broadcast, user }: Props) {
    //submits a comment
    const postComment = async (formData: FormData) => {
        "use server";
        const supabase = createClient();
        const comment = formData.get("comment") as string;

        const { error } = await supabase
            .from("broadcast_comment")
            .insert({
                broadcast_id: broadcast.broadcast_id,
                user_id: user.id,
                content: comment,
            });

        if (error) {
            console.error("Error posting comment", error);
            return;
        }
    };

    return (
        <Accordion type="single" collapsible>
            <AccordionItem value="item-1">
                <AccordionTrigger className="text-sm text-muted-foreground pt-0 pb-2 hover:no-underline">Replies</AccordionTrigger>
                <AccordionContent>
                    <div className="space-y-6">
                        <form className="flex space-x-2">
                            <Input type="text" name="comment" placeholder="Write a comment" className="w-full" required/>
                            <SubmitButton
                                formAction={postComment}
                                className="w-fit rounded-md px-4 py-2 whitespace-nowrap text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80"
                                pendingText="Posting..."
                            >
                                Post
                            </SubmitButton>
                        </form>
                        <Comments broadcast={broadcast} />
                    </div>
                </AccordionContent>
            </AccordionItem>
        </Accordion>
    );
}