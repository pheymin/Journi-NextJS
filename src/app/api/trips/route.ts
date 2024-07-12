import { createClient } from '@/utils/supabase/server';

export async function GET(request: Request) {
    const supabase = createClient();
    //get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
        return new Response(JSON.stringify({ error: 'User not found' }), { status: 404 });
    }

    try {
        const { data, error } = await supabase.rpc('get_trip_plans', { user_id: user.id });

        if (error) {
            console.error(error);
            return new Response(JSON.stringify({ error: 'Could not fetch trips' }), { status: 400 });
        }

        // Use data.place_id to get place photo for each trip plan
        const enhancedData = await Promise.all(data.map(async (trip: any) => {
            const {data, error} = await supabase.from('POI').select('image_url').eq('place_id', trip.place_id);
            if (error) {
                console.error(error);
                return trip;
            }
            
            let image = data[0]?.image_url || 'https://source.unsplash.com/1600x900/?nature,water';
            return {
                ...trip,
                image
            }
        }));

        return new Response(JSON.stringify(enhancedData), { status: 200 });
    } catch (error) {
        console.error('An error occurred while processing the request:', error);
        return new Response(JSON.stringify({ error: 'An error occurred while processing the request' }), { status: 500 });
    }
}

export async function POST(request: Request) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const { place_id, place_name, types, dates, tripmates = [] } = await request.json();

    const title = `Trip to ${place_name}`;
    if (!user) {
        return new Response(JSON.stringify({ error: 'User not found' }), { status: 404 });
    }

    try {
        const { data, error } = await supabase.from('trips').insert([{
            title,
            start_date: dates.from,
            end_date: dates.to,
            description: null,
            place_name,
            types,
            user_id: user.id,
            place_id
        }]).select();

        if (error) {
            console.error(error);
            return new Response(JSON.stringify({ error: 'Could not create trip' }), { status: 400 });
        }

        const trip_id = data[0].trip_id;

        if (tripmates.length > 0) {
            const participants = tripmates.map((tripmate: any) => {
                return {
                    trip_id,
                    user_id: tripmate.value
                }
            });

            const { error: participantsError } = await supabase.from('trip_participants').insert(participants);

            if (participantsError) {
                console.error(participantsError);
                return new Response(JSON.stringify({ error: 'Could not add participant to trip' }), { status: 400 });
            }
        }
        return new Response(JSON.stringify(data), { status: 201 });
    } catch (error) {
        console.error(error);
        return new Response(JSON.stringify({ error: 'An error occurred while processing the request' }), { status: 500 });
    }
}