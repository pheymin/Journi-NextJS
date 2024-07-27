"use client"
import { supabaseBrowser } from "@/utils/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from 'date-fns';
import BroadcastAction from "./BroadcastAction";
import BroadcastComment from "./BroadcastComment";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { EllipsisVertical } from "lucide-react";

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

export default function BroadcastCard({ broadcast, user }: Props) {
    const supabase = supabaseBrowser();

    const deleteBroadcast = async () => {
        const { error } = await supabase
            .from("broadcast")
            .delete()
            .eq("broadcast_id", broadcast.broadcast_id);

        if (error) {
            console.error("Error deleting broadcast", error);
            return;
        }
    };

    return (
        <div className="flex justify-center items-center gap-4">
            <div className="w-full md:w-3/5 rounded-xl p-4 border-2 space-y-3">
                <div className="space-y-3">
                    <div className="flex justify-between">
                        <div className="flex space-x-2 items-center">
                            <Avatar className="size-8">
                                <AvatarImage className="object-cover" src={broadcast.profiles.avatar_url || `https://source.boringavatars.com/marble/120/${broadcast.profiles.email}`} alt="Avatar" />
                                <AvatarFallback>{broadcast.profiles.username}</AvatarFallback>
                            </Avatar>
                            <div>
                                <p className="text-sm">
                                    {broadcast.profiles.username ? `@${broadcast.profiles.username}` :
                                        broadcast.profiles.full_name ? broadcast.profiles.full_name :
                                            broadcast.profiles.email}
                                </p>
                                <p className="text-muted-foreground text-xs">{format(new Date(broadcast.created_at), 'PPpp')}</p>
                            </div>
                        </div>
                        {user.id === broadcast.user_id &&
                            <DropdownMenu>
                                <DropdownMenuTrigger><EllipsisVertical /></DropdownMenuTrigger>
                                <DropdownMenuContent>
                                    <DropdownMenuItem>
                                        <form action={deleteBroadcast}>
                                            <button className="no-underline">
                                                Delete
                                            </button>
                                        </form>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        }
                    </div>
                    <h3 className="font-semibold text-xl">{broadcast.content}</h3>
                    <BroadcastAction broadcast={broadcast} />
                    <hr />
                    <div>
                        <BroadcastComment broadcast={broadcast} user={user} />
                    </div>
                </div>
            </div>
        </div>
    )
}