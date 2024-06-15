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
import { Textarea } from "@/components/ui/textarea"
import { supabaseBrowser } from "@/utils/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function AddBroadcastDialog({ trip_id, user }: { trip_id: string, user: any }) {
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
                    <Button variant="outline" className="bg-[#baff66] border py-2 text-black mb-2 hover:text-[#baff66] hover:bg-[#0c1f19] hover:border-[#baff66] px-6">New Broadcast</Button>
                </DrawerTrigger>
                <DrawerContent>
                    <DrawerHeader className="text-left">
                        <DrawerTitle>New Broadcast</DrawerTitle>
                        <DrawerDescription>
                            Send a message to all members of the group.
                        </DrawerDescription>
                    </DrawerHeader>
                    <BroadcastForm user={user.id} trip_id={trip_id} className="px-4" />
                </DrawerContent>
            </Drawer>
        )
    }

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="outline" className="bg-[#baff66] border py-2 text-black mb-2 hover:text-[#baff66] hover:bg-[#0c1f19] hover:border-[#baff66] px-6">New Broadcast</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] max-w-sm">
                <DialogHeader>
                    <DialogTitle>New Broadcast</DialogTitle>
                    <DialogDescription>
                        Send a message to all members of the group.
                    </DialogDescription>
                </DialogHeader>
                <BroadcastForm user={user} trip_id={trip_id} />
            </DialogContent>
        </Dialog>
    )
}

type BroadcastFormProps = React.ComponentProps<'form'> & { user: any } & { trip_id: string };

const FormSchema = z.object({
    message:
        z.string()
            .min(2, {
                message: "Message must be at least 2 characters.",
            })
            .max(160, {
                message: "Message must not be longer than 30 characters.",
            }),
});

const BroadcastForm: React.FC<BroadcastFormProps> = ({ className, user, trip_id }) => {
    const { toast } = useToast();

    const form = useForm<z.infer<typeof FormSchema>>({
        resolver: zodResolver(FormSchema),
    });

    const onSubmit = (formData: z.infer<typeof FormSchema>) => {
        const supabase = supabaseBrowser();
        const { message } = formData;

        const createBroadcast = async () => {
            const { data, error } = await supabase
                .from("broadcast")
                .insert({
                    trip_id: trip_id,
                    user_id: user.id,
                    content: message,
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
                description: 'Broadcast sent successfully',
            });

            window.location.reload();
        };
        createBroadcast();
    };

    return (
        <Form {...form}>
            <form className={className} onSubmit={form.handleSubmit(onSubmit)}>
                <div className="grid gap-4 py-4">
                    <div className="flex space-x-2 w-full">
                        <Avatar className="size-9">
                            <AvatarImage
                                src={
                                    user.avatar_url ? user.avatar_url :
                                    `https://source.boringavatars.com/marble/120/${user.email}`
                                }
                                alt="Avatar"
                            />
                            <AvatarFallback>JN</AvatarFallback>
                        </Avatar>
                        <FormField
                            control={form.control}
                            name="message"
                            render={({ field }) => (
                                <FormItem className="w-full">
                                    <FormLabel>
                                    {user.username ? `@${user.username}` :
                                        user.full_name ? user.full_name :
                                        user.email}
                                    </FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Write your message here"
                                            className="resize-none"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                    <SubmitButton
                        className="w-full md:w-1/5 ml-auto items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80 h-9 px-4 py-2"
                        pendingText="Posting..."
                    >
                        Post
                    </SubmitButton>
                </div>
            </form>
        </Form>
    );
};