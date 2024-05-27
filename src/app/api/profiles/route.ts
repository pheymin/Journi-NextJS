import { createClient } from '@/utils/supabase/server';
import { NextResponse } from "next/server";

export async function GET(request: Request) {
    const supabase = createClient();

    try {
        //get current user
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }
        const { data, error } = await supabase.from('profiles').select().neq('id', user.id);
        if (error) {
            console.error(error);
            return NextResponse.json({ error: 'Could not fetch users' }, { status: 400 });
        }
        return NextResponse.json(data, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: 'An error occurred while processing the request' }, { status: 500 });
    }
}