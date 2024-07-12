"use client"
import React, { useEffect, useState, useRef } from "react";
import GoogleMap from "@/components/GoogleMap";
import { supabaseBrowser } from "@/utils/supabase/client";
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

type Props = {
    trip_id: string;
};

export default function Map({ trip_id }: Props) {
    const supabase = supabaseBrowser();
    const [POI, setPOI] = useState<any>(null);
    const [sections_poi, setSectionsPoi] = useState<any>(null);

    const fetchPOI = async () => {
        const { data, error } = await supabase
            .from("trips")
            .select(`POI(*)`)
            .eq("trip_id", trip_id)
            .single();

        if (error) {
            console.error("Error fetching POI", error);
        }

        setPOI(data?.POI);
    };

    const fetchSectionsPoi = async () => {
        const { data, error } = await supabase
            .from("section")
            .select(`section_id,section_poi(sequence_num, POI(*))`)
            .eq("trip_id", trip_id);

        if (error) {
            console.error("Error fetching sections_poi", error);
        }
        setSectionsPoi(data);
        return data;
    };

    useEffect(() => {
        fetchPOI();
        fetchSectionsPoi().then((data) => {
            if (data && data.length > 0) {
                const sectionId = data[0].section_id;

                const subscription = supabase
                    .channel(`section_poi_map:${sectionId}`)
                    .on('postgres_changes', {
                        event: '*',
                        schema: 'public',
                        table: 'section_poi',
                        filter: `section_id=eq.${sectionId}`
                    }, () => {
                        fetchSectionsPoi();
                    })
                    .subscribe();

                return () => {
                    subscription.unsubscribe();
                };
            }
        });
    }, [trip_id]);

    if (!POI || !sections_poi) {
        return <div className="flex justify-center min-h-screen items-center">
            <Loader2 className={cn('h-4 w-4 animate-spin', 'mr-2')} />
            <p>Loading map...</p>
        </div>;
    }

    return (
        <GoogleMap POI={POI} sections_poi={sections_poi} />
    );
}