import { createClient } from '@/utils/supabase/server';
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const supabase = createClient();

  try {
    const { email, password } = await request.json();

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return NextResponse.json({ error: 'Invalid login credentials' }, { status: 400 });
    }

    return NextResponse.json({ message: 'Successfully authenticated user' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'An error occurred while processing the request' }, { status: 500 });
  }
}