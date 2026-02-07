import type { BeltDesign } from '../types';

export interface PriceBreakdown {
  base: number;
  widthUpcharge: number;
  finishUpcharge: number;
  buckleUpcharge: number;
  total: number;
}

// Pricing functionality removed - this is kept for compatibility only
export function calculatePrice(design: BeltDesign): PriceBreakdown {
  return {
    base: 0,
    widthUpcharge: 0,
    finishUpcharge: 0,
    buckleUpcharge: 0,
    total: 0,
  };
}
