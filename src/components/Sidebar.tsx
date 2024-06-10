"use client";

import { useState, useEffect } from "react";
import { Nav } from "@/components/ui/nav";
import {
  LayoutDashboard,
  ChevronRight,
  Route,
  Vote,
  AudioLines,
  CircleDollarSign,
} from "lucide-react";
import { Button } from "./ui/button";
import { supabaseBrowser } from "@/utils/supabase/client";
import { format } from "date-fns"
import { it } from "node:test";

type Props = {
  trip_id: string;
};

interface Itinerary {
  itinerary_id: number;
  trip_id: number;
  itinerary_date: Date;
  subheading: string | null;
  created_at: string;
}

interface Section {
  section_id: number;
  trip_id: number;
  title: string;
  created_at: string;
}

export default function Sidebar({trip_id}: Props) {
  const supabase = supabaseBrowser();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [mobileWidth, setMobileWidth] = useState(false);
  const [itinerary, setItinerary] = useState<Itinerary[]>([]);
  const [sections, setSections] = useState<Section[]>([]);

  const handleResize = () => {
    setMobileWidth(window.innerWidth < 768);
  };

  const fetchItinerary = async () => {
    const { data, error } = await supabase
      .from("itinerary")
      .select("*")
      .eq("trip_id", trip_id);

    if (error) {
      console.error("Error fetching itinerary", error);
    }

    setItinerary(data ?? []); 
  };

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
    fetchItinerary();
    fetchSections();
  }, [trip_id]);

  useEffect(() => {
    handleResize();

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  function toggleSidebar() {
    setIsCollapsed(!isCollapsed);
  }

  const baseRoute = `/trips/${trip_id}`;

  return (
    <div className="relative min-w-[80px] border-r px-3 pb-10">
      {!mobileWidth && (
        <div className="absolute right-[-20px] top-12">
          <Button
            onClick={toggleSidebar}
            variant="secondary"
            className="rounded-full p-2"
          >
            <ChevronRight />
          </Button>
        </div>
      )}
      <Nav
        isCollapsed={mobileWidth ? true : isCollapsed}
        links={[
          {
            title: "Overview",
            href: `${baseRoute}`,
            icon: LayoutDashboard,
            variant: "ghost",
            children: sections.map((item) => ({
              title: item.title,
              href: `${baseRoute}#${item.section_id}`,
              variant: "ghost",
            })),
          },
          {
            title: "Itinerary",
            href: `${baseRoute}/itinerary`,
            icon: Route,
            variant: "ghost",
            children: itinerary.map((item) => ({
              title: format(item.itinerary_date, "LLL dd, y"),
              href: `${baseRoute}/itinerary#${item.itinerary_id}`,
              variant: "ghost",
            })),
          },
          {
            title: "Polls",
            href: `${baseRoute}/polls`,
            icon: Vote,
            variant: "ghost",
            children: [
              {
                title: "Active",
                href: `${baseRoute}/polls#active`,
                variant: "default"
              },
              {
                title: "Closed",
                href: `${baseRoute}/polls#closed`,
                variant: "ghost"
              }
            ]
          },
          {
            title: "Broadcast",
            href: `${baseRoute}/broadcast`,
            icon: AudioLines,
            variant: "ghost"
          },
          {
            title: "Budget",
            href: `${baseRoute}/budget`,
            icon: CircleDollarSign,
            variant: "ghost"
          }
        ]}
      />
    </div>
  );
}
