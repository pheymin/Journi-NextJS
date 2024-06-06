import { createClient } from "@/utils/supabase/server";

export default async function Page({ params }: { params: { id: string } }) {
    const supabase = createClient();

    return (
        <div>
            <h1>Itinerary</h1>
        </div>
    );
}