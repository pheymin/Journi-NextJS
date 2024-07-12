import { createClient } from "@/utils/supabase/server";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import Link from 'next/link';
import { FormattedAmount } from "@/components/FormattedAmount";

type Props = {
    trip_id: string;
};

export default async function ParticipantsCard({ trip_id }: Props) {
    const supabase = createClient();

    //fetch budget data
    const { data, error } = await supabase
        .from("budget")
        .select(`*`)
        .eq("trip_id", trip_id)
        .single();

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle>Budgeting</CardTitle>
            </CardHeader>
            <CardContent>
                {data ? (
                    <p className="font-bold text-3xl"><FormattedAmount amount={data.budget_amount} /></p>
                ) : (
                    <p className="font-bold text-3xl"><FormattedAmount amount={0} /></p>
                )}
                <Link href={`/trips/${trip_id}/budget`} className="text-blue-500">
                    View details
                </Link>
            </CardContent>
        </Card>
    );
}