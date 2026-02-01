import { useState, useCallback } from 'react';
import type { BeltDesign, CustomerDetails, BeltOrder } from './types';
import { BELT_SPECS, BUSINESS_INFO, WAIST_MIN, WAIST_MAX } from './constants';
import { calculatePrice } from './utils/pricing';
import { generateOrderNumber, generateOrderId, formatDate, saveOrder } from './utils/orderUtils';
import { generateOrderPDF } from './utils/pdfGenerator';
import BeltPreview from './components/BeltPreview/BeltPreview';
import DesignControls from './components/DesignControls/DesignControls';
import PriceDisplay from './components/PriceDisplay/PriceDisplay';
import CustomerInfo from './components/CustomerInfo/CustomerInfo';
import OrderHistory from './components/OrderHistory/OrderHistory';
import s from './App.module.css';

const DEFAULT_DESIGN: BeltDesign = {
  waistSize: 34,
  width: 1.5,
  colorId: 'light-brown',
  finish: 'smooth',
  style: 'casual',
  endShape: 'round',
  buckleId: 'square-brass',
  buckleAttachment: 'additional',
};

const DEFAULT_CUSTOMER: CustomerDetails = {
  name: '',
  phone: '',
  email: '',
  notes: '',
};

export default function App() {
  const [design, setDesign] = useState<BeltDesign>(DEFAULT_DESIGN);
  const [customer, setCustomer] = useState<CustomerDetails>(DEFAULT_CUSTOMER);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  }, []);

  const integratedExtra = design.buckleAttachment === 'integrated' ? BELT_SPECS.integratedFoldBack : 0;
  const totalLength = design.waistSize + BELT_SPECS.buckleAllowance + BELT_SPECS.holeAllowance + integratedExtra;
  const price = calculatePrice(design);

  const handleGeneratePDF = () => {
    const order: BeltOrder = {
      id: generateOrderId(),
      orderNumber: generateOrderNumber(),
      date: formatDate(),
      design,
      customer,
      totalLength,
      price: price.total,
    };

    saveOrder(order);
    generateOrderPDF(order);
    showToast(`PDF generated — ${order.orderNumber}`);
  };

  const handleReset = () => {
    setDesign(DEFAULT_DESIGN);
    setCustomer(DEFAULT_CUSTOMER);
  };

  const handleLoadOrder = (order: BeltOrder) => {
    setDesign(order.design);
    setCustomer(order.customer);
    showToast(`Loaded ${order.orderNumber}`);
  };

  const handleDuplicate = (order: BeltOrder) => {
    setDesign(order.design);
    setCustomer({ ...DEFAULT_CUSTOMER });
    showToast('Design duplicated — enter new customer info');
  };

  const adjustWaist = (delta: number) => {
    const next = Math.min(WAIST_MAX, Math.max(WAIST_MIN, design.waistSize + delta));
    setDesign(d => ({ ...d, waistSize: next }));
  };

  const adjustActualWaist = (delta: number) => {
    const current = design.actualWaistSize ?? design.waistSize;
    const next = Math.min(WAIST_MAX, Math.max(WAIST_MIN, current + delta));
    setDesign(d => ({ ...d, actualWaistSize: next }));
  };

  const canGenerate = customer.name.trim().length > 0;

  return (
    <div className={s.app}>
      <header className={s.topBar}>
        <div>
          <span className={s.logo}>{BUSINESS_INFO.name}</span>
          <span className={s.logoSub}>Belt Designer</span>
        </div>
        <div className={s.topActions}>
          <button className={s.iconBtn} onClick={() => setHistoryOpen(true)}>
            Orders
          </button>
          <button className={s.iconBtn} onClick={handleReset}>
            New Order
          </button>
        </div>
      </header>

      {/* Full-width top section: Customer + Waist Size */}
      <div className={s.heroSection}>
        <div className={s.heroInner}>
          <div className={s.heroLeft}>
            <CustomerInfo customer={customer} onChange={setCustomer} />
          </div>
          <div className={s.heroRight}>
            <div className={s.measurementCards}>
              <div className={s.waistCard}>
                <div className={s.waistLabel}>Pant Waist Size <span className={s.waistBadge}>drives template</span></div>
                <div className={s.waistRow}>
                  <button className={s.waistBtn} onClick={() => adjustWaist(-1)}>&minus;</button>
                  <input
                    className={s.waistInput}
                    type="number"
                    min={WAIST_MIN}
                    max={WAIST_MAX}
                    value={design.waistSize}
                    onChange={e => {
                      const v = parseInt(e.target.value);
                      if (!isNaN(v)) setDesign(d => ({ ...d, waistSize: Math.min(WAIST_MAX, Math.max(WAIST_MIN, v)) }));
                    }}
                  />
                  <span className={s.waistUnit}>inches</span>
                  <button className={s.waistBtn} onClick={() => adjustWaist(1)}>+</button>
                </div>
                <div className={s.waistNote}>
                  Total belt length: {totalLength}&Prime; (waist + {BELT_SPECS.buckleAllowance}&Prime; buckle + {BELT_SPECS.holeAllowance}&Prime; holes{integratedExtra ? ` + ${integratedExtra}″ fold-back` : ''})
                </div>
              </div>

              <div className={s.waistCard}>
                <div className={s.waistLabel}>Actual Waist Size <span className={s.waistBadge}>reference</span></div>
                <div className={s.waistRow}>
                  <button className={s.waistBtn} onClick={() => adjustActualWaist(-1)}>&minus;</button>
                  <input
                    className={s.waistInput}
                    type="number"
                    min={WAIST_MIN}
                    max={WAIST_MAX}
                    value={design.actualWaistSize ?? ''}
                    placeholder="—"
                    onChange={e => {
                      const v = parseInt(e.target.value);
                      if (!isNaN(v)) setDesign(d => ({ ...d, actualWaistSize: Math.min(WAIST_MAX, Math.max(WAIST_MIN, v)) }));
                      else setDesign(d => ({ ...d, actualWaistSize: undefined }));
                    }}
                  />
                  <span className={s.waistUnit}>inches</span>
                  <button className={s.waistBtn} onClick={() => adjustActualWaist(1)}>+</button>
                </div>
                <div className={s.waistNote}>
                  Measured around the body for reference during making
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <main className={s.main}>
        <div className={s.leftCol}>
          <BeltPreview design={design} />
          <PriceDisplay design={design} />
          <button
            className={s.generateBtn}
            onClick={handleGeneratePDF}
            disabled={!canGenerate}
          >
            {canGenerate ? 'Generate Order PDF' : 'Enter customer name to generate PDF'}
          </button>
          <button className={s.resetBtn} onClick={handleReset}>
            Reset All
          </button>
        </div>

        <div className={s.rightCol}>
          <DesignControls design={design} onChange={setDesign} />
        </div>
      </main>

      <OrderHistory
        open={historyOpen}
        onClose={() => setHistoryOpen(false)}
        onLoad={handleLoadOrder}
        onDuplicate={handleDuplicate}
      />

      {toast && <div className={s.toast}>{toast}</div>}
    </div>
  );
}
