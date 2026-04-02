'use client'

import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Plane, Search, Globe, Menu, X, ArrowRight } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useSettings } from './SettingsProvider'

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isRegionalSettingsOpen, setIsRegionalSettingsOpen] = useState(false)

  const { language, setLanguage, country, setCountry, currency, setCurrency } = useSettings()
  
  // Local state for modal to prevent immediate changes
  const [localLang, setLocalLang] = useState(language)
  const [localCountry, setLocalCountry] = useState(country)
  const [localCurrency, setLocalCurrency] = useState(currency)

  useEffect(() => {
    if (isRegionalSettingsOpen) {
      setLocalLang(language)
      setLocalCountry(country)
      setLocalCurrency(currency)
    }
  }, [isRegionalSettingsOpen, language, country, currency])

  const handleSaveSettings = () => {
    setLanguage(localLang)
    setCountry(localCountry)
    setCurrency(localCurrency)
    setIsRegionalSettingsOpen(false)
  }

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Lock body scroll when mobile menu or settings modal is open
  useEffect(() => {
    if (isMobileMenuOpen || isRegionalSettingsOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [isMobileMenuOpen, isRegionalSettingsOpen])

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Explore', href: '/search' },
    { name: 'Packages', href: '/search' },
    { name: 'Methodology', href: '/#methodology' },
  ]

  return (
    <>
      <nav 
        className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 ${
          isScrolled ? 'py-4' : 'py-8'
        }`}
      >
        <div className="container-custom">
          <div className={`glass-4d rounded-3xl px-6 md:px-8 py-3 flex items-center justify-between transition-all duration-500 border-white/60 ${
            isScrolled ? 'shadow-4d-hover bg-white/60 scale-[1.01]' : 'bg-white/30'
          }`}>
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 group relative">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-primary-600 rounded-[1rem] flex items-center justify-center text-white shadow-[0_10px_20px_-5px_rgba(59,102,245,0.5)] group-hover:rotate-[360deg] transition-transform duration-1000 group-hover:scale-110">
                <Plane className="w-5 h-5 md:w-7 md:h-7 rotate-45" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl md:text-2xl font-black tracking-tighter text-neutral-900 leading-none">
                  On<span className="text-primary-600 tracking-normal">Trip</span>
                </span>
                <span className="text-[9px] md:text-[10px] font-black text-secondary-500 uppercase tracking-widest leading-none mt-1">4D Comparison</span>
              </div>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-10">
              {navLinks.map(({ name, href }) => (
                <Link key={name} href={href} className="relative font-bold text-neutral-600 hover:text-primary-600 transition-all group py-2">
                  {name}
                  <span className="absolute bottom-0 left-0 w-0 h-1 bg-gradient-to-r from-primary-600 to-secondary-500 group-hover:w-full transition-all duration-500 rounded-full" />
                </Link>
              ))}
            </div>

            {/* Desktop Actions */}
            <div className="hidden md:flex items-center gap-6">
              <button 
                onClick={() => setIsRegionalSettingsOpen(true)}
                className="p-3 glass rounded-2xl text-neutral-400 hover:text-primary-600 transition-all hover:rotate-12 hover:scale-110"
                aria-label="Regional Settings"
              >
                <Globe className="w-6 h-6 animate-spin-slow" />
              </button>
              <Link href="/search" className="btn-4d py-3.5 px-8 flex items-center gap-2 text-sm">
                <Search className="w-4 h-4" />
                <span>LAUNCH</span>
              </Link>
            </div>

            {/* Mobile Toggle */}
            <button 
              className="md:hidden p-2.5 rounded-xl bg-white/60 backdrop-blur-md border border-white/60 text-neutral-900 shadow-sm ml-2"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu — Full-screen overlay rendered outside <nav> */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-[110] bg-black/40 backdrop-blur-sm md:hidden"
              onClick={() => setIsMobileMenuOpen(false)}
            />

            {/* Menu Panel */}
            <motion.div
              key="menu"
              initial={{ opacity: 0, y: -16, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -16, scale: 0.97 }}
              transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
              className="md:hidden fixed top-4 left-4 right-4 z-[120] rounded-[2rem] overflow-hidden shadow-2xl border border-white/30"
              style={{ background: 'rgba(255,255,255,0.97)' }}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-5 border-b border-neutral-100">
                <Link href="/" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary-600 rounded-[0.75rem] flex items-center justify-center text-white">
                    <Plane className="w-5 h-5 rotate-45" />
                  </div>
                  <span className="text-xl font-black tracking-tighter text-neutral-900">
                    On<span className="text-primary-600">Trip</span>
                  </span>
                </Link>
                <button 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-9 h-9 rounded-xl bg-neutral-100 flex items-center justify-center text-neutral-500"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Nav Links */}
              <div className="px-6 py-4 flex flex-col gap-1">
                {navLinks.map(({ name, href }, i) => (
                  <motion.div
                    key={name}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.05 + i * 0.05 }}
                  >
                    <Link 
                      href={href} 
                      onClick={() => setIsMobileMenuOpen(false)} 
                      className="flex items-center justify-between py-4 px-3 rounded-2xl text-xl font-black text-neutral-800 hover:bg-primary-50 hover:text-primary-600 transition-all group"
                    >
                      {name}
                      <ArrowRight className="w-5 h-5 text-primary-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </Link>
                  </motion.div>
                ))}
              </div>

              {/* Mobile Actions */}
              <div className="px-6 pb-4">
                <button 
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    setTimeout(() => setIsRegionalSettingsOpen(true), 300);
                  }}
                  className="flex items-center justify-between w-full py-4 px-3 rounded-2xl text-lg font-bold text-neutral-600 hover:bg-neutral-50 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <Globe className="w-5 h-5" />
                    Regional Settings
                  </div>
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>

              {/* CTA */}
              <div className="px-6 pb-8 pt-2">
                <div className="h-px bg-neutral-100 mb-6" />
                <Link 
                  href="/search" 
                  onClick={() => setIsMobileMenuOpen(false)} 
                  className="btn-4d w-full flex items-center justify-center gap-3 py-5 text-base"
                >
                  <Search className="w-5 h-5" />
                  LAUNCH SEARCH
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Regional Settings Modal */}
      <AnimatePresence>
        {isRegionalSettingsOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-[200] bg-black/50 backdrop-blur-sm"
              onClick={() => setIsRegionalSettingsOpen(false)}
            />

            {/* Modal Content */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="fixed inset-x-4 top-[10%] md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 z-[210] md:w-full md:max-w-md bg-white/95 backdrop-blur-xl rounded-[2rem] shadow-2xl border border-white p-6 md:p-8"
            >
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary-50 rounded-2xl flex items-center justify-center text-primary-600">
                    <Globe className="w-5 h-5" />
                  </div>
                  <h3 className="text-xl font-black text-neutral-900 tracking-tight">Regional Settings</h3>
                </div>
                <button 
                  onClick={() => setIsRegionalSettingsOpen(false)}
                  className="w-10 h-10 rounded-full bg-neutral-100 hover:bg-neutral-200 flex items-center justify-center text-neutral-500 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-neutral-600 ml-2">Language</label>
                  <select 
                    value={localLang}
                    onChange={(e) => setLocalLang(e.target.value)}
                    className="w-full bg-neutral-50 border border-neutral-200 text-neutral-900 text-base font-medium rounded-2xl focus:ring-4 focus:ring-primary-500/20 focus:border-primary-500 block p-4 outline-none appearance-none cursor-pointer transition-all"
                  >
                    <option value="en">English (US)</option>
                    <option value="en-gb">English (UK)</option>
                    <option value="es">Español</option>
                    <option value="fr">Français</option>
                    <option value="hi">हिंदी (Hindi)</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-neutral-600 ml-2">Country/Region</label>
                  <select 
                    value={localCountry}
                    onChange={(e) => setLocalCountry(e.target.value)}
                    className="w-full bg-neutral-50 border border-neutral-200 text-neutral-900 text-base font-medium rounded-2xl focus:ring-4 focus:ring-primary-500/20 focus:border-primary-500 block p-4 outline-none appearance-none cursor-pointer transition-all"
                  >
                    <option value="US">United States</option>
                    <option value="IN">India</option>
                    <option value="UK">United Kingdom</option>
                    <option value="CA">Canada</option>
                    <option value="AU">Australia</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-neutral-600 ml-2">Currency</label>
                  <select 
                    value={localCurrency}
                    onChange={(e) => setLocalCurrency(e.target.value)}
                    className="w-full bg-neutral-50 border border-neutral-200 text-neutral-900 text-base font-medium rounded-2xl focus:ring-4 focus:ring-primary-500/20 focus:border-primary-500 block p-4 outline-none appearance-none cursor-pointer transition-all"
                  >
                    <option value="USD">USD ($)</option>
                    <option value="INR">INR (₹)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                    <option value="AUD">AUD ($)</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-4 mt-10">
                <button 
                  onClick={() => setIsRegionalSettingsOpen(false)}
                  className="flex-1 py-4 px-6 rounded-2xl text-neutral-600 font-bold hover:bg-neutral-100 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSaveSettings}
                  className="flex-1 py-4 px-6 rounded-2xl btn-primary shadow-premium"
                >
                  Save Settings
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
