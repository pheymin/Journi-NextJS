import { createClient } from "@/utils/supabase/server";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import Link from 'next/link';

type Props = {
    trip_id: string;
};

export default async function ParticipantsCard({ trip_id }: Props) {
    const supabase = createClient();

    //fetch budget data
    const { data, error } = await supabase
        .from("budget")
        .select(`*`)
        .eq("trip_id", trip_id);

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle>Budgeting</CardTitle>
            </CardHeader>
            <CardContent>
                {data?.length === 0 ? (
                    <p className="font-bold text-3xl">MYR 0</p>
                ) : (
                    data?.map((budget: any) => (
                        <div key={budget.id}>
                            <p>{budget.amount}</p>
                        </div>
                    ))
                )}
                <Link href={`/plan/trips/${trip_id}/budget`} className="text-blue-500">
                    View details
                </Link>
            </CardContent>
        </Card>
    );
}