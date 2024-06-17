"use client";
import React, { useEffect, useState, useRef } from "react";
import { useGoogleMapsLoader } from "@/utils/googleMapsLoader";
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { POI_COLORS } from "@/utils/constant";

type Props = {
    POI: any;
    sections_poi: any;
}

const GoogleMap = ({ POI, sections_poi }: Props) => {
    const [map, setMap] = useState<google.maps.Map | null>(null);
    const { isLoaded } = useGoogleMapsLoader();
    const mapRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isLoaded && mapRef.current) {
            const googleMap = new google.maps.Map(mapRef.current, {
                center: POI.geometry.location,
                zoom: 10,
                mapId: process.env.NEXT_PUBLIC_MAP_ID
            });

            setMap(googleMap);
            setMarkers();
        }
    }, [isLoaded]);

    useEffect(() => {
        if (map) {
            setMarkers();
        }
    }, [map]);

    function setMarkers() {
        if (!map) return;

        if (sections_poi) {
            sections_poi.forEach((section: any, index: number) => {
                section.section_poi.forEach((poi: any) => {
                    const marker = new google.maps.marker.AdvancedMarkerElement({
                        position: poi.POI.geometry.location,
                        map: map,
                        title: poi.POI.name,
                        content: setStyle(poi.sequence_num, index),
                    });
                });
            });
        }
    }

    return (
        <>
            {isLoaded ?
                <div ref={mapRef} style={{ width: "100%", height: "100%" }}></div>
                :
                <div className="flex justify-center min-h-screen items-center">
                    <Loader2 className={cn('h-4 w-4 animate-spin', 'mr-2')} />
                    <p>Loading map...</p>
                </div>
            }
        </>
    )
}

const setStyle = (number: number, section: number): HTMLElement => {
    const sectionColors = POI_COLORS;
    const color = sectionColors[section % sectionColors.length];

    const content = document.createElement("div");
    content.style.position = "relative";
    content.style.display = "inline-block";

    const icon = document.createElement("div");
    icon.innerHTML = `<svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="map-marker-alt" class="svg-inline--fa fa-map-marker-alt fa-w-12" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512"><path fill="${color}" d="M172.268 501.67C6.69 279.56 0 272.24 0 192 0 86 86 0 192 0s192 86 192 192c0 80.24-6.69 87.56-172.268 309.67-12.61 17.26-39.863 17.26-52.464 0zM192 272c-44.11 0-80-35.89-80-80s35.89-80 80-80 80 35.89 80 80-35.89 80-80 80z"></path></svg>`;
    icon.style.position = "relative";
    icon.style.fontSize = "36px";

    const numberSpan = document.createElement("span");
    numberSpan.style.position = "absolute";
    numberSpan.style.top = "45%";
    numberSpan.style.left = "50%";
    numberSpan.style.transform = "translate(-50%, -50%)";
    numberSpan.style.color = "#000";
    numberSpan.style.fontWeight = "bold";
    numberSpan.textContent = number.toString();

    content.appendChild(icon);
    content.appendChild(numberSpan);

    return content;
}

export default GoogleMap
