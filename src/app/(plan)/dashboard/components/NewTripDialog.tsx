"use client"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
import { DatePickerWithRange } from "@/components/DateRangePicker";
import { useState, useRef, useEffect, useCallback } from "react";
import { Library } from "@googlemaps/js-api-loader";
import { useJsApiLoader } from "@react-google-maps/api";
import MultipleSelector, { Option } from '@/components/ui/multiple-selector';

const libs: Library[] = ["places", "maps"];

export default function NewTripDialog() {
    //maps autocomplete
    const [autoComplete, setAutoComplete] = useState<google.maps.places.Autocomplete | null>(null);
    const { isLoaded } = useJsApiLoader({
        googleMapsApiKey: process.env.NEXT_PUBLIC_MAPS_API_KEY as string,
        libraries: libs,
    });
    const placeAutoComplete = useRef<HTMLInputElement>(null);
    const [open, setOpen] = useState(false);
    const [selectedPlace, setSelectedPlace] = useState<string | null>(null);

    useEffect(() => {
        if (isLoaded && placeAutoComplete.current) {
            const gautoComplete = new google.maps.places.Autocomplete(placeAutoComplete.current as HTMLInputElement, {
                fields: ['place_id', 'name'],
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
                setSelectedPlace(place.place_id as string);
            });

            // Cleanup listener on component unmount
            return () => {
                google.maps.event.clearInstanceListeners(autoComplete);
            };
        }
    }, [autoComplete, isLoaded, open]);

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
                    value: category.place_categories_id,
                    label: category.name,
                }));
                setPlaceCategories(options);
            } catch (error) {
                console.error('Error fetching place categories:', error);
            }
        };

        fetchPlaceCategories();
    }, []);

    //trip status
    const [tripStatus, setTripStatus] = useState("Friends");

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
                    <div className="grid gap-5 py-4">
                        <div className="grid w-full items-center gap-2">
                            <Label htmlFor="destination">
                                Where to?
                            </Label>
                            <Input ref={placeAutoComplete} id="destination" />
                        </div>
                        <div className="grid w-full items-center gap-2">
                            <Label htmlFor="dates">
                                Dates
                            </Label>
                            <DatePickerWithRange className="w-full" />
                        </div>
                        <div className="grid w-full items-center gap-2">
                            <Label htmlFor="types">
                                Types of trip
                            </Label>
                            <MultipleSelector className="col-span-3" placeholder="Select your preference travel styles" options={placeCategories} />
                        </div>
                        {showInviteCombo && (
                            <div className="grid w-full items-center gap-2">
                                <Label htmlFor="tripmates">
                                    Invite tripmates
                                </Label>
                                {/* <MultipleSelector className="col-span-3" placeholder="Search by name or enter email" options={OPTIONS} /> */}
                                <MultipleSelector
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
                            </div>
                        )}
                        <div className="flex justify-between">
                            {!showInviteCombo && (
                                <Button variant="link" className="text-[#baff66]" onClick={handleInviteComboToggle}>+ Invite tripmates</Button>
                            )}
                            <Select value={tripStatus} onValueChange={setTripStatus}>
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="Select a status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        <SelectLabel>Privacy Status</SelectLabel>
                                        <SelectItem value="Friends">Friends</SelectItem>
                                        <SelectItem value="Public">Public</SelectItem>
                                        <SelectItem value="Private">Private</SelectItem>
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="submit" className="bg-[#baff66] border py-2 text-black mb-2 hover:text-[#baff66] hover:bg-[#0c1f19] hover:border-[#baff66] px-6"><span className="mr-2 text-xl">+</span>Start Planning</Button>
                    </DialogFooter>
                </DialogContent>
            )}
        </Dialog>
    )
}