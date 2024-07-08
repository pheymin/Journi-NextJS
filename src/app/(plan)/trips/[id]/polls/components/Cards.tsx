"use client";
import { supabaseBrowser } from "@/utils/supabase/client";
import PollCard from "./PollCard";
import React, { useState, useEffect } from "react";

type Props = {
    user: any;
    trip_id: string;
    status: string;
};

export default function Cards({ user, trip_id, status }: Props) {
    const supabase = supabaseBrowser();
    const [data, setData] = useState<any[] | null>(null);

    const fetchPolls = async () => {
        const { data, error } = await supabase
            .from("polls")
            .select(`*, profiles(*)`)
            .eq("status", status)
            .eq("trip_id", trip_id);

        if (error) {
            console.error("Error fetching polls", error);
            return;
        }

        setData(data);
    };

    useEffect(() => {
        fetchPolls();

        const subscription = supabase
            .channel(`polls:${trip_id}`)
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'polls',
            }, () => {
                fetchPolls();
            })
            .subscribe();

        return () => {
            subscription.unsubscribe();
        }
    }, [trip_id]);
    
    if(data?.length === 0) {
        return (
            <div>
                <img src="/polling.svg " alt="No active polls" className="mx-auto w-1/3" />
                <p className="text-center">No {status} polls</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {data?.map((poll: any, index: number) => (
                <PollCard poll={poll} user={user} trip_id={trip_id} isOwner={user.id == poll.profiles.id} key={index} />
            ))}
        </div>
    );
};