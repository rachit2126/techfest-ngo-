import Link from 'next/link';
import { HelpCircle, ArrowLeft, Globe } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
      <div className="max-w-md w-full text-center space-y-4 bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
        <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center mx-auto">
          <HelpCircle className="w-6 h-6" />
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">404 — Page Not Found</h1>
        <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
          The humanitarian route or relief record you requested could not be located on the platform.
        </p>
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/"
            className="w-full sm:w-auto px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Return Home
          </Link>
          <Link
            href="/explore"
            className="w-full sm:w-auto px-4 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold text-xs flex items-center justify-center gap-1.5 transition"
          >
            <Globe className="w-3.5 h-3.5" /> Explore Relief Globe
          </Link>
        </div>
      </div>
    </div>
  );
}
