"use client";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserPlus } from '@fortawesome/free-solid-svg-icons';
import * as z from 'zod';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { useForm, SubmitHandler } from 'react-hook-form';
import MultipleSelector, { Option } from '@/components/ui/multiple-selector';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState, useEffect } from 'react';
import { LoadingButton } from '@/components/ui/loading-button';
import { toast } from '@/components/ui/use-toast';
import { supabaseBrowser } from "@/utils/supabase/client";

const tripmatesSchema = z.object({
    label: z.string(),
    value: z.string(),
    disable: z.boolean().optional(),
});

const FormSchema = z.object({
    tripmates: z.array(tripmatesSchema),
});

export function AddTripmateDialog({ tripData }: { tripData: any }) {
    const supabase = supabaseBrowser();
    const form = useForm<z.infer<typeof FormSchema>>({
        resolver: zodResolver(FormSchema)
    });

    const mockSearch = async (value: string): Promise<Option[]> => {
        return new Promise((resolve) => {
            setTimeout(() => {
                const res = users.filter((option) => option.label.includes(value));
                resolve(res);
            }, 1000);
        });
    };

    const [users, setUsers] = useState<Option[]>([]);
    const [isTriggered, setIsTriggered] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchUsers = async () => {
            const { data, error } = await supabase
                .rpc('get_available_profiles', { param_trip_id: tripData.trip_id });

            if (error) {
                console.error('Error fetching users:', error);
            } else {
                const userOptions = data.map((user: any) => ({
                    value: user.id,
                    label: user.email,
                }));
                setUsers(userOptions);
            }
        };

        fetchUsers();
    }, [tripData.trip_id]);

    const onSubmit: SubmitHandler<z.infer<typeof FormSchema>> = async (data) => {
        setLoading(true);
        try {
            const tripmates = data.tripmates ?? [];

            if (tripmates.length > 0) {
                const { error: insertError } = await supabase.from('trip_participants').insert(tripmates.map((tripmate) => ({
                    trip_id: tripData.trip_id,
                    user_id: tripmate.value,
                })));

                if (insertError) {
                    throw new Error(insertError.message);
                }

                const emailResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_API_URL}/send`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        title: tripData.title,
                        emailRedirectTo: `${window.location.origin}/trips/${tripData.trip_id}`,
                        invitees: tripmates.map((tripmate) => tripmate.label),
                    }),
                });

                if (!emailResponse.ok) {
                    throw new Error('Failed to send invitation emails');
                }

                toast({
                    title: 'Tripmate added',
                    description: 'Tripmate has been added successfully',
                });

                form.reset();
                window.location.reload();
            } else {
                toast({
                    variant: 'destructive',
                    title: 'Error',
                    description: 'Please select at least one tripmate',
                });
            }

        } catch (error: any) {
            console.error('Error:', error);
            toast({
                variant: 'destructive',
                title: 'Error',
                description: error.message,
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="ghost">
                    <FontAwesomeIcon icon={faUserPlus} className='w-5' />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Add Tripmate</DialogTitle>
                    <DialogDescription>
                        Make changes to your profile here. Click save when you're done.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-5 py-4">
                        <FormField
                            control={form.control}
                            name="tripmates"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Invite tripmates</FormLabel>
                                    <FormControl>
                                        <MultipleSelector
                                            {...field}
                                            className="col-span-3"
                                            onSearch={async (value) => {
                                                setIsTriggered(true);
                                                const res = await mockSearch(value);
                                                setIsTriggered(false);
                                                return res;
                                            }}
                                            placeholder="Search by name or enter email"
                                            loadingIndicator={
                                                <p className="py-2 text-center text-lg leading-10 text-muted-foreground">loading...</p>
                                            }
                                            emptyIndicator={
                                                <p className="w-full text-center text-lg leading-10 text-muted-foreground">
                                                    no results found.
                                                </p>
                                            }
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <LoadingButton loading={loading} type="submit" className="bg-[#baff66] border py-2 text-black mb-2 hover:text-[#baff66] hover:bg-[#0c1f19] hover:border-[#baff66] px-6">
                            Submit
                        </LoadingButton>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
