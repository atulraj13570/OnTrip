'use client'

import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Plane, Search, Globe, Menu, X, ArrowRight } from 'lucide-react'
import { useState, useEffect } from 'react'

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <nav 
      className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 ${
        isScrolled ? 'py-4' : 'py-8'
      }`}
    >
      <div className="container-custom">
        <div className={`glass-4d rounded-3xl px-8 py-3 flex items-center justify-between transition-all duration-500 border-white/60 ${
          isScrolled ? 'shadow-4d-hover bg-white/60 scale-[1.01]' : 'bg-white/30'
        }`}>
          {/* Logo with 4D Depth */}
          <Link href="/" className="flex items-center gap-3 group relative">
            <div className="w-12 h-12 bg-primary-600 rounded-[1rem] flex items-center justify-center text-white shadow-[0_10px_20px_-5px_rgba(59,102,245,0.5)] group-hover:rotate-[360deg] transition-transform duration-1000 group-hover:scale-110">
              <Plane className="w-7 h-7 rotate-45" />
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-black tracking-tighter text-neutral-900 leading-none">
                On<span className="text-primary-600 tracking-normal">Trip</span>
              </span>
              <span className="text-[10px] font-black text-secondary-500 uppercase tracking-widest leading-none mt-1">4D Comparison</span>
            </div>
          </Link>

          {/* Desktop Nav with Moving Accents */}
          <div className="hidden md:flex items-center gap-10">
            {['Home', 'Explore', 'Packages', 'Methodology'].map((name) => (
              <Link key={name} href={name === 'Home' ? '/' : `/${name.toLowerCase()}`} className="relative font-bold text-neutral-600 hover:text-primary-600 transition-all group py-2">
                {name}
                <span className="absolute bottom-0 left-0 w-0 h-1 bg-gradient-to-r from-primary-600 to-secondary-500 group-hover:w-full transition-all duration-500 rounded-full" />
              </Link>
            ))}
          </div>

          {/* Actions with Depth */}
          <div className="hidden md:flex items-center gap-6">
            <button className="p-3 glass rounded-2xl text-neutral-400 hover:text-primary-600 transition-all hover:rotate-12 hover:scale-110">
              <Globe className="w-6 h-6 animate-spin-slow" />
            </button>
            <Link href="/search" className="btn-4d py-3.5 px-8 flex items-center gap-2 text-sm">
              <Search className="w-4 h-4" />
              <span>LAUNCH</span>
            </Link>
          </div>

          {/* Mobile Toggle */}
          <button 
            className="md:hidden p-3 rounded-2xl glass text-neutral-900"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu with 4D Feel */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="md:hidden absolute top-[100px] left-6 right-6 glass-4d rounded-[2.5rem] p-10 shadow-4d border-white/60 z-[101]"
          >
            <div className="flex flex-col gap-8">
              {['Home', 'Explore', 'Packages', 'Methodology'].map((name) => (
                <Link key={name} href="/" onClick={() => setIsMobileMenuOpen(false)} className="text-2xl font-black text-neutral-900 flex justify-between items-center group">
                  {name}
                  <ArrowRight className="w-6 h-6 text-primary-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              ))}
              <hr className="border-white/20" />
              <Link href="/search" onClick={() => setIsMobileMenuOpen(false)} className="btn-4d text-center text-xl py-6">
                LAUNCH SEARCH
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}
