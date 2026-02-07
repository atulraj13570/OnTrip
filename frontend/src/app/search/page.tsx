'use client'

import { useSearchParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function SearchResults() {
  const searchParams = useSearchParams()
  const destination = searchParams.get('destination') || ''
  const [packages, setPackages] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (destination) {
      setIsLoading(false)
      // Mock data for now
      setPackages([
        {
          id: '1',
          name: `${destination} Adventure Tour`,
          days: 7,
          nights: 6,
          source_tier: 2,
          data_freshness_days: 1,
          price_per_person: 1299,
          value_score: 85,
          trust_score: 90,
          overall_score: 87
        }
      ])
    }
  }, [destination])

  if (!destination) {
    return (
      <div className="container py-12">
        <p className="text-neutral-600">Please enter a destination to search</p>
      </div>
    )
  }

  return (
    <div className="container py-12">
      <h1 className="text-4xl font-extrabold mb-8 text-neutral-900 tracking-tight">Tours in {destination}</h1>

      {isLoading && <p className="text-neutral-600">Loading...</p>}

      <div className="space-y-6">
        {packages.map((pkg) => (
          <Link
            key={pkg.id}
            href={`/packages/${pkg.id}`}
            className="card block p-8"
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold text-xl mb-2 text-neutral-900">{pkg.name}</h3>
                <p className="text-sm text-neutral-600">{pkg.days} days • {pkg.nights} nights</p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-neutral-900">${pkg.price_per_person}</div>
                <div className="text-xs text-neutral-500">per person</div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
