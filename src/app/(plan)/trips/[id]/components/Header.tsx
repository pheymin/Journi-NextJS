import { createClient } from "@/utils/supabase/server";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import TripDetails from "./TripDetails"
import { AddTripmateDialog } from "./AddTripmateDialog";

export default async function Header(params: any) {
    const supabase = createClient();
    const trip_id = parseInt(params.tripId);

    const { data: tripData, error } = await supabase.rpc('get_trip_details', { param_trip_id: trip_id });

    //if tripData is empty, return a 404 page
    if (!tripData) {
        return <div>404 - Not Found</div>;
    }

    const placeDetailsResponse = await fetch(`https://maps.googleapis.com/maps/api/place/details/json?place_id=${tripData[0].place_id}&fields=photo&key=${process.env.NEXT_PUBLIC_MAPS_API_KEY}`);
    const placeDetails = await placeDetailsResponse.json();
    let cover = 'https://source.unsplash.com/1600x900/?nature,water';

    if (placeDetails.result && placeDetails.result.photos && placeDetails.result.photos.length > 0) {
        const photoReference = placeDetails.result.photos[0].photo_reference;
        cover = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${photoReference}&key=${process.env.NEXT_PUBLIC_MAPS_API_KEY}`;
    }

    return (
        <div className="w-full h-[280px] bg-cover bg-repeat-x" style={{ backgroundImage: `url(${cover})`, backgroundPosition: 'center' }}>
            <div className="h-full flex flex-col justify-center items-center space-y-4 backdrop-blur-sm backdrop-brightness-50">
                <div className="flex flex-col space-y-2 text-center items-center">
                    <TripDetails tripData={tripData[0]} />
                </div>
                <div className="bg-white text-black px-3 py-2 rounded-xl flex justify-between space-x-10">
                    <div className="flex items-center space-x-2">
                        <Avatar className="size-8">
                            <AvatarImage src=
                                {tripData[0]?.host_avatar_url ? (
                                    tripData[0].host_avatar_url
                                ) : (
                                    `https://source.boringavatars.com/marble/120/${tripData[0].host_email}`
                                )} alt="Avatar" className="object-cover"/>
                            <AvatarFallback>JN</AvatarFallback>
                        </Avatar>
                        <p>{tripData[0]?.host_username ? (tripData[0].host_username) : tripData[0].host_email}</p>
                        <Badge className="bg-[#baff66]">Host</Badge>
                    </div>
                    <div className="flex space-x-2">
                        {tripData[0].participant_user_id?.length > 0 && (
                            <div className="flex flex-row-reverse justify-end space-x-reverse *:ring *:ring-white">
                                {tripData.map((trip: any) => (
                                    <Avatar className="size-8" key={trip.participant_user_id}>
                                        <AvatarImage src=
                                            {trip.participant_avatar_url ? (
                                                trip.participant_avatar_url
                                            ) : (
                                                `https://source.boringavatars.com/marble/120/${trip.participant_email}`
                                            )} alt="Avatar" />
                                        <AvatarFallback>{trip.username}</AvatarFallback>
                                    </Avatar>
                                ))}
                            </div>
                        )}
                        <AddTripmateDialog tripData={tripData[0]} />
                    </div>
                </div>
            </div>
        </div>
    );
}