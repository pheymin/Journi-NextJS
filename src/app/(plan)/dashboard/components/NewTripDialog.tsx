"use client"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { useState, useRef, useEffect } from "react";
import MultipleSelector, { Option } from '@/components/ui/multiple-selector';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, SubmitHandler } from 'react-hook-form';
import * as z from 'zod';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { toast } from '@/components/ui/use-toast';
import { LoadingButton } from '@/components/ui/loading-button';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { CalendarIcon } from "@radix-ui/react-icons"
import { addDays, format } from "date-fns"
import { Calendar } from "@/components/ui/calendar"
import { cn } from "@/lib/utils"
import { supabaseBrowser } from "@/utils/supabase/client";
import { useGoogleMapsLoader } from "@/utils/googleMapsLoader";


const typesSchema = z.object({
    label: z.string(),
    value: z.string(),
    disable: z.boolean().optional(),
});

const tripmatesSchema = z.object({
    label: z.string(),
    value: z.string(),
    disable: z.boolean().optional(),
});

const FormSchema = z.object({
    place_id: z.string({ message: "Please select a destination" }),
    place_name: z.string({ message: "Please enter a destination" }),
    types: z.array(typesSchema).min(1),
    tripmates: z.array(tripmatesSchema).optional(),
    dates: z.object({
        from: z.date({ message: "Please select a date" }),
        to: z.date({ message: "Please select a date" }),
    }),
});

export default function NewTripDialog() {
    const form = useForm<z.infer<typeof FormSchema>>({
        resolver: zodResolver(FormSchema),
        defaultValues: {
            dates: {
                from: new Date(),
                to: addDays(new Date(), 5),
            },
        },
    });

    const [loading, setLoading] = useState(false);
    const onSubmit: SubmitHandler<z.infer<typeof FormSchema>> = async (data) => {
        setLoading(true);

        try {
            const tripmates = data.tripmates ?? [];
            const tripResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_API_URL}/trips`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            if (!tripResponse.ok) {
                throw new Error('Failed to create trip');
            }

            const tripData = await tripResponse.json();

            if (tripmates.length > 0) {
                const emailResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_API_URL}/send`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        title: tripData[0].title,
                        emailRedirectTo: `${window.location.origin}/trips/${tripData[0].trip_id}`,
                        invitees: data.tripmates?.map((tripmate) => tripmate.label) || [],
                    }),
                });

                if (!emailResponse.ok) {
                    throw new Error('Failed to send invitation emails');
                }
            }

            toast({
                title: 'Trip created',
                description: 'Your trip has been successfully created.',
            });

            window.location.href = `/trips/${tripData[0].trip_id}`;

        } catch (error) {
            console.error('Error:', error);
            toast({
                variant: 'destructive',
                title: 'Failed to create trip',
                description: 'An error occurred while creating your trip.',
            });
        } finally {
            setLoading(false);
        }
    };

    //maps autocomplete
    const [autoComplete, setAutoComplete] = useState<google.maps.places.Autocomplete | null>(null);
    const { isLoaded } = useGoogleMapsLoader();
    const placeAutoComplete = useRef<HTMLInputElement>(null);
    const [open, setOpen] = useState(false);
    const [selectedPlace, setSelectedPlace] = useState<string | null>(null);
    const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null);

    useEffect(() => {
        if (isLoaded && placeAutoComplete.current) {
            const gautoComplete = new google.maps.places.Autocomplete(placeAutoComplete.current as HTMLInputElement, {
                fields: ['place_id', 'name', 'geometry', 'photos'],
            });
            setAutoComplete(gautoComplete);
            setTimeout(() => {
                document.body.style.pointerEvents = "";
            }, 0);
        }
    }, [isLoaded, open]);

    useEffect(() => {
        if (isLoaded && autoComplete) {
            autoComplete.addListener('place_changed', () => {
                const place = autoComplete.getPlace();
                setSelectedPlaceId(place.place_id as string);
                if (place && place.place_id && place.name && place.geometry) {
                    form.setValue('place_id', place.place_id);
                    form.setValue('place_name', place.name);
                    storePlaceDetails(place);
                }
            });

            // Cleanup listener on component unmount
            return () => {
                google.maps.event.clearInstanceListeners(autoComplete);
            };
        }
    }, [autoComplete, isLoaded, open]);

    const storePlaceDetails = async (place: any) => {
        const supabase = supabaseBrowser();
        const { data, error } = await supabase.from('POI').upsert({
            place_id: place.place_id,
            name: place.name,
            geometry: place.geometry,
            image_url: place.photos[0].getUrl(),
        });

        if (error) {
            console.error('Error storing place details:', error);
        }
    };

    //invite tripmates toggle
    const [showInviteCombo, setShowInviteCombo] = useState(false);
    const [users, setUsers] = useState<Option[]>([]);
    const [isTriggered, setIsTriggered] = useState(false);

    const handleInviteComboToggle = () => {
        setShowInviteCombo(!showInviteCombo);
    };

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_API_URL}/profiles`);
                const data = await response.json();
                const userOptions = data.map((user: any) => ({
                    value: user.id,
                    label: user.email,
                }));
                setUsers(userOptions);
            } catch (error) {
                console.error('Error fetching users:', error);
            }
        };

        fetchUsers();
    }, []);

    const mockSearch = async (value: string): Promise<Option[]> => {
        return new Promise((resolve) => {
            setTimeout(() => {
                const res = users.filter((option) => option.label.includes(value));
                resolve(res);
            }, 1000);
        });
    };

    //types of trip options
    const [placeCategories, setPlaceCategories] = useState<Option[]>([]);
    useEffect(() => {
        const fetchPlaceCategories = async () => {
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_API_URL}/place_categories`);
                const data = await response.json();
                const options = data.map((category: any) => ({
                    value: String(category.place_categories_id),
                    label: category.name,
                }));
                setPlaceCategories(options);
            } catch (error) {
                console.error('Error fetching place categories:', error);
            }
        };

        fetchPlaceCategories();
    }, []);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button type="submit" className="rounded-full bg-[#baff66] border py-2 text-black mb-2 hover:text-[#baff66] hover:bg-[#0c1f19] hover:border-[#baff66] px-6"><span className="mr-2 text-xl">+</span>New Trip</Button>
            </DialogTrigger>
            {open && (
                <DialogContent
                    className="max-w-[452px] md:max-w-[600px]"
                    onInteractOutside={(e) => {
                        const hasPacContainer = e.composedPath().some((el: EventTarget) => {
                            if ("classList" in el) {
                                return Array.from((el as Element).classList).includes("pac-container")
                            }
                            return false
                        })

                        if (hasPacContainer) {
                            e.preventDefault()
                        }
                    }}
                >
                    <DialogHeader>
                        <DialogTitle>Plan a new trip</DialogTitle>
                        <DialogDescription>
                            Craft your journey together.
                        </DialogDescription>
                    </DialogHeader>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-5 py-4">
                            <div className="grid w-full items-center gap-2">
                                <FormField
                                    control={form.control}
                                    name="place_name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Where to?</FormLabel>
                                            <FormControl>
                                                <Input
                                                    {...field}
                                                    ref={placeAutoComplete}
                                                    onChange={(e) => {
                                                        field.onChange(e);
                                                        setSelectedPlace(e.target.value);
                                                    }}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="place_id"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormControl>
                                                <Input {...field} type="hidden" />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <div className="grid w-full items-center gap-2">
                                <FormField
                                    control={form.control}
                                    name="dates"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-col">
                                            <FormLabel>Dates</FormLabel>
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <FormControl>
                                                        <Button
                                                            variant={"outline"}
                                                            className={cn(
                                                                "w-[240px] pl-3 text-left font-normal",
                                                                !field.value && "text-muted-foreground"
                                                            )}
                                                        >
                                                            {field.value?.from ? (
                                                                field.value?.to ? (
                                                                    <>
                                                                        {format(field.value.from, "LLL dd, y")} -{" "}
                                                                        {format(field.value.to, "LLL dd, y")}
                                                                    </>
                                                                ) : (
                                                                    format(field.value.from, "LLL dd, y")
                                                                )
                                                            ) : (
                                                                <span>Pick a date</span>
                                                            )}
                                                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                        </Button>
                                                    </FormControl>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-auto p-0" align="start">
                                                    <Calendar
                                                        initialFocus
                                                        mode="range"
                                                        defaultMonth={field.value.from}
                                                        selected={field.value}
                                                        onSelect={
                                                            (range) => {
                                                                field.onChange(range);
                                                            }
                                                        }
                                                        disabled={(date) =>
                                                            date < new Date()
                                                        }
                                                    />
                                                </PopoverContent>
                                            </Popover>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <div className="grid w-full items-center gap-2">
                                <FormField
                                    control={form.control}
                                    name="types"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Types of trip</FormLabel>
                                            <FormControl>
                                                <MultipleSelector {...field} className="col-span-3" placeholder="Select your preference travel styles" options={placeCategories} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            {showInviteCombo && (
                                <div className="grid w-full items-center gap-2">
                                    <FormField
                                        control={form.control}
                                        name="tripmates"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Invite tripmates</FormLabel>
                                                <FormControl>
                                                    <MultipleSelector
                                                        {...field}
                                                        className="col-span-3"
                                                        onSearch={async (value) => {
                                                            setIsTriggered(true);
                                                            const res = await mockSearch(value);
                                                            setIsTriggered(false);
                                                            return res;
                                                        }}
                                                        placeholder="Search by name or enter email"
                                                        loadingIndicator={
                                                            <p className="py-2 text-center text-lg leading-10 text-muted-foreground">loading...</p>
                                                        }
                                                        emptyIndicator={
                                                            <p className="w-full text-center text-lg leading-10 text-muted-foreground">
                                                                no results found.
                                                            </p>
                                                        }
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            )}
                            <div className="flex justify-between">
                                {!showInviteCombo && (
                                    <Button variant="link" className="text-[#baff66]" onClick={handleInviteComboToggle}>+ Invite tripmates</Button>
                                )}
                            </div>
                            <LoadingButton loading={loading} type="submit" className="bg-[#baff66] border py-2 text-black mb-2 hover:text-[#baff66] hover:bg-[#0c1f19] hover:border-[#baff66] px-6">
                                Submit
                            </LoadingButton>
                        </form>
                    </Form>
                </DialogContent>
            )}
        </Dialog>
    )
}