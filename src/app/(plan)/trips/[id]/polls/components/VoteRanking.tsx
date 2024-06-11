"use client";
import { supabaseBrowser } from "@/utils/supabase/client";
import React, { useState, useEffect } from "react";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress"

export default function VoteRanking({ poll_id, trip_id }: { poll_id: number, trip_id: string }) {
    const supabase = supabaseBrowser();
    const [data, setData] = useState<any[] | null>(null);
    const [totalUsers, setTotalUsers] = useState<number | null>(null);

    const fetchVotes = async () => {
        const { data, error } = await supabase
            .from("poll_answer")
            .select(`
                *,
                poll_vote(count)
            `)
            .eq("poll_id", poll_id);

        if (error) {
            console.error("Error fetching votes", error);
            return;
        }
        //set data descending by votes
        data.sort((a: any, b: any) => b.poll_vote[0]?.count - a.poll_vote[0]?.count);
        setData(data);
    };

    const fetchTotalUsers = async () => {
        const { data, error } = await supabase
            .from("trip_participants")
            .select('trip_participant_id')
            .eq("trip_id", trip_id);

        if (error) {
            console.error("Error fetching total users", error);
            return;
        }

        setTotalUsers(data?.length);
    };

    useEffect(() => {
        fetchVotes();
        fetchTotalUsers();

        const channel = supabase
            .channel(`poll_answer:${poll_id}`)
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'poll_vote',
            },
                (payload) => {
                    fetchVotes();
                }
            )
            .subscribe();

        return () => {
            channel.unsubscribe();
        };
    }, [poll_id, trip_id]);

    return (
        <div className="space-y-2 p-4">
            <h3 className="text-xl">Result</h3>
            <hr />
            {data?.slice(0, 3).map((answer: any, index: number) => (
                <div key={index} className="grid gap-2">
                    <h3>{answer.answer}</h3>
                    <Progress value={totalUsers ? (answer.poll_vote[0]?.count || 0) / totalUsers * 100 : 0} />
                    <VotedUsers poll_answer_id={answer.poll_answer_id} />
                    <p className="justify-self-end">{answer.poll_vote[0]?.count || 0} votes</p>
                </div>
            ))}
        </div>
    );
}

function VotedUsers({ poll_answer_id }: { poll_answer_id: number }) {
    const supabase = supabaseBrowser();
    const [data, setData] = useState<any[] | null>(null);

    const fetchVotes = async () => {
        const { data, error } = await supabase
            .from("poll_vote")
            .select(`
                *,
                profiles(*)
            `)
            .eq("poll_answer_id", poll_answer_id);

        if (error) {
            console.error("Error fetching votes", error);
            return;
        }

        setData(data);
    };

    useEffect(() => {
        fetchVotes();

        const channel = supabase
            .channel(`poll_votes_${poll_answer_id}`)
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'poll_vote',
                },
                (payload) => {
                    fetchVotes();
                }
            )
            .subscribe();

        return () => {
            channel.unsubscribe();
        };
    }, [poll_answer_id]);

    return (
        <div className="space-x-2 justify-self-end">
            {data?.map((vote: any) => (
                <TooltipProvider key={vote.poll_vote_id}>
                    <Tooltip>
                        <TooltipTrigger>
                            <Avatar className="size-8">
                                <AvatarImage
                                    src={
                                        vote.profiles?.avatar_url ||
                                        `https://source.boringavatars.com/marble/120/${vote.profiles.email}`
                                    }
                                    alt="Avatar"
                                />
                                <AvatarFallback>JN</AvatarFallback>
                            </Avatar>
                        </TooltipTrigger>
                        <TooltipContent>
                            <div className="grid gap-2">
                                <p>{vote.profiles?.username || vote.profiles.email}</p>
                            </div>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            ))}
        </div>
    );
}
