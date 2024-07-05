"use client"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    Drawer,
    DrawerContent,
    DrawerDescription,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
} from "@/components/ui/drawer"
import { Button } from "@/components/ui/button";
import { SubmitButton } from "@/components/submit-button";
import { useToast } from "@/components/ui/use-toast";
import React, { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { supabaseBrowser } from "@/utils/supabase/client";
import { Input } from "@/components/ui/input";

export default function AddBudgetDialog({ trip_id }: { trip_id: string}) {
    const [open, setOpen] = useState(false)
    const [mobileWidth, setMobileWidth] = useState(false);

    const handleResize = () => {
        setMobileWidth(window.innerWidth < 768);
    };

    useEffect(() => {
        handleResize();

        window.addEventListener("resize", handleResize);

        return () => {
            window.removeEventListener("resize", handleResize);
        };
    }, []);

    if (mobileWidth) {
        return (
            <Drawer open={open} onOpenChange={setOpen}>
                <DrawerTrigger asChild>
                    <Button variant="outline" className="bg-[#baff66] border py-2 text-black mb-2 hover:text-[#baff66] hover:bg-[#0c1f19] hover:border-[#baff66] px-6">Set Budget</Button>
                </DrawerTrigger>
                <DrawerContent>
                    <DrawerHeader className="text-left">
                        <DrawerTitle>Set Budget</DrawerTitle>
                        <DrawerDescription>
                            Set a budget for your trip.
                        </DrawerDescription>
                    </DrawerHeader>
                    <BudgetForm trip_id={trip_id} className="px-4" />
                </DrawerContent>
            </Drawer>
        )
    }

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="outline" className="bg-[#baff66] border py-2 text-black mb-2 hover:text-[#baff66] hover:bg-[#0c1f19] hover:border-[#baff66] px-6">Set Budget</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] max-w-sm">
                <DialogHeader>
                    <DialogTitle>Set Budget</DialogTitle>
                    <DialogDescription>
                        Set a budget for your trip.
                    </DialogDescription>
                </DialogHeader>
                <BudgetForm trip_id={trip_id} />
            </DialogContent>
        </Dialog>
    )
}

type BudgetFormProps = React.ComponentProps<'form'>  & { trip_id: string };

const FormSchema = z.object({
    budget: z.preprocess((value) => Number(value), z.number().int().positive().min(1)),
});

const BudgetForm: React.FC<BudgetFormProps> = ({ className, trip_id }) => {
    const { toast } = useToast();

    const form = useForm<z.infer<typeof FormSchema>>({
        resolver: zodResolver(FormSchema),
    });

    const onSubmit = (formData: z.infer<typeof FormSchema>) => {
        const supabase = supabaseBrowser();
        const { budget } = formData;

        const createBudget = async () => {
            const { data, error } = await supabase
                .from("budget")
                .insert({
                    trip_id: trip_id,
                    budget_amount: budget,
                });

            if (error) {
                toast({
                    variant: 'destructive',
                    title: 'Error!',
                    description: error.message,
                });
                return;
            };

            toast({
                title: 'Success!',
                description: 'Budget set successfully',
            });

            window.location.reload();
        };
        createBudget();
    };

    return (
        <Form {...form}>
            <form className={className} onSubmit={form.handleSubmit(onSubmit)}>
                <div className="grid gap-4 py-4">
                    <div className="flex space-x-2 w-full">
                        <FormField
                            control={form.control}
                            name="budget"
                            render={({ field }) => (
                                <FormItem className="w-full">
                                    <FormLabel>
                                        Budget
                                    </FormLabel>
                                    <FormControl>
                                        <Input {...field} placeholder="Enter budget" type="number" className="w-full" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                    <SubmitButton
                        className="w-full md:w-1/5 ml-auto items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80 h-9 px-4 py-2"
                        pendingText="Setting..."
                    >
                        Set Budget
                    </SubmitButton>
                </div>
            </form>
        </Form>
    );
};