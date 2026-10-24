'use client';

import { useState, useEffect } from 'react';
import { UserCheck, ChevronDown } from 'lucide-react';
import { UserRole } from '@/lib/types';

const ROLES: { role: UserRole; label: string; badge: string }[] = [
  { role: 'admin', label: 'Vikramaditya (Super Admin)', badge: 'Admin' },
  { role: 'ngo_reviewer', label: 'Pooja (NGO Verification Officer)', badge: 'Reviewer' },
  { role: 'emergency_coordinator', label: 'Maj. Rao (Emergency Coordinator)', badge: 'Emergency' },
  { role: 'donor', label: 'Riya Sharma (Individual Donor)', badge: 'Donor' },
  { role: 'business_donor', label: 'Grand Horizon (Business Donor)', badge: 'Business' },
  { role: 'ngo_staff', label: 'Anshu (Goonj NGO Staff)', badge: 'NGO' },
  { role: 'analytics_viewer', label: 'Auditor (Analytics Viewer)', badge: 'Analytics' }
];

export default function RoleSelector() {
  const [currentRole, setCurrentRole] = useState<UserRole>('admin');
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Read cookie or fetch me
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        if (data.user?.role) setCurrentRole(data.user.role);
      })
      .catch(() => {});
  }, []);

  const switchRole = async (role: UserRole) => {
    setLoading(true);
    try {
      const res = await fetch('/api/auth/switch-role', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role })
      });
      if (res.ok) {
        setCurrentRole(role);
        setIsOpen(false);
        window.location.reload();
      }
    } catch (err) {
      console.error('Role switch failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const activeItem = ROLES.find(r => r.role === currentRole) || ROLES[0];

  return (
    <div className="relative inline-block text-left">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-100/90 hover:bg-slate-200/80 border border-slate-300/80 text-xs font-medium text-slate-800 transition cursor-pointer shadow-2xs"
        aria-label="Switch simulation role"
      >
        <UserCheck className="w-3.5 h-3.5 text-teal-700" />
        <span className="hidden md:inline text-slate-600">Simulating:</span>
        <span className="font-semibold text-slate-900">{activeItem.badge}</span>
        <ChevronDown className="w-3 h-3 text-slate-500" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1 w-64 rounded-xl bg-white border border-slate-200 shadow-xl z-50 py-1 divide-y divide-slate-100 animate-in fade-in zoom-in-95">
          <div className="px-3 py-2 text-[11px] font-semibold text-slate-500 uppercase tracking-wider bg-slate-50">
            Switch Persona / RBAC Role
          </div>
          <div className="py-1">
            {ROLES.map(r => (
              <button
                key={r.role}
                onClick={() => switchRole(r.role)}
                disabled={loading}
                className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between transition cursor-pointer hover:bg-teal-50/70 ${
                  r.role === currentRole ? 'bg-teal-50 text-teal-900 font-semibold' : 'text-slate-700'
                }`}
              >
                <div>
                  <div className="text-slate-900">{r.label}</div>
                  <div className="text-[10px] text-slate-500 font-normal">Role: {r.role}</div>
                </div>
                {r.role === currentRole && (
                  <span className="w-2 h-2 rounded-full bg-teal-600 shrink-0" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
