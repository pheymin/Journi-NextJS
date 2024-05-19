import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
    const requestUrl = new URL(request.url);
    const origin = requestUrl.origin;

    // Extract token and type from the URL search parameters
    const token = requestUrl.searchParams.get("token_hash");
    const type = requestUrl.searchParams.get("type");

    // Ensure token and type are correct
    if (!token || type !== "magiclink") {
        return NextResponse.redirect(`${origin}/auth/error`);
    }

    const supabase = createClient();

    // Verify OTP with Supabase
    const { error } = await supabase.auth.verifyOtp({ token_hash: token, type: "magiclink" });

    // Handle error if verification fails
    if (error) {
        return NextResponse.redirect(`${origin}/auth/error`);
    }

    // Redirect to profile page upon successful verification
    return NextResponse.redirect(`${origin}/dashboard`);
}