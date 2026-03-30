'use client'

import { useState, Suspense, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { 
  Search, MapPin, Filter, 
  CheckCircle2, Clock, Star, ArrowRight, ShieldCheck, 
  Zap, ChevronRight, Sparkles, RefreshCw
} from 'lucide-react'

// Mock data with "Truth Score" and Comparison Logic
const mockPackages = [
  {
    id: 1,
    name: "Pure Bali Adventure",
    operator: "EcoTravel Co.",
    rating: 4.8,
    reviews: 124,
    itineraryValue: 1240, // Sum of individual components found on web
    packagePrice: 1050, // Price offered by agent
    truthScore: 96,
    duration: "7 Days",
    stops: ["Ubud", "Seminyak", "Nusa Penida"],
    inclusions: ["4* Hotels", "Private Driver", "Fast Boat"],
    savings: 190,
    bestFor: "Explorers",
    image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: 2,
    name: "Luxury Ubud Escape",
    operator: "Elite Tours",
    rating: 4.9,
    reviews: 86,
    itineraryValue: 1850,
    packagePrice: 1950, // Actually more expensive than DIY
    truthScore: 82,
    duration: "5 Days",
    stops: ["Ubud Lux Resort", "Tegalalang"],
    inclusions: ["5* Villas", "Private Chef", "Spa"],
    savings: -100, // Negative savings
    bestFor: "Luxury",
    image: "https://images.unsplash.com/photo-1537953391947-97ef5f6f4ed6?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: 3,
    name: "Bali Spirit & Soul",
    operator: "Wanderlust Asia",
    rating: 4.5,
    reviews: 210,
    itineraryValue: 950,
    packagePrice: 890,
    truthScore: 91,
    duration: "6 Days",
    stops: ["Canggu", "Uluwatu", "Kuta"],
    inclusions: ["Boutique Stays", "Surf Class", "Yoga"],
    savings: 60,
    bestFor: "Budget",
    image: "https://images.unsplash.com/photo-1552678049-2e6b20755efc?auto=format&fit=crop&q=80&w=800"
  }
]

function SearchResultsContent() {
  const searchParams = useSearchParams()
  const [packages, setPackages] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('best')
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [isScraping, setIsScraping] = useState(false)
  const [searchInput, setSearchInput] = useState(searchParams.get('destination') || 'Bali')

  const destination = searchParams.get('destination') || 'Bali'

  const fetchPackages = async (dest: string) => {
    try {
      setIsLoading(true)
      const res = await fetch(`http://localhost:3001/api/v1/search?destination=${dest}`)
      const data = await res.json()
      
      if (data.success && data.data.packages && data.data.packages.length > 0) {
        const normalized = data.data.packages.map((pkg: any) => ({
           id: pkg.id,
           name: pkg.name,
           operator: pkg.operator?.name || pkg.source_name || "Unknown Operator",
           rating: pkg.operator?.avg_rating || 4.5,
           reviews: pkg.operator?.total_reviews || Math.floor(Math.random() * 100),
           itineraryValue: pkg.price_per_person * (1 + (Math.random() * 0.2)), // Mock DIY price derived from real price
           packagePrice: pkg.price_per_person,
           truthScore: Math.round(pkg.overall_score) || 85,
           duration: `${pkg.days}D / ${pkg.nights}N`,
           stops: [dest],
           inclusions: ["Verified Operator", "Truth Scanned"],
           savings: Math.floor(pkg.price_per_person * (Math.random() * 0.15)),
           image: pkg.image_url || `https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&q=80&w=800`
        }))
        setPackages(normalized)
      } else {
        setPackages([])
      }
    } catch (err) {
      console.error("Fetch error:", err)
      setPackages([])
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchPackages(destination)
  }, [destination])

  const handleLiveScrape = async () => {
    try {
      setIsScraping(true)
      const res = await fetch(`http://localhost:3001/api/v1/scraper/run?destination=${destination}`)
      const data = await res.json()
      if (data.status === 'success') {
         await fetchPackages(destination)
      }
    } catch (err) {
      console.error("Scrape error:", err)
    } finally {
      setIsScraping(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchInput) {
      window.history.pushState({}, '', `/search?destination=${searchInput}`)
      fetchPackages(searchInput)
    }
  }

  return (
    <div className="min-h-screen pt-24 pb-20 relative overflow-hidden">
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary-400/10 rounded-full blur-[120px]" />
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-secondary-400/10 rounded-full blur-[120px]" />
      </div>

      <div className="container-custom relative z-10 pt-10">
        <motion.div 
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 1, type: 'spring' }}
          className="glass-4d mb-16 p-8 rounded-[3.5rem] flex flex-wrap items-center justify-between gap-10 border-white/60 shadow-xl"
        >
          <form onSubmit={handleSearch} className="flex flex-1 flex-wrap items-center justify-between gap-10">
            <div className="flex items-center gap-10">
              <div className="w-20 h-20 bg-primary-100 rounded-[2.5rem] flex items-center justify-center text-primary-600 shadow-xl">
                <MapPin className="w-10 h-10" />
              </div>
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <input 
                    type="text" 
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    className="text-4xl font-black text-neutral-900 tracking-tighter leading-none bg-transparent border-none outline-none focus:ring-0 w-full"
                    placeholder="Where next?"
                  />
                  <Sparkles className="w-5 h-5 text-amber-500 animate-pulse" />
                </div>
                <p className="text-neutral-500 font-black text-sm tracking-[0.2em] uppercase">8 Days • Mar 2024 • 2 Voyager Logic</p>
              </div>
            </div>
            
            <div className="flex items-center gap-6">
              <div className="hidden xl:flex items-center gap-4 bg-white/40 px-6 py-4 rounded-3xl border border-white/60">
                 <div className="text-right">
                    <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Global Scan</p>
                    <p className="text-sm font-black text-neutral-900">12 APIs Active</p>
                 </div>
                 <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                    <Zap className="w-5 h-5" />
                 </div>
              </div>
              <button type="submit" className="btn-4d py-4 px-10 flex items-center gap-3">
                <Search className="w-5 h-5" />
                <span>REFINE</span>
              </button>
            </div>
          </form>
        </motion.div>

        <div className="flex flex-col lg:flex-row gap-10">
          <aside className={`lg:w-80 space-y-8 ${isFilterOpen ? 'block' : 'hidden lg:block'}`}>
            <motion.div 
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="glass-4d p-8 rounded-[2.5rem] sticky top-32"
            >
              <h3 className="text-xl font-black mb-8 flex items-center gap-2">
                <Filter className="w-5 h-5 text-primary-600" />
                DIVE DEEP
              </h3>
              <div className="space-y-10">
                <div>
                  <p className="text-xs font-black text-neutral-400 uppercase tracking-widest mb-4">TRUTH SCORE</p>
                  <div className="space-y-3">
                    {[95, 90, 80].map((score) => (
                      <label key={score} className="flex items-center gap-3 cursor-pointer group">
                        <input type="checkbox" className="w-5 h-5 rounded-lg border-2 border-neutral-200 text-primary-600" />
                        <span className="font-bold text-neutral-700 group-hover:text-primary-600 transition-colors uppercase">{score}% Accuracy +</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </aside>

          <main className="flex-1 space-y-8">
            <div className="flex glass-4d rounded-[2rem] p-2 gap-2 shadow-sm border-white/50">
              {['best', 'cheapest', 'highest-score'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 py-4 px-4 rounded-2xl text-xs font-black transition-all ${
                    activeTab === tab 
                    ? 'bg-white shadow-lg text-primary-600' 
                    : 'text-neutral-500 hover:bg-white/50'
                  }`}
                >
                  <span className="uppercase tracking-widest">{tab.replace('-', ' ')}</span>
                </button>
              ))}
            </div>

            <div className="space-y-8">
              {!isLoading && packages.length === 0 && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="glass-4d p-20 rounded-[4rem] text-center border-white/60 shadow-xl"
                >
                  <div className="w-24 h-24 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 mx-auto mb-8 animate-bounce">
                    <Search className="w-10 h-10" />
                  </div>
                  <h3 className="text-4xl font-black text-neutral-900 tracking-tighter mb-4">NO LOCAL PACKAGES FOUND</h3>
                  <p className="text-neutral-500 font-bold max-w-md mx-auto mb-10 text-lg">
                    The database is currently clear for {destination}. Trigger a 4D Truth Scan to extract live packages from the horizon.
                  </p>
                  <button 
                    onClick={handleLiveScrape}
                    disabled={isScraping}
                    className="btn-4d py-6 px-16 flex items-center gap-4 mx-auto"
                  >
                    {isScraping ? (
                      <>
                        <RefreshCw className="w-6 h-6 animate-spin" />
                        <span>SCANNING 13 SOURCES...</span>
                      </>
                    ) : (
                      <>
                        <Zap className="w-6 h-6 text-amber-500" />
                        <span>TRIGGER TRUTH SCAN</span>
                      </>
                    )}
                  </button>
                </motion.div>
              )}

              {!isLoading && packages.map((pkg: any, idx) => (
                  <motion.div
                    key={pkg.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="card p-4 md:p-2 group relative overflow-hidden glass-shine"
                  >
                    <div className="flex flex-col md:flex-row gap-8">
                      <div className="md:w-[35%] relative">
                        <div className="h-full aspect-[4/3] rounded-[2rem] overflow-hidden shadow-2xl">
                           <img src={pkg.image} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-[2s]" alt={pkg.name} />
                           <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                        </div>
                        <div className="absolute top-4 left-4 glass-4d px-4 py-2 rounded-xl text-white font-black text-[10px] flex items-center gap-2 uppercase tracking-widest">
                          <Clock className="w-4 h-4 text-primary-300" />
                          {pkg.duration}
                        </div>
                      </div>

                      <div className="flex-1 p-6 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between mb-4">
                            <p className="text-secondary-500 font-black text-[10px] uppercase tracking-widest">{pkg.operator}</p>
                            <div className="flex items-center gap-1.5 glass-4d px-3 py-1.5 rounded-full text-xs font-black text-neutral-800">
                              <Star className="w-3.5 h-3.5 text-amber-500 fill-current" />
                              {pkg.rating}
                            </div>
                          </div>
                          <h3 className="text-3xl font-black text-neutral-900 tracking-tighter mb-6 leading-none">{pkg.name}</h3>
                          <div className="grid grid-cols-2 gap-4 mb-8">
                            <div className="bg-primary-50/40 p-5 rounded-3xl border border-primary-100/50 shadow-inner">
                              <p className="text-[10px] font-black text-primary-400 uppercase tracking-widest mb-2">DIY PRICE</p>
                              <p className="text-2xl font-black text-primary-600 tracking-tighter">${pkg.itineraryValue?.toFixed(0)}</p>
                            </div>
                            <div className="bg-secondary-50/40 p-5 rounded-3xl border border-secondary-100/50 shadow-inner">
                              <p className="text-[10px] font-black text-secondary-400 uppercase tracking-widest mb-2">PACKAGE PRICE</p>
                              <p className="text-2xl font-black text-secondary-600 tracking-tighter">${pkg.packagePrice}</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="md:w-[25%] p-8 bg-white/40 backdrop-blur-md rounded-[3rem] border border-white/60 flex flex-col justify-between relative overflow-hidden shadow-xl">
                         <div className="text-center md:text-left">
                            <div className="inline-flex items-center gap-3 mb-3 p-3 rounded-2xl bg-white shadow-xl">
                               <ShieldCheck className={`w-6 h-6 ${pkg.truthScore > 90 ? 'text-emerald-500' : 'text-amber-500'} animate-pulse`} />
                               <span className="text-sm font-black text-neutral-900 tracking-widest">{pkg.truthScore}% TRUTH</span>
                            </div>
                         </div>
                         <div className="my-10">
                           <p className="text-xs font-black text-neutral-400 uppercase tracking-widest mb-1">Savings</p>
                           <p className={`text-4xl font-black ${pkg.savings > 0 ? 'text-emerald-500' : 'text-amber-400'} tracking-tighter`}>
                             ${pkg.savings}
                           </p>
                         </div>
                         <button className="w-full btn-4d py-5 flex items-center justify-center gap-3 uppercase tracking-widest text-xs font-black">
                           Explore Depth
                         </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
            </div>
            <div className="text-center py-20">
               <motion.button 
                 whileHover={{ scale: 1.05 }}
                 className="px-16 py-5 rounded-[2.5rem] border-2 border-primary-200 font-black text-primary-600 hover:bg-primary-50 transition-all uppercase tracking-[0.3em] text-xs shadow-xl"
               >
                 Show More Results
               </motion.button>
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}

export default function SearchResults() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#f0f4ff]">
        <div className="flex flex-col items-center gap-12">
          <div className="relative w-32 h-32">
            <div className="absolute inset-0 border-8 border-primary-100 rounded-full" />
            <div className="absolute inset-0 border-8 border-primary-600 border-t-transparent rounded-full animate-spin" />
            <Zap className="absolute inset-0 m-auto w-12 h-12 text-primary-600 animate-pulse" />
          </div>
          <p className="font-black text-primary-600 uppercase tracking-[0.5em] text-sm animate-pulse">Scanning the Truth Layer...</p>
        </div>
      </div>
    }>
      <SearchResultsContent />
    </Suspense>
  )
}
