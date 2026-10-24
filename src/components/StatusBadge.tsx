import React from 'react';
import {
  Clock,
  CheckCircle2,
  AlertTriangle,
  Truck,
  ShieldCheck,
  XCircle,
  FileSearch,
  PackageCheck,
  PauseCircle
} from 'lucide-react';
import { DonationStatus, VerificationStatus } from '@/lib/types';

interface StatusBadgeProps {
  status: DonationStatus | VerificationStatus | string;
  size?: 'sm' | 'md';
}

export default function StatusBadge({ status, size = 'sm' }: StatusBadgeProps) {
  const norm = (status || '').toLowerCase().replace(/[\s-]/g, '_');

  let label = status.replace(/_/g, ' ');
  let color = 'bg-slate-100 text-slate-700 border-slate-200';
  let Icon = Clock;

  switch (norm) {
    case 'verified':
      label = 'Verified';
      color = 'bg-emerald-50 text-emerald-800 border-emerald-300';
      Icon = ShieldCheck;
      break;
    case 'in_review':
    case 'validating':
      label = norm === 'in_review' ? 'In Review' : 'Validating';
      color = 'bg-blue-50 text-blue-800 border-blue-300';
      Icon = FileSearch;
      break;
    case 'eligible':
    case 'matched':
    case 'match_recommended':
      label = norm === 'eligible' ? 'Eligible' : 'Matched';
      color = 'bg-teal-50 text-teal-800 border-teal-300';
      Icon = CheckCircle2;
      break;
    case 'match_proposed':
    case 'awaiting_ngo':
      label = norm === 'match_proposed' ? 'Match Proposed' : 'Awaiting NGO';
      color = 'bg-indigo-50 text-indigo-800 border-indigo-300';
      Icon = Clock;
      break;
    case 'approved':
    case 'packed_ready':
      label = norm === 'approved' ? 'Approved' : 'Packed & Ready';
      color = 'bg-teal-50 text-teal-900 border-teal-400 font-semibold';
      Icon = PackageCheck;
      break;
    case 'picked_up':
    case 'in_transit':
      label = norm === 'picked_up' ? 'Picked Up' : 'In Transit';
      color = 'bg-sky-50 text-sky-800 border-sky-300';
      Icon = Truck;
      break;
    case 'delivered_pending':
      label = 'Delivered (Awaiting Confirmation)';
      color = 'bg-amber-50 text-amber-800 border-amber-300';
      Icon = Clock;
      break;
    case 'delivered_confirmed':
      label = 'Delivered Confirmed';
      color = 'bg-emerald-100 text-emerald-900 border-emerald-400 font-semibold';
      Icon = CheckCircle2;
      break;
    case 'rejected':
      label = 'Rejected';
      color = 'bg-rose-50 text-rose-800 border-rose-300';
      Icon = XCircle;
      break;
    case 'suspended':
      label = 'Suspended';
      color = 'bg-amber-50 text-amber-900 border-amber-300';
      Icon = PauseCircle;
      break;
    case 'disputed':
    case 'cancelled':
      label = norm === 'disputed' ? 'Disputed' : 'Cancelled';
      color = 'bg-rose-50 text-rose-800 border-rose-300 font-medium';
      Icon = AlertTriangle;
      break;
    case 'reverification_required':
      label = 'Re-verification Required';
      color = 'bg-purple-50 text-purple-800 border-purple-300';
      Icon = FileSearch;
      break;
    case 'code_red':
      label = 'Code Red (Critical)';
      color = 'bg-rose-100 text-rose-900 border-rose-400 font-bold';
      Icon = AlertTriangle;
      break;
    default:
      label = status;
      color = 'bg-slate-100 text-slate-700 border-slate-200';
      Icon = Clock;
  }

  const sizeClasses = size === 'sm' ? 'text-xs px-2 py-0.5 gap-1' : 'text-sm px-2.5 py-1 gap-1.5';

  return (
    <span
      className={`inline-flex items-center rounded-full border capitalize font-medium ${color} ${sizeClasses}`}
    >
      <Icon className={size === 'sm' ? 'w-3 h-3 shrink-0' : 'w-4 h-4 shrink-0'} />
      <span>{label}</span>
    </span>
  );
}
