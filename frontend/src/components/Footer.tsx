import Link from 'next/link'
import { Plane, Globe, Mail } from 'lucide-react'

export default function Footer() {
  return (
<footer className="pt-20 pb-16 relative overflow-hidden mt-40">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary-500 to-transparent opacity-30" />
      <div className="absolute -bottom-48 -left-48 w-[40rem] h-[40rem] bg-primary-600/5 rounded-full blur-[120px]" />
      <div className="absolute -top-48 -right-48 w-[40rem] h-[40rem] bg-secondary-500/5 rounded-full blur-[120px]" />

      <div className="container-custom relative z-10 px-6 md:px-12">
        <div className="glass-4d p-12 md:p-24 rounded-[4rem] md:rounded-[6rem] shadow-4d border-white/60 mb-20 relative group">
           {/* Inner shine */}
           <div className="absolute inset-0 bg-gradient-to-br from-primary-600/5 via-transparent to-secondary-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
           
           <div className="grid grid-cols-1 md:grid-cols-4 gap-16 md:gap-32 relative z-20">
             <div className="col-span-1 md:col-span-1">
               <Link href="/" className="flex items-center gap-4 mb-8 group">
                 <div className="w-14 h-14 bg-primary-600 rounded-2xl flex items-center justify-center text-white shadow-xl group-hover:rotate-[360deg] transition-transform duration-1000">
                   <Plane className="w-8 h-8 rotate-45" />
                 </div>
                 <div className="flex flex-col">
                   <span className="text-2xl font-black tracking-tighter text-neutral-900 leading-none">
                     On<span className="text-primary-600 tracking-normal">Trip</span>
                   </span>
                   <span className="text-[10px] font-black text-secondary-500 uppercase tracking-widest leading-none mt-1">4D Logic</span>
                 </div>
               </Link>
               <p className="text-neutral-500 font-bold leading-relaxed mb-8 text-sm">
                 Empowering voyagers with pure, transparent, and multidimensional data. No layers of hidden costs—just the horizon.
               </p>
               <div className="flex items-center gap-6">
                 {/* Social links with 4D depth */}
                 {[Globe, Mail].map((Icon, i) => (
                   <a key={i} href="#" className="w-12 h-12 rounded-2xl glass-4d flex items-center justify-center text-neutral-400 hover:text-primary-600 hover:shadow-xl hover:-translate-y-1 transition-all">
                     <Icon className="w-6 h-6" />
                   </a>
                 ))}
               </div>
             </div>

             <div>
               <h4 className="text-neutral-900 font-black uppercase tracking-widest text-xs mb-8">Discovery</h4>
               <ul className="space-y-6 text-sm font-bold text-neutral-500">
                 {['Find Packages', 'Popular Routes', 'How We Compare'].map(link => (
                   <li key={link}><Link href="#" className="hover:text-primary-600 transition-colors">{link}</Link></li>
                 ))}
               </ul>
             </div>

             <div>
               <h4 className="text-neutral-900 font-black uppercase tracking-widest text-xs mb-8">Company</h4>
               <ul className="space-y-6 text-sm font-bold text-neutral-500">
                 {['Our Vision', 'Data Sources', 'Contact Support'].map(link => (
                   <li key={link}><Link href="#" className="hover:text-primary-600 transition-colors">{link}</Link></li>
                 ))}
               </ul>
             </div>

             <div>
               <h4 className="text-neutral-900 font-black uppercase tracking-widest text-xs mb-8">Newsletter</h4>
               <p className="text-sm font-bold text-neutral-500 mb-6 leading-relaxed">Join the inner circle of data-driven travelers.</p>
               <form className="space-y-4">
                 <div className="relative group/input">
                   <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400 group-focus-within/input:text-primary-600 transition-colors" />
                   <input 
                     type="email" 
                     placeholder="Horizon mail..." 
                     className="w-full glass-4d bg-white/40 border border-white/60 rounded-2xl py-4 pl-14 pr-4 text-xs font-bold outline-none focus:border-primary-500 transition-all placeholder:text-neutral-300"
                   />
                 </div>
                 <button type="submit" className="w-full btn-4d py-4 text-[10px] tracking-[0.3em]">
                   SCAN ON
                 </button>
               </form>
             </div>
           </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center gap-8 py-8 px-4 text-[10px] font-black text-neutral-400 uppercase tracking-widest">
          <p>© 2026 ONTRIP 4D ENGINE. ALL DATA SECURE.</p>
          <div className="flex gap-12">
            <Link href="#" className="hover:text-primary-600 transition-colors">Privacy</Link>
            <Link href="#" className="hover:text-primary-600 transition-colors">Terms</Link>
            <Link href="#" className="hover:text-primary-600 transition-colors">Safety</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
