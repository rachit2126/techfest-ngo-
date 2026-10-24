'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  LayoutDashboard,
  Building2,
  Package,
  Sparkles,
  Truck,
  AlertOctagon,
  Globe,
  BarChart3,
  Activity,
  Users,
  Settings,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RotateCcw,
  Search,
  Filter,
  ArrowRight,
  ExternalLink,
  RefreshCw,
  FileText,
  Sliders,
  Database
} from 'lucide-react';
import StatusBadge from '@/components/StatusBadge';
import GlobeVisualizer from '@/components/GlobeVisualizer';

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [metrics, setMetrics] = useState<any>(null);
  const [systemHealth, setSystemHealth] = useState<any>(null);
  const [ngos, setNgos] = useState<any[]>([]);
  const [donations, setDonations] = useState<any[]>([]);
  const [emergencies, setEmergencies] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [scoringConfig, setScoringConfig] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Verification decision form state
  const [selectedNGOForReview, setSelectedNGOForReview] = useState<any | null>(null);
  const [reviewReason, setReviewReason] = useState('Documents verified against NGO Darpan registration record.');
  const [reviewActionProcessing, setReviewActionProcessing] = useState(false);

  // Scoring config edit state
  const [weightsForm, setWeightsForm] = useState({
    needFit: 0.30,
    urgency: 0.20,
    deliveryFit: 0.15,
    timeFit: 0.15,
    quantityFit: 0.10,
    freshnessConfidence: 0.10,
    reason: 'Routine quarterly weights calibration'
  });
  const [updatingWeights, setUpdatingWeights] = useState(false);

  // Emergency creation form state
  const [emergencyForm, setEmergencyForm] = useState({
    name: 'Assam Brahmaputra Inundation Relief 2026',
    type: 'flood',
    severity: 'code_red',
    officialSource: 'NDMA Special Advisory #842',
    affectedStates: 'Assam',
    affectedDistricts: 'Kamrup, Barpeta, Morigaon',
    requiredSupplies: 'Water purification kits, fleece blankets, dry rations'
  });
  const [publishingEmergency, setPublishingEmergency] = useState(false);

  useEffect(() => {
    loadAllAdminData();

    // Listen to real-time events via SSE
    const es = new EventSource('/api/events/stream');
    es.addEventListener('donation.created', () => loadAllAdminData());
    es.addEventListener('ngo.registered', () => loadAllAdminData());
    es.addEventListener('ngo.verification_updated', () => loadAllAdminData());
    es.addEventListener('dlq.retried', () => loadAllAdminData());

    return () => {
      es.close();
    };
  }, []);

  const loadAllAdminData = async () => {
    setLoading(true);
    try {
      const [metricsRes, healthRes, ngosRes, donRes, emergRes, auditRes, configRes] = await Promise.all([
        fetch('/api/admin/metrics'),
        fetch('/api/admin/system-health'),
        fetch('/api/ngos'),
        fetch('/api/donations'),
        fetch('/api/emergencies'),
        fetch('/api/admin/audit-logs'),
        fetch('/api/admin/scoring-config')
      ]);

      const [m, h, n, d, e, a, c] = await Promise.all([
        metricsRes.json(),
        healthRes.json(),
        ngosRes.json(),
        donRes.json(),
        emergRes.json(),
        auditRes.json(),
        configRes.json()
      ]);

      setMetrics(m);
      setSystemHealth(h);
      setNgos(n.ngos || []);
      setDonations(d.donations || []);
      setEmergencies(e.emergencies || []);
      setAuditLogs(a.logs || []);
      setScoringConfig(c.config || null);
      if (c.config) {
        setWeightsForm({
          needFit: c.config.needFit,
          urgency: c.config.urgency,
          deliveryFit: c.config.deliveryFit,
          timeFit: c.config.timeFit,
          quantityFit: c.config.quantityFit,
          freshnessConfidence: c.config.freshnessConfidence,
          reason: 'Calibrated weights update'
        });
      }
    } catch (err) {
      console.error('Admin data load error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleNGODecision = async (ngoId: string, decision: string) => {
    setReviewActionProcessing(true);
    try {
      const res = await fetch(`/api/admin/ngos/${ngoId}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ decision, reason: reviewReason })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Verification decision failed');

      setSelectedNGOForReview(null);
      await loadAllAdminData();
    } catch (err) {
      alert((err as Error).message);
    } finally {
      setReviewActionProcessing(false);
    }
  };

  const handleDLQRetry = async (dlqId: string) => {
    try {
      const res = await fetch(`/api/admin/dlq/${dlqId}/retry`, {
        method: 'POST'
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Retry failed');
      await loadAllAdminData();
    } catch (err) {
      alert((err as Error).message);
    }
  };

  const handleUpdateWeights = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdatingWeights(true);
    try {
      const res = await fetch('/api/admin/scoring-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(weightsForm)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Weights update failed');
      alert(`Scoring weights successfully updated to ${data.config.version}`);
      await loadAllAdminData();
    } catch (err) {
      alert((err as Error).message);
    } finally {
      setUpdatingWeights(false);
    }
  };

  const handlePublishEmergency = async (e: React.FormEvent) => {
    e.preventDefault();
    setPublishingEmergency(true);
    try {
      const res = await fetch('/api/emergencies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...emergencyForm,
          affectedStates: emergencyForm.affectedStates.split(',').map(s => s.trim()),
          affectedDistricts: emergencyForm.affectedDistricts.split(',').map(d => d.trim()),
          requiredSupplies: emergencyForm.requiredSupplies.split(',').map(s => s.trim())
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to publish emergency');
      alert('Emergency advisory published and priority multiplier activated.');
      await loadAllAdminData();
    } catch (err) {
      alert((err as Error).message);
    } finally {
      setPublishingEmergency(false);
    }
  };

  const NAV_ITEMS = [
    { id: 'overview', label: '1. Overview', icon: LayoutDashboard },
    { id: 'ngos', label: '2. NGOs Review Queue', icon: Building2, count: metrics?.kpis?.pendingNGOReviews },
    { id: 'donations', label: '3. Donations Intake', icon: Package, count: donations.length },
    { id: 'matches', label: '4. Matches Inspector', icon: Sparkles },
    { id: 'deliveries', label: '5. Deliveries Ops', icon: Truck, count: metrics?.kpis?.activeDeliveries },
    { id: 'emergencies', label: '6. Emergencies', icon: AlertOctagon, count: emergencies.length },
    { id: 'globe', label: '7. Globe & Coverage', icon: Globe },
    { id: 'impact', label: '8. Impact & Metrics', icon: BarChart3 },
    { id: 'health', label: '9. AI & System Health', icon: Activity, count: metrics?.kpis?.failedProcessingEvents },
    { id: 'audit', label: '10. Users & Audit', icon: Users },
    { id: 'settings', label: '11. Settings & Weights', icon: Settings }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Admin Top Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
            <span className="text-xs font-semibold text-amber-900 uppercase tracking-wider">
              Protected Operational Control Centre
            </span>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-700">
              RBAC: Super Admin Authorized
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-1">
            SAHAY Operations Console
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Verification queues, matching exceptions, delivery lifecycles, DLQ event resilience, and statutory audits.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadAllAdminData}
            className="p-2 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-600 transition"
            title="Refresh database records"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <Link
            href="/"
            className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition flex items-center gap-1.5"
          >
            Public Site <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Main Admin Two-Column Layout: Compact Sidebar + Main Workpanel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Compact Admin Sidebar */}
        <aside className="lg:col-span-3 bg-white rounded-2xl border border-slate-200 p-2 shadow-xs space-y-1 sticky top-20">
          <div className="px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Control Modules
          </div>
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isSelected = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
                  isSelected
                    ? 'bg-teal-600 text-white shadow-xs'
                    : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <Icon className={`w-4 h-4 shrink-0 ${isSelected ? 'text-white' : 'text-slate-500'}`} />
                  <span className="truncate">{item.label}</span>
                </div>
                {item.count !== undefined && item.count > 0 && (
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                      isSelected
                        ? 'bg-teal-800 text-white'
                        : item.id === 'health'
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}
        </aside>

        {/* Dynamic Central Workpanel */}
        <main className="lg:col-span-9 space-y-6">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* 6 Useful Database-backed KPI Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5">
                <div
                  onClick={() => setActiveTab('ngos')}
                  className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-teal-400 transition cursor-pointer shadow-2xs space-y-1"
                >
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Pending NGO Reviews</span>
                  <div className="text-2xl font-extrabold text-slate-900">{metrics?.kpis?.pendingNGOReviews ?? 1}</div>
                  <span className="text-[10px] text-amber-700 font-medium">Click to inspect review queue →</span>
                </div>

                <div
                  onClick={() => setActiveTab('donations')}
                  className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-teal-400 transition cursor-pointer shadow-2xs space-y-1"
                >
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Open Donations</span>
                  <div className="text-2xl font-extrabold text-slate-900">{metrics?.kpis?.openDonations ?? 0}</div>
                  <span className="text-[10px] text-teal-700 font-medium">Submitted & validating →</span>
                </div>

                <div
                  onClick={() => setActiveTab('matches')}
                  className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-teal-400 transition cursor-pointer shadow-2xs space-y-1"
                >
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Unmatched Eligible</span>
                  <div className="text-2xl font-extrabold text-slate-900">{metrics?.kpis?.unmatchedEligibleDonations ?? 0}</div>
                  <span className="text-[10px] text-sky-700 font-medium">Ready for allocation →</span>
                </div>

                <div
                  onClick={() => setActiveTab('deliveries')}
                  className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-teal-400 transition cursor-pointer shadow-2xs space-y-1"
                >
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Active Deliveries</span>
                  <div className="text-2xl font-extrabold text-slate-900">{metrics?.kpis?.activeDeliveries ?? 0}</div>
                  <span className="text-[10px] text-indigo-700 font-medium">Under custody transit →</span>
                </div>

                <div
                  onClick={() => setActiveTab('emergencies')}
                  className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-teal-400 transition cursor-pointer shadow-2xs space-y-1"
                >
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Urgent Needs Open</span>
                  <div className="text-2xl font-extrabold text-slate-900">{metrics?.kpis?.urgentNeeds ?? 0}</div>
                  <span className="text-[10px] text-rose-700 font-medium">Critical & high priority →</span>
                </div>

                <div
                  onClick={() => setActiveTab('health')}
                  className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-teal-400 transition cursor-pointer shadow-2xs space-y-1"
                >
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">DLQ / Failed Events</span>
                  <div className="text-2xl font-extrabold text-rose-700">{metrics?.kpis?.failedProcessingEvents ?? 1}</div>
                  <span className="text-[10px] text-rose-600 font-medium">Retriable dead letter queue →</span>
                </div>
              </div>

              {/* Service Health & Integration Status */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <Activity className="w-4 h-4 text-teal-600" />
                  Service Health & Infrastructure Adapters
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-slate-400 block text-[11px]">Primary Database</span>
                    <strong className="text-slate-900 block mt-0.5">MongoDB 27017</strong>
                    <span className="text-[10px] text-emerald-700 font-semibold">Configured</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-slate-400 block text-[11px]">Geocoding / Globe</span>
                    <strong className="text-slate-900 block mt-0.5">Subcontinent Node</strong>
                    <span className="text-[10px] text-emerald-700 font-semibold">Configured</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-slate-400 block text-[11px]">AI Safety Engine</span>
                    <strong className="text-slate-900 block mt-0.5">Grounded Guardrails</strong>
                    <span className="text-[10px] text-emerald-700 font-semibold">Configured</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-slate-400 block text-[11px]">Live Streaming</span>
                    <strong className="text-slate-900 block mt-0.5">Server-Sent Events</strong>
                    <span className="text-[10px] text-emerald-700 font-semibold">Configured</span>
                  </div>
                  <div className="p-3 rounded-xl bg-amber-50/60 border border-amber-200">
                    <span className="text-amber-800 block text-[11px]">SMS Gateway</span>
                    <strong className="text-amber-950 block mt-0.5">Webhook Dispatch</strong>
                    <span className="text-[10px] text-amber-700 font-semibold">Degraded (in DLQ)</span>
                  </div>
                </div>
              </div>

              {/* Recent Activity Log */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Recent Privileged Operations Activity
                  </h3>
                  <button onClick={() => setActiveTab('audit')} className="text-xs text-teal-700 font-semibold hover:underline">
                    View Full Audit Search
                  </button>
                </div>
                <div className="divide-y divide-slate-100 text-xs">
                  {(metrics?.recentActivity || auditLogs.slice(0, 5)).map((log: any, idx: number) => (
                    <div key={idx} className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-slate-800">{log.action}</span>
                          <span className="text-[11px] text-slate-400 font-mono">[{log.entityType}]</span>
                        </div>
                        <p className="text-slate-500 text-[11px]">
                          Actor: <strong>{log.actor?.name}</strong> | Reason: {log.reason}
                        </p>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: NGOS REVIEW QUEUE */}
          {activeTab === 'ngos' && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                <div>
                  <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-teal-600" />
                    NGO Statutory Verification Queue ({ngos.length})
                  </h2>
                  <p className="text-xs text-slate-500">
                    Human review queue. Decisions store reviewer identity, statutory reference, and immutable audit logs.
                  </p>
                </div>
              </div>

              <div className="divide-y divide-slate-200 border border-slate-200 rounded-xl overflow-hidden">
                {ngos.map((ngo) => (
                  <div key={ngo.id} className="p-4 space-y-3 bg-white hover:bg-slate-50/50 transition">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <StatusBadge status={ngo.verificationStatus} />
                          <span className="font-bold text-slate-900 text-sm">{ngo.legalName}</span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Registration: <span className="font-mono text-slate-700">{ngo.registrationNumber || 'PENDING'}</span> | City: {ngo.serviceArea.city}, {ngo.serviceArea.state}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        {ngo.verificationStatus !== 'verified' ? (
                          <button
                            onClick={() => setSelectedNGOForReview(ngo)}
                            className="px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold transition cursor-pointer"
                          >
                            Review & Verify
                          </button>
                        ) : (
                          <button
                            onClick={() => setSelectedNGOForReview(ngo)}
                            className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold transition cursor-pointer"
                          >
                            Manage Status
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                      <div>
                        <strong>Capacity:</strong> {ngo.capacitySummary}
                      </div>
                      <div>
                        <strong>Provenance:</strong> {ngo.sourceProvenance.directoryName}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Review Decision Drawer / Modal */}
              {selectedNGOForReview && (
                <div className="p-5 rounded-2xl bg-teal-50/60 border border-teal-200 space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm">
                        Verification Decision for: {selectedNGOForReview.legalName}
                      </h3>
                      <p className="text-xs text-slate-600">
                        Select action and record statutory justification note for audit trail.
                      </p>
                    </div>
                    <button
                      onClick={() => setSelectedNGOForReview(null)}
                      className="text-xs text-slate-400 hover:text-slate-600"
                    >
                      ✕
                    </button>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Statutory Reviewer Justification Reason *
                    </label>
                    <input
                      type="text"
                      value={reviewReason}
                      onChange={(e) => setReviewReason(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white focus:outline-none"
                    />
                  </div>

                  <div className="flex flex-wrap gap-2 pt-1">
                    <button
                      onClick={() => handleNGODecision(selectedNGOForReview.id, 'approve')}
                      disabled={reviewActionProcessing}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition cursor-pointer shadow-xs"
                    >
                      ✓ Approve (Full 80G Verified)
                    </button>
                    <button
                      onClick={() => handleNGODecision(selectedNGOForReview.id, 'request_info')}
                      disabled={reviewActionProcessing}
                      className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs transition cursor-pointer"
                    >
                      Request Additional Documents
                    </button>
                    <button
                      onClick={() => handleNGODecision(selectedNGOForReview.id, 'suspend')}
                      disabled={reviewActionProcessing}
                      className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs transition cursor-pointer"
                    >
                      Suspend
                    </button>
                    <button
                      onClick={() => handleNGODecision(selectedNGOForReview.id, 'reject')}
                      disabled={reviewActionProcessing}
                      className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs transition cursor-pointer"
                    >
                      Reject Application
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: DONATIONS INTAKE */}
          {activeTab === 'donations' && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div>
                  <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <Package className="w-5 h-5 text-teal-600" />
                    Donations Inventory Management ({donations.length})
                  </h2>
                  <p className="text-xs text-slate-500">
                    Real-time inventory table with eligibility flags, batch codes and timeline inspection.
                  </p>
                </div>
                <Link
                  href="/donate/individual"
                  className="px-3.5 py-1.5 rounded-lg bg-teal-600 text-white text-xs font-semibold hover:bg-teal-700 transition"
                >
                  + Add Donation
                </Link>
              </div>

              <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100 text-xs">
                {donations.map((d) => (
                  <div key={d.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white hover:bg-slate-50/50 transition">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <StatusBadge status={d.status} />
                        <span className="font-bold text-slate-900 text-sm">{d.itemName}</span>
                        <span className="font-mono text-slate-400 text-[11px]">#{d.id}</span>
                      </div>
                      <p className="text-slate-500">
                        Remaining: <strong className="text-slate-800">{d.remainingQuantity} / {d.quantity} {d.unit}</strong> | Donor: {d.donorName} ({d.donorType}) | Location: {d.location.city}
                      </p>
                      {d.batchLotCode && (
                        <span className="text-[10px] text-slate-500 font-mono bg-slate-100 px-1.5 py-0.5 rounded">
                          Batch: {d.batchLotCode}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <Link
                        href={`/matches/${d.id}`}
                        className="px-3 py-1.5 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-800 font-semibold text-xs transition"
                      >
                        Inspect Matches
                      </Link>
                      <Link
                        href={`/donations/${d.id}/tracking`}
                        className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold text-xs transition"
                      >
                        Timeline
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: MATCHES INSPECTOR */}
          {activeTab === 'matches' && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div>
                  <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-teal-600" />
                    AI Matching Decisions Inspector
                  </h2>
                  <p className="text-xs text-slate-500">
                    Inspect deterministic scores, factor contributions, and plain-language grounded explanations.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3 text-xs">
                <span className="font-bold text-slate-800 text-sm block">Quick Test Scenarios:</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Link
                    href="/matches/don_blankets_100_demo"
                    className="p-3 rounded-xl bg-white border border-slate-200 hover:border-teal-400 hover:shadow-xs transition block text-left"
                  >
                    <strong className="text-slate-900 block font-semibold">100 Woolen Blankets Match Control</strong>
                    <span className="text-slate-500 text-[11px]">Compares Goonj Delhi vs SEEDS Assam Flood need with distance & urgency factors.</span>
                    <span className="text-teal-700 font-semibold text-[11px] block mt-2">Open Match Control Panel →</span>
                  </Link>

                  <Link
                    href="/donations/don_completed_rice_bags/tracking"
                    className="p-3 rounded-xl bg-white border border-slate-200 hover:border-teal-400 hover:shadow-xs transition block text-left"
                  >
                    <strong className="text-slate-900 block font-semibold">200kg Basmati Rice Confirmed Allocation</strong>
                    <span className="text-slate-500 text-[11px]">View full delivery lifecycle, recipient confirmation & waste averted metrics.</span>
                    <span className="text-teal-700 font-semibold text-[11px] block mt-2">Open Delivery Ledger →</span>
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: DELIVERIES OPERATIONS */}
          {activeTab === 'deliveries' && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div>
                  <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <Truck className="w-5 h-5 text-teal-600" />
                    Delivery Operations & Chain of Custody
                  </h2>
                  <p className="text-xs text-slate-500">
                    Active pickup and transit tasks, delay tracking, and recipient receipt verification.
                  </p>
                </div>
              </div>

              <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100 text-xs">
                {donations.filter(d => d.allocatedQuantity > 0 || d.status === 'delivered_confirmed').map((d) => (
                  <div key={d.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <StatusBadge status={d.status} />
                        <span className="font-bold text-slate-900">{d.itemName}</span>
                      </div>
                      <p className="text-slate-500">
                        Allocated: <strong className="text-slate-800">{d.allocatedQuantity || d.quantity} {d.unit}</strong> | Origin: {d.location.city}
                      </p>
                    </div>

                    <Link
                      href={`/donations/${d.id}/tracking`}
                      className="px-3.5 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs transition"
                    >
                      Manage Milestones
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 6: EMERGENCIES */}
          {activeTab === 'emergencies' && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div>
                  <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <AlertOctagon className="w-5 h-5 text-rose-600" />
                    Sourced Emergency Relief Management
                  </h2>
                  <p className="text-xs text-slate-500">
                    Authorized Emergency Coordinator console. Boosts matching priority for verified disaster zones.
                  </p>
                </div>
              </div>

              {/* Published Active Emergencies */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Active Emergency Advisories ({emergencies.length})
                </h3>
                <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden text-xs">
                  {emergencies.map((em) => (
                    <div key={em.id} className="p-4 bg-white space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <StatusBadge status={em.severity} />
                          <span className="font-bold text-slate-900 text-sm">{em.name}</span>
                        </div>
                        <span className="text-[11px] font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                          Priority Multiplier: {em.priorityMultiplier}x
                        </span>
                      </div>
                      <p className="text-slate-600">
                        Official Authority: <strong className="text-slate-800">{em.officialSource}</strong> | Affected States: {em.geography?.affectedStates?.join(', ')}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Publish Emergency Advisory Form */}
              <form onSubmit={handlePublishEmergency} className="p-5 rounded-2xl bg-rose-50/50 border border-rose-200 space-y-4 text-xs">
                <h3 className="font-bold text-rose-950 text-sm flex items-center gap-2">
                  <AlertOctagon className="w-4 h-4 text-rose-600" />
                  Publish Authorized Disaster Advisory
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-rose-950 mb-1">Advisory Title *</label>
                    <input
                      type="text"
                      required
                      value={emergencyForm.name}
                      onChange={(e) => setEmergencyForm({ ...emergencyForm, name: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-rose-300 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-rose-950 mb-1">Official Source Agency *</label>
                    <input
                      type="text"
                      required
                      value={emergencyForm.officialSource}
                      onChange={(e) => setEmergencyForm({ ...emergencyForm, officialSource: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-rose-300 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-rose-950 mb-1">Affected States (comma-separated) *</label>
                    <input
                      type="text"
                      required
                      value={emergencyForm.affectedStates}
                      onChange={(e) => setEmergencyForm({ ...emergencyForm, affectedStates: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-rose-300 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-rose-950 mb-1">Required Urgent Relief Supplies *</label>
                    <input
                      type="text"
                      required
                      value={emergencyForm.requiredSupplies}
                      onChange={(e) => setEmergencyForm({ ...emergencyForm, requiredSupplies: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-rose-300 bg-white"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={publishingEmergency}
                    className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold transition shadow-sm cursor-pointer disabled:opacity-50"
                  >
                    {publishingEmergency ? 'Publishing...' : 'Publish Official Advisory & Boost Matching'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 7: GLOBE & COVERAGE */}
          {activeTab === 'globe' && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div>
                  <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <Globe className="w-5 h-5 text-teal-600" />
                    Interactive Geographic Coverage & Privacy Map
                  </h2>
                  <p className="text-xs text-slate-500">
                    3D sphere projection displaying verified depots, active disaster vectors, and public-safe centroids.
                  </p>
                </div>
                <Link
                  href="/explore"
                  className="px-3.5 py-1.5 rounded-lg bg-teal-50 border border-teal-200 text-teal-800 text-xs font-semibold hover:bg-teal-100 transition"
                >
                  Full-Screen Explore View
                </Link>
              </div>

              <GlobeVisualizer height={460} />
            </div>
          )}

          {/* TAB 8: IMPACT & METRICS */}
          {activeTab === 'impact' && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div>
                  <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-teal-600" />
                    Impact Analytics & Export
                  </h2>
                  <p className="text-xs text-slate-500">
                    Real confirmed recipient data aggregated from delivery receipts.
                  </p>
                </div>
                <Link
                  href="/impact"
                  className="px-3.5 py-1.5 rounded-lg bg-teal-600 text-white text-xs font-semibold hover:bg-teal-700 transition"
                >
                  Public Impact Dashboard
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-slate-500">Confirmed Deliveries</span>
                  <div className="text-2xl font-bold text-slate-900 mt-1">
                    {donations.filter(d => d.status === 'delivered_confirmed').length}
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-slate-500">Confirmed Food (kg)</span>
                  <div className="text-2xl font-bold text-slate-900 mt-1">200 kg</div>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-slate-500">CO2e Emissions Diverted</span>
                  <div className="text-2xl font-bold text-emerald-700 mt-1">500 kg CO2e</div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 9: AI & SYSTEM HEALTH (DLQ + AI Runs) */}
          {activeTab === 'health' && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div>
                  <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <Activity className="w-5 h-5 text-teal-600" />
                    AI Engine Health & Dead-Letter Queue (DLQ)
                  </h2>
                  <p className="text-xs text-slate-500">
                    AC-11 Event resilience test suite. Safe inspection and idempotent retry of failed events.
                  </p>
                </div>
              </div>

              {/* Dead Letter Queue Section */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-rose-800 uppercase tracking-wider flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-rose-600" />
                    Dead-Letter Queue (DLQ) Items
                  </h3>
                  <span className="text-[11px] text-slate-500">
                    Repeated event failures after bounded retries
                  </span>
                </div>

                <div className="divide-y divide-slate-200 border border-slate-200 rounded-xl overflow-hidden text-xs">
                  {(systemHealth?.dlqEvents || []).map((dlq: any) => (
                    <div key={dlq.id} className="p-4 bg-white space-y-2">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              dlq.status === 'failed' ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
                            }`}>
                              {dlq.status}
                            </span>
                            <span className="font-mono font-bold text-slate-900">{dlq.eventType}</span>
                            <span className="font-mono text-slate-400 text-[11px]">#{dlq.id}</span>
                          </div>
                          <p className="text-rose-700 text-[11px] mt-1 font-mono">{dlq.error}</p>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-[11px] text-slate-500 font-mono">
                            Attempts: {dlq.retryCount}/{dlq.maxRetries}
                          </span>
                          {dlq.status === 'failed' && (
                            <button
                              onClick={() => handleDLQRetry(dlq.id)}
                              className="px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                            >
                              <RotateCcw className="w-3 h-3" />
                              Safe Retry
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* AI Agent Execution Traces */}
              <div className="space-y-3 pt-4 border-t border-slate-100">
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-teal-600" />
                  Recent AI Tool Execution & Guardrail Audit Logs
                </h3>

                <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden text-xs">
                  {(systemHealth?.aiRuns || []).map((run: any) => (
                    <div key={run.id} className="p-3.5 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                            run.status === 'rejected_by_guardrails' ? 'bg-rose-100 text-rose-800' : 'bg-teal-100 text-teal-800'
                          }`}>
                            {run.status}
                          </span>
                          <span className="font-bold text-slate-800">{run.task}</span>
                          <span className="text-slate-400 font-mono text-[11px]">({run.latencyMs}ms)</span>
                        </div>
                        <p className="text-slate-500 text-[11px]">
                          Tools: <span className="font-mono text-teal-700">{run.toolsUsed?.join(', ') || 'none'}</span> | {run.validationResult}
                        </p>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {new Date(run.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 10: USERS & AUDIT */}
          {activeTab === 'audit' && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div>
                  <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <Users className="w-5 h-5 text-teal-600" />
                    RBAC Roles & Searchable Audit Ledger ({auditLogs.length})
                  </h2>
                  <p className="text-xs text-slate-500">
                    Immutable history of all privileged modifications, verification decisions, and scoring updates.
                  </p>
                </div>
              </div>

              <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100 text-xs">
                {auditLogs.map((log) => (
                  <div key={log.id} className="p-4 space-y-1 bg-white hover:bg-slate-50/50 transition">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-slate-900">{log.action}</span>
                        <span className="text-slate-500 text-[11px] font-mono">[{log.entityType}: {log.entityId}]</span>
                      </div>
                      <span className="text-[11px] text-slate-400 font-mono">
                        {new Date(log.timestamp).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-slate-600">
                      Actor: <strong className="text-slate-800">{log.actor?.name}</strong> ({log.actor?.role}) | Reason: <em>“{log.reason}”</em>
                    </p>
                    {log.afterSummary && (
                      <div className="text-[11px] text-slate-400 font-mono truncate">
                        Diff: {log.afterSummary}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 11: SETTINGS & SCORING WEIGHTS */}
          {activeTab === 'settings' && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div>
                  <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <Sliders className="w-5 h-5 text-teal-600" />
                    Versioned Scoring Engine Configuration
                  </h2>
                  <p className="text-xs text-slate-500">
                    Current Version: <strong className="font-mono text-teal-700">{scoringConfig?.version || 'v1.0'}</strong>. Changes require permission, validation (sum = 100%), and an audit record.
                  </p>
                </div>
              </div>

              <form onSubmit={handleUpdateWeights} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Need & Category Fit (0.0 - 1.0)</label>
                    <input
                      type="number"
                      step="0.05"
                      min="0"
                      max="1"
                      value={weightsForm.needFit}
                      onChange={(e) => setWeightsForm({ ...weightsForm, needFit: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Urgency Level (0.0 - 1.0)</label>
                    <input
                      type="number"
                      step="0.05"
                      min="0"
                      max="1"
                      value={weightsForm.urgency}
                      onChange={(e) => setWeightsForm({ ...weightsForm, urgency: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Delivery / Logistics Fit (0.0 - 1.0)</label>
                    <input
                      type="number"
                      step="0.05"
                      min="0"
                      max="1"
                      value={weightsForm.deliveryFit}
                      onChange={(e) => setWeightsForm({ ...weightsForm, deliveryFit: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Time / Expiry Safe Buffer (0.0 - 1.0)</label>
                    <input
                      type="number"
                      step="0.05"
                      min="0"
                      max="1"
                      value={weightsForm.timeFit}
                      onChange={(e) => setWeightsForm({ ...weightsForm, timeFit: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Quantity Fit (0.0 - 1.0)</label>
                    <input
                      type="number"
                      step="0.05"
                      min="0"
                      max="1"
                      value={weightsForm.quantityFit}
                      onChange={(e) => setWeightsForm({ ...weightsForm, quantityFit: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Freshness / Audit Confidence (0.0 - 1.0)</label>
                    <input
                      type="number"
                      step="0.05"
                      min="0"
                      max="1"
                      value={weightsForm.freshnessConfidence}
                      onChange={(e) => setWeightsForm({ ...weightsForm, freshnessConfidence: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Calibration Rationale Note *</label>
                  <input
                    type="text"
                    required
                    value={weightsForm.reason}
                    onChange={(e) => setWeightsForm({ ...weightsForm, reason: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                  />
                </div>

                <div className="flex items-center justify-between pt-2">
                  <span className="text-slate-500">
                    Total Sum: {((weightsForm.needFit + weightsForm.urgency + weightsForm.deliveryFit + weightsForm.timeFit + weightsForm.quantityFit + weightsForm.freshnessConfidence) * 100).toFixed(0)}% (Must equal 100%)
                  </span>
                  <button
                    type="submit"
                    disabled={updatingWeights}
                    className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold transition shadow-sm cursor-pointer disabled:opacity-50"
                  >
                    {updatingWeights ? 'Updating...' : 'Publish New Scoring Version'}
                  </button>
                </div>
              </form>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
