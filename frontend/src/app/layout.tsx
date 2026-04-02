import './globals.css'
import { Analytics } from '@vercel/analytics/next'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

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
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body>
        <Navbar />
        <main className="min-h-screen pt-24">
          {children}
        </main>
        <Footer />
        <Analytics />
      </body>
    </html>
  )
}
