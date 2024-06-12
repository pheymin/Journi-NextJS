"use client"
import { supabaseBrowser } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import React, { useState, useEffect } from "react";

type PollOptionsProps = {
    poll_id: number;
    user_id: string;
    status: boolean;
};

export default function PollOptions({ poll_id, user_id, status }: PollOptionsProps) {
    const supabase = supabaseBrowser();
    const [data, setData] = useState<any[] | null>(null);
    const [userVotes, setUserVotes] = useState<{ [key: number]: boolean }>({});

    const fetchPolls = async () => {
        const { data, error } = await supabase
            .from("poll_answer")
            .select(`
                *,
                poll_vote(count)
            `)
            .eq("poll_id", poll_id);

        if (error) {
            console.error("Error fetching polls", error);
            return;
        }

        const userVoteStatus: { [key: number]: boolean } = {};

        for (const answer of data) {
            const userVote = await supabase
                .from("poll_vote")
                .select("user_id")
                .eq("poll_answer_id", answer.poll_answer_id)
                .eq("user_id", user_id);

            if (userVote.data && userVote.data.length > 0) {
                userVoteStatus[answer.poll_answer_id] = true;
            } else {
                userVoteStatus[answer.poll_answer_id] = false;
            }
        }

        setUserVotes(userVoteStatus);
        setData(data);
    };

    useEffect(() => {
        fetchPolls();

        const subscription = supabase
            .channel(`poll_answer:${poll_id}`)
            .on('postgres_changes', {
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
                return;
            }

            fetchPolls();
        };

        insertVote();
    };

    return (
        <div className="grid justify-items-stretch space-y-2">
            {data?.map((answer: any, index: number) => (
                <div key={answer.poll_answer_id} className="grid gap-2">
                    <Button 
                        variant="outline"
                        className={`text-left flex-grow ${userVotes[answer.poll_answer_id] ? "border-2 text-[#baff66] border-[#baff66] bg-[#0c1f19]" : ""}`}
                        onClick={() => updateVote(answer.poll_answer_id)}
                        disabled={!status || userVotes[answer.poll_answer_id]}
                    >
                        {answer.answer}
                    </Button>
                    <p className="justify-self-end">{answer.poll_vote?.[0]?.count || 0} votes</p>
                </div>
            ))}
        </div>
    );
}