import './globals.css'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <title>OnTrip - Honest Tour Package Comparison</title>
        <meta
          name="description"
          content="Compare tour packages transparently. We show you what each package really includes, not just the price."
        />
      </head>
      <body>
        <header className="bg-white border-b border-neutral-200/50">
          <nav className="container py-5 flex justify-between items-center">
            <div className="text-2xl font-bold text-neutral-900">OnTrip</div>
            <div className="flex items-center gap-12">
              <div className="flex items-center gap-8">
                <a href="/" className="text-sm text-neutral-700 hover:text-neutral-900 transition-colors font-medium">Home</a>
                <a href="/methodology" className="text-sm text-neutral-700 hover:text-neutral-900 transition-colors font-medium">How We Work</a>
                <a href="/about" className="text-sm text-neutral-700 hover:text-neutral-900 transition-colors font-medium">About</a>
              </div>
              <a href="/signin" className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2.5 rounded-full text-sm font-semibold transition-all duration-200">
                Sign In
              </a>
            </div>
          </nav>
        </header>

        <main className="min-h-screen">
          {children}
        </main>

        <footer className="bg-neutral-900 text-white py-12 mt-20">
          <div className="container">
            <div className="grid grid-cols-3 gap-12 mb-8">
              <div>
                <h3 className="font-semibold mb-4">OnTrip</h3>
                <p className="text-sm text-neutral-400 leading-relaxed">
                  Transparent tour package comparison powered by data, not marketing.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-4">Product</h3>
                <ul className="text-sm text-neutral-400 space-y-2.5">
                  <li><a href="/" className="hover:text-white transition-colors">Search</a></li>
                  <li><a href="/methodology" className="hover:text-white transition-colors">Methodology</a></li>
                  <li><a href="/api" className="hover:text-white transition-colors">API Docs</a></li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-4">Legal</h3>
                <ul className="text-sm text-neutral-400 space-y-2.5">
                  <li><a href="/privacy" className="hover:text-white transition-colors">Privacy</a></li>
                  <li><a href="/terms" className="hover:text-white transition-colors">Terms</a></li>
                  <li><a href="/disclaimer" className="hover:text-white transition-colors">Disclaimer</a></li>
                </ul>
              </div>
            </div>
            <div className="border-t border-neutral-800 pt-8 text-sm text-neutral-400">
              <p>&copy; 2026 OnTrip. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  )
}
