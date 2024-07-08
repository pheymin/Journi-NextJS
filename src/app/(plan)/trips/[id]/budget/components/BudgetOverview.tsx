"use client";
import { supabaseBrowser } from "@/utils/supabase/client";
import React, { useState, useEffect, useCallback } from "react";
import { Progress } from "@/components/ui/progress";
import AddBudgetDialog from "./AddBudgetDialog";
import PieChart from "./PieChart";
import {
    Table,
    TableBody,
    TableFooter,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"

export default function BudgetOverview({ trip_id }: { trip_id: string }) {
    const supabase = supabaseBrowser();
    const [budget, setBudget] = useState<any | null>(null);
    const [expenses, setExpenses] = useState<any | null>(null);
    const [expensesCategory, setExpensesCategory] = useState<any | null>(null);

    const fetchBudgetAndExpenses = useCallback(async () => {
        const budgetPromise = supabase
            .from("budget")
            .select('*')
            .eq("trip_id", trip_id)
            .single();

        const expensesPromise = supabase
            .from("expenses")
            .select('*')
            .eq("trip_id", trip_id);

        const expensesCategoryPromise = supabase
            .rpc('get_expenses_by_category', { param_trip_id: trip_id });

        const [
            { data: budget, error: budgetError },
            { data: expenses, error: expensesError },
            { data: expensesCategory, error: expensesCategoryError }
        ] = await Promise.all([budgetPromise, expensesPromise, expensesCategoryPromise]);

        if (budgetError) {
            console.error("Error fetching budget", budgetError);
        } else {
            setBudget(budget);
        }

        if (expensesError) {
            console.error("Error fetching expenses", expensesError);
        } else {
            setExpenses(expenses);
        }

        if (expensesCategoryError) {
            console.error("Error fetching expenses category", expensesCategoryError);
        } else {
            setExpensesCategory(expensesCategory);
        }
    }, [trip_id, supabase]);

    useEffect(() => {
        fetchBudgetAndExpenses();

        const budgetChannel = supabase
            .channel(`budget:trip_id=${trip_id}`)
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'budget',
                filter: `trip_id = eq.${trip_id}`,
            }, () => {
                fetchBudgetAndExpenses();
            }).subscribe();

        const expensesChannel = supabase
            .channel(`expenses:trip_id=${trip_id}`)
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'expenses',
                filter: `trip_id = eq.${trip_id}`,
            }, () => {
                fetchBudgetAndExpenses();
            }).subscribe();

        return () => {
            budgetChannel.unsubscribe();
            expensesChannel.unsubscribe();
        }
    }, [fetchBudgetAndExpenses]);

    const totalExpenses = expenses?.reduce((acc: number, expense: { expenses_amount: number }) => acc + expense.expenses_amount, 0) || 0;
    const budgetAmount = budget?.budget_amount || 0;
    const balance = budgetAmount - totalExpenses;
    const progress = budget ? (totalExpenses / budgetAmount) * 100 : 0;

    return (
        <>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4 h-1/5 mb-5 px-2 md:px-0">
                <div className="rounded-xl h-full px-6 py-8 space-y-2 border border-[#baff66]">
                    <h3 className="text-[#baff66] font-medium text-2xl">MYR {totalExpenses}</h3>
                    {budget ? (
                        <>
                            <Progress value={progress} />
                            <p className="text-[#baff66] text-xs text-right">Budget: MYR {budgetAmount}</p>
                        </>
                    ) : (
                        <AddBudgetDialog trip_id={trip_id} />
                    )}
                </div>
                <div className="rounded-xl h-full px-6 py-8 space-y-2 bg-[#0c1f19]">
                    <h3>Budget</h3>
                    <p className="text-3xl font-medium">MYR {budgetAmount}</p>
                </div>
                <div className="rounded-xl bg-[#baff66] h-full px-6 py-8 space-y-2 text-black">
                    <h3>Balance</h3>
                    <p className="text-3xl font-medium">MYR {balance}</p>
                </div>
                <div className="rounded-xl h-full px-6 py-8 space-y-2 border border-muted-foreground">
                    <h3>Expenses</h3>
                    <p className="text-3xl font-medium">MYR {totalExpenses}</p>
                </div>
            </div>
            <div className="h-full">
                {expenses?.length === 0 ? (
                    <div className="py-10">
                        <img src="/polling.svg " alt="No data" className="mx-auto w-1/3" />
                        <p className="text-center">No data yet</p>
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 grid-cols-1 h-full">
                        <div className="p-4 md:p-8 h-[500px] rounded-xl">
                            <h4 className="text-2xl font-semibold">Summary</h4>
                            <PieChart trip_id={trip_id} />
                        </div>
                        <div className="p-4 md:p-8 content-center space-y-4">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>PERCENRAGE</TableHead>
                                        <TableHead>CATEGORY</TableHead>
                                        <TableHead>TOTAL AMOUNT (MYR)</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {expensesCategory?.map((expense: any, index: number) => (
                                        <TableRow key={index}>
                                            <TableCell>{expense.percentage.toFixed(2)}%</TableCell>
                                            <TableCell>{expense.expenses_category}</TableCell>
                                            <TableCell>{expense.total_expenses}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                                <TableFooter>
                                    <TableRow>
                                        <TableCell colSpan={2}>Total</TableCell>
                                        <TableCell>{totalExpenses}</TableCell>
                                    </TableRow>
                                </TableFooter>
                            </Table>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}
