import type { BeltDesign } from '../../types';
import { LEATHER_COLORS, BUCKLE_OPTIONS, BELT_SPECS, FINISH_LABELS, STYLE_LABELS, END_SHAPE_LABELS, BUCKLE_ATTACHMENT_LABELS } from '../../constants';
import s from './BeltPreview.module.css';

interface Props {
  design: BeltDesign;
}

// SVG path data extracted from reference SVGs, normalized to ~105x78 viewBox
// These define the full closed left end shape of the belt
const END_SHAPE_PATHS: Record<string, string> = {
  round: 'M104.26,77.17l-73.96-1.28c-9.23-.16-17.3-7.14-22.49-14.38C-.94,49.29-1.08,33.37,6.38,20.45,13.32,8.43,26.22.96,41.34,1l62.92.17v76Z',
  square: 'M104.11,77l-91.5-.09c-6.14,0-10.67-4.95-10.93-10.93-.86-19.06-.88-37.76-.15-56.99.14-3.61,1.8-7.75,6.06-7.76l96.52-.24v76Z',
  'square-taper': 'M104,76.36c-11.68,1.54-24,1.02-36.18-1.68l-57.94-12.83c-5.3-1.17-8.24-5.32-8.43-10.44-.35-9.91-.66-18.88-.28-28.92.1-2.76,4.88-6.01,7.69-6.69C29.11,10.96,48.52,5.97,69.1,2.39c11.78-2.05,23.56-1.3,34.9-1.03v75Z',
  spear: 'M104.16,76.02h-33.6c-6.8,0-13.56-.95-20.09-2.83l-8.69-2.51C30.97,67.57,1.03,52.37,1,41.5c0-3,1.44-6.49,3.85-8.83C21.78,16.21,42.71,5.78,66.14,1.88l38.03-.86v75Z',
};

// Same paths but without the closing right vertical edge (v76Z / v75Z removed)
// Used for outline strokes so the tip flows seamlessly into the belt body
const END_SHAPE_OUTLINE_PATHS: Record<string, string> = {
  round: 'M104.26,77.17l-73.96-1.28c-9.23-.16-17.3-7.14-22.49-14.38C-.94,49.29-1.08,33.37,6.38,20.45,13.32,8.43,26.22.96,41.34,1l62.92.17',
  square: 'M104.11,77l-91.5-.09c-6.14,0-10.67-4.95-10.93-10.93-.86-19.06-.88-37.76-.15-56.99.14-3.61,1.8-7.75,6.06-7.76l96.52-.24',
  'square-taper': 'M104,76.36c-11.68,1.54-24,1.02-36.18-1.68l-57.94-12.83c-5.3-1.17-8.24-5.32-8.43-10.44-.35-9.91-.66-18.88-.28-28.92.1-2.76,4.88-6.01,7.69-6.69C29.11,10.96,48.52,5.97,69.1,2.39c11.78-2.05,23.56-1.3,34.9-1.03',
  spear: 'M104.16,76.02h-33.6c-6.8,0-13.56-.95-20.09-2.83l-8.69-2.51C30.97,67.57,1.03,52.37,1,41.5c0-3,1.44-6.49,3.85-8.83C21.78,16.21,42.71,5.78,66.14,1.88l38.03-.86',
};

export default function BeltPreview({ design }: Props) {
  const color = LEATHER_COLORS.find(c => c.id === design.colorId)!;
  const buckle = BUCKLE_OPTIONS.find(b => b.id === design.buckleId)!;
  const integratedExtra = design.buckleAttachment === 'integrated' ? BELT_SPECS.integratedFoldBack : 0;
  const totalLength = design.waistSize + BELT_SPECS.buckleAllowance + BELT_SPECS.holeAllowance + integratedExtra;

  const viewW = 640;
  const viewH = 130;
  const beltY = 30;
  const beltH = 50;
  const beltX = 10;
  const beltW = viewW - 50;

  // End shape area width (proportional to belt height, matching SVG aspect ~105:78)
  const tipW = beltH * (105 / 78);

  // Hole positions
  const holeScale = beltW / totalLength;
  const holes = Array.from({ length: BELT_SPECS.holeCount }, (_, i) => {
    const inchesFromTip = BELT_SPECS.firstHoleFromTip + i * BELT_SPECS.holeSpacing;
    return beltX + inchesFromTip * holeScale;
  });

  // Buckle area
  const buckleAreaStart = beltX + beltW - BELT_SPECS.buckleAllowance * holeScale;
  const buckleAreaW = BELT_SPECS.buckleAllowance * holeScale;

  // Measurement marks
  const markInterval = 5;
  const marks: { x: number; label: string }[] = [];
  for (let inch = 0; inch <= totalLength; inch += markInterval) {
    marks.push({ x: beltX + inch * holeScale, label: `${inch}"` });
  }

  // Buckle drawing
  const buckleEndX = beltX + beltW;
  const buckleW = 24;
  const buckleH_draw = beltH + 16;
  const buckleY_draw = beltY - 8;

  // Pattern ID for leather texture (unique per color to avoid collisions)
  const patternId = `leather-${color.id}`;

  return (
    <div className={s.wrapper}>
      <div className={s.previewCard}>
        <div className={s.title}>Live Preview</div>

        <div className={s.svgContainer}>
          <svg viewBox={`0 0 ${viewW} ${viewH}`} xmlns="http://www.w3.org/2000/svg">
            <defs>
              {/* Leather texture pattern using actual image */}
              {color.image && (
                <pattern id={patternId} patternUnits="userSpaceOnUse" x={beltX} y={beltY} width={beltW} height={beltH}>
                  <image
                    href={color.image}
                    x="0"
                    y="0"
                    width={beltW}
                    height={beltH}
                    preserveAspectRatio="xMidYMid slice"
                  />
                </pattern>
              )}
              {/* Fallback gradient */}
              <linearGradient id="beltGradFallback" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color.hex} />
                <stop offset="100%" stopColor={color.darkHex} />
              </linearGradient>
              <filter id="beltShadow">
                <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.12" />
              </filter>
              {/* Clip path for the end shape */}
              <clipPath id="beltClip">
                {/* End shape area */}
                <g transform={`translate(${beltX}, ${beltY}) scale(${tipW / 105}, ${beltH / 78})`}>
                  <path d={END_SHAPE_PATHS[design.endShape]} />
                </g>
                {/* Body rectangle extending from end shape to belt end */}
                <rect x={beltX + tipW - 5} y={beltY} width={beltW - tipW + 5} height={beltH} />
              </clipPath>
            </defs>

            {/* Belt body with leather texture, clipped to unified shape */}
            <g filter="url(#beltShadow)">
              <g clipPath="url(#beltClip)">
                <rect
                  x={beltX}
                  y={beltY}
                  width={beltW}
                  height={beltH}
                  fill={color.image ? `url(#${patternId})` : 'url(#beltGradFallback)'}
                />
              </g>
            </g>

            {/* Outline: tip contour (no right edge) flowing into body edges */}
            <g transform={`translate(${beltX}, ${beltY}) scale(${tipW / 105}, ${beltH / 78})`}>
              <path
                d={END_SHAPE_OUTLINE_PATHS[design.endShape]}
                fill="none"
                stroke="rgba(0,0,0,0.2)"
                strokeWidth="1.5"
              />
            </g>
            {/* Top and bottom edges of belt body */}
            <line x1={beltX + tipW} y1={beltY} x2={beltX + beltW} y2={beltY} stroke="rgba(0,0,0,0.2)" strokeWidth="1" />
            <line x1={beltX + tipW} y1={beltY + beltH} x2={beltX + beltW} y2={beltY + beltH} stroke="rgba(0,0,0,0.2)" strokeWidth="1" />

            {/* Stitching lines */}
            <line
              x1={beltX + tipW}
              y1={beltY + 4}
              x2={beltX + beltW}
              y2={beltY + 4}
              stroke="rgba(0,0,0,0.15)"
              strokeWidth="0.5"
              strokeDasharray="3,2"
            />
            <line
              x1={beltX + tipW}
              y1={beltY + beltH - 4}
              x2={beltX + beltW}
              y2={beltY + beltH - 4}
              stroke="rgba(0,0,0,0.15)"
              strokeWidth="0.5"
              strokeDasharray="3,2"
            />

            {/* Holes */}
            {holes.map((hx, i) => (
              <circle key={i} cx={hx} cy={beltY + beltH / 2} r={3} fill="#ffffff" stroke="rgba(0,0,0,0.25)" strokeWidth="0.7" />
            ))}

            {/* Buckle area indicator */}
            <rect
              x={buckleAreaStart}
              y={beltY - 2}
              width={buckleAreaW}
              height={beltH + 4}
              fill="none"
              stroke="rgba(0,0,0,0.1)"
              strokeWidth="1"
              strokeDasharray="4,3"
              rx="3"
            />

            {/* Buckle shape */}
            {buckle.shape === 'square' ? (
              <g>
                <rect
                  x={buckleEndX - 2}
                  y={buckleY_draw}
                  width={buckleW}
                  height={buckleH_draw}
                  fill="none"
                  stroke="#b8953a"
                  strokeWidth="2"
                  rx="2"
                />
                <line
                  x1={buckleEndX + buckleW / 2 - 1}
                  y1={buckleY_draw + 2}
                  x2={buckleEndX + buckleW / 2 - 1}
                  y2={buckleY_draw + buckleH_draw - 2}
                  stroke="#b8953a"
                  strokeWidth="1.5"
                />
              </g>
            ) : (
              <g>
                <path
                  d={`M${buckleEndX - 2},${buckleY_draw} L${buckleEndX + buckleW - 8},${buckleY_draw} Q${buckleEndX + buckleW},${buckleY_draw} ${buckleEndX + buckleW},${buckleY_draw + buckleH_draw / 2} Q${buckleEndX + buckleW},${buckleY_draw + buckleH_draw} ${buckleEndX + buckleW - 8},${buckleY_draw + buckleH_draw} L${buckleEndX - 2},${buckleY_draw + buckleH_draw}`}
                  fill="none"
                  stroke="#888"
                  strokeWidth="2"
                />
                <line
                  x1={buckleEndX + buckleW / 2 - 3}
                  y1={buckleY_draw + 2}
                  x2={buckleEndX + buckleW / 2 - 3}
                  y2={buckleY_draw + buckleH_draw - 2}
                  stroke="#888"
                  strokeWidth="1.5"
                />
              </g>
            )}

            {/* Measurement marks */}
            {marks.map((m, i) => (
              <g key={i}>
                <line
                  x1={m.x}
                  y1={beltY + beltH + 6}
                  x2={m.x}
                  y2={beltY + beltH + 12}
                  stroke="rgba(0,0,0,0.2)"
                  strokeWidth="0.5"
                />
                <text
                  x={m.x}
                  y={beltY + beltH + 20}
                  textAnchor="middle"
                  fontSize="6"
                  fill="#999"
                >
                  {m.label}
                </text>
              </g>
            ))}
          </svg>
        </div>

        {/* Spec summary */}
        <div className={s.specs}>
          <div className={s.specItem}>
            <span className={s.specLabel}>Total Length</span>
            <span className={`${s.specValue} ${s.specHighlight}`}>{totalLength}&Prime;</span>
          </div>
          <div className={s.specItem}>
            <span className={s.specLabel}>Width</span>
            <span className={s.specValue}>{design.width}&Prime;</span>
          </div>
          <div className={s.specItem}>
            <span className={s.specLabel}>Color &amp; Finish</span>
            <span className={s.specValue}>{color.name} / {FINISH_LABELS[design.finish]}</span>
          </div>
          <div className={s.specItem}>
            <span className={s.specLabel}>Style</span>
            <span className={s.specValue}>{STYLE_LABELS[design.style]}</span>
          </div>
          <div className={s.specItem}>
            <span className={s.specLabel}>End Shape</span>
            <span className={s.specValue}>{END_SHAPE_LABELS[design.endShape]}</span>
          </div>
          <div className={s.specItem}>
            <span className={s.specLabel}>Buckle</span>
            <span className={s.specValue}>{buckle.name}</span>
          </div>
          <div className={s.specItem}>
            <span className={s.specLabel}>Attachment</span>
            <span className={s.specValue}>{BUCKLE_ATTACHMENT_LABELS[design.buckleAttachment]}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
