import jsPDF from 'jspdf';
import type { BeltOrder } from '../types';
import {
  LEATHER_COLORS,
  BUCKLE_SHAPES,
  BUCKLE_MATERIALS,
  BELT_SPECS,
  BUSINESS_INFO,
  END_SHAPE_LABELS,
  BUCKLE_ATTACHMENT_LABELS,
} from '../constants';

// ================================================================
// SVG PATH DATA (same as BeltPreview, ~105x78 viewBox)
// ================================================================
// Full closed paths (for fills and clip paths)
const END_SHAPE_PATHS: Record<string, string> = {
  round: 'M104.26,77.17l-73.96-1.28c-9.23-.16-17.3-7.14-22.49-14.38C-.94,49.29-1.08,33.37,6.38,20.45,13.32,8.43,26.22.96,41.34,1l62.92.17v76Z',
  square: 'M104.11,77l-91.5-.09c-6.14,0-10.67-4.95-10.93-10.93-.86-19.06-.88-37.76-.15-56.99.14-3.61,1.8-7.75,6.06-7.76l96.52-.24v76Z',
  'square-taper': 'M104,76.36c-11.68,1.54-24,1.02-36.18-1.68l-57.94-12.83c-5.3-1.17-8.24-5.32-8.43-10.44-.35-9.91-.66-18.88-.28-28.92.1-2.76,4.88-6.01,7.69-6.69C29.11,10.96,48.52,5.97,69.1,2.39c11.78-2.05,23.56-1.3,34.9-1.03v75Z',
  spear: 'M104.16,76.02h-33.6c-6.8,0-13.56-.95-20.09-2.83l-8.69-2.51C30.97,67.57,1.03,52.37,1,41.5c0-3,1.44-6.49,3.85-8.83C21.78,16.21,42.71,5.78,66.14,1.88l38.03-.86v75Z',
};

// Open paths (no closing right vertical edge) — for outline strokes only
const END_SHAPE_OUTLINE_PATHS: Record<string, string> = {
  round: 'M104.26,77.17l-73.96-1.28c-9.23-.16-17.3-7.14-22.49-14.38C-.94,49.29-1.08,33.37,6.38,20.45,13.32,8.43,26.22.96,41.34,1l62.92.17',
  square: 'M104.11,77l-91.5-.09c-6.14,0-10.67-4.95-10.93-10.93-.86-19.06-.88-37.76-.15-56.99.14-3.61,1.8-7.75,6.06-7.76l96.52-.24',
  'square-taper': 'M104,76.36c-11.68,1.54-24,1.02-36.18-1.68l-57.94-12.83c-5.3-1.17-8.24-5.32-8.43-10.44-.35-9.91-.66-18.88-.28-28.92.1-2.76,4.88-6.01,7.69-6.69C29.11,10.96,48.52,5.97,69.1,2.39c11.78-2.05,23.56-1.3,34.9-1.03',
  spear: 'M104.16,76.02h-33.6c-6.8,0-13.56-.95-20.09-2.83l-8.69-2.51C30.97,67.57,1.03,52.37,1,41.5c0-3,1.44-6.49,3.85-8.83C21.78,16.21,42.71,5.78,66.14,1.88l38.03-.86',
};

// The SVG paths span y≈1 to y≈77 within a 78-unit viewBox.
// Use the actual content height (76) for scaling so shapes fill the full belt width.
const SVG_CONTENT_H = 76;
// Y offset: paths start at y≈1, so shift up by 1 scaled unit
const SVG_Y_OFFSET = 1;

// ================================================================
// SVG PATH PARSER FOR jsPDF
// Parses SVG path data and outputs jsPDF-compatible line/bezier
// segments with coordinate transforms applied.
// ================================================================
type Seg = [number, number] | [number, number, number, number, number, number];

interface ParsedPath {
  startX: number;
  startY: number;
  segments: Seg[];
}

function parseSVGPathForPDF(
  d: string, scale: number, ox: number, oy: number,
): ParsedPath {
  const tokens = d.match(/[MmLlHhVvCcZz]|[-+]?[0-9]*\.?[0-9]+/g) || [];
  const segs: Seg[] = [];
  let cx = 0, cy = 0;
  let startX = 0, startY = 0;
  let i = 0;
  let started = false;

  function num(): number { return parseFloat(tokens[i++]); }
  function hasNums(): boolean {
    return i < tokens.length && /^[-+.\d]/.test(tokens[i]);
  }

  while (i < tokens.length) {
    const cmd = tokens[i++];
    switch (cmd) {
      case 'M': {
        cx = num(); cy = num();
        if (!started) {
          startX = cx * scale + ox;
          startY = cy * scale + oy;
          started = true;
        }
        while (hasNums()) {
          const nx = num(), ny = num();
          segs.push([(nx - cx) * scale, (ny - cy) * scale]);
          cx = nx; cy = ny;
        }
        break;
      }
      case 'l': {
        while (hasNums()) {
          const dx = num(), dy = num();
          segs.push([dx * scale, dy * scale]);
          cx += dx; cy += dy;
        }
        break;
      }
      case 'L': {
        while (hasNums()) {
          const nx = num(), ny = num();
          segs.push([(nx - cx) * scale, (ny - cy) * scale]);
          cx = nx; cy = ny;
        }
        break;
      }
      case 'h': {
        const dx = num();
        segs.push([dx * scale, 0]);
        cx += dx;
        break;
      }
      case 'H': {
        const nx = num();
        segs.push([(nx - cx) * scale, 0]);
        cx = nx;
        break;
      }
      case 'v': {
        const dy = num();
        segs.push([0, dy * scale]);
        cy += dy;
        break;
      }
      case 'V': {
        const ny = num();
        segs.push([0, (ny - cy) * scale]);
        cy = ny;
        break;
      }
      case 'c': {
        while (hasNums()) {
          const dx1 = num(), dy1 = num();
          const dx2 = num(), dy2 = num();
          const dx3 = num(), dy3 = num();
          segs.push([
            dx1 * scale, dy1 * scale,
            dx2 * scale, dy2 * scale,
            dx3 * scale, dy3 * scale,
          ]);
          cx += dx3; cy += dy3;
        }
        break;
      }
      case 'C': {
        while (hasNums()) {
          const x1 = num(), y1 = num();
          const x2 = num(), y2 = num();
          const x3 = num(), y3 = num();
          segs.push([
            (x1 - cx) * scale, (y1 - cy) * scale,
            (x2 - cx) * scale, (y2 - cy) * scale,
            (x3 - cx) * scale, (y3 - cy) * scale,
          ]);
          cx = x3; cy = y3;
        }
        break;
      }
      case 'Z': case 'z': break;
    }
  }
  return { startX, startY, segments: segs };
}

/**
 * Draw an end shape on the PDF using the actual SVG path data.
 * Returns the rightmost x coordinate of the drawn shape.
 */
/**
 * Draw an end shape on the PDF.
 * outline=true uses the open path (no right vertical edge) for seamless strokes.
 */
function drawEndShapeOnPDF(
  doc: jsPDF, shape: string, x: number, y: number,
  beltWidth: number, style: string = 'FD', outline: boolean = false,
): number {
  const pathData = outline ? END_SHAPE_OUTLINE_PATHS[shape] : END_SHAPE_PATHS[shape];
  if (!pathData) return x;

  const scale = beltWidth / SVG_CONTENT_H;
  const yOffset = y - SVG_Y_OFFSET * scale;
  const path = parseSVGPathForPDF(pathData, scale, x, yOffset);

  if (path.segments.length < 2) return x;

  doc.lines(path.segments, path.startX, path.startY, [1, 1], style, !outline);

  const shapeWidth = 105 * scale;
  return x + shapeWidth;
}

/**
 * Draw a MIRRORED end shape (tip pointing right).
 * outline=true uses the open path (no left vertical edge) for seamless strokes.
 */
function drawEndShapeMirroredOnPDF(
  doc: jsPDF, shape: string, rightEdgeX: number, y: number,
  beltWidth: number, style: string = 'FD', outline: boolean = false,
): number {
  const pathData = outline ? END_SHAPE_OUTLINE_PATHS[shape] : END_SHAPE_PATHS[shape];
  if (!pathData) return rightEdgeX;

  const scale = beltWidth / SVG_CONTENT_H;
  const shapeWidth = 105 * scale;
  const yOffset = y - SVG_Y_OFFSET * scale;

  const path = parseSVGPathForPDF(pathData, scale, 0, yOffset);
  if (path.segments.length < 2) return rightEdgeX;

  const mirroredStartX = rightEdgeX - path.startX;

  const mirroredSegs: Seg[] = path.segments.map(seg => {
    if (seg.length === 2) return [-seg[0], seg[1]] as Seg;
    return [-seg[0], seg[1], -seg[2], seg[3], -seg[4], seg[5]] as Seg;
  });

  doc.lines(mirroredSegs, mirroredStartX, path.startY, [1, 1], style, !outline);

  return rightEdgeX - shapeWidth;
}

// Aspect ratios from buckle template reference SVGs (width / height)
const BUCKLE_TEMPLATE_RATIOS: Record<string, number> = {
  round: 293 / 99,
  square: 293 / 98.5,
  'square-taper': 313 / 98.4,
  spear: 332 / 99,
};

// All measurements in inches. Paper: 11x17 (tabloid)

export function generateOrderPDF(order: BeltOrder): void {
  const doc = new jsPDF({ unit: 'in', format: [11, 17] });

  const color = LEATHER_COLORS.find(c => c.id === order.design.colorId)!;
  const buckleShape = BUCKLE_SHAPES.find(s => s.id === order.design.buckleShape)!;
  const buckleMaterial = BUCKLE_MATERIALS.find(m => m.id === order.design.buckleMaterial)!;

  drawPage1(doc, order, color, buckleShape.id, buckleMaterial.name);

  doc.addPage([17, 11], 'landscape');
  drawPage2(doc, order, color, buckleShape.id, buckleMaterial.name);

  const safeName = order.customer.name.replace(/[^a-zA-Z0-9]/g, '') || 'Customer';
  const dateStr = new Date().toISOString().split('T')[0];
  doc.save(`BeltOrder_${safeName}_${dateStr}.pdf`);
}

// ================================================================
// PAGE 1 - ORDER SUMMARY (not to scale)
// ================================================================
function drawPage1(
  doc: jsPDF,
  order: BeltOrder,
  color: { name: string; hex: string; darkHex: string },
  buckleShape: string,
  buckleMaterial: string,
): void {
  const pageW = 11;
  const margin = 1;
  const contentW = pageW - margin * 2;
  let y = margin;

  // Header
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text(BUSINESS_INFO.name, margin, y + 0.25);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(120);
  doc.text(BUSINESS_INFO.tagline, margin, y + 0.55);

  doc.setFontSize(9);
  const rightX = pageW - margin;
  doc.text(BUSINESS_INFO.phone, rightX, y + 0.1, { align: 'right' });
  doc.text(BUSINESS_INFO.email, rightX, y + 0.28, { align: 'right' });
  doc.text(BUSINESS_INFO.website, rightX, y + 0.46, { align: 'right' });
  doc.text(BUSINESS_INFO.address, rightX, y + 0.64, { align: 'right' });

  y += 0.9;
  doc.setDrawColor(200);
  doc.line(margin, y, pageW - margin, y);
  y += 0.4;

  // Order Info
  doc.setTextColor(0);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Order Confirmation', margin, y);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text(`Order #: ${order.orderNumber}`, rightX, y, { align: 'right' });
  y += 0.25;
  doc.setFontSize(9);
  doc.setTextColor(100);
  doc.text(`Date: ${order.date}`, rightX, y, { align: 'right' });
  y += 0.5;

  // Customer Details
  doc.setTextColor(0);
  sectionHeader(doc, 'Customer Details', margin, y);
  y += 0.4;
  y = drawTable(doc, [
    ['Name', order.customer.name || '—'],
    ['Phone', order.customer.phone || '—'],
    ['Email', order.customer.email || '—'],
  ], margin, y, contentW);
  y += 0.4;

  // Belt Specifications (including actual waist size)
  sectionHeader(doc, 'Belt Specifications', margin, y);
  y += 0.4;
  const isIntegrated = order.design.buckleAttachment === 'integrated';
  const lengthBreakdown = isIntegrated
    ? `${order.totalLength}" (waist ${order.design.waistSize}" + ${BELT_SPECS.buckleAllowance}" buckle + ${BELT_SPECS.holeAllowance}" holes + ${BELT_SPECS.integratedFoldBack}" fold-back)`
    : `${order.totalLength}" (waist ${order.design.waistSize}" + ${BELT_SPECS.buckleAllowance}" buckle + ${BELT_SPECS.holeAllowance}" holes)`;
  const specRows: [string, string][] = [
    ['Pant Waist Size', `${order.design.waistSize}"`],
    ['Actual Waist Size', order.design.actualWaistSize ? `${order.design.actualWaistSize}"` : 'Not provided'],
    ['Total Belt Length', lengthBreakdown],
    ['Belt Width', `${order.design.width}"`],
    ['Leather Color', color.name],
    ['End Shape', END_SHAPE_LABELS[order.design.endShape]],
    ['Buckle Shape', buckleShape.charAt(0).toUpperCase() + buckleShape.slice(1)],
    ['Buckle Material', buckleMaterial],
    ['Buckle Attachment', BUCKLE_ATTACHMENT_LABELS[order.design.buckleAttachment]],
    ['First Hole from Tip', `${BELT_SPECS.firstHoleFromTip}"`],
    ['Hole Spacing', `${BELT_SPECS.holeSpacing}" (${BELT_SPECS.holeCount} holes)`],
  ];
  y = drawTable(doc, specRows, margin, y, contentW);
  y += 0.4;

  // Belt Illustration (not to scale, using SVG paths)
  sectionHeader(doc, 'Belt Design (Not to Scale)', margin, y);
  y += 0.5;

  const illustW = contentW;
  const beltDrawY = y;
  const beltDrawH = 0.6;
  const beltDrawX = margin;

  // Draw the belt body as one seamless piece
  doc.setFillColor(
    parseInt(color.hex.slice(1, 3), 16),
    parseInt(color.hex.slice(3, 5), 16),
    parseInt(color.hex.slice(5, 7), 16),
  );
  doc.setDrawColor(0);
  doc.setLineWidth(0.01);

  const p1ShapeW = 105 * (beltDrawH / SVG_CONTENT_H);

  // Fill end shape + body rectangle (no strokes yet)
  drawEndShapeOnPDF(doc, order.design.endShape, beltDrawX, beltDrawY, beltDrawH, 'F');
  doc.rect(beltDrawX + p1ShapeW - 0.02, beltDrawY, beltDrawX + illustW - (beltDrawX + p1ShapeW) + 0.02, beltDrawH, 'F');

  // Stroke: tip contour (open) + body top/bottom edges
  drawEndShapeOnPDF(doc, order.design.endShape, beltDrawX, beltDrawY, beltDrawH, 'S', true);
  doc.line(beltDrawX + p1ShapeW, beltDrawY, beltDrawX + illustW, beltDrawY);
  doc.line(beltDrawX + p1ShapeW, beltDrawY + beltDrawH, beltDrawX + illustW, beltDrawY + beltDrawH);

  // Buckle at right end
  const buckleDrawX = beltDrawX + illustW;
  const buckleDrawW = 0.4;
  const buckleDrawH_val = beltDrawH + 0.2;
  const buckleDrawY_val = beltDrawY - 0.1;
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(80);
  doc.setLineWidth(0.015);
  if (buckleShape === 'square') {
    doc.rect(buckleDrawX, buckleDrawY_val, buckleDrawW, buckleDrawH_val, 'FD');
  } else {
    doc.roundedRect(buckleDrawX, buckleDrawY_val, buckleDrawW, buckleDrawH_val, 0.12, 0.12, 'FD');
  }
  doc.line(buckleDrawX + buckleDrawW / 2, buckleDrawY_val + 0.05, buckleDrawX + buckleDrawW / 2, buckleDrawY_val + buckleDrawH_val - 0.05);

  // Hole markers
  const holeRegionScale = illustW / order.totalLength;
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(255, 255, 255);
  for (let i = 0; i < BELT_SPECS.holeCount; i++) {
    const hx = beltDrawX + (BELT_SPECS.firstHoleFromTip + i * BELT_SPECS.holeSpacing) * holeRegionScale;
    doc.circle(hx, beltDrawY + beltDrawH / 2, 0.04, 'FD');
  }

  // Labels
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100);
  const labelY = beltDrawY + beltDrawH + 0.2;
  const firstHoleX = beltDrawX + BELT_SPECS.firstHoleFromTip * holeRegionScale;
  doc.text(`${BELT_SPECS.firstHoleFromTip}" to first hole`, firstHoleX, labelY, { align: 'center' });
  doc.text(`Total: ${order.totalLength}"`, beltDrawX + illustW / 2, labelY + 0.2, { align: 'center' });

  y += 1.4;

  // Special Notes
  if (order.customer.notes) {
    sectionHeader(doc, 'Special Notes', margin, y);
    y += 0.4;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0);
    const lines = doc.splitTextToSize(order.customer.notes, contentW - 0.2);
    doc.setFillColor(248, 248, 248);
    doc.roundedRect(margin, y - 0.1, contentW, lines.length * 0.2 + 0.3, 0.05, 0.05, 'F');
    doc.text(lines, margin + 0.15, y + 0.1);
    y += lines.length * 0.2 + 0.5;
  }

  // Lead Time
  doc.setTextColor(0);
  sectionHeader(doc, 'Estimated Completion', margin, y);
  y += 0.35;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(BUSINESS_INFO.leadTime, margin, y);

  // Footer
  const footerY = 16.3;
  doc.setDrawColor(200);
  doc.line(margin, footerY, pageW - margin, footerY);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(150);
  doc.text(`${BUSINESS_INFO.name} | ${BUSINESS_INFO.phone} | ${BUSINESS_INFO.email}`, pageW / 2, footerY + 0.25, { align: 'center' });
  doc.text('Thank you for your custom order!', pageW / 2, footerY + 0.45, { align: 'center' });
}

// ================================================================
// PAGE 2 - 1:1 CUTTING TEMPLATES
// ================================================================
function drawPage2(
  doc: jsPDF,
  order: BeltOrder,
  color: { name: string; hex: string },
  buckleShape: string,
  buckleMaterial: string,
): void {
  const pageW = 17;
  const pageH = 11;
  const margin = 0.75;
  const beltWidth = order.design.width;

  // Header
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0);
  doc.text('1:1 SCALE CUTTING TEMPLATES', margin, margin + 0.15);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`Order: ${order.orderNumber}  |  ${order.customer.name}  |  ${order.date}`, margin, margin + 0.45);
  doc.text(`${color.name} | ${order.design.width}" wide | ${buckleShape.charAt(0).toUpperCase() + buckleShape.slice(1)} ${buckleMaterial}`, margin, margin + 0.65);

  // Scale warning
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(200, 0, 0);
  doc.text('PRINT AT 100% SCALE — DO NOT SCALE TO FIT', pageW / 2, margin + 0.2, { align: 'center' });
  doc.setTextColor(0);

  // 1-inch verification ruler
  const vrX = pageW - margin - 2;
  const vrY = margin + 0.4;
  doc.setDrawColor(0);
  doc.setLineWidth(0.01);
  doc.rect(vrX, vrY, 1, 0.3);
  doc.line(vrX + 0.5, vrY, vrX + 0.5, vrY + 0.3);
  for (let i = 0; i <= 4; i++) doc.line(vrX + i * 0.25, vrY, vrX + i * 0.25, vrY + 0.12);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.text('0', vrX - 0.05, vrY + 0.2);
  doc.text('1"', vrX + 1.05, vrY + 0.2);
  doc.text('VERIFY SCALE', vrX + 0.5, vrY + 0.5, { align: 'center' });

  const isIntegrated = order.design.buckleAttachment === 'integrated';

  // ============================================================
  // TEMPLATE A — TIP END (1:1 scale, using SVG path shapes)
  // For integrated: also includes fold-back mark at the far end
  // ============================================================
  const tAY = 2;
  const tAX = margin + 1;

  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0);
  doc.text('TEMPLATE A — TIP END', margin, tAY - 0.3);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100);
  doc.text('Cut along outline. Mark hole positions.', margin, tAY - 0.1);
  doc.setTextColor(0);

  // Template length: from tip to last hole + 2" buffer
  // For integrated: extend to include fold-back area with slot mark
  const holeEndFromTip = BELT_SPECS.firstHoleFromTip + (BELT_SPECS.holeCount - 1) * BELT_SPECS.holeSpacing;
  const tipTemplateLen = holeEndFromTip + 2;

  // Draw unified belt shape: end shape + body as one piece
  doc.setFillColor(245, 242, 235);
  doc.setDrawColor(0);
  doc.setLineWidth(0.02);
  const shapeW = 105 * (beltWidth / SVG_CONTENT_H);
  const bodyEndX = tAX + tipTemplateLen;

  // Fill the entire area (shape + body) without internal edges
  drawEndShapeOnPDF(doc, order.design.endShape, tAX, tAY, beltWidth, 'F'); // fill only
  doc.rect(tAX + shapeW - 0.03, tAY, bodyEndX - (tAX + shapeW - 0.03), beltWidth, 'F'); // fill only

  // Stroke the outline: tip contour (outline=true — no closing right edge)
  drawEndShapeOnPDF(doc, order.design.endShape, tAX, tAY, beltWidth, 'S', true);
  // Top and bottom edges continuing seamlessly to the right end
  doc.line(tAX + shapeW, tAY, bodyEndX, tAY); // top
  doc.line(tAX + shapeW, tAY + beltWidth, bodyEndX, tAY + beltWidth); // bottom
  // Right end (dashed to indicate belt continues)
  doc.setLineDashPattern([0.1, 0.08], 0);
  doc.line(bodyEndX, tAY, bodyEndX, tAY + beltWidth);
  doc.setLineDashPattern([], 0);

  // Center line
  doc.setDrawColor(150, 150, 200);
  doc.setLineWidth(0.005);
  doc.setLineDashPattern([0.1, 0.05], 0);
  doc.line(tAX, tAY + beltWidth / 2, tAX + tipTemplateLen, tAY + beltWidth / 2);
  doc.setLineDashPattern([], 0);
  doc.setFontSize(5);
  doc.setTextColor(150, 150, 200);
  doc.text('CENTER', tAX + tipTemplateLen + 0.05, tAY + beltWidth / 2 + 0.02);
  doc.setTextColor(0);

  // Holes at 1:1
  doc.setDrawColor(0);
  doc.setLineWidth(0.01);
  for (let i = 0; i < BELT_SPECS.holeCount; i++) {
    const hx = tAX + BELT_SPECS.firstHoleFromTip + i * BELT_SPECS.holeSpacing;
    doc.circle(hx, tAY + beltWidth / 2, BELT_SPECS.holeDiameter / 2);
    doc.setFontSize(6);
    doc.text(`${BELT_SPECS.firstHoleFromTip + i * BELT_SPECS.holeSpacing}"`, hx, tAY + beltWidth + 0.3, { align: 'center' });
  }

  // Width dimension
  drawDimensionArrow(doc, tAX - 0.4, tAY, tAY + beltWidth, `${beltWidth}"`);

  // Ruler
  drawRuler(doc, tAX, tAY + beltWidth + 0.5, tipTemplateLen);

  // ============================================================
  // TEMPLATE B — BUCKLE END
  // Additional: symmetrical with end shape on both sides
  // Integrated: left side is dashed square (no cut), right side has end shape
  // ============================================================
  let notesY = tAY + beltWidth + 2;

  {
    const tBY = tAY + beltWidth + 2.5;
    const tBX = margin + 1;

    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0);
    doc.text(
      isIntegrated
        ? 'TEMPLATE B — BUCKLE END (Integrated)'
        : 'TEMPLATE B — BUCKLE END (Additional Piece)',
      margin, tBY - 0.3,
    );
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100);
    doc.text(
      isIntegrated
        ? 'Right side: cut along outline. Left dashed edge indicates belt body (do not cut). Punch slot. Fold at fold line.'
        : 'Cut along outline. Punch slot and holes. Fold at fold line.',
      margin, tBY - 0.1,
    );
    doc.setTextColor(0);

    // Template length from reference SVG proportions
    const templateRatio = BUCKLE_TEMPLATE_RATIOS[order.design.endShape] || 3;
    const buckleTemplateLen = templateRatio * beltWidth;
    const centerX = tBX + buckleTemplateLen / 2;

    // Draw unified belt piece — fill everything first, then stroke edges
    doc.setFillColor(245, 242, 235);
    doc.setDrawColor(0);
    doc.setLineWidth(0.02);
    const tBShapeW = 105 * (beltWidth / SVG_CONTENT_H);

    if (isIntegrated) {
      // Fill: full rectangle + right end shape
      doc.rect(tBX, tBY, buckleTemplateLen, beltWidth, 'F');
      drawEndShapeMirroredOnPDF(doc, order.design.endShape, tBX + buckleTemplateLen, tBY, beltWidth, 'F');

      // Stroke: dashed left edge (do not cut)
      doc.setDrawColor(120);
      doc.setLineDashPattern([0.1, 0.08], 0);
      doc.line(tBX, tBY, tBX, tBY + beltWidth);
      doc.setLineDashPattern([], 0);

      // Stroke: top and bottom edges
      doc.setDrawColor(0);
      doc.line(tBX, tBY, tBX + buckleTemplateLen - tBShapeW, tBY); // top
      doc.line(tBX, tBY + beltWidth, tBX + buckleTemplateLen - tBShapeW, tBY + beltWidth); // bottom

      // Stroke: right end shape contour (outline=true — no closing left edge)
      drawEndShapeMirroredOnPDF(doc, order.design.endShape, tBX + buckleTemplateLen, tBY, beltWidth, 'S', true);

      // Label the dashed left edge
      doc.setFontSize(5);
      doc.setTextColor(120);
      doc.text('BELT BODY', tBX - 0.05, tBY + beltWidth / 2, { align: 'right', angle: 90 });
      doc.text('(do not cut)', tBX - 0.18, tBY + beltWidth / 2, { align: 'right', angle: 90 });
      doc.setTextColor(0);
    } else {
      // Fill: both end shapes + body rectangle
      drawEndShapeOnPDF(doc, order.design.endShape, tBX, tBY, beltWidth, 'F');
      drawEndShapeMirroredOnPDF(doc, order.design.endShape, tBX + buckleTemplateLen, tBY, beltWidth, 'F');
      doc.rect(tBX + tBShapeW - 0.03, tBY, buckleTemplateLen - 2 * tBShapeW + 0.06, beltWidth, 'F');

      // Stroke: left shape contour (outline=true — no closing right edge)
      drawEndShapeOnPDF(doc, order.design.endShape, tBX, tBY, beltWidth, 'S', true);
      // Stroke: right shape contour (outline=true — no closing left edge)
      drawEndShapeMirroredOnPDF(doc, order.design.endShape, tBX + buckleTemplateLen, tBY, beltWidth, 'S', true);
      // Stroke: top and bottom edges connecting the two shapes
      doc.line(tBX + tBShapeW, tBY, tBX + buckleTemplateLen - tBShapeW, tBY); // top
      doc.line(tBX + tBShapeW, tBY + beltWidth, tBX + buckleTemplateLen - tBShapeW, tBY + beltWidth); // bottom
    }

    // Center line
    doc.setDrawColor(150, 150, 200);
    doc.setLineWidth(0.005);
    doc.setLineDashPattern([0.1, 0.05], 0);
    doc.line(tBX, tBY + beltWidth / 2, tBX + buckleTemplateLen, tBY + beltWidth / 2);
    doc.setLineDashPattern([], 0);

    // Fold line — dead center, right on top of buckle slot
    doc.setDrawColor(200, 80, 80);
    doc.setLineWidth(0.01);
    doc.setLineDashPattern([0.1, 0.05], 0);
    doc.line(centerX, tBY - 0.2, centerX, tBY + beltWidth + 0.2);
    doc.setLineDashPattern([], 0);
    doc.setFontSize(7);
    doc.setTextColor(200, 80, 80);
    doc.text('FOLD LINE', centerX, tBY - 0.3, { align: 'center' });
    doc.setTextColor(0);

    // Buckle prong slot (dead center)
    const slotW = BELT_SPECS.buckleSlotWidth;
    const slotH = BELT_SPECS.buckleSlotLength;
    doc.setDrawColor(0);
    doc.setLineWidth(0.015);
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(
      centerX - slotW / 2, tBY + beltWidth / 2 - slotH / 2,
      slotW, slotH, 0.02, 0.02, 'FD',
    );
    doc.setFontSize(6);
    doc.setTextColor(0);
    doc.text('BUCKLE SLOT', centerX, tBY + beltWidth / 2 - slotH / 2 - 0.15, { align: 'center' });
    doc.text(`${slotW}" x ${slotH}"`, centerX, tBY + beltWidth / 2 + slotH / 2 + 0.2, { align: 'center' });

    // Stitching guide dots — between rivets on both halves
    doc.setDrawColor(100);
    doc.setLineWidth(0.003);
    doc.setLineDashPattern([0.02, 0.06], 0);
    const stitchY1 = tBY + beltWidth * 0.15;
    const stitchY2 = tBY + beltWidth * 0.85;
    const stitchInnerL = tBX + buckleTemplateLen * 0.22;
    const stitchOuterL = centerX - 0.2;
    doc.line(stitchInnerL, stitchY1, stitchOuterL, stitchY1);
    doc.line(stitchInnerL, stitchY2, stitchOuterL, stitchY2);
    const stitchInnerR = tBX + buckleTemplateLen * 0.78;
    const stitchOuterR = centerX + 0.2;
    doc.line(stitchOuterR, stitchY1, stitchInnerR, stitchY1);
    doc.line(stitchOuterR, stitchY2, stitchInnerR, stitchY2);
    doc.setLineDashPattern([], 0);

    // Rivet holes — 4 total, placed symmetrically (~29% from each end)
    const rivetR = 0.05;
    const rivetLeftX = tBX + buckleTemplateLen * 0.29;
    const rivetRightX = tBX + buckleTemplateLen * 0.71;
    const rivetUpperY = tBY + beltWidth * 0.17;
    const rivetLowerY = tBY + beltWidth * 0.83;

    doc.setDrawColor(0);
    doc.setLineWidth(0.01);
    doc.circle(rivetLeftX, rivetUpperY, rivetR);
    doc.circle(rivetLeftX, rivetLowerY, rivetR);
    doc.circle(rivetRightX, rivetUpperY, rivetR);
    doc.circle(rivetRightX, rivetLowerY, rivetR);

    doc.setFontSize(4);
    doc.setTextColor(80);
    doc.text('RIVET', rivetLeftX, rivetUpperY - 0.1, { align: 'center' });
    doc.text('RIVET', rivetRightX, rivetUpperY - 0.1, { align: 'center' });

    // Alternative stitch line — dashed vertical from top rivet to bottom rivet
    doc.setDrawColor(100, 100, 200);
    doc.setLineWidth(0.008);
    doc.setLineDashPattern([0.06, 0.04], 0);
    doc.line(rivetLeftX, rivetUpperY, rivetLeftX, rivetLowerY);
    doc.line(rivetRightX, rivetUpperY, rivetRightX, rivetLowerY);
    doc.setLineDashPattern([], 0);
    doc.setFontSize(3.5);
    doc.setTextColor(100, 100, 200);
    doc.text('ALT STITCH', rivetLeftX, rivetLowerY + 0.15, { align: 'center' });
    doc.text('ALT STITCH', rivetRightX, rivetLowerY + 0.15, { align: 'center' });
    doc.setTextColor(0);

    // Snap holes — near each end (~13% from each end)
    const snapY = tBY + beltWidth / 2;
    const snapLeftX = tBX + buckleTemplateLen * 0.13;
    const snapRightX = tBX + buckleTemplateLen * 0.87;
    doc.setDrawColor(0);
    doc.setLineWidth(0.01);
    doc.circle(snapLeftX, snapY, 0.06);
    doc.circle(snapRightX, snapY, 0.06);
    doc.setFontSize(4);
    doc.setTextColor(80);
    doc.text('SNAP', snapLeftX, snapY - 0.12, { align: 'center' });
    doc.text('SNAP', snapRightX, snapY - 0.12, { align: 'center' });

    // Width dimension
    drawDimensionArrow(doc, tBX - 0.4, tBY, tBY + beltWidth, `${beltWidth}"`);

    // Ruler
    drawRuler(doc, tBX, tBY + beltWidth + 0.5, buckleTemplateLen);

    notesY = tBY + beltWidth + 1.5;
  }

  // Full belt length note
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(80);
  const lengthNote = isIntegrated
    ? `Full belt length: ${order.totalLength}" (pant waist ${order.design.waistSize}" + ${BELT_SPECS.buckleAllowance}" buckle + ${BELT_SPECS.holeAllowance}" holes + ${BELT_SPECS.integratedFoldBack}" fold-back)`
    : `Full belt length: ${order.totalLength}" (pant waist ${order.design.waistSize}" + ${BELT_SPECS.buckleAllowance}" buckle allowance + ${BELT_SPECS.holeAllowance}" hole allowance)`;
  doc.text(lengthNote, margin, notesY);
  let ny = notesY + 0.3;
  if (order.design.actualWaistSize) {
    doc.text(
      `Actual waist size: ${order.design.actualWaistSize}" (reference measurement)`,
      margin, ny,
    );
    ny += 0.3;
  }
  const instructions = isIntegrated
    ? 'Cut belt body to full length. Use Template A for tip shaping and hole marking. Use Template B for buckle fold-back reference.'
    : 'Cut belt body to full length. Use Template A for tip shaping and hole marking. Use Template B for buckle end piece.';
  doc.text(instructions, margin, ny);

  // Footer
  doc.setFontSize(7);
  doc.setTextColor(150);
  doc.text(`${BUSINESS_INFO.name} | ${order.orderNumber} | Generated ${order.date}`, pageW / 2, pageH - margin, { align: 'center' });
}

// ================================================================
// HELPERS
// ================================================================

function drawDimensionArrow(doc: jsPDF, x: number, yTop: number, yBot: number, label: string): void {
  const width = yBot - yTop;
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0);
  doc.text(label, x - 0.15, yTop + width / 2 + 0.03, { align: 'center', angle: 90 });
  doc.setDrawColor(0);
  doc.setLineWidth(0.005);
  doc.line(x, yTop, x, yBot);
  doc.line(x - 0.04, yTop + 0.06, x, yTop);
  doc.line(x + 0.04, yTop + 0.06, x, yTop);
  doc.line(x - 0.04, yBot - 0.06, x, yBot);
  doc.line(x + 0.04, yBot - 0.06, x, yBot);
}

function drawRuler(doc: jsPDF, x: number, y: number, length: number): void {
  doc.setDrawColor(0);
  doc.setLineWidth(0.005);
  doc.line(x, y, x + length, y);
  for (let inch = 0; inch <= length; inch++) {
    const tx = x + inch;
    const isMajor = inch % 5 === 0;
    doc.line(tx, y, tx, y + (isMajor ? 0.15 : 0.08));
    doc.setFontSize(isMajor ? 7 : 5);
    doc.setFont('helvetica', 'normal');
    doc.text(`${inch}`, tx, y + 0.25, { align: 'center' });
  }
}

function sectionHeader(doc: jsPDF, text: string, x: number, y: number): void {
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(60);
  doc.text(text, x, y);
  doc.setTextColor(0);
}

function drawTable(doc: jsPDF, rows: [string, string][], x: number, y: number, width: number): number {
  const rowH = 0.3;
  const labelW = 1.8;
  doc.setFontSize(9);

  rows.forEach((row, i) => {
    const rowY = y + i * rowH;
    if (i % 2 === 0) {
      doc.setFillColor(248, 248, 248);
      doc.rect(x, rowY - 0.08, width, rowH, 'F');
    }
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(80);
    doc.text(row[0], x + 0.15, rowY + 0.1);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0);
    const valueLines = doc.splitTextToSize(row[1], width - labelW - 0.3);
    doc.text(valueLines, x + labelW, rowY + 0.1);
  });

  return y + rows.length * rowH;
}
