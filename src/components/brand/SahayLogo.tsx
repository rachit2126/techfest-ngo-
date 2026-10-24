'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { SAHAY_BRAND } from '@/config/brand';

interface SahayLogoProps {
  variant?: 'header' | 'full' | 'compact' | 'footer' | 'card' | 'symbol';
  className?: string;
  showTagline?: boolean;
  href?: string;
}

export default function SahayLogo({
  variant = 'header',
  className = '',
  showTagline = true,
  href = '/',
}: SahayLogoProps) {
  const content = (
    <div className={`inline-flex items-center gap-3 select-none ${className}`}>
      {variant === 'card' ? (
        // Cream background emblem card
        <div className="relative rounded-xl overflow-hidden shadow-xs border border-[#E3EAE3] bg-[#FEF7E5] p-2 flex items-center justify-center">
          <Image
            src={SAHAY_BRAND.assets.logoCream}
            alt="SAHAY — यत्र आवश्यकता, तत्र सहायः"
            width={240}
            height={90}
            className="h-14 w-auto object-contain"
            priority
          />
        </div>
      ) : variant === 'symbol' ? (
        // Just the logo mark
        <div className="relative w-10 h-10 shrink-0 flex items-center justify-center rounded-xl bg-[#EAF3EC] border border-[#E3EAE3] p-1.5 shadow-2xs">
          <Image
            src={SAHAY_BRAND.assets.icon}
            alt="Sahay"
            width={48}
            height={48}
            className="w-full h-full object-contain"
          />
        </div>
      ) : (
        // Header / Full / Footer
        <div className="flex items-center gap-3">
          <div className="relative h-10 sm:h-11 w-auto shrink-0 flex items-center">
            <Image
              src={SAHAY_BRAND.assets.logoTransparent}
              alt="SAHAY"
              width={160}
              height={55}
              className="h-10 sm:h-11 w-auto object-contain transition-transform duration-200 group-hover:scale-102"
              priority
            />
          </div>
          {showTagline && variant === 'full' && (
            <div className="hidden sm:flex flex-col justify-center border-l border-[#E3EAE3] pl-3 py-0.5">
              <span className="text-[11px] font-bold text-[#075B3C] tracking-wide font-sans">
                {SAHAY_BRAND.tagline}
              </span>
              <span className="text-[9.5px] text-[#64746A] font-medium tracking-tight">
                {SAHAY_BRAND.englishTagline}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="group focus:outline-none shrink-0" aria-label="Sahay Home">
        {content}
      </Link>
    );
  }

  return content;
}
