"use client";
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { supabaseBrowser } from "@/utils/supabase/client";
import React, { useEffect, useState } from "react";
import { useToast } from "@/components/ui/use-toast"
import { CalendarIcon } from "@radix-ui/react-icons"
import { addDays, format } from "date-fns"
import { DateRange } from "react-day-picker"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"

export default function TripDetails(tripData: any) {
    const supabase = supabaseBrowser();
    const { toast } = useToast();

    const [trip, setTrip] = useState(tripData.tripData);
    const [date, setDate] = useState<DateRange | undefined>({
        from: new Date(trip.start_date),
        to: new Date(trip.end_date)
    });

    useEffect(() => {
        const channel = supabase
            .channel(`trip:${tripData.tripData.trip_id}`)
            .on('postgres_changes', {
                event: 'UPDATE',
                schema: 'public',
                table: 'trips',
                filter: `trip_id=eq.${tripData.tripData.trip_id}`
            }, payload => {
                setTrip(payload.new);
                setDate({ from: new Date(payload.new.start_date), to: new Date(payload.new.end_date) });
            })
            .subscribe();

        return () => {
            channel.unsubscribe();
        };
    }, [tripData.tripData.trip_id]);

    const updateTrip = async (updatedTrip: any) => {
        const { data, error } = await supabase
            .from('trips')
            .update({
                title: updatedTrip.title,
                description: updatedTrip.description,
                start_date: updatedTrip.start_date,
                end_date: updatedTrip.end_date
            })
            .eq('trip_id', updatedTrip.trip_id);

        if (error) {
            toast({
                variant: "destructive",
                title: 'Error',
                description: error.message,
            });
        } else {
            toast({
                title: 'Success',
                description: 'Trip updated successfully',
            });
        }
    };

    const handleDateChange = (selectedDate: any) => {
        setDate(selectedDate);
        if (selectedDate?.from && selectedDate?.to) {
            const updatedTrip = {
                ...trip,
                start_date: format(selectedDate.from, "yyyy-MM-dd"),
                end_date: format(selectedDate.to, "yyyy-MM-dd"),
            };
            setTrip(updatedTrip);
            updateTrip(updatedTrip);
        }
    };

    return (
        <>
            <Input
                className="text-center font-semibold text-4xl px-2 py-1 border-none hover:border"
                placeholder="Title"
                defaultValue={trip.title}
                onChange={(e) => setTrip({ ...trip, title: e.target.value })}
                onBlur={() => updateTrip(trip)}
            />
            <Popover>
                <PopoverTrigger asChild>
                    <Button
                        id="date"
                        variant={"outline"}
                        className={cn(
                            "justify-start w-fit text-left font-normal bg-transparent border-none hover:border-none",
                            !date && "text-muted-foreground"
                        )}
                    >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date?.from ? (
                            date.to ? (
                                <>
                                    {format(date.from, "LLL dd, y")} -{" "}
                                    {format(date.to, "LLL dd, y")}
                                </>
                            ) : (
                                format(date.from, "LLL dd, y")
                            )
                        ) : (
                            <span>Pick a date</span>
                        )}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                        initialFocus
                        mode="range"
                        defaultMonth={date?.from}
                        selected={date}
                        onSelect={handleDateChange}
                        numberOfMonths={2}
                    />
                </PopoverContent>
            </Popover>
            <Textarea
                className="text-center px-2 py-1 border-none"
                placeholder="Description"
                defaultValue={trip.description}
                onChange={(e) => setTrip({ ...trip, description: e.target.value })}
                onBlur={() => updateTrip(trip)}
            />
        </>
    );
}