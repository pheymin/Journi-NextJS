import { createClient } from '@/utils/supabase/server';
import { NextResponse } from "next/server";

export async function GET(request: Request) {
    const supabase = createClient();

    try {
        let { data: place_categories, error } = await supabase
            .from('place_categories')
            .select("*")

        if (error) {
            console.error(error);
            return NextResponse.json({ error: 'Could not fetch place categories' }, { status: 400 });
        }

        return NextResponse.json(place_categories, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: 'An error occurred while processing the request' }, { status: 500 });
    }
}