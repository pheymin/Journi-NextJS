"use client"
import { ResponsivePie } from '@nivo/pie';
import { supabaseBrowser } from "@/utils/supabase/client";
import React, { useState, useEffect } from "react";
import { PIE_COLORS } from '@/utils/constant';

export default function PieChart({ trip_id }: { trip_id: string }) {
    const supabase = supabaseBrowser();
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<any | null>(null);

    const fetchExpenses = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .rpc('get_expenses_by_category', { param_trip_id: trip_id });

        if (error) {
            console.error("Error fetching expenses", error);
            setError(error);
            setLoading(false);
            return;
        }

        const transformedData = data.map((item: { expenses_category: string; total_expenses: number }, index: number) => ({
            id: item.expenses_category,
            label: item.expenses_category,
            value: item.total_expenses,
            color: PIE_COLORS[index % PIE_COLORS.length]
        }));
        
        setData(transformedData);
        setLoading(false);
    };

    useEffect(() => {
        fetchExpenses();

        const expensesChannel = supabase
            .channel(`expenses:*`)
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'expenses',
            }, () => {
                fetchExpenses();
            })
            .subscribe();

        return () => {
            expensesChannel.unsubscribe();
        };
    }, [supabase, trip_id]);

    if (loading) return <p>Loading...</p>;
    if (error) return <p>Error: {error.message}</p>;

    return (
        <ResponsivePie
        data={data}
        margin={{ top: 40, right: 80, bottom: 80, left: 80 }}
        innerRadius={0.5}
        padAngle={0.7}
        cornerRadius={3}
        activeOuterRadiusOffset={8}
        colors={{ scheme: 'yellow_green' }}
        borderWidth={1}
        borderColor={{
            from: 'color',
            modifiers: [
                [
                    'darker',
                    0.6
                ]
            ]
        }}
        arcLinkLabelsSkipAngle={10}
        arcLinkLabelsTextColor="#fff"
        arcLinkLabelsThickness={2}
        arcLinkLabelsColor={{ from: 'color' }}
        arcLabelsSkipAngle={10}
        arcLabelsTextColor={{
            from: 'color',
            modifiers: [
                [
                    'darker',
                    2
                ]
            ]
        }}
        legends={[
            {
                anchor: 'bottom',
                direction: 'row',
                justify: false,
                translateX: 0,
                translateY: 56,
                itemsSpacing: 0,
                itemWidth: 100,
                itemHeight: 18,
                itemTextColor: '#fff',
                itemDirection: 'left-to-right',
                itemOpacity: 1,
                symbolSize: 18,
                symbolShape: 'circle',
                effects: [
                    {
                        on: 'hover',
                        style: {
                            itemTextColor: '#fff'
                        }
                    }
                ]
            }
        ]}
    />
    );
}