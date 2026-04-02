'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ArrowLeft, 
  MapPin, 
  Clock, 
  Users, 
  ShieldCheck, 
  Zap, 
  Star, 
  ChevronDown, 
  Hotel, 
  Utensils, 
  Compass, 
  CreditCard,
  AlertCircle,
  ExternalLink,
  Check,
  Calendar
} from 'lucide-react'

interface PackageDetailProps {
  params: {
    id: string
  }
}

export default function PackageDetail({ params }: PackageDetailProps) {
  const { id } = params
  const [pkg, setPkg] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('itinerary')

  useEffect(() => {
    // Mock data for now
    setTimeout(() => {
      setIsLoading(false)
      setPkg({
        name: 'Ultimate Tokyo & Kyoto Discovery',
        total_days: 10,
        total_nights: 9,
        destination: 'Japan',
        image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&q=80&w=1200',
        value_score: 92,
        transparency_score: 95,
        trust_score: 88,
        risk_score: 10,
        pricing: {
          total_per_person: 2499,
          currency: 'USD',
          original_price: 2999
        },
        source_tier: 1,
        source_info: {
          name: 'PremiumTravel',
          url: 'https://premiumtravel.com',
          freshness_days: 0,
          confidence: 98
        },
        nights: [
          {
            day: 1,
            city: 'Tokyo',
            title: 'Arrival & Shinjuku Night Walk',
            hotel: { name: 'Park Hyatt Tokyo', room_type: 'King Deluxe' },
            meals: { breakfast: false, lunch: false, dinner: true },
            activity_summary: 'Guided walk through the neon lights of Shinjuku and a welcome dinner.'
          },
          {
            day: 2,
            city: 'Tokyo',
            title: 'Asakusa & SkyTree',
            hotel: { name: 'Park Hyatt Tokyo', room_type: 'King Deluxe' },
            meals: { breakfast: true, lunch: true, dinner: false },
            activity_summary: 'Traditional temple visit followed by modern heights at SkyTree.'
          },
          {
            day: 3,
            city: 'Tokyo',
            title: 'Fish Market & Sushi Workshop',
            hotel: { name: 'Park Hyatt Tokyo', room_type: 'King Deluxe' },
            meals: { breakfast: true, lunch: true, dinner: false },
            activity_summary: 'Tsukiji Outer Market exploration and sushi making class.'
          },
          {
            day: 4,
            city: 'Kyoto',
            title: 'Bullet Train to Kyoto',
            hotel: { name: 'Ritz-Carlton Kyoto', room_type: 'Garden Suite' },
            meals: { breakfast: true, lunch: false, dinner: true },
            activity_summary: 'Shinkansen ride and evening in Gion district.'
          }
        ],
        activities: [
          {
            id: '1',
            name: 'Shinkansen Green Class Tickets',
            description: 'Luxury bullet train travel between Tokyo and Kyoto.',
            included: true,
            estimated_market_value: 250
          },
          {
            id: '2',
            name: 'Private Geisha Dinner',
            description: 'Exclusive evening in Gion with a traditional Maiko performance.',
            included: true,
            estimated_market_value: 450
          }
        ],
        cancellation_policy: {
          is_refundable: true,
          risk_level: 'low',
          free_cancellation_until: '14 days before'
        }
      })
    }, 800)
  }, [id])

  if (isLoading) {
    return (
      <div className="container-custom pt-32 pb-24 text-center">
        <div className="w-20 h-20 border-4 border-primary-100 border-t-primary-600 rounded-full animate-spin mx-auto mb-6" />
        <p className="text-neutral-500 font-medium">Analyzing package data...</p>
      </div>
    )
  }

  if (!pkg) return null

  return (
    <div className="min-h-screen bg-neutral-50/50 pb-24">
      {/* Immersive Header */}
      <div className="relative h-[50vh] min-h-[400px] overflow-hidden">
        <img 
          src={pkg.image} 
          alt={pkg.name} 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-900 via-neutral-900/40 to-transparent" />
        
        <div className="absolute bottom-0 left-0 w-full p-8 md:p-16">
          <div className="container-custom">
            <Link 
              href="/search" 
              className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-6 transition-colors bg-white/10 backdrop-blur-md px-4 py-2 rounded-full text-sm font-medium"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to results
            </Link>
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
              <div>
                <div className="flex items-center gap-3 text-primary-400 mb-4 font-bold tracking-widest uppercase text-xs">
                  <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {pkg.destination}</span>
                  <span className="w-1 h-1 rounded-full bg-primary-400" />
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {pkg.total_days} Days</span>
                </div>
                <h1 className="text-2xl sm:text-4xl md:text-6xl font-extrabold text-white tracking-tight max-w-3xl leading-[1.1]">
                  {pkg.name}
                </h1>
              </div>
              
              <div className="flex flex-wrap bg-white/10 backdrop-blur-xl border border-white/20 p-3 md:p-4 rounded-2xl md:rounded-3xl items-center gap-3 md:gap-6">
                <div className="text-center">
                  <p className="text-white/60 text-[10px] font-bold uppercase mb-1">Truth Score</p>
                  <div className="text-2xl font-black text-primary-400">{pkg.value_score}</div>
                </div>
                <div className="w-px h-10 bg-white/20" />
                <div className="text-center">
                  <p className="text-white/60 text-[10px] font-bold uppercase mb-1">Trust</p>
                  <div className="text-2xl font-black text-secondary-400">{pkg.trust_score}%</div>
                </div>
                <div className="w-px h-10 bg-white/20" />
                <div className="text-center">
                  <p className="text-white/60 text-[10px] font-bold uppercase mb-1">Safety</p>
                  <div className="text-2xl font-black text-accent-400">{100 - pkg.risk_score}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container-custom mt-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-12">
            {/* Tabs */}
            <div className="flex border-b border-neutral-200 sticky top-24 bg-neutral-50/80 backdrop-blur-md z-30 pt-4 overflow-x-auto scrollbar-none -mx-4 px-4">
              {['itinerary', 'inclusions', 'policies'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-5 md:px-8 py-4 text-sm font-bold uppercase tracking-widest transition-all relative whitespace-nowrap ${
                    activeTab === tab ? 'text-primary-600' : 'text-neutral-400 hover:text-neutral-600'
                  }`}
                >
                  {tab}
                  {activeTab === tab && (
                    <motion.div 
                      layoutId="activeTab" 
                      className="absolute bottom-0 left-0 right-0 h-1 bg-primary-600 rounded-t-full" 
                    />
                  )}
                </button>
              ))}
            </div>

            <AnimatePresence mode="wait">
              {activeTab === 'itinerary' && (
                <motion.div
                  key="itinerary"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-8"
                >
                  {pkg.nights.map((day: any, i: number) => (
                    <div key={i} className="relative pl-12 group">
                      {/* Timeline Line */}
                      <div className="absolute left-[19px] top-10 bottom-[-32px] w-0.5 bg-neutral-200 group-last:hidden" />
                      
                      {/* Timeline Dot */}
                      <div className="absolute left-0 top-0 w-10 h-10 rounded-full bg-white shadow-md border-4 border-primary-50 text-primary-600 flex items-center justify-center font-bold z-10">
                        {day.day}
                      </div>

                      <div className="card p-8">
                        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-6">
                          <div>
                            <span className="text-xs font-bold text-primary-600 uppercase tracking-widest mb-1 block">
                              {day.city}
                            </span>
                            <h3 className="text-2xl font-bold text-neutral-900">{day.title}</h3>
                          </div>
                          <div className="flex gap-2">
                            {day.meals.breakfast && <div className="p-2 rounded-lg bg-neutral-100 text-neutral-600" title="Breakfast"><Utensils className="w-4 h-4" /></div>}
                            <div className="p-2 rounded-lg bg-neutral-100 text-neutral-600" title="Hotel"><Hotel className="w-4 h-4" /></div>
                          </div>
                        </div>

                        <p className="text-neutral-600 leading-relaxed mb-6 italic">
                          "{day.activity_summary}"
                        </p>

                        <div className="flex items-center gap-6 pt-6 border-t border-neutral-100">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center text-primary-600">
                              <Hotel className="w-5 h-5" />
                            </div>
                            <div>
                              <p className="text-[10px] font-bold text-neutral-400 uppercase leading-none mb-1">Accommodation</p>
                              <p className="text-sm font-bold text-neutral-800">{day.hotel.name}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </motion.div>
              )}

              {activeTab === 'inclusions' && (
                <motion.div
                  key="inclusions"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="grid grid-cols-1 md:grid-cols-2 gap-6"
                >
                  {pkg.activities.map((act: any) => (
                    <div key={act.id} className="card p-8 border-l-4 border-success">
                      <div className="flex justify-between items-start mb-4">
                        <div className="w-12 h-12 rounded-2xl bg-success/10 flex items-center justify-center text-success">
                          <Check className="w-6 h-6" />
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] font-black uppercase text-neutral-400">Value</span>
                          <p className="text-lg font-bold text-neutral-900">${act.estimated_market_value}</p>
                        </div>
                      </div>
                      <h3 className="text-xl font-bold mb-2">{act.name}</h3>
                      <p className="text-sm text-neutral-600 leading-relaxed">{act.description}</p>
                    </div>
                  ))}
                  
                  <div className="card p-8 bg-primary-600 text-white border-none md:col-span-2 relative overflow-hidden">
                    <Zap className="absolute top-[-20px] right-[-20px] w-48 h-48 opacity-10 rotate-12" />
                    <h3 className="text-2xl font-bold mb-4 relative z-10">Total Included Value</h3>
                    <p className="text-4xl font-black mb-2 relative z-10">$1,450 / person</p>
                    <p className="text-primary-100 text-sm relative z-10">We calculated this by analyzing individual market rates for hotels and activities.</p>
                  </div>
                </motion.div>
              )}

              {activeTab === 'policies' && (
                <motion.div
                  key="policies"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  <div className="card p-10">
                    <div className="flex items-center gap-6 mb-8">
                      <div className="w-16 h-16 rounded-[2rem] bg-warning/10 flex items-center justify-center text-warning">
                        <AlertCircle className="w-8 h-8" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold">Cancellation Policy</h3>
                        <p className="text-neutral-500 font-medium capitalize">{pkg.cancellation_policy.risk_level} Risk Level</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-5 h-5 rounded-full flex items-center justify-center ${pkg.cancellation_policy.is_refundable ? 'bg-success text-white' : 'bg-neutral-200'}`}>
                            {pkg.cancellation_policy.is_refundable && <Check className="w-3 h-3" />}
                          </div>
                          <span className="font-bold">Refundable Package</span>
                        </div>
                        <p className="text-sm text-neutral-500 pl-8">
                          This package qualifies for a full refund if cancelled within the specified window.
                        </p>
                      </div>
                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          <Calendar className="w-5 h-5 text-primary-600" />
                          <span className="font-bold">Deadline: {pkg.cancellation_policy.free_cancellation_until}</span>
                        </div>
                        <p className="text-sm text-neutral-500 pl-8">
                          Make changes or cancel for free before this date. 
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Sidebar - Sticky Booking */}
          <div className="lg:col-span-1">
            <div className="sticky top-32 space-y-6">
              <div className="card p-8 shadow-2xl border-primary-100">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <span className="text-xs font-bold text-neutral-400 uppercase tracking-widest line-through">
                      ${pkg.pricing.original_price}
                    </span>
                    <div className="flex items-end gap-1">
                      <span className="text-4xl font-black text-neutral-900">${pkg.pricing.total_per_person}</span>
                      <span className="text-sm font-bold text-neutral-500 pb-1">/ person</span>
                    </div>
                  </div>
                  <div className="bg-success/10 text-success text-[10px] font-black px-3 py-1.5 rounded-lg uppercase">
                    Save 16%
                  </div>
                </div>

                <div className="space-y-4 mb-8">
                  <div className="flex items-center justify-between text-sm p-3 rounded-xl bg-neutral-50 border border-neutral-100">
                    <span className="text-neutral-500 flex items-center gap-2"><MapPin className="w-4 h-4" /> Start</span>
                    <span className="font-bold text-neutral-800">Tokyo, NRT</span>
                  </div>
                  <div className="flex items-center justify-between text-sm p-3 rounded-xl bg-neutral-50 border border-neutral-100">
                    <span className="text-neutral-500 flex items-center gap-2"><Users className="w-4 h-4" /> Guests</span>
                    <span className="font-bold text-neutral-800">2 Travelers</span>
                  </div>
                </div>

                <a 
                  href={pkg.source_info.url}
                  target="_blank"
                  className="btn-primary w-full py-5 flex items-center justify-center gap-3"
                >
                  <CreditCard className="w-5 h-5" />
                  <span>Book on {pkg.source_info.name}</span>
                  <ExternalLink className="w-4 h-4 opacity-50" />
                </a>

                <p className="text-[10px] text-center text-neutral-400 mt-6 font-medium">
                  Price verified {pkg.source_info.freshness_days} hours ago • No commission charged by OnTrip
                </p>
              </div>

              {/* Trust Badge */}
              <div className="glass p-6 rounded-3xl flex items-start gap-4 border-warning/20">
                <ShieldCheck className="w-6 h-6 text-warning flex-shrink-0" />
                <div>
                  <h4 className="text-sm font-bold mb-1">Buyer Protection</h4>
                  <p className="text-xs text-neutral-500 leading-relaxed">
                    This operator has a 98% confidence score. We recommend using a travel credit card for additional protection.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

