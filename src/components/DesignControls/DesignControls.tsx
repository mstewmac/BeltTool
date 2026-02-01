import type { BeltDesign, BeltWidth, LeatherFinish, BeltStyle, BeltEndShape, BuckleAttachment } from '../../types';
import {
  LEATHER_COLORS,
  BUCKLE_OPTIONS,
  WIDTH_OPTIONS,
  FINISH_LABELS,
  STYLE_LABELS,
  END_SHAPE_LABELS,
  BUCKLE_ATTACHMENT_LABELS,
} from '../../constants';
import s from './DesignControls.module.css';

interface Props {
  design: BeltDesign;
  onChange: (design: BeltDesign) => void;
}

export default function DesignControls({ design, onChange }: Props) {
  const set = <K extends keyof BeltDesign>(key: K, value: BeltDesign[K]) =>
    onChange({ ...design, [key]: value });

  return (
    <div className={s.controls}>
      {/* Belt Width */}
      <div className={s.section}>
        <div className={s.sectionTitle}>Belt Width</div>
        <div className={s.toggleGroup}>
          {WIDTH_OPTIONS.map(w => (
            <button
              key={w}
              className={`${s.toggleBtn} ${design.width === w ? s.toggleBtnActive : ''}`}
              onClick={() => set('width', w as BeltWidth)}
            >
              {w}&Prime;
            </button>
          ))}
        </div>
      </div>

      {/* Leather Color */}
      <div className={s.section}>
        <div className={s.sectionTitle}>Leather Color</div>
        <div className={s.colorGrid}>
          {LEATHER_COLORS.map(c => (
            <button
              key={c.id}
              className={`${s.colorSwatch} ${design.colorId === c.id ? s.colorSwatchActive : ''}`}
              onClick={() => set('colorId', c.id)}
              title={c.name}
            >
              {c.image ? (
                <img className={s.colorSwatchImg} src={c.image} alt={c.name} />
              ) : (
                <div style={{ width: '100%', height: '100%', background: `linear-gradient(135deg, ${c.hex}, ${c.darkHex})` }} />
              )}
              <span className={s.colorName}>{c.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Leather Finish */}
      <div className={s.section}>
        <div className={s.sectionTitle}>Leather Finish</div>
        <select
          className={s.select}
          value={design.finish}
          onChange={e => set('finish', e.target.value as LeatherFinish)}
        >
          {Object.entries(FINISH_LABELS).map(([val, label]) => (
            <option key={val} value={val}>{label}</option>
          ))}
        </select>
      </div>

      {/* Belt Style */}
      <div className={s.section}>
        <div className={s.sectionTitle}>Belt Style</div>
        <div className={s.toggleGroup}>
          {Object.entries(STYLE_LABELS).map(([val, label]) => (
            <button
              key={val}
              className={`${s.toggleBtn} ${design.style === val ? s.toggleBtnActive : ''}`}
              onClick={() => set('style', val as BeltStyle)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Belt End Shape */}
      <div className={s.section}>
        <div className={s.sectionTitle}>Belt End Shape</div>
        <div className={s.toggleGroup}>
          {Object.entries(END_SHAPE_LABELS).map(([val, label]) => (
            <button
              key={val}
              className={`${s.toggleBtn} ${design.endShape === val ? s.toggleBtnActive : ''}`}
              onClick={() => set('endShape', val as BeltEndShape)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Buckle Selection */}
      <div className={s.section}>
        <div className={s.sectionTitle}>Buckle</div>
        <div className={s.buckleGrid}>
          {BUCKLE_OPTIONS.map(b => (
            <button
              key={b.id}
              className={`${s.buckleCard} ${design.buckleId === b.id ? s.buckleCardActive : ''}`}
              onClick={() => set('buckleId', b.id)}
            >
              <div className={s.buckleIcon}>
                {b.image && <img src={b.image} alt={b.name} />}
              </div>
              <div className={s.buckleName}>{b.name}</div>
              <div className={s.buckleDesc}>{b.description}</div>
              {b.priceModifier > 0 && (
                <div className={s.bucklePrice}>+${b.priceModifier}</div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Buckle Attachment Style */}
      <div className={s.section}>
        <div className={s.sectionTitle}>Buckle Attachment</div>
        <div className={s.toggleGroup}>
          {Object.entries(BUCKLE_ATTACHMENT_LABELS).map(([val, label]) => (
            <button
              key={val}
              className={`${s.toggleBtn} ${design.buckleAttachment === val ? s.toggleBtnActive : ''}`}
              onClick={() => set('buckleAttachment', val as BuckleAttachment)}
            >
              {label}
            </button>
          ))}
        </div>
        <div className={s.sectionHint}>
          {design.buckleAttachment === 'additional'
            ? 'Separate piece cut and folded around buckle bar'
            : 'Belt cut long with fold-back at buckle end (+2.5″)'}
        </div>
      </div>
    </div>
  );
}
