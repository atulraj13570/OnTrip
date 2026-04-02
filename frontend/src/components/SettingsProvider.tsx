'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'

type SettingsContextType = {
  language: string;
  setLanguage: (lang: string) => void;
  country: string;
  setCountry: (country: string) => void;
  currency: string;
  setCurrency: (currency: string) => void;
  formatPrice: (amount: number) => string;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined)

const CURRENCY_RATES: Record<string, number> = {
  USD: 1,
  INR: 83.0,
  EUR: 0.92,
  GBP: 0.79,
  AUD: 1.53,
}

const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: '$',
  INR: '₹',
  EUR: '€',
  GBP: '£',
  AUD: 'A$',
}

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState('en')
  const [country, setCountry] = useState('US')
  const [currency, setCurrency] = useState('USD')
  const [isMounted, setIsMounted] = useState(false)

  // Load from local storage on mount
  useEffect(() => {
    setIsMounted(true)
    try {
      const savedL = localStorage.getItem('ontrip_lang')
      const savedC = localStorage.getItem('ontrip_country')
      const savedCurr = localStorage.getItem('ontrip_curr')
      if (savedL) setLanguage(savedL)
      if (savedC) setCountry(savedC)
      if (savedCurr) setCurrency(savedCurr)
    } catch (e) {}
  }, [])

  // Save changes
  useEffect(() => {
    if (isMounted) {
      try {
        localStorage.setItem('ontrip_lang', language)
        localStorage.setItem('ontrip_country', country)
        localStorage.setItem('ontrip_curr', currency)
      } catch (e) {}
    }
  }, [language, country, currency, isMounted])

  const formatPrice = (amount: number) => {
    // Heuristic: If amount is over 10,000, we consider it natively INR (from the mock data)
    let baseInUSD = amount;
    if (amount > 5000) {
      baseInUSD = amount / CURRENCY_RATES.INR;
    }
    
    // If not mounted yet, provide a sensible default to prevent hydration mismatch
    // Actually the easiest way to avoid hydration mismatch is just default calculation
    const currentCurrency = isMounted ? currency : 'USD'
    
    const rate = CURRENCY_RATES[currentCurrency] || 1
    const symbol = CURRENCY_SYMBOLS[currentCurrency] || '$'
    const converted = baseInUSD * rate
    
    const formatted = converted.toLocaleString(undefined, {
      maximumFractionDigits: converted > 1000 ? 0 : 0
    })
    
    return `${symbol}${formatted}`
  }

  return (
    <SettingsContext.Provider value={{ language, setLanguage, country, setCountry, currency, setCurrency, formatPrice }}>
      {children}
    </SettingsContext.Provider>
  )
}

export function useSettings() {
  const context = useContext(SettingsContext)
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider')
  }
  return context
}
