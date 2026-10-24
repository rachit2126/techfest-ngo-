'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { HeartHandshake, ShieldCheck, ArrowRight, Lock, Mail, UserCheck } from 'lucide-react';
import SahayLogo from '@/components/brand/SahayLogo';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('riya.sharma@example.com');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (targetEmail?: string) => {
    const emailToUse = targetEmail || email;
    if (!emailToUse) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailToUse })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Login failed');

      router.push('/');
      router.refresh();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-teal-50/30 to-[#fbfbfa]">
      <div className="max-w-md w-full space-y-6 bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-1">
            <SahayLogo variant="header" />
          </div>
          <h1 className="text-2xl font-bold text-[#182820] tracking-tight">Sign In to SAHAY</h1>
          <p className="text-xs text-[#64746A]">
            Secure access for individual donors, verified NGOs, corporate surplus partners, and emergency coordinators.
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs">
            {error}
          </div>
        )}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleLogin();
          }}
          className="space-y-4 text-xs"
        >
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                defaultValue="••••••••••••"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs sm:text-sm transition flex items-center justify-center gap-1.5 cursor-pointer shadow-sm disabled:opacity-50"
          >
            {loading ? 'Authenticating...' : 'Sign In'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* 1-Click Evaluation Personas */}
        <div className="pt-4 border-t border-slate-100 space-y-2">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block text-center">
            Or Sign In as Test Persona (1-Click)
          </span>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handleLogin('riya.sharma@example.com')}
              className="p-2 rounded-lg bg-slate-50 hover:bg-teal-50 border border-slate-200 text-slate-700 hover:text-teal-900 text-[11px] font-medium text-left transition"
            >
              <strong className="block text-slate-900">Riya Sharma</strong>
              Individual Donor
            </button>
            <button
              onClick={() => handleLogin('csr@grandhorizon.com')}
              className="p-2 rounded-lg bg-slate-50 hover:bg-teal-50 border border-slate-200 text-slate-700 hover:text-teal-900 text-[11px] font-medium text-left transition"
            >
              <strong className="block text-slate-900">Grand Horizon</strong>
              Business Donor
            </button>
            <button
              onClick={() => handleLogin('relief@goonj-demo.org')}
              className="p-2 rounded-lg bg-slate-50 hover:bg-teal-50 border border-slate-200 text-slate-700 hover:text-teal-900 text-[11px] font-medium text-left transition"
            >
              <strong className="block text-slate-900">Anshu Mehra</strong>
              Goonj NGO Staff
            </button>
            <button
              onClick={() => handleLogin('admin@relieflink.ai')}
              className="p-2 rounded-lg bg-slate-50 hover:bg-teal-50 border border-slate-200 text-slate-700 hover:text-teal-900 text-[11px] font-medium text-left transition"
            >
              <strong className="block text-slate-900">Vikramaditya</strong>
              Super Admin
            </button>
          </div>
        </div>

        <div className="text-center text-xs text-slate-500">
          Don&apos;t have an account?{' '}
          <Link href="/register" className="text-teal-700 font-semibold hover:underline">
            Register here
          </Link>
        </div>
      </div>
    </div>
  );
}
