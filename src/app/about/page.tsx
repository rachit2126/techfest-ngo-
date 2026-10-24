import React from 'react';
import Link from 'next/link';
import {
  HeartHandshake,
  ShieldCheck,
  Scale,
  Sparkles,
  Lock,
  ArrowRight,
  Building2,
  Leaf,
  Globe
} from 'lucide-react';
import SahayLogo from '@/components/brand/SahayLogo';
import { SAHAY_BRAND } from '@/config/brand';

export default function AboutPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      {/* Hero */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="flex justify-center mb-2">
          <SahayLogo variant="card" />
        </div>
        <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-[#EAF3EC] text-[#075B3C] text-xs font-bold border border-[#075B3C]/20">
          <span className="font-hindi text-sm">{SAHAY_BRAND.tagline}</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#075B3C] tracking-tight leading-tight">
          Turning Surplus Into Support
        </h1>
        <p className="text-base text-[#64746A] leading-relaxed">
          {SAHAY_BRAND.subheadline}
        </p>
      </div>

      {/* 3 Core Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-2xl bg-white border border-[#E3EAE3] shadow-xs space-y-3">
          <div className="w-10 h-10 rounded-xl bg-[#EAF3EC] border border-[#075B3C]/20 flex items-center justify-center text-[#075B3C]">
            <Scale className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-[#182820] text-base">Deterministic Matching</h3>
          <p className="text-xs text-[#64746A] leading-relaxed">
            Matching decisions are governed by transparent, deterministic scoring formulas (Need Fit, Urgency, Logistics Distance, Safe Buffer, Quantity Match). AI explains results from stored records and cannot fabricate NGO verification or delivery status.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-white border border-[#E3EAE3] shadow-xs space-y-3">
          <div className="w-10 h-10 rounded-xl bg-[#E6F5F3] border border-[#159C9A]/20 flex items-center justify-center text-[#159C9A]">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-[#182820] text-base">Statutory NGO Vetting</h3>
          <p className="text-xs text-[#64746A] leading-relaxed">
            Every participating organisation is vetted against statutory public registers (NGO Darpan, FSSAI Food Safety Licence, 80G/12A certificates) and physical depot audits. AI cannot auto-verify organisations.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-white border border-[#E3EAE3] shadow-xs space-y-3">
          <div className="w-10 h-10 rounded-xl bg-[#FFF9E9] border border-[#C47A18]/20 flex items-center justify-center text-[#C47A18]">
            <Lock className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-[#182820] text-base">Privacy by Default</h3>
          <p className="text-xs text-[#64746A] leading-relaxed">
            Public globes and maps display service-area centroids only. Vulnerable community shelters and donor private addresses are strictly restricted to authorized drivers at scheduled pickup time.
          </p>
        </div>
      </div>

      {/* Sustainable Development Goals Alignment */}
      <div className="bg-white rounded-2xl border border-[#E3EAE3] p-8 shadow-xs space-y-4">
        <h2 className="text-lg font-bold text-[#182820] flex items-center gap-2">
          <Leaf className="w-5 h-5 text-[#075B3C]" />
          United Nations Sustainable Development Goals (UN SDGs)
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-[#FFF9E9] border border-[#C47A18]/20 space-y-1">
            <strong className="text-[#C47A18] font-bold block">SDG 2: Zero Hunger</strong>
            <p className="text-[#64746A]">
              Recovering edible surplus within safe 48-hour buffers to nourish vulnerable families and shelters with dignity.
            </p>
          </div>
          <div className="p-4 rounded-xl bg-[#E6F5F3] border border-[#159C9A]/20 space-y-1">
            <strong className="text-[#159C9A] font-bold block">SDG 11: Sustainable Communities</strong>
            <p className="text-[#64746A]">
              Building localized, resilient supply networks between urban surplus providers and frontline grassroots distribution centers.
            </p>
          </div>
          <div className="p-4 rounded-xl bg-[#EAF3EC] border border-[#075B3C]/20 space-y-1">
            <strong className="text-[#075B3C] font-bold block">SDG 12 & 13: Responsible Consumption & Climate Action</strong>
            <p className="text-[#64746A]">
              Diverting usable surplus from landfills, preventing methane generation with auditable CO2e accounting.
            </p>
          </div>
        </div>
      </div>

      <div className="text-center pt-4">
        <Link
          href="/donate/individual"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#075B3C] hover:bg-[#06452F] text-white font-bold text-sm transition shadow-sm"
        >
          Get Started with a Donation <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
