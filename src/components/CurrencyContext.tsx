"use client";
import { getUserLocation } from "@/utils/currencyFormat";
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';

type CurrencyContextType = {
  currency: string | null;
  country_name: string | null;
};

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export const useCurrency = (): CurrencyContextType => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};

type CurrencyProviderProps = {
  children: ReactNode;
};

export const CurrencyProvider = ({ children }: CurrencyProviderProps) => {
  const [currency, setCurrency] = useState<string | null>(null);
  const [countryName, setCountryName] = useState<string | null>(null);

  useEffect(() => {
    const fetchCurrency = async () => {
      const locationData = await getUserLocation();
      if (locationData) {
        setCurrency(locationData.currency);
        setCountryName(locationData.country_name);
      }
    };

    fetchCurrency();
  }, []);

  return (
    <CurrencyContext.Provider value={{ currency, country_name: countryName }}>
      {children}
    </CurrencyContext.Provider>
  );
};
