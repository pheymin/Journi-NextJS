"use client";

import { useState, useEffect } from "react";
import { Nav } from "@/components/ui/nav";

import {
  LayoutDashboard,
  ChevronRight,
  Route,
  Vote,
  AudioLines,
  CircleDollarSign
} from "lucide-react";
import { Button } from "./ui/button";

type Props = {};

export default function Sidebar({}: Props) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [mobileWidth, setMobileWidth] = useState(false);
  const [pathName, setPathName] = useState("");

  const handleResize = () => {
    setMobileWidth(window.innerWidth < 768);
  };

  useEffect(() => {
    handleResize();

    setPathName(window.location.pathname);

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  function toggleSidebar() {
    setIsCollapsed(!isCollapsed);
  }

  return (
    <div className="relative min-w-[80px] border-r px-3  pb-10 pt-24 ">
      {!mobileWidth && (
        <div className="absolute right-[-20px] top-7">
          <Button
            onClick={toggleSidebar}
            variant="secondary"
            className=" rounded-full p-2"
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
            href: "",
            icon: LayoutDashboard,
            variant: "default"
          },
          {
            title: "Itinerary",
            href: `${pathName}/itinerary`,
            icon: Route,
            variant: "ghost"
          },
          {
            title: "Polls",
            href: `${pathName}/polls`,
            icon: Vote,
            variant: "ghost"
          },
          {
            title: "Broadcast",
            href: `${pathName}/broadcast`,
            icon: AudioLines,
            variant: "ghost"
          },
          {
            title: "Budget",
            href: `${pathName}/budget`,
            icon: CircleDollarSign,
            variant: "ghost"
          }
        ]}
      />
    </div>
  );
}
