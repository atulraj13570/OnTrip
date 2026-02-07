'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function Home() {
  const [destination, setDestination] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const router = useRouter()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (destination && startDate && endDate) {
      router.push(`/search?destination=${destination}&start=${startDate}&end=${endDate}`)
    }
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section - CENTERED */}
      <section className="py-20 md:py-32">
        <div className="w-full max-w-2xl mx-auto px-6">
          {/* Eyebrow */}
          <div className="text-center mb-4">
            <span className="text-xs md:text-sm font-semibold text-primary-600 uppercase tracking-wider">
              A SAFE SPACE FOR YOU
            </span>
          </div>

          {/* Headline */}
          <h1 className="text-center text-4xl sm:text-5xl md:text-6xl font-extrabold mb-6 text-neutral-900 tracking-tight">
            Find Your Perfect Tour Package
          </h1>

          {/* Supporting Text */}
          <p className="text-center text-base md:text-lg text-neutral-700 mb-12 max-w-xl mx-auto">
            We compare tour packages transparently so you can see exactly what each one includes.
            Not just the cheapest—the best value.
          </p>

          {/* Search Form */}
          <form onSubmit={handleSearch} className="card p-8 md:p-10 w-full">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Where are you going?
                </label>
                <input
                  type="text"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  placeholder="e.g., Paris, Bali, Rome"
                  className="input-field w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  From
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="input-field w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  To
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="input-field w-full"
                />
              </div>
            </div>
            <button type="submit" className="btn-primary w-full">
              Search Packages
            </button>
          </form>
        </div>
      </section>

      {/* Trust Statement - CENTERED */}
      <section className="py-16 md:py-20">
        <div className="w-full max-w-4xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            <div className="card p-8 md:p-10 text-center">
              <div className="text-4xl md:text-5xl font-bold text-primary-600 mb-4">✓</div>
              <h3 className="font-bold text-neutral-900 mb-3 text-base md:text-lg">Honest Comparison</h3>
              <p className="text-neutral-600 text-sm">
                We break down packages into components so you see what each dollar actually buys.
              </p>
            </div>
            <div className="card p-8 md:p-10 text-center">
              <div className="text-4xl md:text-5xl font-bold text-primary-600 mb-4">✓</div>
              <h3 className="font-bold text-neutral-900 mb-3 text-base md:text-lg">No Bookings. No Commission.</h3>
              <p className="text-neutral-600 text-sm">
                We compare and educate. You book directly on the source platform.
              </p>
            </div>
            <div className="card p-8 md:p-10 text-center">
              <div className="text-4xl md:text-5xl font-bold text-primary-600 mb-4">✓</div>
              <h3 className="font-bold text-neutral-900 mb-3 text-base md:text-lg">Transparent Scoring</h3>
              <p className="text-neutral-600 text-sm">
                Every score is explained. We show you our methodology, not black boxes.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How OnTrip Works - CENTERED */}
      <section className="py-16 md:py-20">
        <div className="w-full max-w-3xl mx-auto px-6">
          <div className="card p-10 md:p-12">
            <h2 className="text-center text-3xl md:text-4xl font-bold mb-6 md:mb-8 text-neutral-900">
              How OnTrip Works
            </h2>
            <ol className="space-y-5 md:space-y-6 text-neutral-700 text-sm md:text-base max-w-2xl mx-auto">
              <li className="flex gap-3 md:gap-4">
                <span className="font-bold text-neutral-900 flex-shrink-0">1.</span>
                <span>Search for your destination and dates</span>
              </li>
              <li className="flex gap-3 md:gap-4">
                <span className="font-bold text-neutral-900 flex-shrink-0">2.</span>
                <span>See packages compared by value, trust, and transparency—not just price</span>
              </li>
              <li className="flex gap-3 md:gap-4">
                <span className="font-bold text-neutral-900 flex-shrink-0">3.</span>
                <span>Click on any package to see the full breakdown: which hotels, meals, activities</span>
              </li>
              <li className="flex gap-3 md:gap-4">
                <span className="font-bold text-neutral-900 flex-shrink-0">4.</span>
                <span>Compare 2-4 packages side-by-side</span>
              </li>
              <li className="flex gap-3 md:gap-4">
                <span className="font-bold text-neutral-900 flex-shrink-0">5.</span>
                <span>Book on the source platform when you're ready</span>
              </li>
            </ol>
            <div className="text-center mt-8 md:mt-10">
              <Link
                href="/methodology"
                className="text-neutral-900 font-semibold hover:text-primary-600 transition-colors inline-flex items-center gap-2 text-sm md:text-base"
              >
                Learn more about our methodology
                <span className="text-base md:text-lg">→</span>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
