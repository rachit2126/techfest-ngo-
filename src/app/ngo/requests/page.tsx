'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Building2,
  Package,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  ShieldAlert
} from 'lucide-react';

export default function PublishNeedPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    category: 'clothing_blankets',
    itemSpecification: 'High-density thermal blankets for winter night shelters',
    quantityRequested: '100',
    unit: 'units',
    urgency: 'high',
    neededBy: '2026-11-20',
    city: 'New Delhi',
    state: 'Delhi',
    storageCapabilities: ['dry', 'sheltered'],
    emergencyEventId: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch('/api/ngo/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          quantityRequested: Number(form.quantityRequested),
          neededBy: new Date(form.neededBy).toISOString(),
          serviceArea: {
            city: form.city,
            state: form.state,
            coordinates: [28.5355, 77.2610]
          }
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to publish need');

      router.push('/ngo/dashboard');
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      <div className="text-center max-w-xl mx-auto">
        <span className="text-xs font-bold uppercase tracking-wider text-teal-700 bg-teal-50 px-3 py-1 rounded-full border border-teal-200">
          Structured Humanitarian Demand
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-2">
          Publish Structured NGO Relief Need
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 mt-1">
          Structured requests enable automatic deterministic matching with donors in your service radius.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
        {error && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Relief Category *
              </label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20"
              >
                <option value="clothing_blankets">Clothing & Warm Blankets</option>
                <option value="packaged_food">Packaged / Shelf-Stable Food</option>
                <option value="hygiene_kits">Hygiene & Sanitation Kits</option>
                <option value="medical_first_aid">First Aid & Emergency Supplies</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Specific Relief Item Requirement *
              </label>
              <input
                type="text"
                required
                value={form.itemSpecification}
                onChange={(e) => setForm({ ...form, itemSpecification: e.target.value })}
                placeholder="e.g. 100 fleece blankets, 500kg grain packets, 250 hygiene kits"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Quantity *
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={form.quantityRequested}
                  onChange={(e) => setForm({ ...form, quantityRequested: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Unit *
                </label>
                <select
                  value={form.unit}
                  onChange={(e) => setForm({ ...form, unit: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none"
                >
                  <option value="units">units</option>
                  <option value="kg">kg</option>
                  <option value="boxes">boxes</option>
                  <option value="kits">kits</option>
                  <option value="meals">meals</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Urgency Level *
                </label>
                <select
                  value={form.urgency}
                  onChange={(e) => setForm({ ...form, urgency: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none font-semibold text-slate-800"
                >
                  <option value="critical">Critical (Disaster/Emergency)</option>
                  <option value="high">High (Winter/Upcoming Need)</option>
                  <option value="medium">Medium</option>
                  <option value="routine">Routine</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Needed By Deadline *
                </label>
                <input
                  type="date"
                  required
                  value={form.neededBy}
                  onChange={(e) => setForm({ ...form, neededBy: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Link to Active Emergency Event (Optional)
                </label>
                <select
                  value={form.emergencyEventId}
                  onChange={(e) => setForm({ ...form, emergencyEventId: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none text-slate-700"
                >
                  <option value="">None (Routine Need)</option>
                  <option value="emerg_assam_flood_2026">Assam Flood Surge 2026 (Code Red)</option>
                </select>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs sm:text-sm transition cursor-pointer shadow-sm disabled:opacity-50"
            >
              {submitting ? 'Publishing...' : 'Publish Need to Relief Engine'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
