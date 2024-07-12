"use client";
import React, { useState, useEffect } from 'react';
import { useCurrency } from "@/components/CurrencyContext";
import { formatAmount } from "@/utils/currencyFormat";

interface FormattedAmountProps {
    amount: number;
    className?: string;
}

export const FormattedAmount: React.FC<FormattedAmountProps> = ({ amount, className }) => {
    const [formattedValue, setFormattedValue] = useState('');
    const { currency } = useCurrency();

    useEffect(() => {
        if (!currency) return;
        const formatValue = async () => {
            const formatted = await formatAmount(amount, currency);
            setFormattedValue(formatted);
        };
        formatValue();
    }, [amount, currency]);

    return <span className={className}>{formattedValue}</span>;
};