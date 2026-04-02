'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { 
  Search, MapPin, CheckCircle2, ArrowRight, ShieldCheck, 
  Zap, BarChart3, Plane, Globe, ChevronRight, Sparkles,
  Heart, Star
} from 'lucide-react'

export default function Home() {
  const [destination, setDestination] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const router = useRouter()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (destination) {
      const today = new Date().toISOString().split('T')[0]
      const start = startDate || today
      const end = endDate || new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0]
      router.push(`/search?destination=${destination}&start=${start}&end=${end}`)
    }
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-24 pb-24 md:pt-48 md:pb-64 overflow-hidden mx-3 md:mx-10 my-4 md:my-6 rounded-[2.5rem] md:rounded-[6rem] border border-white/50 shadow-2xl perspective-1000">
        {/* Animated Background Blobs */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <motion.div animate={{ rotate: [0, 360], scale: [1, 1.2, 1] }} transition={{ duration: 20, repeat: Infinity }} className="absolute -top-24 -left-24 w-[40rem] h-[40rem] bg-primary-400/20 rounded-full blur-[120px]" />
          <motion.div animate={{ rotate: [-360, 0], scale: [1, 1.3, 1] }} transition={{ duration: 25, repeat: Infinity }} className="absolute top-1/2 -right-24 w-[35rem] h-[35rem] bg-secondary-400/20 rounded-full blur-[130px]" />
        </div>

        <div className="container-custom relative z-10">
          <div className="max-w-6xl mx-auto text-center">
            
            {/* Search Bar AT THE TOP */}
            <motion.div 
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, type: 'spring' }}
              className="mb-10 md:mb-24"
            >
              <div className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full glass-4d text-primary-700 text-xs font-black tracking-[0.2em] uppercase mb-6 border-white/60 shadow-xl">
                <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" />
                <span>Next-Gen Comparison Engine</span>
              </div>

              <div className="mb-8 md:mb-12 max-w-4xl mx-auto px-2 md:px-4">
                <motion.h2 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  className="text-3xl sm:text-5xl md:text-7xl font-black text-neutral-900 tracking-tight leading-[1.1] mb-4 md:mb-6"
                >
                  Find Your <span className="text-gradient">Perfect</span> Tour Package
                </motion.h2>
                <motion.p 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.3 }}
                  className="text-sm sm:text-lg md:text-2xl text-neutral-600 font-medium leading-relaxed max-w-3xl mx-auto"
                >
                  We compare tour packages transparently so you can see exactly what each one includes. Not just the cheapest—the best value.
                </motion.p>
              </div>

              <div className="glass-4d p-2 md:p-5 rounded-[2rem] md:rounded-[3.5rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.15)] max-w-5xl mx-auto relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-primary-500 via-secondary-500 to-accent-500 rounded-[3.8rem] blur-2xl opacity-20 group-hover:opacity-40 transition-opacity duration-1000" />
                <div className="relative bg-white/60 backdrop-blur-3xl rounded-[1.8rem] md:rounded-[3.2rem] p-3 md:p-6 shadow-inner-light translate-z-10">
                  <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-12 gap-3 md:gap-5 items-center text-left">
                    <div className="md:col-span-4 relative">
                      <MapPin className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-primary-500 animate-bounce" />
                      <input
                        type="text"
                        value={destination}
                        onChange={(e) => setDestination(e.target.value)}
                        placeholder="Where are we venturing?"
                        className="w-full bg-white/40 border border-white/60 hover:border-primary-400 focus:border-primary-500 rounded-[1.5rem] md:rounded-[2rem] py-4 md:py-5 pl-14 md:pl-16 pr-4 md:pr-6 text-neutral-900 font-bold placeholder:text-neutral-400 outline-none transition-all text-sm md:text-base"
                      />
                    </div>
                    <div className="md:col-span-3 grid grid-cols-2 gap-2 md:gap-3">
                      <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="bg-white/40 border border-white/60 rounded-[1.3rem] md:rounded-[1.8rem] py-4 md:py-5 px-3 md:px-5 text-neutral-900 font-bold text-xs outline-none focus:border-primary-500 transition-all font-sans" />
                      <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="bg-white/40 border border-white/60 rounded-[1.3rem] md:rounded-[1.8rem] py-4 md:py-5 px-3 md:px-5 text-neutral-900 font-bold text-xs outline-none focus:border-primary-500 transition-all font-sans" />
                    </div>
                    <div className="md:col-span-3 hidden md:block">
                      <div className="relative px-7 py-5 bg-white/40 border border-white/60 rounded-[1.8rem] flex items-center justify-between cursor-pointer hover:border-primary-400 transition-all">
                        <div className="flex items-center gap-3">
                          <Globe className="w-5 h-5 text-secondary-500 animate-spin-slow" />
                          <span className="font-extrabold text-neutral-700 text-sm">2 VOYAGERS</span>
                        </div>
                        <ChevronRight className="w-4 h-4 rotate-90 text-neutral-400" />
                      </div>
                    </div>
                    <div className="md:col-span-2">
                      <button type="submit" className="w-full btn-4d py-4 md:py-5 h-full flex items-center justify-center gap-2 md:gap-3 group/btn">
                        <Search className="w-5 h-5 md:w-6 md:h-6 group-hover/btn:scale-125 transition-transform duration-500" />
                        <span className="text-xs md:text-sm font-black">SEARCH</span>
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </motion.div>

            {/* Title with Staggered Reveal */}
            <div className="overflow-hidden mb-6 md:mb-10">
              <motion.h1 
                initial={{ y: 200, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 1.2, ease: [0.77, 0, 0.175, 1] }}
                className="text-5xl sm:text-6xl md:text-9xl font-black text-neutral-900 leading-[0.85] tracking-tighter"
              >
                Beyond <br /> 
                <span className="text-gradient">Horizon</span>
              </motion.h1>
            </div>

            <motion.p 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.8 }}
              className="text-base sm:text-xl md:text-3xl text-neutral-500/80 mb-10 md:mb-16 max-w-3xl mx-auto font-medium tracking-tight px-4"
            >
              Comparing every pulse of your journey. <br className="hidden md:block" />
              Unmasking true costs with multidimensional data.
            </motion.p>
          </div>
        </div>

        {/* Floating 3D-like Icons - hidden on mobile */}
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden hidden sm:block">
           {[Plane, Globe, Zap, Heart, Star, Sparkles].map((Icon, i) => (
             <motion.div 
               key={i}
               animate={{ 
                 y: [0, -40, 0], 
                 x: [0, (i % 2 === 0 ? 30 : -30), 0],
                 rotate: [0, 10, -10, 0] 
               }}
               transition={{ duration: 5 + i, repeat: Infinity, ease: 'easeInOut' }}
               className="absolute opacity-10 text-primary-600"
               style={{ 
                 top: `${15 + (i * 15)}%`, 
                 left: `${10 + (i * 16)}%`,
               }}
             >
               <Icon className="w-16 h-16" />
             </motion.div>
           ))}
        </div>
      </section>

      {/* Trust Pillars with 4D Grid */}
      <section className="py-12 md:py-20 relative">
        <div className="container-custom">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-12">
            {[
              { 
                icon: <ShieldCheck className="w-14 h-14 text-primary-500" />, 
                title: "Deep Analysis", 
                desc: "We look where others don't. From airline surcharges to resort fees, we expose the reality.",
                delay: 0.1
              },
              { 
                icon: <Zap className="w-14 h-14 text-secondary-500" />, 
                title: "Live Logic", 
                desc: "Every comparison is refreshed in milliseconds across 12 source-data providers.",
                delay: 0.2
              },
              { 
                icon: <BarChart3 className="w-14 h-14 text-accent-500" />, 
                title: "Multi-Source", 
                desc: "Packages vs DIY. Flights vs Charters. We aggregate everything into one truth.",
                delay: 0.3
              }
            ].map((pillar, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, rotateY: 30, x: 50 }}
                whileInView={{ opacity: 1, rotateY: 0, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: pillar.delay }}
                className="card p-8 md:p-12 hover:rotate-y-10 group"
              >
                <div className="mb-10 p-6 rounded-[2rem] bg-white shadow-2xl inline-block group-hover:bg-primary-600 transition-colors duration-500">
                  <div className="group-hover:text-white transition-colors duration-500">
                    {pillar.icon}
                  </div>
                </div>
                <h3 className="text-4xl font-black mb-6 text-neutral-900 tracking-tighter leading-none">{pillar.title}</h3>
                <p className="text-neutral-500 font-semibold text-lg leading-relaxed">
                  {pillar.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Moving Data Section */}
      <section className="py-16 md:py-40 relative">
        <div className="container-custom">
           <div className="flex flex-col lg:flex-row items-center gap-12 md:gap-32">
             <div className="flex-1 relative">
                <motion.div 
                  initial={{ scale: 0.8, rotate: -5 }}
                  whileInView={{ scale: 1, rotate: 0 }}
                  className="relative z-10 glass-4d p-4 rounded-[4rem] shadow-4d animate-float-slow"
                >
                   <img src="https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&q=80&w=1200" className="w-full aspect-video object-cover rounded-[3rem]" alt="Data Travel" />
                </motion.div>
                <motion.div 
                   animate={{ y: [0, -20, 0] }}
                   transition={{ duration: 4, repeat: Infinity }}
                   className="absolute -top-8 -right-4 md:-top-12 md:-right-12 glass-4d p-4 md:p-8 rounded-3xl shadow-4d z-20"
                >
                   <span className="text-3xl md:text-5xl font-black text-primary-600 tracking-tighter">98.4%</span>
                   <p className="text-xs font-black text-neutral-500 uppercase tracking-widest mt-2">Accuracy Rate</p>
                </motion.div>
             </div>

             <div className="flex-1">
                <motion.h2 
                  initial={{ opacity: 0, x: 100 }}
                   whileInView={{ opacity: 1, x: 0 }}
                   className="text-4xl sm:text-6xl md:text-8xl font-black text-neutral-900 tracking-tighter leading-[0.9] mb-8 md:mb-12"
                >
                  Unveiling the <span className="text-gradient">Invisible</span>
                </motion.h2>
                <div className="space-y-8">
                  {[
                    "Granular cost-benefit visualizations",
                    "Real-time dynamic pricing alerts",
                    "Hotel quality-to-price indexing",
                    "Hidden inclusion verification"
                  ].map((item, i) => (
                    <motion.div 
                      key={i}
                      initial={{ opacity: 0, x: 50 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="flex items-center gap-6 group"
                    >
                      <div className="w-14 h-14 rounded-2xl glass-4d flex items-center justify-center text-primary-600 group-hover:bg-primary-600 group-hover:text-white transition-all">
                        <CheckCircle2 className="w-7 h-7" />
                      </div>
                      <p className="text-2xl font-black text-neutral-700 tracking-tight group-hover:text-primary-600 transition-colors">{item}</p>
                    </motion.div>
                  ))}
                </div>
             </div>
           </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-16 md:py-40">
        <div className="container-custom">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            className="glass-4d p-10 sm:p-20 md:p-40 rounded-[3rem] md:rounded-[8rem] text-center relative overflow-hidden group shadow-4d"
          >
            <div className="absolute inset-0 bg-gradient-radial from-primary-600/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-[2s]" />
            <div className="relative z-10">
              <h2 className="text-4xl sm:text-6xl md:text-[10rem] font-black text-neutral-900 leading-none tracking-tighter mb-8 md:mb-16">
                Redefine <br />
                Your Path.
              </h2>
              <button className="btn-4d py-4 md:py-6 px-8 md:px-16 text-base md:text-xl group/btn">
                Launch Search
                <ArrowRight className="w-5 h-5 md:w-7 md:h-7 inline-block ml-3 md:ml-4 group-hover/btn:translate-x-3 transition-transform duration-500" />
              </button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
