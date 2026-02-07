'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface PackageDetailProps {
  params: {
    id: string
  }
}

export default function PackageDetail({ params }: PackageDetailProps) {
  const { id } = params
  const [pkg, setPkg] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    // Mock data for now
    setIsLoading(false)
    setPkg({
      name: 'Paris Adventure Tour',
      total_days: 7,
      total_nights: 6,
      destination: 'Paris',
      value_score: 85,
      transparency_score: 88,
      trust_score: 90,
      risk_score: 15,
      pricing: {
        total_per_person: 1299,
        currency: 'USD'
      },
      source_tier: 2,
      source_info: {
        name: 'Viator',
        url: 'https://viator.com',
        freshness_days: 1,
        confidence: 95
      },
      nights: [
        {
          night_number: 1,
          city: 'Paris',
          hotel: { name: 'Hotel Example', room_type: 'Standard' },
          meals: { breakfast: true, lunch: false, dinner: true },
          activity_summary: 'City tour'
        }
      ],
      activities: [
        {
          id: '1',
          name: 'Eiffel Tower Visit',
          description: 'Guided tour',
          included: true,
          estimated_market_value: 50
        }
      ],
      cancellation_policy: {
        is_refundable: true,
        risk_level: 'low',
        free_cancellation_until: '7 days before'
      }
    })
  }, [id])

  if (isLoading) {
    return (
      <div className="container max-w-4xl py-12">
        <p className="text-neutral-600">Loading package details...</p>
      </div>
    )
  }

  if (error || !pkg) {
    return (
      <div className="container max-w-4xl py-12">
        <p className="text-error">Package not found</p>
        <Link href="/" className="text-primary-600 hover:text-primary-700 transition-colors">
          Back to search
        </Link>
      </div>
    )
  }

  return (
    <div className="container max-w-4xl py-12">
      {/* Header */}
      <div className="mb-8">
        <Link href="/" className="text-primary-600 hover:text-primary-700 transition-colors text-sm mb-3 inline-block">
          ← Back to search
        </Link>
        <h1 className="text-4xl font-extrabold mb-3 text-neutral-900 tracking-tight">{pkg.name}</h1>
        <div className="flex gap-4 text-neutral-600">
          <span>{pkg.total_days} days • {pkg.total_nights} nights</span>
          <span>{pkg.destination}</span>
        </div>
      </div>

      {/* Scoring Section */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="card p-6 border-l-4 border-success">
          <div className="text-4xl font-bold text-success">{pkg.value_score}</div>
          <div className="font-semibold text-neutral-900 mt-2">Value Score</div>
          <p className="text-sm text-neutral-600 mt-2 leading-relaxed">
            Cost-per-night vs market average
          </p>
        </div>

        <div className="card p-6 border-l-4 border-primary-600">
          <div className="text-4xl font-bold text-primary-600">{pkg.transparency_score}</div>
          <div className="font-semibold text-neutral-900 mt-2">Transparency</div>
          <p className="text-sm text-neutral-600 mt-2 leading-relaxed">
            Clarity of terms & inclusions
          </p>
        </div>

        <div className="card p-6 border-l-4 border-secondary">
          <div className="text-4xl font-bold text-secondary">{pkg.trust_score}</div>
          <div className="font-semibold text-neutral-900 mt-2">Trust Score</div>
          <p className="text-sm text-neutral-600 mt-2 leading-relaxed">
            Operator reputation & reviews
          </p>
        </div>

        <div className="card p-6 border-l-4 border-warning">
          <div className="text-4xl font-bold text-warning">{100 - pkg.risk_score}</div>
          <div className="font-semibold text-neutral-900 mt-2">Safety</div>
          <p className="text-sm text-neutral-600 mt-2 leading-relaxed">
            Lower risk = better
          </p>
        </div>
      </div>

      {/* Pricing */}
      <div className="card p-8 mb-8">
        <h2 className="font-bold text-xl mb-6 text-neutral-900">Pricing</h2>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <div className="text-sm text-neutral-600 mb-1">Price per Person</div>
            <div className="text-4xl font-bold text-neutral-900">
              ${Math.round(pkg.pricing.total_per_person)}
            </div>
          </div>
          <div>
            <div className="text-sm text-neutral-600 mb-1">Currency</div>
            <div className="text-2xl font-bold text-neutral-900">{pkg.pricing.currency}</div>
          </div>
        </div>
      </div>

      {/* Trust & Source Info */}
      <div className="card p-8 mb-8 border-l-4 border-primary-600">
        <h2 className="font-bold text-xl mb-6 text-neutral-900">Data & Source Information</h2>
        <div className="space-y-4">
          <div className="flex justify-between">
            <span className="text-neutral-700">Source Tier</span>
            <span className="font-semibold text-neutral-900">Tier {pkg.source_tier}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-neutral-700">Source Platform</span>
            <a
              href={pkg.source_info.url}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-primary-600 hover:text-primary-700 transition-colors"
            >
              {pkg.source_info.name} ↗
            </a>
          </div>
          <div className="flex justify-between">
            <span className="text-neutral-700">Last Updated</span>
            <span className="font-semibold text-neutral-900">{pkg.source_info.freshness_days} days ago</span>
          </div>
          <div className="flex justify-between">
            <span className="text-neutral-700">Confidence Score</span>
            <span className="font-semibold text-neutral-900">{pkg.source_info.confidence}%</span>
          </div>
        </div>
      </div>

      {/* Itinerary */}
      {pkg.nights && pkg.nights.length > 0 && (
        <div className="mb-8">
          <h2 className="font-bold text-xl mb-6 text-neutral-900">Itinerary</h2>
          <div className="space-y-4">
            {pkg.nights.map((night: any) => (
              <div key={night.night_number} className="card p-6">
                <div className="font-semibold mb-3 text-neutral-900">
                  Night {night.night_number}: {night.city}
                </div>
                <div className="text-neutral-700 mb-2">
                  🏨 {night.hotel.name} • {night.hotel.room_type}
                </div>
                <div className="text-sm text-neutral-600">
                  {night.meals.breakfast && '🍳 Breakfast • '}
                  {night.meals.lunch && '🥗 Lunch • '}
                  {night.meals.dinner && '🍽️ Dinner'}
                </div>
                {night.activity_summary && (
                  <div className="text-sm text-neutral-600 mt-2">
                    📍 {night.activity_summary}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Activities */}
      {pkg.activities && pkg.activities.length > 0 && (
        <div className="mb-8">
          <h2 className="font-bold text-xl mb-6 text-neutral-900">Activities & Experiences</h2>
          <div className="space-y-4">
            {pkg.activities
              .filter((a: any) => a.included)
              .map((activity: any) => (
                <div key={activity.id} className="card p-6">
                  <div className="flex justify-between items-start mb-2">
                    <div className="font-semibold text-neutral-900">{activity.name}</div>
                    {activity.estimated_market_value && (
                      <div className="text-sm text-neutral-600">
                        Market value: ${activity.estimated_market_value}
                      </div>
                    )}
                  </div>
                  {activity.description && (
                    <p className="text-neutral-700 text-sm leading-relaxed">{activity.description}</p>
                  )}
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Cancellation Policy */}
      {pkg.cancellation_policy && (
        <div className="mb-8">
          <h2 className="font-bold text-xl mb-6 text-neutral-900">Cancellation Policy</h2>
          <div className="card p-8">
            <div className="grid grid-cols-2 gap-6 mb-6">
              <div>
                <div className="text-sm text-neutral-600 mb-1">Refundable</div>
                <div className="font-semibold text-neutral-900">
                  {pkg.cancellation_policy.is_refundable ? 'Yes' : 'No'}
                </div>
              </div>
              <div>
                <div className="text-sm text-neutral-600 mb-1">Risk Level</div>
                <div className="font-semibold capitalize text-neutral-900">
                  {pkg.cancellation_policy.risk_level}
                </div>
              </div>
            </div>
            {pkg.cancellation_policy.free_cancellation_until && (
              <div>
                <div className="text-sm text-neutral-600 mb-1">Free Cancellation Until</div>
                <div className="font-semibold text-neutral-900">{pkg.cancellation_policy.free_cancellation_until}</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* CTA */}
      <div className="border-t border-neutral-200 pt-8">
        <a
          href={pkg.source_info.url}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-primary block text-center mb-6"
        >
          Book on {pkg.source_info.name} →
        </a>
        <div className="card p-6 border-l-4 border-warning text-sm text-neutral-700 leading-relaxed">
          <strong>Important:</strong> You are leaving OnTrip to complete your booking. Please confirm all details and pricing on the source website before booking.
        </div>
      </div>
    </div>
  )
}
