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

const libs: Library[] = ["places", "maps"];
export default function NewTripDialog() {
    const [autoComplete, setAutoComplete] = useState<google.maps.places.Autocomplete | null>(null);
    const { isLoaded } = useJsApiLoader({
        googleMapsApiKey: process.env.NEXT_PUBLIC_MAPS_API_KEY as string,
        libraries: libs,
    });
    const placeAutoComplete = useRef<HTMLInputElement>(null);
    const [open, setOpen] = useState(false);
    const [showInviteCombo, setShowInviteCombo] = useState(false);

    const handleInviteComboToggle = () => {
        setShowInviteCombo(!showInviteCombo);
    };

    useEffect(() => {
        if (isLoaded && placeAutoComplete.current) {
            const gautoComplete = new google.maps.places.Autocomplete(placeAutoComplete.current);
            setAutoComplete(gautoComplete);
        }
    }, [isLoaded, open]);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button type="submit" className="rounded-full bg-[#baff66] border py-2 text-black mb-2 hover:text-[#baff66] hover:bg-[#0c1f19] hover:border-[#baff66] px-6"><span className="mr-2 text-xl">+</span>New Trip</Button>
            </DialogTrigger>
            {open && (
                <DialogContent className="max-w-[452px] md:max-w-[600px]">
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
                            <Input id="types" className="col-span-3" />
                        </div>
                        {showInviteCombo && (
                            <div className="grid w-full items-center gap-2">
                                <Label htmlFor="tripmates">
                                    Invite tripmates
                                </Label>
                                <Input id="tripmates" placeholder="Search by name or enter email" className="col-span-3" />
                            </div>
                        )}
                        <div className="flex justify-between">
                            {!showInviteCombo && (
                                <Button variant="link" className="text-[#baff66]" onClick={handleInviteComboToggle}>+ Invite tripmates</Button>
                            )}
                            <Select>
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