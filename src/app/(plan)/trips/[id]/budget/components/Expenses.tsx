"use client";
import { supabaseBrowser } from "@/utils/supabase/client";
import React, { useState, useEffect, useCallback } from "react";
import AddExpensesDialog from "./AddExpensesDialog";
import EditExpensesDialog from "./EditExpensesDialog";
import {
    Table,
    TableBody,
    TableFooter,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { EllipsisVertical } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button";
import { FormattedAmount } from "@/components/FormattedAmount";

export default function Expenses({ trip_id, user_id }: { trip_id: string, user_id: string }) {
    const supabase = supabaseBrowser();
    const [expenses, setExpenses] = useState<any[]>([]);

    const fetchExpenses = useCallback(async () => {
        const { data, error } = await supabase
            .from("expenses")
            .select('*')
            .eq("trip_id", trip_id);

        if (error) {
            console.error("Error fetching expenses", error);
        } else {
            setExpenses(data);
        }
    }, [trip_id, supabase]);

    useEffect(() => {
        fetchExpenses();

        const expensesChannel = supabase
            .channel(`expenses:trip_id=${trip_id}`)
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'expenses',
                filter: `trip_id = eq.${trip_id}`,
            }, () => {
                fetchExpenses();
            }).subscribe();

        return () => {
            expensesChannel.unsubscribe();
        }
    }, [trip_id, supabase]);

    // Group expenses by date
    const groupedExpenses = expenses.reduce((acc: any, expense: any) => {
        const date = new Date(expense.expenses_date).toDateString();

        if (!acc[date]) {
            acc[date] = [];
        }

        acc[date].push(expense);

        return acc;
    }, {});

    // Sort and group expenses by date
    const sortedGroupedExpenses = Object.entries(groupedExpenses)
        .sort((a, b) => new Date(b[0]).getTime() - new Date(a[0]).getTime())
        .reduce((acc, [date, expenses]) => {
            acc[date] = expenses;
            return acc;
        }, {} as any);

    const handleDelete = async (id: string) => {
        const { error } = await supabase
            .from("expenses")
            .delete()
            .eq("expenses_id", id);

        if (error) {
            console.error("Error deleting expense", error);
        } else {
            fetchExpenses();
        }
    };

    return (
        <div className="p-4">
            <div className="flex justify-between items-center">
                <h4 className="font-semibold text-2xl leading-none tracking-tight mb-2">Transactions</h4>
                <AddExpensesDialog trip_id={trip_id} user_id={user_id} />
            </div>
            {expenses.length === 0 ? (
                <div className="py-10">
                    <img src="/polling.svg " alt="No data" className="mx-auto w-1/3" />
                    <p className="text-center">You haven’t added any expenses yet.</p>
                </div>
            ) : (
                <div className="space-y-5">
                    {Object.keys(sortedGroupedExpenses).map((date: string, index: number) => (
                        <div key={index}>
                            <p className="font-semibold text-2xl bg-slate-800 p-3 rounded-t-lg">{date}</p>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-1/6">Category</TableHead>
                                        <TableHead className="w-3/6">Description</TableHead>
                                        <TableHead className="w-1/6">Amount</TableHead>
                                        <TableHead className="w-1/6"></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {sortedGroupedExpenses[date].map((expense: any, index: number) => (
                                        <TableRow key={index}>
                                            <TableCell>{expense.expenses_category}</TableCell>
                                            <TableCell>{expense.expenses_description}</TableCell>
                                            <TableCell><FormattedAmount amount={expense.expenses_amount} /></TableCell>
                                            <TableCell className="text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger><Button variant='ghost' size="icon"><EllipsisVertical /></Button></DropdownMenuTrigger>
                                                    <DropdownMenuContent>
                                                        <EditExpensesDialog expenses_id={expense.expenses_id} />
                                                        <DropdownMenuItem onClick={() => handleDelete(expense.expenses_id)}>Delete</DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                                <TableFooter>
                                    <TableRow>
                                        <TableCell colSpan={3}>Total</TableCell>
                                        <TableCell>
                                            <FormattedAmount amount={sortedGroupedExpenses[date].reduce((acc: number, expense: any) => acc + expense.expenses_amount, 0)} />
                                        </TableCell>
                                    </TableRow>
                                </TableFooter>
                            </Table>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
