import { createClient } from '@/utils/supabase/server';
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const supabase = createClient();

  try {
    const { email, password, origin} = await request.json();

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${origin}/auth/callback`,
      },
    });

    if (error) {
      return NextResponse.json({ error: 'Could not sign up user' }, { status: 400 });
    }

    return NextResponse.json({ message: 'Check email to continue sign in process' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'An error occurred while processing the request' }, { status: 500 });
  }
}