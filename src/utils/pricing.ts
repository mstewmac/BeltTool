import type { BeltDesign } from '../types';
import { PRICING, BUCKLE_OPTIONS } from '../constants';

export interface PriceBreakdown {
  base: number;
  widthUpcharge: number;
  finishUpcharge: number;
  buckleUpcharge: number;
  total: number;
}

export function calculatePrice(design: BeltDesign): PriceBreakdown {
  const base = PRICING.basePrice[design.style];
  const widthUpcharge = PRICING.widthModifier[design.width];
  const finishUpcharge = PRICING.finishModifier[design.finish];
  const buckle = BUCKLE_OPTIONS.find(b => b.id === design.buckleId);
  const buckleUpcharge = buckle?.priceModifier ?? 0;

  return {
    base,
    widthUpcharge,
    finishUpcharge,
    buckleUpcharge,
    total: base + widthUpcharge + finishUpcharge + buckleUpcharge,
  };
}
