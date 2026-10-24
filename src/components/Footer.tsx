'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { HeartHandshake, ShieldCheck, MapPin, Sparkles } from 'lucide-react';
import SahayLogo from '@/components/brand/SahayLogo';
import { SAHAY_BRAND } from '@/config/brand';

export default function Footer() {
  const pathname = usePathname();
  if (pathname === '/donate/individual') {
    return null;
  }
  return (

    <footer className="bg-white text-[#64746A] border-t border-[#E3EAE3] text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand Col */}
          <div className="space-y-3">
            <SahayLogo variant="full" />
            <p className="text-[#64746A] leading-relaxed text-xs mt-2">
              {SAHAY_BRAND.subheadline}
            </p>
            <div className="flex items-center gap-2 text-[#075B3C] font-semibold text-[11px] pt-1">
              <ShieldCheck className="w-3.5 h-3.5 text-[#075B3C]" />
              <span>Transparent, audit-ready humanitarian coordination</span>
            </div>
          </div>

          {/* Donor Journeys */}
          <div>
            <h4 className="font-bold text-[#182820] uppercase tracking-wider text-[11px] mb-3">
              Donation Portals
            </h4>
            <ul className="space-y-2">
              <li>
                <Link href="/donate/individual" className="text-[#64746A] hover:text-[#075B3C] transition font-medium">
                  Individual & Community Donors
                </Link>
              </li>
              <li>
                <Link href="/donate/organisation" className="text-[#64746A] hover:text-[#075B3C] transition font-medium">
                  Business & Enterprise Surplus (CSV)
                </Link>
              </li>
              <li>
                <Link href="/matches/don_blankets_100_demo" className="text-[#64746A] hover:text-[#075B3C] transition font-medium">
                  Demo: 100 Blankets Match Control
                </Link>
              </li>
              <li>
                <Link href="/donations/don_completed_rice_bags/tracking" className="text-[#64746A] hover:text-[#075B3C] transition font-medium">
                  Live Delivery Milestone Tracker
                </Link>
              </li>
            </ul>
          </div>

          {/* NGO & Governance */}
          <div>
            <h4 className="font-bold text-[#182820] uppercase tracking-wider text-[11px] mb-3">
              NGOs & Relief Operations
            </h4>
            <ul className="space-y-2">
              <li>
                <Link href="/explore" className="text-[#64746A] hover:text-[#075B3C] transition font-medium">
                  Interactive Globe & Directory
                </Link>
              </li>
              <li>
                <Link href="/ngo/dashboard" className="text-[#64746A] hover:text-[#075B3C] transition font-medium">
                  NGO Recipient Hub
                </Link>
              </li>
              <li>
                <Link href="/ngo/requests" className="text-[#64746A] hover:text-[#075B3C] transition font-medium">
                  Publish Structured Need
                </Link>
              </li>
              <li>
                <Link href="/ngos/register" className="text-[#64746A] hover:text-[#075B3C] transition font-medium">
                  Verification Intake (80G / 12A)
                </Link>
              </li>
              <li>
                <Link href="/admin" className="text-[#64746A] hover:text-[#075B3C] transition font-medium">
                  Operations Admin Console
                </Link>
              </li>
            </ul>
          </div>

          {/* Provenance & Principles */}
          <div>
            <h4 className="font-bold text-[#182820] uppercase tracking-wider text-[11px] mb-3">
              Governance & Integrity
            </h4>
            <p className="text-[11px] text-[#64746A] leading-relaxed mb-3">
              <strong className="text-[#182820]">Privacy Safeguard:</strong> Exact shelter and beneficiary addresses are never exposed publicly. Public maps display service-area centroids only.
            </p>
            <p className="text-[11px] text-[#64746A] leading-relaxed">
              <strong className="text-[#182820]">AI Safety:</strong> Matching is governed by deterministic rules. AI explains factors from stored records and cannot fabricate NGO verification or delivery status.
            </p>
          </div>
        </div>

        <div className="pt-8 border-t border-[#E3EAE3] flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-[#64746A]">
          <p>© 2026 {SAHAY_BRAND.name} ({SAHAY_BRAND.legalEntity}). {SAHAY_BRAND.tagline}.</p>
          <div className="flex items-center gap-4">
            <Link href="/assistant" className="hover:text-[#075B3C] transition flex items-center gap-1 font-medium">
              <Sparkles className="w-3 h-3 text-[#159C9A]" /> Sahay AI Assistant
            </Link>
            <Link href="/impact" className="hover:text-[#075B3C] transition font-medium">
              Audited Impact Metrics
            </Link>
            <span className="text-[#E3EAE3]">|</span>
            <span className="text-[#075B3C] font-semibold flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#13845B] animate-pulse"></span>
              Verified Database Connected
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}

