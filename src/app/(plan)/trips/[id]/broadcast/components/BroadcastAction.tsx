"use client"
import { supabaseBrowser } from "@/utils/supabase/client";
import React, { useState, useEffect } from "react";
import { Heart, MessageCircle } from "lucide-react";

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
};

export default function BroadcastAction({ broadcast }: Props) {
    const supabase = supabaseBrowser();
    const [commentCount, setCommentCount] = useState<number | null>(0);
    const [isOwnerLike, setIsOwnerLike] = useState<boolean>(false);
    const [currentUser, setCurrentUser] = useState<any | null>(null);
    const [likes, setLikes] = useState<number | null>(broadcast.likes);

    useEffect(() => {
        fetchCurrentUser().then((user) => fetchLikes(user));
        fetchComments();

        const setupSubscriptions = () => {
            const likeSubscription = supabase
                .channel(`broadcast:${broadcast.broadcast_id}`)
                .on('postgres_changes', {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'broadcast',
                    filter: `broadcast_id=eq.${broadcast.broadcast_id}`
                }, (payload) => {
                    setLikes(payload.new.likes);
                })
                .subscribe();

            const commentSubscription = supabase
                .channel(`broadcast_comment_count:${broadcast.broadcast_id}`)
                .on('postgres_changes', {
                    event: '*',
                    schema: 'public',
                    table: 'broadcast_comment',
                    filter: `broadcast_id=eq.${broadcast.broadcast_id}`
                }, (payload) => {
                    fetchComments();
                })
                .subscribe();

            return () => {
                likeSubscription.unsubscribe();
                commentSubscription.unsubscribe();
            };
        }

        const cleanupSubscriptions = setupSubscriptions();

        return () => {
            cleanupSubscriptions();
        };
    }, [broadcast.broadcast_id]);

    const fetchComments = async () => {
        const { count, error } = await supabase
            .from('broadcast_comment')
            .select('*', { count: 'exact', head: true })
            .eq('broadcast_id', broadcast.broadcast_id);

        if (error) {
            console.error('Error fetching comments', error);
            return;
        }

        setCommentCount(count);
    };

    const fetchLikes = async (user: any) => {
        const { count, error } = await supabase
            .from('broadcast_likes')
            .select('*', { count: 'exact', head: true })
            .eq('broadcast_id', broadcast.broadcast_id)
            .eq('user_id', user.id);

        if (error) {
            console.error('Error fetching likes', error);
            return;
        }
        if (count && count > 0) {
            setIsOwnerLike(true);
        }
    };

    const fetchCurrentUser = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        setCurrentUser(user);
        return user;
    };

    const handleLike = async () => {
        const { data, error } = await supabase
            .rpc('toggle_broadcast_like',
                {
                    _broadcast_id: broadcast.broadcast_id,
                    _user_id: currentUser.id
                })

        if (error) {
            console.error('Error unliking broadcast', error);
            return;
        }

        setIsOwnerLike(data);
    }

    return (
        <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
                <Heart
                    size={16}
                    className={`cursor-pointer ${isOwnerLike ? 'text-red-500 fill-red-500' : ''}`}
                    onClick={handleLike}
                />
                <p>{likes}</p>
            </div>
            <div className="flex items-center space-x-2">
                <MessageCircle size={16} />
                <p>{commentCount}</p>
            </div>
        </div>
    )
}