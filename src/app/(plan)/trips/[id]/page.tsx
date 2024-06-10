import ParticipantsCard from "./components/ParticipantsCard";
import BudgetCard from "./components/BudgetCard";

export default async function Page({ params }: { params: { id: string } }) {

    return (
        <div>
            <div className="flex flex-row gap-2 w-full">
                <ParticipantsCard trip_id={params.id} />
                <BudgetCard trip_id={params.id} />
            </div>
        </div>
    );
}