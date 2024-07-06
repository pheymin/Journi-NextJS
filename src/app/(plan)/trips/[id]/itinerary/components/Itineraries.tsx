"use client";
import { useState, useEffect } from "react";
import { supabaseBrowser } from "@/utils/supabase/client";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"
import { Input } from "@/components/ui/input"
import { format } from "date-fns"
import ItineraryPOI from "./ItineraryPOI";
import AddPOI from "@/components/AddPOI";
import NearbySearch from "@/components/NearbySearch";

type Props = {
    trip_id: string;
};

interface Types {
    label: string;
    value: string;
}

interface Trip {
    trip_id: number;
    types: Types[];
    POI: any;
}

interface Itinerary {
    itinerary_id: number;
    trip_id: number;
    itinerary_date: string;
    subheading: string;
    created_at: string;
    trips: Trip;
}

export default function Itineraries({ trip_id }: Props) {
    const supabase = supabaseBrowser();
    const [itineraries, setItineraries] = useState<Itinerary[]>([]);
    const [types, setTypes] = useState<string[]>([]);

    const fetchItineraries = async () => {
        const { data, error } = await supabase
            .from("itinerary")
            .select(`*, trips(types, POI(*))`)
            .eq("trip_id", trip_id);

        if (error) {
            console.error("Error fetching itineraries", error);
        }

        const parsedData = data?.map(itinerary => ({
            ...itinerary,
            trips: {
                ...itinerary.trips,
                types: itinerary.trips.types.map((jsonString: string) => JSON.parse(jsonString))
            }
        })) ?? [];

        //for each itinerary type, fetch the types
        parsedData[0].trips.types.forEach((type: Types) => {
            fetchTypes(parseInt(type.value));
        })

        setItineraries(parsedData);
    }

    const fetchTypes = async (place_category_id: number) => {
        const { data, error } = await supabase
            .from("POI_types")
            .select("name")
            .eq("place_categories_id", place_category_id);

        if (error) {
            console.error("Error fetching types", error);
        }

        const newTypes = data?.map((type: any) => type.name) ?? [];

        setTypes((prevTypes) => {
            const uniqueNewTypes = newTypes.filter((type) => !prevTypes.includes(type));
            return [...prevTypes, ...uniqueNewTypes];
        });
    }

    useEffect(() => {
        fetchItineraries();

        const subscription = supabase
            .channel(`itinerary:trip_id=${trip_id}`)
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'itinerary',
            }, () => {
                fetchItineraries();
            })

        return () => {
            subscription.unsubscribe();
        }
    }, [trip_id]);

    const updateSubheading = async (itinerary_id: number) => {
        const itinerary = itineraries.find((i) => i.itinerary_id === itinerary_id);
        if (!itinerary) return;

        const { data, error } = await supabase
            .from("itinerary")
            .update({ subheading: itinerary.subheading })
            .eq("itinerary_id", itinerary_id);

        if (error) {
            console.error("Error updating subheading", error);
        }
    }

    const handlePlaceSelected = (itinerary_id: number) => async (placeId: string) => {
        const { error } = await supabase.rpc("insert_itinerary_poi", {
            p_itinerary_id: itinerary_id,
            p_place_id: placeId,
        });

        if (error) {
            console.error("Error inserting itinerary POI", error);
        }
    }

    return (
        <div>
            {itineraries.map((itinerary, index: number) => (
                <Accordion id={itinerary.itinerary_id.toString()} type="single" collapsible key={index} defaultValue={`item-${index}`}>
                    <AccordionItem value={`item-${index}`}>
                        <AccordionTrigger>
                            <div className="flex flex-col items-start">
                                <h4 className="font-semibold text-lg">{format(itinerary.itinerary_date, "LLL dd, y")}</h4>
                                <Input
                                    className="font-semibold text-sm py-1 border-none hover:bg-muted focus:bg-transparent w-fit"
                                    placeholder="Add subheading"
                                    onChange={(e) => setItineraries(itineraries.map((i) => i.itinerary_id === itinerary.itinerary_id ? { ...i, subheading: e.target.value } : i))}
                                    onBlur={() => updateSubheading(itinerary.itinerary_id)}
                                    defaultValue={itinerary.subheading} required />
                            </div>
                        </AccordionTrigger>
                        <AccordionContent>
                            <ItineraryPOI itinerary_id={itinerary.itinerary_id} itinerary_index={index} />
                            <AddPOI onPlaceSelected={handlePlaceSelected(itinerary.itinerary_id)} />
                            {types[index] &&
                                <></>
                                // <NearbySearch
                                //     place_types={["point_of_interest", types[index]]}
                                //     location={itinerary.trips.POI.geometry.location}
                                //     onPlaceSelected={handlePlaceSelected(itinerary.itinerary_id)} />
                            }
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            ))}
        </div>
    );
}