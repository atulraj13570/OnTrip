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

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [isMobileMenuOpen])

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
              className="md:hidden p-2.5 rounded-xl bg-white/60 backdrop-blur-md border border-white/60 text-neutral-900 shadow-sm"
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
    </>
  )
}
