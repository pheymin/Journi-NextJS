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
import SectionPOI from "./SectionPOI";

type Props = {
    trip_id: string;
};

interface Section {
    section_id: number;
    trip_id: number;
    title: string;
    created_at: string;
}

export default function Sections({ trip_id }: Props) {
    const supabase = supabaseBrowser();
    const [sections, setSections] = useState<Section[]>([]);

    const fetchSections = async () => {
        const { data, error } = await supabase
            .from("section")
            .select("*")
            .eq("trip_id", trip_id);

        if (error) {
            console.error("Error fetching sections", error);
        }

        setSections(data ?? []);
    }

    useEffect(() => {
        fetchSections();

        const subscription = supabase
            .channel(`section:trip_id=${trip_id}`)
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'section',
            }, (payload) => {
                fetchSections();
            })
            .subscribe();

        return () => {
            subscription.unsubscribe();
        }
    }, [trip_id]);

    const updateTitle = async (section_id: number) => {
        const section = sections.find((s) => s.section_id === section_id);

        if (!section) {
            return;
        }

        const { error } = await supabase
            .from("section")
            .update({ title: section.title })
            .eq("section_id", section_id);

        if (error) {
            console.error("Error updating section title", error);
        }
    }

    return (
        <div>
            {sections.map((section: Section, index: number) => (
                <Accordion id={section.section_id.toString()} type="single" collapsible key={index} defaultValue={`item-${index}`}>
                    <AccordionItem value={`item-${index}`}>
                        <AccordionTrigger>
                            <Input
                                className="font-semibold text-lg px-2 py-1 border-none hover:bg-muted focus:bg-transparent w-fit"
                                placeholder="Add a title (e.g., Restaurants)"
                                onChange={(e) => setSections(sections.map((s) => s.section_id === section.section_id ? { ...s, title: e.target.value } : s))}
                                onBlur={() => updateTitle(section.section_id)}
                                defaultValue={section.title} required />
                        </AccordionTrigger>
                        <AccordionContent>
                            <SectionPOI section_id={section.section_id} section_index={index} />
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            ))}
        </div>
    );
}