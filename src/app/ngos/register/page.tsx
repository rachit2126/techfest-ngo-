'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Building2,
  ShieldCheck,
  Upload,
  CheckCircle2,
  AlertTriangle,
  FileText,
  ArrowRight,
  Info
} from 'lucide-react';

export default function NGORegisterPage() {
  const [submitting, setSubmitting] = useState(false);
  const [registeredNGO, setRegisteredNGO] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    legalName: 'Jan Kalyan Relief & Health Society',
    registrationNumber: 'DL/2026/0099412',
    categoryList: ['clothing_blankets', 'hygiene_kits'],
    description: 'Serving underprivileged urban settlements and night shelters in NCR region.',
    contactEmail: 'contact@jankalyan-demo.org',
    contactPhone: '+91 11 2345 9988',
    city: 'New Delhi',
    state: 'Delhi',
    capacitySummary: '6,000 sq ft central transit depot with 2 distribution light commercial vehicles.',
    documentNames: ['80G_Tax_Exemption_Certificate.pdf', 'NGO_Darpan_Unique_ID_Proof.pdf']
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch('/api/ngos/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Registration failed');

      setRegisteredNGO(data.ngo);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto">
        <span className="text-xs font-bold uppercase tracking-wider text-teal-700 bg-teal-50 px-3 py-1 rounded-full border border-teal-200">
          NGO Statutory Onboarding
        </span>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mt-2">
          Register Organisation for Verified Relief Allocation
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 mt-1">
          ReliefLink enforces statutory verification via NGO Darpan, 80G/12A, and physical depot review.
        </p>
      </div>

      {registeredNGO ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm space-y-4 text-center animate-in fade-in">
          <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Application Submitted for Human Review</h2>
          <p className="text-xs text-slate-600 max-w-md mx-auto">
            Organisation <strong className="text-slate-800">{registeredNGO.legalName}</strong> has been enrolled with status <span className="font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">In Review</span>.
          </p>
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 max-w-md mx-auto text-xs text-slate-600 text-left space-y-1">
            <div><strong>Application ID:</strong> {registeredNGO.id}</div>
            <div><strong>Documents Stored:</strong> {registeredNGO.documents?.length} files in secure private object storage</div>
            <div><strong>Reviewer:</strong> Assigned to NGO Verification Queue</div>
          </div>
          <div className="pt-2 flex justify-center gap-3">
            <Link
              href="/admin"
              className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs transition flex items-center gap-1.5"
            >
              Open Admin Review Queue <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
          {error && (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-2">
                <Building2 className="w-4 h-4 text-teal-600" />
                Organisation Legal Identification
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Legal Registered Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={form.legalName}
                    onChange={(e) => setForm({ ...form, legalName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Registration / NGO Darpan ID *
                  </label>
                  <input
                    type="text"
                    required
                    value={form.registrationNumber}
                    onChange={(e) => setForm({ ...form, registrationNumber: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    City & State *
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      required
                      value={form.city}
                      onChange={(e) => setForm({ ...form, city: e.target.value })}
                      placeholder="City"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none"
                    />
                    <input
                      type="text"
                      required
                      value={form.state}
                      onChange={(e) => setForm({ ...form, state: e.target.value })}
                      placeholder="State"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Official Contact Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={form.contactEmail}
                    onChange={(e) => setForm({ ...form, contactEmail: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Storage Depot & Distribution Capacity
                </label>
                <textarea
                  rows={2}
                  value={form.capacitySummary}
                  onChange={(e) => setForm({ ...form, capacitySummary: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none"
                />
              </div>
            </div>

            {/* Document Evidence Uploads */}
            <div className="space-y-4 pt-2">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-2">
                <FileText className="w-4 h-4 text-teal-600" />
                Statutory Evidence Documents (Private Storage)
              </h3>

              <div className="p-4 rounded-xl border border-dashed border-slate-300 bg-slate-50/70 text-center space-y-2">
                <Upload className="w-6 h-6 text-slate-400 mx-auto" />
                <div className="text-xs font-semibold text-slate-800">
                  Attached Demonstration Evidence Files:
                </div>
                <div className="flex flex-wrap justify-center gap-2">
                  {form.documentNames.map((name, i) => (
                    <span key={i} className="px-2.5 py-1 rounded-md bg-white border border-slate-200 text-[11px] text-slate-700 font-mono flex items-center gap-1">
                      <FileText className="w-3 h-3 text-teal-600" />
                      {name}
                    </span>
                  ))}
                </div>
                <p className="text-[11px] text-slate-400">
                  Files are stored in private access-controlled storage with short-lived signed URLs.
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-500">
                AI may summarize documents for human review, but never verifies automatically.
              </span>
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs sm:text-sm transition cursor-pointer shadow-sm disabled:opacity-50"
              >
                {submitting ? 'Submitting...' : 'Submit Verification Dossier'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
