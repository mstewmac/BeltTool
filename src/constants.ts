import type { LeatherColor, BuckleOption } from './types';

// ============================================================
// LEATHER COLORS
// ============================================================
export const LEATHER_COLORS: LeatherColor[] = [
  { id: 'black-saddle',   name: 'Black Saddle',     hex: '#1a1a1a', darkHex: '#000000', image: '/leather/blacksaddleskirt.webp' },
  { id: 'light-brown',    name: 'Light Brown',      hex: '#B5835A', darkHex: '#96643C', image: '/leather/lightbrown.webp' },
  { id: 'dark-brown',     name: 'Dark Brown',       hex: '#4A2C2A', darkHex: '#2E1A18', image: '/leather/darkbrown.jpg' },
];

// ============================================================
// BUCKLE OPTIONS
// ============================================================
export const BUCKLE_OPTIONS: BuckleOption[] = [
  { id: 'square-brass', name: 'Square Brass',  description: 'Solid brass square buckle', style: 'casual', priceModifier: 0,  image: '/buckles/Squarebuckle.webp', shape: 'square' },
  { id: 'round-silver', name: 'Round Silver',  description: 'Silver round buckle',       style: 'dress',  priceModifier: 10, image: '/buckles/roundbuckle.webp',  shape: 'round' },
];

// ============================================================
// PRICING
// ============================================================
export const PRICING = {
  basePrice: {
    casual: 65,
    dress: 85,
    work: 75,
  },
  widthModifier: {
    1: -5,
    1.25: 0,
    1.5: 5,
    1.75: 10,
  },
  finishModifier: {
    smooth: 0,
    textured: 5,
    distressed: 10,
    oiled: 8,
    suede: 12,
  },
};

// ============================================================
// BUSINESS INFO
// ============================================================
export const BUSINESS_INFO = {
  name: 'Deep Cove Leather Workshop',
  tagline: 'Handcrafted Custom Leather Goods',
  phone: '(555) 123-4567',
  email: 'orders@deepcoveleather.com',
  website: 'www.deepcoveleather.com',
  address: '123 Main Street, Your Town, ST 12345',
  leadTime: '2-3 weeks',
  depositPercent: 50,
  paymentTerms: '50% deposit required. Balance due upon completion.',
};

// ============================================================
// BELT SPECS
// ============================================================
export const BELT_SPECS = {
  buckleAllowance: 6,
  holeAllowance: 5,
  holeCount: 8,
  holeSpacing: 1,
  firstHoleFromTip: 5,
  integratedFoldBack: 2.5,
  holeDiameter: 0.15625,
  buckleSlotWidth: 0.75,
  buckleSlotLength: 0.1875,
};

// ============================================================
// DISPLAY LABELS
// ============================================================
export const FINISH_LABELS: Record<string, string> = {
  smooth: 'Smooth',
  textured: 'Textured',
  distressed: 'Distressed',
  oiled: 'Oiled',
  suede: 'Suede',
};

export const STYLE_LABELS: Record<string, string> = {
  casual: 'Casual',
  dress: 'Dress',
  work: 'Work / Heavy-Duty',
};

export const END_SHAPE_LABELS: Record<string, string> = {
  round: 'Round',
  square: 'Square',
  'square-taper': 'Square Taper',
  spear: 'Spear',
};

export const BUCKLE_ATTACHMENT_LABELS: Record<string, string> = {
  additional: 'Additional Piece',
  integrated: 'Integrated',
};

export const WIDTH_OPTIONS: number[] = [1, 1.25, 1.5, 1.75];

export const WAIST_MIN = 26;
export const WAIST_MAX = 54;
