'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { UserCheck, Shield, ChevronUp, ChevronDown, CheckCircle2, RotateCcw } from 'lucide-react';
import { UserRole } from '@/lib/types';

const ROLES: { role: UserRole; label: string; name: string }[] = [
  { role: 'admin', label: 'Super Admin', name: 'Vikramaditya Sen' },
  { role: 'ngo_reviewer', label: 'NGO Verification Officer', name: 'Pooja Narang' },
  { role: 'emergency_coordinator', label: 'Emergency Relief Lead', name: 'Maj. Amitav Rao' },
  { role: 'donor', label: 'Individual Donor', name: 'Riya Sharma' },
  { role: 'business_donor', label: 'Business Donor', name: 'Grand Horizon Hospitality' },
  { role: 'ngo_staff', label: 'NGO Recipient Staff', name: 'Anshu Mehra (Goonj)' },
  { role: 'analytics_viewer', label: 'Analytics & Audit Viewer', name: 'Auditor' }
];

export default function DevSandboxDrawer() {
  const pathname = usePathname();
  if (pathname === '/donate/individual') {
    return null;
  }
  const [isOpen, setIsOpen] = useState(false);
  const [currentRole, setCurrentRole] = useState<UserRole>('admin');
  const [switching, setSwitching] = useState(false);

  useEffect(() => {
    fetch('/api/auth/me')
      .then(r => r.json())
      .then(d => {
        if (d.user?.role) setCurrentRole(d.user.role);
      })
      .catch(() => {});
  }, []);

  const handleSwitch = async (role: UserRole) => {
    setSwitching(true);
    try {
      const res = await fetch('/api/auth/switch-role', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role })
      });
      if (res.ok) {
        setCurrentRole(role);
        window.location.reload();
      }
    } finally {
      setSwitching(false);
    }
  };

  return (
    <div className="fixed bottom-4 left-4 z-40 text-xs">
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900/90 hover:bg-slate-900 text-white shadow-lg border border-slate-700/80 transition cursor-pointer backdrop-blur-md"
        >
          <UserCheck className="w-3.5 h-3.5 text-teal-400" />
          <span className="text-[11px] font-semibold text-slate-300">Testing Sandbox:</span>
          <span className="font-bold text-teal-300">{currentRole}</span>
          <ChevronUp className="w-3 h-3 text-slate-400" />
        </button>
      ) : (
        <div className="w-72 bg-white rounded-2xl shadow-2xl border border-slate-200 p-3 space-y-2 animate-in fade-in zoom-in-95">
          <div className="flex items-center justify-between pb-1.5 border-b border-slate-100">
            <div className="flex items-center gap-1.5 font-bold text-slate-900 text-xs">
              <Shield className="w-3.5 h-3.5 text-teal-600" />
              Role Simulation Sandbox
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
            >
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
          </div>

          <p className="text-[10px] text-slate-500">
            Separated from production header. Switch personas to verify role-based permissions:
          </p>

          <div className="space-y-1">
            {ROLES.map((r) => (
              <button
                key={r.role}
                onClick={() => handleSwitch(r.role)}
                disabled={switching}
                className={`w-full text-left px-2.5 py-1.5 rounded-lg flex items-center justify-between transition cursor-pointer text-[11px] ${
                  r.role === currentRole
                    ? 'bg-teal-50 text-teal-900 font-bold border border-teal-200'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <div>
                  <span className="block text-slate-900">{r.label}</span>
                  <span className="text-[10px] text-slate-400">{r.name}</span>
                </div>
                {r.role === currentRole && (
                  <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
