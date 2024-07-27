"use client"
import { supabaseBrowser } from "@/utils/supabase/client";
import React, { useState, useEffect } from "react";
import BroadcastCard from "./BroadcastCard";

type User = {
    id: string;
    avatar_url: string;
    username: string;
    email: string;
    full_name: string;
};

type Props = {
    user: User;
    trip_id: string;
};

export default function BroadcastList({ user, trip_id }: Props) {
    const supabase = supabaseBrowser();
    const [broadcasts, setBroadcasts] = useState<any[]>([]);

    useEffect(() => {
        fetchBroadcasts();

        const subscription = supabase
            .channel(`broadcast:${trip_id}`)
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'broadcast',
                filter: `trip_id=eq.${trip_id}`
            }, () => {
                fetchBroadcasts();
            })
            .subscribe();

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    const fetchBroadcasts = async () => {
        const { data, error } = await supabase
            .from("broadcast")
            .select(`*, profiles(*)`)
            .eq("trip_id", trip_id)
            .order("created_at", { ascending: false });

        if (error) {
            console.error("Error fetching broadcasts", error);
            return;
        }

        setBroadcasts(data);
    };

    return (
        <div className="space-y-4">
            {broadcasts.map((broadcast) => (
                <BroadcastCard key={broadcast.broadcast_id} broadcast={broadcast} user={user} />
            ))}
        </div>
    );
}