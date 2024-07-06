"use client";
import { useState, useEffect } from "react";
import { supabaseBrowser } from "@/utils/supabase/client";
import { Textarea } from "@/components/ui/textarea";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLocationPin } from "@fortawesome/free-solid-svg-icons";
import { ChevronUpIcon, ChevronDownIcon, TrashIcon } from "@radix-ui/react-icons"
import { POI_COLORS } from "@/utils/constant";
import POIDistance from "@/components/POIDistance";

type Props = {
    itinerary_id: number;
    itinerary_index: number;
};

interface ItineraryPOI {
    itinerary_poi_id: number;
    itinerary_id: number;
    place_id: string;
    sequence_num: number;
    note: string;
    travel_method: string;
    created_at: string;
    POI: any;
}

export default function ItineraryPOI({ itinerary_id, itinerary_index }: Props) {
    const supabase = supabaseBrowser();
    const [POIs, setPOIs] = useState<ItineraryPOI[]>([]);
    const itinerary_color = POI_COLORS[itinerary_index % POI_COLORS.length];

    const fetchItineraryPOIs = async () => {
        const { data, error } = await supabase
            .from("itinerary_poi")
            .select(`*, POI(*)`)
            .eq("itinerary_id", itinerary_id);

        if (error) {
            console.error("Error fetching itineraries", error);
        }

        setPOIs(data ?? []);
    }

    useEffect(() => {
        fetchItineraryPOIs();

        const channel = supabase
            .channel(`itinerary_poi:${itinerary_id}`)
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'itinerary_poi',
                filter: `itinerary_id=eq.${itinerary_id}`
            }, () => {
                fetchItineraryPOIs();
            })
            .subscribe();

        return () => {
            channel.unsubscribe();
        }
    }, [itinerary_id]);

    const handleDeletePOI = async (itinerary_poi_id: number) => {
        const { error } = await supabase
            .rpc('delete_itinerary_poi', {
                p_itinerary_poi_id: itinerary_poi_id
            })

        if (error) {
            console.error("Error deleting POI", error);
        }
    }

    const handleNoteChange = async (itinerary_poi_id: number, note: string) => {
        const { error } = await supabase
            .from("itinerary_poi")
            .update({ note })
            .eq("itinerary_poi_id", itinerary_poi_id);

        if (error) {
            console.error("Error updating note", error);
        }
    }

    const handleReorderPOI = async (itinerary_poi_id: number, order: number) => {
        const { error } = await supabase
            .rpc('reorder_itinerary_poi', {
                p_itinerary_poi_id: itinerary_poi_id,
                p_order: order
            })

        if (error) {
            console.error("Error reordering POI", error);
        }
    }

    return (
        <div>
            {POIs.sort((a, b) => a.sequence_num - b.sequence_num).map((SectionPOI: ItineraryPOI, index: number) => (
                <div className="grid grid-cols-12 gap-4 mb-4">
                    <div key={index} className="col-span-12">
                        <div className="grid grid-cols-12 gap-2 max-h-[150px]">
                            {POIs.length > 1 &&
                                <div className="col-span-1 h-full flex flex-col justify-center">
                                    {SectionPOI.sequence_num !== 1 &&
                                        <ChevronUpIcon className="p-2 size-10 rounded-full hover:bg-muted cursor-pointer" onClick={() => handleReorderPOI(SectionPOI.itinerary_poi_id, -1)} />}
                                    {SectionPOI.sequence_num !== POIs.reduce((max, poi) => poi.sequence_num > max ? poi.sequence_num : max, 0) &&
                                        <ChevronDownIcon className="p-2 size-10 rounded-full hover:bg-muted cursor-pointer" onClick={() => handleReorderPOI(SectionPOI.itinerary_poi_id, 1)} />}
                                </div>
                            }
                            <div className={`${POIs.length > 1 ? 'col-span-6' : 'col-span-7'} h-full flex flex-col`}>
                                <div className="flex shrink-0 space-x-1 grow-0 items-center">
                                    <div className="relative">
                                        <FontAwesomeIcon icon={faLocationPin} className={`size-7 fill-[${itinerary_color}] text-[${itinerary_color}]`} />
                                        <span className="absolute top-3 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-[#0c1f19] font-bold">{SectionPOI.sequence_num}</span>
                                    </div>
                                    <h4 className="font-semibold text-base ml-6 mb-2 space-x-2 truncate">{SectionPOI.POI.name}</h4>
                                </div>
                                <Textarea className="resize-none h-28 border-none bg-muted shrink" placeholder="Add notes, links, etc. here" defaultValue={SectionPOI.note} onBlur={(e) => handleNoteChange(SectionPOI.itinerary_poi_id, e.target.value)} />
                            </div>
                            <div className="col-span-4 rounded-lg">
                                <img className="rounded-lg object-cover object-center h-36 w-full overflow-hidden" src={SectionPOI.POI.image_url} alt={SectionPOI.POI.name} />
                            </div>
                            <TrashIcon className="p-2 size-10 rounded-full hover:bg-muted cursor-pointer" onClick={() => handleDeletePOI(SectionPOI.itinerary_poi_id)} />
                        </div>
                    </div>
                    {POIs.length > 1 && index < POIs.length - 1 && (
                        <div className="h-full col-span-6 col-start-2 w-full">
                            <POIDistance
                                origin={SectionPOI.POI.geometry.location}
                                destination={POIs[index + 1].POI.geometry.location}
                            />
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}