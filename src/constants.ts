import type { LeatherColor, BuckleShapeOption, BuckleMaterialOption } from './types';

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
export const BUCKLE_SHAPES: BuckleShapeOption[] = [
  { id: 'square', name: 'Square', image: '/buckles/shapes/Square.webp' },
  { id: 'round', name: 'Round', image: '/buckles/shapes/Round.webp' },
];

export const BUCKLE_MATERIALS: BuckleMaterialOption[] = [
  { id: 'antique-brass', name: 'Antique Brass', image: '/buckles/materials/AntiqueBrass.webp' },
  { id: 'gold-brass', name: 'Gold Brass', image: '/buckles/materials/GoldBrass.webp' },
  { id: 'silver', name: 'Silver', image: '/buckles/materials/Silver.webp' },
  { id: 'black', name: 'Black', image: '/buckles/materials/Black.webp' },
];

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
