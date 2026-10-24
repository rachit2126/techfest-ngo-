import React from 'react';
import { MatchFactorBreakdown } from '@/lib/types';

interface FactorBreakdownProps {
  factors: MatchFactorBreakdown;
  weights?: {
    needFit: number;
    urgency: number;
    deliveryFit: number;
    timeFit: number;
    quantityFit: number;
    freshnessConfidence: number;
  };
}

export default function FactorBreakdown({
  factors,
  weights = {
    needFit: 0.30,
    urgency: 0.20,
    deliveryFit: 0.15,
    timeFit: 0.15,
    quantityFit: 0.10,
    freshnessConfidence: 0.10
  }
}: FactorBreakdownProps) {
  const items = [
    { label: 'Need & Category Fit', score: factors.needFit, weight: weights.needFit, color: 'bg-teal-600' },
    { label: 'Urgency & Deadline', score: factors.urgency, weight: weights.urgency, color: 'bg-amber-600' },
    { label: 'Logistics & Distance Fit', score: factors.deliveryFit, weight: weights.deliveryFit, color: 'bg-sky-600' },
    { label: 'Time / Expiry Safe Buffer', score: factors.timeFit, weight: weights.timeFit, color: 'bg-indigo-600' },
    { label: 'Quantity Match Ratio', score: factors.quantityFit, weight: weights.quantityFit, color: 'bg-emerald-600' },
    { label: 'Freshness & Audit Confidence', score: factors.freshnessConfidence, weight: weights.freshnessConfidence, color: 'bg-purple-600' }
  ];

  return (
    <div className="space-y-2.5 text-xs">
      {items.map((item, idx) => {
        const contribution = Math.round(item.score * item.weight);
        return (
          <div key={idx} className="space-y-1">
            <div className="flex items-center justify-between text-slate-700 font-medium">
              <span>{item.label} <span className="text-[11px] text-slate-400 font-normal">({Math.round(item.weight * 100)}% weight)</span></span>
              <span className="font-semibold text-slate-900">{item.score}/100 <span className="text-slate-500 font-normal">(+{contribution} pts)</span></span>
            </div>
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
              <div
                className={`h-full ${item.color} transition-all duration-500 rounded-full`}
                style={{ width: `${Math.min(100, Math.max(0, item.score))}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
