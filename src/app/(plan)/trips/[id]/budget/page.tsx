import BudgetOverview from './components/BudgetOverview';
import Expenses from './components/Expenses';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"
import { createClient } from "@/utils/supabase/server";

export default async function Page({ params }: { params: { id: string } }) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        console.error("User not authenticated");
        return;
    }
    
    return (
        <div className="p-2 md:p-4">
            <div className="w-full h-full space-y-3">
                <div>
                    <h3 className="font-semibold text-xl leading-none tracking-tight mb-2">Budget</h3>
                    <p className="text-sm text-muted-foreground">Track your expenses and budget for your trip.</p>
                </div>
                <hr />
                <Accordion type="single" collapsible defaultValue="item-1">
                    <AccordionItem value="item-1">
                        <AccordionTrigger>Overview</AccordionTrigger>
                        <AccordionContent>
                            <BudgetOverview trip_id={params.id} />
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
                <Accordion type="single" collapsible defaultValue="item-1">
                    <AccordionItem value="item-1">
                        <AccordionTrigger>Expenses</AccordionTrigger>
                        <AccordionContent>
                            <Expenses trip_id={params.id} user_id={user.id} />
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </div>
        </div>
    );
}
