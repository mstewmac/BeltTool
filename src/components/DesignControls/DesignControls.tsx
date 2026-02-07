import type { BeltDesign, BeltWidth, BeltEndShape, BuckleAttachment, BuckleShape, BuckleMaterial } from '../../types';
import {
  LEATHER_COLORS,
  BUCKLE_SHAPES,
  BUCKLE_MATERIALS,
  WIDTH_OPTIONS,
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

      {/* Buckle Shape */}
      <div className={s.section}>
        <div className={s.sectionTitle}>Buckle Shape</div>
        <div className={s.buckleGrid}>
          {BUCKLE_SHAPES.map(shape => (
            <button
              key={shape.id}
              className={`${s.buckleCard} ${design.buckleShape === shape.id ? s.buckleCardActive : ''}`}
              onClick={() => set('buckleShape', shape.id as BuckleShape)}
            >
              <div className={s.buckleIcon}>
                {shape.image && <img src={shape.image} alt={shape.name} />}
              </div>
              <div className={s.buckleName}>{shape.name}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Buckle Material */}
      <div className={s.section}>
        <div className={s.sectionTitle}>Buckle Material</div>
        <div className={s.buckleGrid}>
          {BUCKLE_MATERIALS.map(material => (
            <button
              key={material.id}
              className={`${s.buckleCard} ${design.buckleMaterial === material.id ? s.buckleCardActive : ''}`}
              onClick={() => set('buckleMaterial', material.id as BuckleMaterial)}
            >
              <div className={s.buckleIcon}>
                {material.image && <img src={material.image} alt={material.name} />}
              </div>
              <div className={s.buckleName}>{material.name}</div>
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
