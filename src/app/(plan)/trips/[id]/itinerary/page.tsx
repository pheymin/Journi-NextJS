import { createClient } from "@/utils/supabase/server";

export default async function Page({ params }: { params: { id: string } }) {
    const supabase = createClient();

    return (
        <div>
            <h1>Polls</h1>
            <ActivePolls />
            <ClosedPolls />
        </div>
    );
}

function ActivePolls() {
    return (
        <div>
            <h1>Active Polls</h1>
        </div>
    );
}

function ClosedPolls() {
    return (
        <div>
            <h1>Closed Polls</h1>
        </div>
    );
}