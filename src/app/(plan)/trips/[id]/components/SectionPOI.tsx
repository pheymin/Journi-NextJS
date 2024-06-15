"use client";
import { useState, useEffect, useRef } from "react";
import { supabaseBrowser } from "@/utils/supabase/client";
import AddPOI from "@/components/AddPOI";
import { Textarea } from "@/components/ui/textarea";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLocationPin } from "@fortawesome/free-solid-svg-icons";
import { Button } from "@/components/ui/button";
import { ChevronUpIcon, ChevronDownIcon, TrashIcon } from "@radix-ui/react-icons"

type Props = {
    section_id: number;
};

interface SectionPOI {
    section_poi_id: number;
    section_id: number;
    place_id: string;
    sequence_num: number;
    note: string;
    created_at: string;
    POI: any;
}

export default function SectionPOI({ section_id }: Props) {
    const supabase = supabaseBrowser();
    const [POIs, setPOIs] = useState<SectionPOI[]>([]);

    const fetchSectionPOIs = async () => {
        const { data, error } = await supabase
            .from("section_poi")
            .select(`*, POI(*)`)
            .eq("section_id", section_id);

        if (error) {
            console.error("Error fetching sections", error);
        }

        setPOIs(data ?? []);
    }

    useEffect(() => {
        fetchSectionPOIs();

        const channel = supabase
            .channel(`section_poi:${section_id}`)
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'section_poi',
                filter: `section_id=eq.${section_id}`
            }, (payload) => {
                fetchSectionPOIs();
            })
            .subscribe();

        return () => {
            channel.unsubscribe();
        }

    }, [section_id]);

    const handlePlaceSelected = async (placeId: string) => {
        const { error } = await supabase
            .rpc("insert_section_poi", {
                p_section_id: section_id,
                p_place_id: placeId,
            });

        if (error) {
            console.error("Error inserting POI", error);
        }
    };

    const handleDeletePOI = async (section_poi_id: number) => {
        const { error } = await supabase
            .rpc('delete_section_poi', {
                p_section_poi_id: section_poi_id
            })

        if (error) {
            console.error("Error deleting POI", error);
        }
    };

    const handleReorderPOI = async (section_poi_id: number, order: number) => {
        //order = -1 for moving up, 1 for moving down
        const { error } = await supabase
            .rpc('reorder_section_poi', {
                p_section_poi_id: section_poi_id,
                p_order: order
            })

        if (error) {
            console.error("Error reordering POI", error);
        }
    }

    const handleUpdateNote = async (section_poi_id: number, note: string) => {
        const { error } = await supabase
            .from('section_poi')
            .update({ note })
            .eq('section_poi_id', section_poi_id);

        if (error) {
            console.error("Error updating note", error);
        }
    }

    return (
        <div>
            {POIs.length > 0 ? (
                <div>
                    {POIs.sort((a, b) => a.sequence_num - b.sequence_num).map((SectionPOI: SectionPOI, index: number) => (
                        <div key={index} className="mb-8">
                            <div className="grid grid-cols-12 gap-2 max-h-[150px]">
                                {POIs.length > 1 &&
                                    <div className="col-span-1 h-full flex flex-col justify-center">
                                        {SectionPOI.sequence_num !== 1 &&
                                            <ChevronUpIcon className="p-2 size-10 rounded-full hover:bg-muted cursor-pointer" onClick={() => handleReorderPOI(SectionPOI.section_poi_id, -1)} />}
                                        {SectionPOI.sequence_num !== POIs.reduce((max, poi) => poi.sequence_num > max ? poi.sequence_num : max, 0) &&
                                            <ChevronDownIcon className="p-2 size-10 rounded-full hover:bg-muted cursor-pointer" onClick={() => handleReorderPOI(SectionPOI.section_poi_id, 1)} />}
                                    </div>
                                }
                                <div className={`${POIs.length > 1 ? 'col-span-6' : 'col-span-7'} h-full`}>
                                    <div className="flex space-x-1">
                                        <div className="relative">
                                            <FontAwesomeIcon icon={faLocationPin} className="size-7 text-[#baff66]" />
                                            <span className="absolute top-3 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-[#0c1f19] font-bold">{SectionPOI.sequence_num}</span>
                                        </div>
                                        <h4 className="font-semibold text-base ml-6 mb-2 space-x-2">{SectionPOI.POI.name}</h4>
                                    </div>
                                    <Textarea className="resize-none h-28 border-none bg-muted" placeholder="Add notes, links, etc. here" defaultValue={SectionPOI.note} onBlur={(e) => handleUpdateNote(SectionPOI.section_poi_id, e.target.value)} />
                                </div>
                                <div className="col-span-4 rounded-lg">
                                    <img className="rounded-lg object-cover object-center h-36 w-full overflow-hidden" src={SectionPOI.POI.image_url} alt={SectionPOI.POI.name} />
                                </div>
                                <TrashIcon className="p-2 size-10 rounded-full hover:bg-muted cursor-pointer" onClick={() => handleDeletePOI(SectionPOI.section_poi_id)} />
                            </div>
                        </div>
                    ))}
                    <AddPOI onPlaceSelected={handlePlaceSelected} />
                </div>
            ) : (
                <AddPOI onPlaceSelected={handlePlaceSelected} />
            )}
        </div>
    );
}