"use client"
import { supabaseBrowser } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import React, { useState, useEffect } from "react";
import { Schema } from "zod";

type PollOptionsProps = {
    poll_id: number;
    user_id: string;
};

export default function PollOptions({ poll_id, user_id }: PollOptionsProps) {
    const supabase = supabaseBrowser();
    const [data, setData] = useState<any[] | null>(null);

    const fetchPolls = async () => {
        const { data, error } = await supabase
            .from("poll_answer")
            .select(`*,
             poll_vote(count)`)
            .eq("poll_id", poll_id);

        if (error) {
            console.error("Error fetching polls", error);
        }

        setData(data);
    };

    useEffect(() => {
        fetchPolls();

        const subscription = supabase
            .channel(`poll_answer:${poll_id}`)
            .on('postgres_changes',{
                event: '*',
                schema: 'public',
                table: 'poll_vote',
            }, (payload) => {
                fetchPolls();
            })
            .subscribe();

        return () => {
            subscription.unsubscribe();
        };
    }, [poll_id]);

    const updateVote = (poll_answer_id: number) => {
        const insertVote = async () => {
            const { data, error } = await supabase
                .rpc("update_vote", {
                    param_poll_id: poll_id,
                    param_poll_answer_id: poll_answer_id,
                    param_user_id: user_id,
                });

            if (error) {
                console.error("Error inserting vote", error);
            }
        }

        insertVote();
    };

    return (
        <div className="grid justify-items-stretch space-y-2">
            {data?.map((answer: any, index: number) => (
                <div key={index} className="grid gap-2">
                    <Button variant="outline" className="text-left flex-grow" onClick={() => updateVote(answer.poll_answer_id)}>
                        {answer.answer}
                    </Button>
                    <p className="justify-self-end">{answer.poll_vote[0].count} votes</p>
                </div>
            ))}
        </div>
    );
}