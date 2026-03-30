'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Zap, Search, Globe, ChevronRight, 
  ShieldCheck, AlertCircle, Database, 
  ArrowRight, CheckCircle2, RefreshCw
} from 'lucide-react'

const SCRAPER_SITES = [
  { name: 'Holidify', status: 'active', coverage: 'High', lastSync: '2m ago', packages: 1240 },
  { name: 'TravelTriangle', status: 'active', coverage: 'Medium', lastSync: '10m ago', packages: 850 },
  { name: 'UnoTrips', status: 'active', coverage: 'Medium', lastSync: '1h ago', packages: 230 },
  { name: 'EaseMyTrip', status: 'pending', coverage: 'N/A', lastSync: 'Never', packages: 0 },
  { name: 'Deyor', status: 'pending', coverage: 'N/A', lastSync: 'Never', packages: 0 },
  { name: 'HeenaTours', status: 'pending', coverage: 'N/A', lastSync: 'Never', packages: 0 },
  { name: 'Kiomoi', status: 'pending', coverage: 'N/A', lastSync: 'Never', packages: 0 },
  { name: 'GoTravelista', status: 'pending', coverage: 'N/A', lastSync: 'Never', packages: 0 },
  { name: 'Nexplore', status: 'pending', coverage: 'N/A', lastSync: 'Never', packages: 0 },
  { name: 'ETripto', status: 'pending', coverage: 'N/A', lastSync: 'Never', packages: 0 },
  { name: 'NavBharatTourism', status: 'pending', coverage: 'N/A', lastSync: 'Never', packages: 0 },
  { name: 'SetMyTrip', status: 'pending', coverage: 'N/A', lastSync: 'Never', packages: 0 },
  { name: 'MakeMyHoliday', status: 'pending', coverage: 'N/A', lastSync: 'Never', packages: 0 },
]

export default function ScraperDashboard() {
  const [isScanning, setIsScanning] = useState(false)
  const [progress, setProgress] = useState(0)

  const handleScan = () => {
    setIsScanning(true)
    let current = 0
    const interval = setInterval(() => {
      current += 2
      setProgress(current)
      if (current >= 100) {
        clearInterval(interval)
        setIsScanning(false)
      }
    }, 100)
  }

  return (
    <div className="min-h-screen pt-32 pb-20 bg-[#f0f4ff]">
      <div className="container-custom">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-16 px-6">
          <motion.div 
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-primary-600 flex items-center justify-center text-white shadow-xl">
                <Database className="w-6 h-6" />
              </div>
              <h1 className="text-4xl font-black text-neutral-900 tracking-tighter">DATA INGESTION HUB</h1>
            </div>
            <p className="text-neutral-500 font-bold max-w-lg">
              Manage multi-dimensional scraping across 13 global travel providers. 
              Real-time synchronization with the OnTrip Truth Engine.
            </p>
          </motion.div>

          <motion.button 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            onClick={handleScan}
            disabled={isScanning}
            className="btn-4d py-5 px-12 text-sm flex items-center gap-3 disabled:opacity-50"
          >
            {isScanning ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Zap className="w-5 h-5" />}
            <span>{isScanning ? `SCANNING LAYER (${progress}%)` : 'TRIGGER GLOBAL SCAN'}</span>
          </motion.button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-16 px-6">
          {[
            { label: 'Total Scraped', value: '2,320', icon: <Globe className="w-5 h-5" />, color: 'primary' },
            { label: 'Truth Verified', value: '98.4%', icon: <ShieldCheck className="w-5 h-5" />, color: 'emerald' },
            { label: 'Active APIs', value: '3/13', icon: <Zap className="w-5 h-5" />, color: 'amber' },
            { label: 'System Health', value: 'EXCELLENT', icon: <CheckCircle2 className="w-5 h-5" />, color: 'sky' }
          ].map((stat, i) => (
            <motion.div 
              key={i}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: i * 0.1 }}
              className="glass-4d p-8 rounded-[2rem] border-white/60 shadow-xl"
            >
              <div className={`w-10 h-10 rounded-xl bg-white flex items-center justify-center text-primary-600 mb-4 shadow-sm`}>
                {stat.icon}
              </div>
              <p className="text-xs font-black text-neutral-400 uppercase tracking-widest mb-1">{stat.label}</p>
              <p className="text-2xl font-black text-neutral-900">{stat.value}</p>
            </motion.div>
          ))}
        </div>

        {/* Sources Table */}
        <motion.div 
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="glass-4d rounded-[3rem] overflow-hidden border-white/60 shadow-4d mx-6"
        >
          <div className="p-10 border-b border-white/40 flex items-center justify-between">
            <h2 className="text-2xl font-black text-neutral-900 tracking-tighter">SOURCE DIRECTORY</h2>
            <div className="flex gap-4">
              <span className="px-4 py-2 rounded-xl bg-white/60 text-[10px] font-black uppercase tracking-widest border border-white/60">13 Total Sources</span>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left font-sans">
              <thead>
                <tr className="border-b border-white/20 bg-white/20 text-[10px] font-black text-neutral-400 uppercase tracking-widest">
                  <th className="px-10 py-6">Source Name</th>
                  <th className="px-10 py-6">Status</th>
                  <th className="px-10 py-6">Coverage</th>
                  <th className="px-10 py-6">Last Sync</th>
                  <th className="px-10 py-6">Vol.</th>
                  <th className="px-10 py-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {SCRAPER_SITES.map((site, i) => (
                  <tr key={site.name} className="border-b border-white/10 hover:bg-white/30 transition-colors group">
                    <td className="px-10 py-6">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center text-primary-600 font-black text-[10px]`}>
                          {site.name[0]}
                        </div>
                        <span className="font-bold text-neutral-800">{site.name}</span>
                      </div>
                    </td>
                    <td className="px-10 py-6">
                      <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        site.status === 'active' ? 'bg-emerald-100 text-emerald-600' : 'bg-neutral-100 text-neutral-400'
                      }`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${site.status === 'active' ? 'bg-emerald-600 animate-pulse' : 'bg-neutral-400'}`} />
                        {site.status}
                      </span>
                    </td>
                    <td className="px-10 py-6 font-bold text-neutral-600">{site.coverage}</td>
                    <td className="px-10 py-6 text-neutral-400 font-bold">{site.lastSync}</td>
                    <td className="px-10 py-6 font-black text-neutral-800">{site.packages}</td>
                    <td className="px-10 py-6 text-right">
                      <button className="p-3 rounded-xl hover:bg-primary-50 text-neutral-400 hover:text-primary-600 transition-all">
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Live Scraped Previews */}
        <div className="mt-24 px-6">
          <h3 className="text-xl font-black text-neutral-900 mb-8 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-amber-500" />
            LIVE DATA PREVIEW (SCRAPED)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { site: 'Holidify', price: '₹24,999', pkg: 'Bali Adventure - 6D/5N' },
              { site: 'TravelTriangle', price: '₹35,000', pkg: 'Ultimate Bali Escape - 7D/6N' },
              { site: 'UnoTrips', price: '₹28,500', pkg: 'Bali Spirit Tour - 5D/4N' }
            ].map((p, i) => (
              <motion.div 
                key={i}
                whileHover={{ y: -10 }}
                className="glass-4d p-8 rounded-[2.5rem] bg-white/40 border-white/60 shadow-xl"
              >
                <p className="text-[10px] font-black text-primary-600 uppercase tracking-widest mb-4">{p.site}</p>
                <h4 className="text-lg font-black text-neutral-900 mb-2 truncate">{p.pkg}</h4>
                <p className="text-3xl font-black text-neutral-900 tracking-tighter mb-6">{p.price}</p>
                <div className="flex items-center gap-2 text-[10px] font-black text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-xl uppercase tracking-wider inline-block">
                  <CheckCircle2 className="w-4 h-4" />
                  Schema Verified
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="mt-24 text-center pb-20 px-6">
           <button className="btn-4d py-6 px-20 group">
              EXHAUSTIVE ANALYTICS
              <ArrowRight className="w-6 h-6 inline-block ml-4 group-hover:translate-x-3 transition-transform duration-500" />
           </button>
        </div>
      </div>
    </div>
  )
}
