'use client';

import { useState } from 'react';
import { Database, RotateCcw, CheckCircle, ShieldAlert } from 'lucide-react';

export default function DemoBanner() {
  const [resetting, setResetting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleReset = async () => {
    setResetting(true);
    setMessage(null);
    try {
      const res = await fetch('/api/seed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ forceReset: true })
      });
      const data = await res.json();
      if (res.ok) {
        setMessage('Database reset to verified Judge Demo state!');
        setTimeout(() => {
          setMessage(null);
          window.location.reload();
        }, 1200);
      } else {
        setMessage(data.error || 'Reset failed');
      }
    } catch {
      setMessage('Network error during reset');
    } finally {
      setResetting(false);
    }
  };

  return (
    <aside aria-label="Demo environment notice" className="bg-amber-50/90 border-b border-amber-200/80 text-amber-900 px-4 py-2 text-xs font-medium flex flex-wrap items-center justify-between gap-2 shadow-2xs backdrop-blur-xs">
      <div className="flex items-center gap-2">
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-amber-200/70 text-amber-950 font-semibold uppercase tracking-wider text-[10px]">
          <Database className="w-3 h-3 text-amber-800" />
          Prototype Demo Environment
        </span>
        <span className="hidden sm:inline text-amber-800/90">
          Seeded records: 4 Verified NGOs, Assam Flood Emergency Advisory, 100 Blankets test scenario, DLQ Event #01.
        </span>
      </div>

      <div className="flex items-center gap-3">
        {message && (
          <span className="flex items-center gap-1 text-emerald-800 font-semibold bg-emerald-100/80 px-2 py-0.5 rounded-md animate-fade-in">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
            {message}
          </span>
        )}
        <button
          onClick={handleReset}
          disabled={resetting}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-white hover:bg-amber-100/60 text-amber-900 border border-amber-300 font-medium transition cursor-pointer shadow-2xs disabled:opacity-50"
          title="Reset database to seeded judge test scenario"
        >
          <RotateCcw className={`w-3 h-3 text-amber-700 ${resetting ? 'animate-spin' : ''}`} />
          {resetting ? 'Resetting...' : 'Reset Demo Records'}
        </button>
      </div>
    </aside>
  );
}
