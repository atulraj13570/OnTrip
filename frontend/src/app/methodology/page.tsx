export default function Methodology() {
  return (
    <div className="container max-w-4xl py-12">
      <h1 className="text-4xl font-extrabold mb-8 text-neutral-900 tracking-tight">How OnTrip Works</h1>

      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4 text-neutral-900">The 7-Tier Data System</h2>
        <p className="text-neutral-700 mb-6">
          Not all data is equal. We classify every package into one of 7 tiers based on freshness,
          reliability, and source type.
        </p>

        <div className="space-y-6">
          {[
            {
              tier: 1,
              name: 'Owned, Partnered, Franchised',
              freshness: '0-2 hours',
              confidence: '95%+',
              example: 'Our own agencies and direct partners',
            },
            {
              tier: 2,
              name: 'Tour Marketplaces',
              freshness: '6-48 hours',
              confidence: '80-90%',
              example: 'Viator, GetYourGuide, Klook',
            },
            {
              tier: 3,
              name: 'Online Travel Agencies',
              freshness: '1-3 days',
              confidence: '70-75%',
              example: 'Expedia, Booking.com (for reference)',
            },
            {
              tier: 4,
              name: 'Destination Specialists',
              freshness: '1-7 days',
              confidence: '85%+',
              example: 'Local operators and DMCs',
            },
            {
              tier: 5,
              name: 'Activity Components',
              freshness: '1-3 days',
              confidence: '75-80%',
              example: 'Airbnb, Civitatis, activity platforms',
            },
            {
              tier: 6,
              name: 'Reviews & Reputation',
              freshness: '0-7 days',
              confidence: 'Variable',
              example: 'TripAdvisor, Google Reviews, Trustpilot',
            },
            {
              tier: 7,
              name: 'Open Web & Context',
              freshness: '1-30 days',
              confidence: '40-60%',
              example: 'News, blogs, market trends',
            },
          ].map((item) => (
            <div key={item.tier} className="card p-6">
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-bold">
                  Tier {item.tier}: {item.name}
                </h3>
                <span className="bg-primary-100 text-primary-600 px-3 py-1 rounded-full text-sm font-semibold">
                  {item.confidence}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-neutral-600">Data Freshness:</span> {item.freshness}
                </div>
                <div>
                  <span className="text-neutral-600">Example:</span> {item.example}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4 text-neutral-900">Scoring Methodology</h2>
        <p className="text-neutral-700 mb-6">
          Every package gets four scores, each calculated from different factors:
        </p>

        <div className="space-y-6">
          <div className="card p-6 border-l-4 border-success">
            <h3 className="font-bold mb-3 text-success">Value Score (0-100)</h3>
            <p className="text-neutral-700 mb-3">
              Measures what you actually get for your money. We compare:
            </p>
            <ul className="text-neutral-700 list-disc list-inside space-y-1 text-sm">
              <li>Cost per night vs market average for similar packages</li>
              <li>Hotel ratings and room quality</li>
              <li>Meals included (breakfast, lunch, dinner)</li>
              <li>Activity value compared to standalone pricing</li>
            </ul>
          </div>

          <div className="card p-6 border-l-4 border-primary-600">
            <h3 className="font-bold mb-3 text-primary-600">Transparency Score (0-100)</h3>
            <p className="text-neutral-700 mb-3">
              Measures how honest and clear the package description is:
            </p>
            <ul className="text-neutral-700 list-disc list-inside space-y-1 text-sm">
              <li>Complete night-by-night itinerary</li>
              <li>Specific meals and dietary options</li>
              <li>Activity details with durations</li>
              <li>Clear cancellation policy</li>
              <li>No suspicious language or hidden fees</li>
            </ul>
          </div>

          <div className="card p-6 border-l-4 border-secondary">
            <h3 className="font-bold mb-3 text-secondary">Trust Score (0-100)</h3>
            <p className="text-neutral-700 mb-3">
              Based on the operator's track record:
            </p>
            <ul className="text-neutral-700 list-disc list-inside space-y-1 text-sm">
              <li>Customer reviews (TripAdvisor, Trustpilot, Google)</li>
              <li>Average rating and number of reviews</li>
              <li>License status and insurance coverage</li>
              <li>Years in business</li>
              <li>Complaint history</li>
            </ul>
          </div>

          <div className="card p-6 border-l-4 border-warning">
            <h3 className="font-bold mb-3 text-warning">Risk Score (0-100, higher = riskier)</h3>
            <p className="text-neutral-700 mb-3">
              Identifies packages with elevated risk factors:
            </p>
            <ul className="text-neutral-700 list-disc list-inside space-y-1 text-sm">
              <li>Destination safety and travel advisories</li>
              <li>Non-refundable cancellation policy</li>
              <li>Operator cancellation history</li>
              <li>Data freshness (old data = less certainty)</li>
              <li>Health or visa requirements</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4 text-neutral-900">What OnTrip Is NOT</h2>
        <ul className="space-y-2 text-neutral-700">
          <li>❌ A booking site. We compare and educate. You book on the source platform.</li>
          <li>❌ Real-time inventory. Many sources update daily or weekly, not by the second.</li>
          <li>
            ❌ A guarantee of package quality. Scores are based on stated terms, not lived
            experience.
          </li>
          <li>❌ A replacement for human travel advisors. Useful for self-directed research.</li>
          <li>❌ Universal coverage. We can't include packages from every operator everywhere.</li>
        </ul>
      </section>

      <section className="card p-8 border-l-4 border-primary-600">
        <h2 className="text-2xl font-bold mb-4 text-neutral-900">Your Privacy & Our Responsibility</h2>
        <p className="text-neutral-700 mb-3">
          We collect your search queries and package views to improve recommendations. We never
          sell your data. You can disable cookies or request deletion at any time.
        </p>
        <p className="text-neutral-700">
          <a href="/privacy" className="text-primary-600 hover:text-primary-700 transition-colors">
            Read our full Privacy Policy →
          </a>
        </p>
      </section>
    </div>
  )
}
