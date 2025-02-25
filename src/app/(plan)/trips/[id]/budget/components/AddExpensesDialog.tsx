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
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Calendar } from "@/components/ui/calendar"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { EXPENSES_CATEGORY } from "@/utils/constant";

export default function AddExpensesDialog({ trip_id, user_id }: { trip_id: string, user_id: string}) {
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
                    <Button variant="outline" className="bg-[#baff66] border py-2 text-black mb-2 hover:text-[#baff66] hover:bg-[#0c1f19] hover:border-[#baff66] px-6">Add Expenses</Button>
                </DrawerTrigger>
                <DrawerContent>
                    <DrawerHeader className="text-left">
                        <DrawerTitle>Add Expenses</DrawerTitle>
                        <DrawerDescription>
                            Set a Expenses for your trip.
                        </DrawerDescription>
                    </DrawerHeader>
                    <ExpensesForm trip_id={trip_id} user_id={user_id} className="px-4" />
                </DrawerContent>
            </Drawer>
        )
    }

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="outline" className="bg-[#baff66] border py-2 text-black mb-2 hover:text-[#baff66] hover:bg-[#0c1f19] hover:border-[#baff66] px-6">Add Expenses</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] max-w-sm">
                <DialogHeader>
                    <DialogTitle>Add Expenses</DialogTitle>
                    <DialogDescription>
                        Set a Expenses for your trip.
                    </DialogDescription>
                </DialogHeader>
                <ExpensesForm trip_id={trip_id} user_id={user_id}/>
            </DialogContent>
        </Dialog>
    )
}

type ExpensesFormProps = React.ComponentProps<'form'> & { trip_id: string } & { user_id: string };

const FormSchema = z.object({
    expenses: z.preprocess((value) => Number(value), z.number().int().positive().min(1).max(1000000)),
    category: z.string({ message: "Please select a category" }),
    description: z.string().optional(),
    date: z.date({ message: "Please select a date" }),
});

const ExpensesForm: React.FC<ExpensesFormProps> = ({ className, trip_id, user_id }) => {
    const { toast } = useToast();

    const form = useForm<z.infer<typeof FormSchema>>({
        resolver: zodResolver(FormSchema),
        defaultValues: {
            date: new Date(),
        },
    });

    const onSubmit = (formData: z.infer<typeof FormSchema>) => {
        const supabase = supabaseBrowser();

        const createExpenses = async () => {
            const { data, error } = await supabase
                .from("expenses")
                .insert({
                    trip_id: trip_id,
                    user_id: user_id,
                    expenses_amount: formData.expenses,
                    expenses_category: formData.category,
                    expenses_description: formData.description,
                    expenses_date: formData.date,
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
                description: 'Expenses set successfully',
            });

            window.location.reload();
        };
        createExpenses();
    };

    return (
        <Form {...form}>
            <form className={className} onSubmit={form.handleSubmit(onSubmit)}>
                <div className="grid gap-4 py-4">
                    <FormField
                        control={form.control}
                        name="expenses"
                        render={({ field }) => (
                            <FormItem className="w-full">
                                <FormLabel>
                                    Expenses
                                </FormLabel>
                                <FormControl>
                                    <Input {...field} placeholder="0" type="number" className="w-full" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="category"
                        render={({ field }) => (
                            <FormItem className="w-full">
                                <FormLabel>Category</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Select a category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectGroup>
                                            {EXPENSES_CATEGORY.map((category) => (
                                                <SelectItem key={category} value={category}>
                                                    {category}
                                                </SelectItem>
                                            ))}
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                            <FormItem className="w-full">
                                <FormLabel>
                                    Description
                                </FormLabel>
                                <FormControl>
                                    <Textarea {...field} placeholder="Enter description" className="w-full" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="date"
                        render={({ field }) => (
                            <FormItem className="flex flex-col">
                                <FormLabel>Date</FormLabel>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <FormControl>
                                            <Button
                                                variant={"outline"}
                                                className={cn(
                                                    "w-full pl-3 text-left font-normal",
                                                    !field.value && "text-muted-foreground"
                                                )}
                                            >
                                                {field.value ? (
                                                    format(field.value, "PPP")
                                                ) : (
                                                    <span>Pick a date</span>
                                                )}
                                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                            </Button>
                                        </FormControl>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                        <Calendar
                                            mode="single"
                                            selected={field.value}
                                            onSelect={field.onChange}
                                            disabled={(date) =>
                                                date > new Date() || date < new Date("1900-01-01")
                                            }
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <SubmitButton
                        className="w-full md:w-2/5 ml-auto items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80 h-9 px-4 py-2"
                        pendingText="Adding..."
                    >
                        Add Expenses
                    </SubmitButton>
                </div>
            </form>
        </Form>
    );
};