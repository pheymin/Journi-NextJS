"use client";
import React, { useEffect, useState, useRef, useMemo } from "react";
import { useGoogleMapsLoader } from "@/utils/googleMapsLoader";
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { POI_COLORS } from "@/utils/constant";

type Props = {
    POI: any;
    sections_poi?: any | null;
    itinerary_poi?: any | null;
}

const GoogleMap = ({ POI, sections_poi, itinerary_poi }: Props) => {
    const [map, setMap] = useState<google.maps.Map | null>(null);
    const { isLoaded } = useGoogleMapsLoader();
    const mapRef = useRef<HTMLDivElement>(null);
    const markersRef = useRef<google.maps.Marker[]>([]);

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
    }, [isLoaded, POI]);

    useEffect(() => {
        if (map && sections_poi || itinerary_poi) {
            clearMarkers();
            setMarkers();
        }
    }, [map, sections_poi]);

    function clearMarkers() {
        markersRef.current.forEach(marker => marker.setMap(null));
        markersRef.current = [];
    }    

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
                        gmpClickable: true,
                    });

                    marker.addListener('click', () => {
                        const infoWindow = new google.maps.InfoWindow({
                            content: infoWindowStyle(poi.POI)
                        });

                        infoWindow.open(map, marker);
                    });

                });
            });
        }

        if (itinerary_poi) {
            itinerary_poi.forEach((itinerary: any, index: number) => {
                itinerary.itinerary_poi.forEach((poi: any) => {
                    const marker = new google.maps.marker.AdvancedMarkerElement({
                        position: poi.POI.geometry.location,
                        map: map,
                        title: poi.POI.name,
                        content: setStyle(poi.sequence_num, index),
                        gmpClickable: true,
                    });

                    marker.addListener('click', () => {
                        const infoWindow = new google.maps.InfoWindow({
                            content: infoWindowStyle(poi.POI)
                        });

                        infoWindow.open(map, marker);
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

const infoWindowStyle = (poi: any) => {
    if (!poi) {
        return '';
    }

    const image = poi.image_url ? `<img src="${poi.image_url}" alt="${poi.name}" style="width: 100%;height: 150px;object-fit: cover;border-radius: 0.5rem;">` : '';
    const name = poi.name ? `<a href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(poi.name)}&query_place_id=${poi.place_id}" target="_blank" rel="noopener noreferrer" style="font-size: 1.25rem;font-weight: bold;margin: 0.5rem 0;">${poi.name}</a>` : '';
    const address = poi.address ? `<p style="margin-bottom: 0.5rem;">${poi.address}</p>` : '';
    const types = poi.types ? poi.types.map((type: string) => `<span style="background-color: #f5f5f5;border: 1px solid #e0e0e0;border-radius: 0.25rem;padding: 0.25rem;margin: 0.25rem;">${type}</span>`).join('') : '';
    const rating = poi.rating ? `<div style="display: flex;align-items: center; color: #f5a623;font-weight: bold;">
            <svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="star" class="svg-inline--fa fa-star fa-w-18" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512" style="color: #f5a623;"><path fill="currentColor" d="M288 4.6l70.1 158.5 175.9 16.2c19.6 1.8 27.6 27.1 12.9 41L431.7 286.3l41.8 174.7c4.6 19.4-16.2 34.1-32.3 25.4L288 391.7 136.9 486.4c-16.1 8.7-36.9-6-32.3-25.4l41.8-174.7L19.1 220.3c-14.7-13.9-6.7-39.2 12.9-41l175.9-16.2L288 4.6z"></path></svg>
            <span>${poi.rating}</span>
        </div>` : '';

    return `
    <div style="color: #000;width: fit-content;">
        ${image}
        ${name}
        ${address}
        <div style="display: flex;flex-wrap: wrap;flex-direction: row;align-items: center;margin-bottom: 0.5rem;">
            ${types}
        </div>
        ${rating}
    </div>`;
};

export default GoogleMap
