/**
 * SAHAY BRAND IDENTITY & DESIGN SYSTEM CONFIGURATION
 * 
 * "यत्र आवश्यकता, तत्र सहायः" (Where there is need, there is Sahay)
 * Assistance, compassion, trust, cooperation, and timely humanitarian coordination.
 */

export const SAHAY_BRAND = {
  name: 'SAHAY',
  tagline: 'यत्र आवश्यकता, तत्र सहायः',
  englishTagline: 'Where there is need, there is Sahay',
  mission: 'Turning Surplus Into Support',
  subheadline:
    'Connect unused resources with verified organizations that need them most. Make every contribution count through transparent, accountable humanitarian coordination.',
  
  // Official Color Palette derived from the authentic Sahay Brand Identity
  colors: {
    primaryForest: '#075B3C',   // Deep Forest Green from logo lettering
    deepGreen: '#06452F',       // Hover / Dark Green
    tealAccent: '#159C9A',      // Vibrant Teal from hand-clasp and leaf details
    warmCream: '#FFF9E9',       // Background cream from logo mark
    white: '#FFFFFF',
    lightSage: '#EAF3EC',       // Soft sage background
    paleTeal: '#E6F5F3',        // Soft teal tint
    primaryText: '#182820',     // Readable dark green-navy
    secondaryText: '#64746A',   // Muted slate-green
    border: '#E3EAE3',          // Organic soft border
    
    // Status colors
    success: '#13845B',
    warning: '#C47A18',
    error: '#C83D4B',
    info: '#3978D4',
  },

  // Asset paths
  assets: {
    logoCream: '/brand/sahay-logo-cream.png',
    logoTransparent: '/brand/sahay-logo-transparent.png',
    logo2x: '/brand/sahay-logo-transparent-2x.png',
    card: '/brand/sahay-card.png',
    icon: '/brand/sahay-icon.png',
    favicon: '/favicon.ico',
  },

  // Contact & Social
  supportEmail: 'support@sahay.org',
  legalEntity: 'Sahay Foundation for Humanitarian Coordination',
} as const;

export default SAHAY_BRAND;
