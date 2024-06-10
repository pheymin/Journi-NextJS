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
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button";
import { SubmitButton } from "@/components/submit-button";
import { useToast } from "@/components/ui/use-toast";
import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
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

export default function AddPollDialog({ trip_id, user }: { trip_id: string, user: any }) {
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
                    <Button variant="outline" className="bg-[#baff66] border py-2 text-black mb-2 hover:text-[#baff66] hover:bg-[#0c1f19] hover:border-[#baff66] px-6">Create Poll</Button>
                </DrawerTrigger>
                <DrawerContent>
                    <DrawerHeader className="text-left">
                        <DrawerTitle>Create Poll</DrawerTitle>
                        <DrawerDescription>
                            Create a new poll for the trip.
                        </DrawerDescription>
                    </DrawerHeader>
                    <PollForm user={user.id} trip_id={trip_id} className="px-4" />
                </DrawerContent>
            </Drawer>
        )
    }

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="outline" className="bg-[#baff66] border py-2 text-black mb-2 hover:text-[#baff66] hover:bg-[#0c1f19] hover:border-[#baff66] px-6">Create Poll</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] max-w-sm">
                <DialogHeader>
                    <DialogTitle>Create Poll</DialogTitle>
                    <DialogDescription>
                        Write a custom question with atleast two answers.
                    </DialogDescription>
                </DialogHeader>
                <PollForm user={user.id} trip_id={trip_id} />
            </DialogContent>
        </Dialog>
    )
}

type PollFormProps = React.ComponentProps<'form'> & { user: String } & { trip_id: string };

const FormSchema = z.object({
    question: z.string().nonempty({ message: 'Question is required' }),
    answers: z
        .array(z.string().nonempty({ message: 'Answer is required' }))
        .min(2, { message: 'At least two answers are required' })
        .max(10, { message: 'Maximum of 10 answers allowed' }),
});

const PollForm: React.FC<PollFormProps> = ({ className, user, trip_id }) => {
    const { toast } = useToast();
    const [answers, setAnswers] = useState<string[]>(['', '']);

    const form = useForm<z.infer<typeof FormSchema>>({
        resolver: zodResolver(FormSchema),
        defaultValues: {
            answers,
        },
    });

    const onSubmit = (formData: z.infer<typeof FormSchema>) => {
        const supabase = supabaseBrowser();
        const { question, answers } = formData;

        const createPoll = async () => {
            const { data, error } = await supabase.rpc('create_poll', {
                question,
                answers,
                user_uuid: user,
                trip_id: trip_id,
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
                title: 'Poll created!',
                description: 'Your poll has been created successfully.',
            });

            window.location.reload();
        };
        createPoll();
    };

    const handleAddAnswer = (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
        if (answers.length < 10) {
            setAnswers([...answers, '']);
        } else {
            toast({
                variant: 'destructive',
                title: 'Error!',
                description: 'Maximum of 10 answers allowed',
            });
        }
    };

    const handleRemoveAnswer = (event: React.MouseEvent<HTMLButtonElement>, index: number) => {
        event.preventDefault();
        setAnswers(answers.filter((_, i) => i !== index));
    };

    const handleAnswerChange = (index: number, value: string) => {
        const newAnswers = answers.slice();
        newAnswers[index] = value;
        setAnswers(newAnswers);
    };

    return (
        <Form {...form}>
            <form className={className} onSubmit={form.handleSubmit(onSubmit)}>
                <div className="grid gap-4 py-4">
                    <div className="grid items-center gap-4">
                        <FormField
                            control={form.control}
                            name="question"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Question</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Write your question" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                    <div className="grid items-center gap-4">
                        {answers.map((answer, index) => (
                            <FormField
                                key={index}
                                control={form.control}
                                name={`answers.${index}`}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Answer {index + 1}</FormLabel>
                                        <FormControl>
                                            <span>
                                                <Input
                                                    id={`answer-${index}`}
                                                    className="col-span-4"
                                                    placeholder={`Answer ${index + 1}`}
                                                    value={answer}
                                                    onChange={(e) => {
                                                        field.onChange(e);
                                                        handleAnswerChange(index, e.target.value);
                                                    }}
                                                />
                                                <Button
                                                    variant="ghost"
                                                    className="p-2 relative float-right mt-[-33px] cursor-pointer rounded-full size-fit"
                                                    onClick={(event) => handleRemoveAnswer(event, index)}
                                                    disabled={answers.length <= 2}
                                                >
                                                    <X className="size-4" />
                                                </Button>
                                            </span>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        ))}
                    </div>
                    <div className="grid items-center gap-4">
                        <Button variant="link" onClick={handleAddAnswer}>
                            + Add answer
                        </Button>
                    </div>
                </div>
                <SubmitButton
                    className="border px-3 py-2 w-full bg-[#baff66] rounded-md text-black mb-2 hover:text-[#baff66] hover:bg-[#0c1f19] hover:border-[#baff66]"
                    pendingText="Saving..."
                >
                    Create Poll
                </SubmitButton>
            </form>
        </Form>
    );
};