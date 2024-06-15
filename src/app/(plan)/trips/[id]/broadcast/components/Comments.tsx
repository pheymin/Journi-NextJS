"use client"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from "date-fns";
import { supabaseBrowser } from "@/utils/supabase/client";
import React, { useState, useEffect } from "react";

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

interface Comment {
    comment_id: string;
    content: string;
    created_at: string;
    user_id: string;
    broadcast_id: string;
    profiles: User;
};

type Props = {
    broadcast: Broadcast;
};

export default function BroadcastComment({ broadcast }: Props) {
    const supabase = supabaseBrowser();
    const [comments, setComments] = useState<Comment[]>([]);

    useEffect(() => {
        fetchComments();
        console.log("Broadcast ID", broadcast.broadcast_id);
        const subscription = supabase
            .channel(`broadcast_comments:${broadcast.broadcast_id}`)
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'broadcast_comment',
                filter: `broadcast_id=eq.${broadcast.broadcast_id}`
            }, (payload) => {
                console.log("Change received!", payload);
                fetchComments();
            })
            .subscribe();

        return () => {
            subscription.unsubscribe();
        }
    }, [broadcast.broadcast_id]);

    const fetchComments = async () => {
        const { data, error } = await supabase
            .from('broadcast_comment')
            .select(`*, profiles(*)`)
            .eq('broadcast_id', broadcast.broadcast_id)
            .order('created_at', { ascending: false });

        if (error) {
            console.error("Error fetching comments", error);
            return;
        }

        setComments(data);
    };

    if (comments.length === 0) {
        return <></>;
    }

    return (
        <div className="space-y-4">
            {comments.map((comment, index) => (
                <div key={index} className="flex space-x-2 items-center">
                    <Avatar className="size-8">
                        <AvatarImage className="object-cover" src={comment.profiles.avatar_url || `https://source.boringavatars.com/marble/120/${comment.profiles.email}`} alt="Avatar" />
                        <AvatarFallback>{comment.profiles.username}</AvatarFallback>
                    </Avatar>
                    <div>
                        <div className="flex space-x-2 items-center">
                            <p className="text-sm">
                                {comment.profiles.username ? `@${comment.profiles.username}` :
                                    comment.profiles.full_name ? comment.profiles.full_name :
                                    comment.profiles.email}
                            </p>
                            <p className="text-muted-foreground text-xs">{format(new Date(comment.created_at), 'PPpp')}</p>
                        </div>
                        <p className="text-sm">{comment.content}</p>
                    </div>
                </div>
            ))}
        </div>
    );
}