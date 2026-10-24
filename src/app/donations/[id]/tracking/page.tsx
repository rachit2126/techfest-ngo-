'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  Clock,
  CheckCircle2,
  Truck,
  Package,
  ShieldCheck,
  AlertTriangle,
  Upload,
  User,
  ArrowRight,
  RefreshCw,
  FileText
} from 'lucide-react';
import StatusBadge from '@/components/StatusBadge';
import { DonationStatus } from '@/lib/types';
import confetti from 'canvas-confetti';

const STATUS_PROGRESSION: DonationStatus[] = [
  'submitted',
  'validating',
  'eligible',
  'approved',
  'packed_ready',
  'picked_up',
  'in_transit',
  'delivered_pending',
  'delivered_confirmed'
];

import { Suspense } from 'react';

function TrackingContent() {
  const params = useParams();
  const id = params?.id as string;

  const [loading, setLoading] = useState(true);
  const [donation, setDonation] = useState<any>(null);
  const [timeline, setTimeline] = useState<any[]>([]);
  const [updating, setUpdating] = useState(false);
  const [confirmModal, setConfirmModal] = useState(false);
  const [disputeModal, setDisputeModal] = useState(false);

  // Form states for recipient delivery confirmation
  const [confirmedQuantity, setConfirmedQuantity] = useState('');
  const [recipientNote, setRecipientNote] = useState('All bundles inspected and verified against loading manifest.');
  const [disputeReason, setDisputeReason] = useState('Package packaging seal torn during transport.');

  useEffect(() => {
    if (!id) return;
    fetchDonationData();

    // Listen to live SSE updates
    const eventSource = new EventSource('/api/events/stream');
    eventSource.addEventListener('delivery.updated', () => {
      fetchDonationData();
    });
    eventSource.addEventListener('delivery.delivered_confirmed', () => {
      fetchDonationData();
    });

    return () => {
      eventSource.close();
    };
  }, [id]);

  const fetchDonationData = async () => {
    try {
      const res = await fetch(`/api/donations/${id}`);
      const data = await res.json();
      if (res.ok) {
        setDonation(data.donation);
        setTimeline(data.timeline || []);
        if (data.donation?.allocatedQuantity) {
          setConfirmedQuantity(String(data.donation.allocatedQuantity));
        }
      }
    } catch (err) {
      console.error('Fetch tracking error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleProgressTransition = async (targetStatus: DonationStatus, note?: string) => {
    setUpdating(true);
    try {
      const res = await fetch(`/api/allocations/${id}/events`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetStatus,
          note: note || `Transitioned to ${targetStatus}`
        })
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Transition failed');

      await fetchDonationData();
    } catch (err) {
      alert((err as Error).message);
    } finally {
      setUpdating(false);
    }
  };

  const handleConfirmDelivery = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdating(true);
    try {
      const res = await fetch(`/api/allocations/${id}/events`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetStatus: 'delivered_confirmed',
          note: `Recipient verified receipt: ${confirmedQuantity} ${donation?.unit} confirmed in satisfactory humanitarian condition.`,
          evidenceUrl: 'https://sahay-storage-demo.s3.internal/receipts/proof_delivery_confirmed.pdf',
          recipientConfirmation: {
            confirmedBy: 'Authorized Recipient / Depot Lead',
            confirmedQuantity: Number(confirmedQuantity),
            conditionVerified: true,
            notes: recipientNote
          }
        })
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Confirmation failed');

      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });

      setConfirmModal(false);
      await fetchDonationData();
    } catch (err) {
      alert((err as Error).message);
    } finally {
      setUpdating(false);
    }
  };

  const handleDispute = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdating(true);
    try {
      const res = await fetch(`/api/allocations/${id}/events`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetStatus: 'disputed',
          note: `Dispute logged: ${disputeReason}`,
          reason: disputeReason
        })
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Dispute failed');

      setDisputeModal(false);
      await fetchDonationData();
    } catch (err) {
      alert((err as Error).message);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-10 h-10 border-3 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-slate-500">Loading delivery ledger and immutable audit timeline...</p>
      </div>
    );
  }

  if (!donation) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto" />
        <h2 className="text-lg font-bold text-slate-900">Donation Record Not Found</h2>
        <Link href="/explore" className="inline-block px-4 py-2 rounded-xl bg-teal-600 text-white text-xs font-semibold">
          Return to Explore
        </Link>
      </div>
    );
  }

  // Get current step index in progression
  const currentStepIdx = STATUS_PROGRESSION.indexOf(donation.status);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Header Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <StatusBadge status={donation.status} size="md" />
              <span className="text-xs text-slate-400 font-mono">Lot #{donation.id}</span>
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-1.5">
              {donation.itemName}
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Donor: <strong className="text-slate-800">{donation.donorName}</strong> ({donation.donorType}) | Quantity: <strong className="text-slate-800">{donation.quantity} {donation.unit}</strong>
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchDonationData}
              className="p-2 rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-600 transition"
              title="Refresh timeline"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <Link
              href={`/matches/${donation.id}`}
              className="px-3.5 py-1.5 rounded-lg bg-teal-50 border border-teal-200 text-teal-800 text-xs font-semibold hover:bg-teal-100 transition"
            >
              Match Analysis
            </Link>
          </div>
        </div>

        {/* Horizontal Progression Bar */}
        <div className="py-2">
          <div className="hidden md:flex items-center justify-between relative">
            <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-slate-200 -translate-y-1/2 z-0" />
            {STATUS_PROGRESSION.map((st, idx) => {
              const isPast = idx <= currentStepIdx;
              const isCurrent = idx === currentStepIdx;
              return (
                <div key={st} className="relative z-10 flex flex-col items-center">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold transition-all ${
                      isCurrent
                        ? 'bg-teal-600 text-white ring-4 ring-teal-100'
                        : isPast
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-200 text-slate-500'
                    }`}
                  >
                    {isPast && !isCurrent ? '✓' : idx + 1}
                  </div>
                  <span
                    className={`text-[10px] mt-1.5 capitalize font-medium ${
                      isCurrent ? 'text-teal-800 font-bold' : isPast ? 'text-slate-700' : 'text-slate-400'
                    }`}
                  >
                    {st.replace(/_/g, ' ')}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Milestone Quick Progression Actions for Demo Testing */}
        <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs text-slate-500">
            Simulate logistics operations (enforces server-side transition state machine):
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {donation.status === 'eligible' && (
              <Link
                href={`/matches/${donation.id}`}
                className="px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs transition"
              >
                Propose Match
              </Link>
            )}

            {donation.status === 'approved' && (
              <button
                onClick={() => handleProgressTransition('packed_ready', 'Goods packed in protective transit cartons by donor')}
                disabled={updating}
                className="px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs transition cursor-pointer"
              >
                Mark Packed & Ready
              </button>
            )}

            {donation.status === 'packed_ready' && (
              <button
                onClick={() => handleProgressTransition('picked_up', 'Driver picked up parcel from donor pickup point')}
                disabled={updating}
                className="px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs transition cursor-pointer"
              >
                Mark Picked Up
              </button>
            )}

            {donation.status === 'picked_up' && (
              <button
                onClick={() => handleProgressTransition('in_transit', 'In transit on delivery route')}
                disabled={updating}
                className="px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-700 text-white font-semibold text-xs transition cursor-pointer"
              >
                Dispatch to In Transit
              </button>
            )}

            {donation.status === 'in_transit' && (
              <button
                onClick={() => handleProgressTransition('delivered_pending', 'Arrived at recipient depot; awaiting recipient physical check')}
                disabled={updating}
                className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs transition cursor-pointer"
              >
                Arrived at Depot (Pending Confirmation)
              </button>
            )}

            {donation.status === 'delivered_pending' && (
              <button
                onClick={() => setConfirmModal(true)}
                disabled={updating}
                className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                Confirm Receipt & Weight Verification
              </button>
            )}

            {donation.status !== 'delivered_confirmed' && donation.status !== 'disputed' && (
              <button
                onClick={() => setDisputeModal(true)}
                className="px-2.5 py-1.5 rounded-lg border border-rose-300 text-rose-700 hover:bg-rose-50 text-xs font-medium transition cursor-pointer"
              >
                Flag Delivery Dispute
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Immutable Timeline Events */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Clock className="w-4 h-4 text-teal-600" />
            Immutable Audit Trail & Milestone History ({timeline.length})
          </h2>
          <span className="text-[11px] text-slate-400">Chronological ledger • Signed by actors</span>
        </div>

        {timeline.length === 0 ? (
          <p className="text-xs text-slate-500 py-4 text-center">No milestone events recorded yet.</p>
        ) : (
          <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
            {timeline.map((evt, idx) => (
              <div key={evt.id || idx} className="relative space-y-1.5">
                {/* Dot */}
                <div className="absolute -left-6 top-1 w-3 h-3 rounded-full bg-teal-600 ring-4 ring-teal-100" />

                <div className="flex flex-wrap items-center gap-2">
                  <StatusBadge status={evt.status} />
                  <span className="text-xs font-semibold text-slate-900">
                    {evt.actor.name} <span className="text-slate-400 font-normal">({evt.actor.role})</span>
                  </span>
                  <span className="text-[11px] text-slate-400">
                    {new Date(evt.timestamp).toLocaleString()}
                  </span>
                </div>

                <p className="text-xs text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-100 leading-relaxed">
                  {evt.note}
                </p>

                {/* Evidence link / recipient confirmation badge */}
                {evt.recipientConfirmation && (
                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-950 space-y-1">
                    <div className="font-bold flex items-center gap-1.5 text-emerald-900">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      Recipient Physical Confirmation Verified
                    </div>
                    <p className="text-[11px]">
                      Confirmed by: <strong className="text-emerald-950">{evt.recipientConfirmation.confirmedBy}</strong> | Confirmed Quantity: <strong>{evt.recipientConfirmation.confirmedQuantity}</strong>
                    </p>
                    {evt.recipientConfirmation.notes && (
                      <p className="text-[11px] text-emerald-800 italic">“{evt.recipientConfirmation.notes}”</p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recipient Confirmation Modal */}
      {confirmModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">Authorized Recipient Receipt Confirmation</h3>
                <p className="text-xs text-slate-500">
                  Updates durable confirmed impact metrics. Requires weight/piece verification.
                </p>
              </div>
              <button onClick={() => setConfirmModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <form onSubmit={handleConfirmDelivery} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Physically Counted / Weighed Quantity ({donation.unit}) *
                </label>
                <input
                  type="number"
                  required
                  value={confirmedQuantity}
                  onChange={(e) => setConfirmedQuantity(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Inspection Note / Depot Verification *
                </label>
                <textarea
                  rows={3}
                  required
                  value={recipientNote}
                  onChange={(e) => setRecipientNote(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                />
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-600 space-y-1">
                <span className="font-semibold text-slate-800 block">Digital Chain of Custody:</span>
                <p>An immutable cryptographic entry will be written to the Delivery Ledger and Impact Pipeline.</p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setConfirmModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition shadow-sm"
                >
                  {updating ? 'Recording...' : 'Confirm Delivery Receipt'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Dispute Modal */}
      {disputeModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-base font-bold text-rose-900">Flag Delivery Issue / Dispute</h3>
                <p className="text-xs text-slate-500">
                  Holds workflow and assigns case to Operations Manager review.
                </p>
              </div>
              <button onClick={() => setDisputeModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <form onSubmit={handleDispute} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Dispute Reason / Discrepancy Note *
                </label>
                <textarea
                  rows={3}
                  required
                  value={disputeReason}
                  onChange={(e) => setDisputeReason(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setDisputeModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold transition shadow-sm"
                >
                  Log Dispute
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function DonationTrackingPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-xs text-slate-500">Loading Delivery Ledger...</div>}>
      <TrackingContent />
    </Suspense>
  );
}
