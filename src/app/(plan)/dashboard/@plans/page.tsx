"use client";
import { supabaseBrowser } from "@/utils/supabase/client";
import React from 'react';
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton"
import { Ellipsis } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface TripPlan {
    trip_id: string;
    title: string;
    start_date: string;
    end_date: string;
    status: string;
    image?: string;
    total_days: number;
    host: string;
}

export default function Page() {
    const supabase = supabaseBrowser();
    const [categories, setCategories] = useState<string>("All");
    const [plans, setPlans] = useState<TripPlan[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [currentUser, setCurrentUser] = useState<any>(null);

    useEffect(() => {
        fetchCurrentUser().then(() => fetchPlans());
    }, [categories]);

    const filteredPlans = plans.filter(plan =>
        categories === "All" || plan.status === categories
    );

    const fetchPlans = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_API_URL}/trips`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
            });
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to fetch trip plans');
            }

            setPlans(data);
        } catch (error) {
            console.error('Error fetching trip plans:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchCurrentUser = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        setCurrentUser(user);
    };

    const handleDeletePlan = async (trip_id: string) => {
        const response = await supabase
            .from('trips')
            .delete()
            .eq('trip_id', trip_id);

        if (response.error) {
            console.error('Error deleting trip plan:', response.error);
            return;
        }

        window.location.reload();
    };

    const handleLeavePlan = async (trip_id: string) => {
        const response = await supabase
            .from('trip_participants')
            .delete()
            .eq('trip_id', trip_id)
            .eq('user_id', currentUser.id);

        if (response.error) {
            console.error('Error leaving trip plan:', response.error);
            return;
        }

        window.location.reload();
    };

    return (
        <div className="flex flex-col space-y-3">
            <div className="flex flex-col space-y-4 md:flex-row md:space-x-4 items-center">
                <p className="text-xl">Trip Plans</p>
                <div className="flex flex-row space-x-4 items-center">
                    {["All", "Planning", "Ongoing", "Finished"].map(category => (
                        <Button
                            key={category}
                            className={`${categories === category
                                ? "bg-[#baff66] text-black"
                                : "bg-[#0c1f19] text-[#baff66]"
                                } border rounded-full mb-2 hover:text-[#baff66] hover:bg-[#0c1f19] border-[#baff66]`}
                            onClick={() => setCategories(category)}
                        >
                            {category}
                        </Button>
                    ))}
                </div>
            </div>
            <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-5">
                {loading ? (
                    <>
                        {[...Array(3)].map((_, index) => (
                            <div key={index} className="flex flex-col space-y-3">
                                <Skeleton className="h-[125px] w-[250px] rounded-xl" />
                                <div className="space-y-2">
                                    <Skeleton className="h-4 w-[250px]" />
                                    <Skeleton className="h-4 w-[200px]" />
                                </div>
                            </div>
                        ))}
                    </>
                ) : filteredPlans.length === 0 ? (
                    <div className="col-span-full flex flex-col h-[250px] items-center justify-center space-y-2">
                         <img src="/polling.svg " alt="No data" className="mx-auto w-1/3" />
                        <p className="text-lg text-center">No trip plans found</p>
                    </div>
                ) : (
                    filteredPlans.map(plan => (
                        <div key={plan.trip_id} className="rounded-xl border bg-card text-card-foreground shadow">
                            <div className="flex flex-col space-y-1.5">
                                <img className="rounded-xl w-100 h-[185px] object-cover" src={plan.image || ''} alt={plan.title} />
                            </div>
                            <DropdownMenu>
                                <DropdownMenuTrigger className='relative float-right mt-[-180px] mr-[10px] cursor-pointer'><Button variant='ghost' size="icon"><Ellipsis /></Button></DropdownMenuTrigger>
                                <DropdownMenuContent>
                                    {currentUser && currentUser.id === plan.host ? (
                                        <DropdownMenuItem onClick={() => handleDeletePlan(plan.trip_id)}>Delete</DropdownMenuItem>
                                    ) : (
                                        <DropdownMenuItem onClick={() => handleLeavePlan(plan.trip_id)}>Leave Trip</DropdownMenuItem>
                                    )}
                                </DropdownMenuContent>
                            </DropdownMenu>
                            <div className="p-5 pt-3 space-y-2 cursor-pointer" onClick={() => window.location.href = `/trips/${plan.trip_id}`}>
                                <p>{plan.title}</p>
                                <div className="flex flex-row justify-between">
                                    <p className="text-sm text-slate-400">{new Date(plan.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {new Date(plan.end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                                    <p className="text-sm text-slate-400">{plan.total_days} days</p>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}