import type { CustomerDetails } from '../../types';
import s from './CustomerInfo.module.css';

interface Props {
  customer: CustomerDetails;
  onChange: (customer: CustomerDetails) => void;
}

export default function CustomerInfo({ customer, onChange }: Props) {
  const set = <K extends keyof CustomerDetails>(key: K, value: string) =>
    onChange({ ...customer, [key]: value });

  return (
    <div className={s.card}>
      <div className={s.title}>Customer Information</div>
      <div className={s.fields}>
        <div className={s.field}>
          <label>Name</label>
          <input
            type="text"
            placeholder="Customer name"
            value={customer.name}
            onChange={e => set('name', e.target.value)}
          />
        </div>
        <div className={s.field}>
          <label>Phone</label>
          <input
            type="tel"
            placeholder="(555) 123-4567"
            value={customer.phone}
            onChange={e => set('phone', e.target.value)}
          />
        </div>
        <div className={s.field}>
          <label>Email <span className={s.optional}>(optional)</span></label>
          <input
            type="email"
            placeholder="customer@email.com"
            value={customer.email}
            onChange={e => set('email', e.target.value)}
          />
        </div>
        <div className={s.field}>
          <label>Special Notes / Requests</label>
          <textarea
            placeholder="Custom requests, monogram details, special instructions..."
            value={customer.notes}
            onChange={e => set('notes', e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}
