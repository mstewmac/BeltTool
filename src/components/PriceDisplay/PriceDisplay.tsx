import type { BeltDesign } from '../../types';
import { calculatePrice } from '../../utils/pricing';
import s from './PriceDisplay.module.css';

interface Props {
  design: BeltDesign;
}

export default function PriceDisplay({ design }: Props) {
  const price = calculatePrice(design);

  return (
    <div className={s.card}>
      <div className={s.title}>Price</div>
      <div className={s.total}>
        <span className={s.currency}>$</span>{price.total}
      </div>
      <div className={s.breakdown}>
        <div className={s.breakdownRow}>
          <span>Base ({design.style})</span>
          <span>${price.base}</span>
        </div>
        {price.widthUpcharge > 0 && (
          <div className={s.breakdownRow}>
            <span>Width ({design.width}&Prime;)</span>
            <span>+${price.widthUpcharge}</span>
          </div>
        )}
        {price.finishUpcharge > 0 && (
          <div className={s.breakdownRow}>
            <span>Finish ({design.finish})</span>
            <span>+${price.finishUpcharge}</span>
          </div>
        )}
        {price.buckleUpcharge > 0 && (
          <div className={s.breakdownRow}>
            <span>Buckle</span>
            <span>+${price.buckleUpcharge}</span>
          </div>
        )}
        <hr className={s.divider} />
        <div className={s.breakdownRow}>
          <span><strong>Total</strong></span>
          <span><strong>${price.total}</strong></span>
        </div>
      </div>
    </div>
  );
}
