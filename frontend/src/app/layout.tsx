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
      <body className="antialiased bg-[#f0f4ff]">
        <div className="flex flex-col min-h-screen relative overflow-x-clip w-full max-w-[100vw]">
          <Navbar />
          <main className="flex-grow pt-24 overflow-x-clip">
            {children}
          </main>
          <Footer />
        </div>
        <Analytics />
      </body>
    </html>
  )
}
