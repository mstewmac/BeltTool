import type { BeltDesign } from '../../types';
import s from './PriceDisplay.module.css';

interface Props {
  design: BeltDesign;
}

// This component is no longer used - pricing removed from the app
export default function PriceDisplay(_props: Props) {
  return (
    <div className={s.card}>
      <div className={s.title}>Pricing removed</div>
      <div className={s.total}>
        <span>TBD</span>
      </div>
    </div>
  );
}
