import ParticipantsCard from "./components/ParticipantsCard";
import BudgetCard from "./components/BudgetCard";
import Sections from "./components/Sections";
import Map from "./components/Map";

export default async function Page({ params }: { params: { id: string } }) {
    return (
        <div className="grid md:grid-cols-2 gap-2">
            <div className="flex flex-col p-2 md:p-4">
                <div className="flex flex-row gap-2 w-full">
                    <ParticipantsCard trip_id={params.id} />
                    <BudgetCard trip_id={params.id} />
                </div>
                <Sections trip_id={params.id} />
            </div>
            <div className="h-[400px] md:h-full">
                <Map trip_id={params.id} />
            </div>
        </div>
    );
}