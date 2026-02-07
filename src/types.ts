export type BeltWidth = 1 | 1.25 | 1.5 | 1.75;
export type BeltEndShape = 'round' | 'square' | 'square-taper' | 'spear';
export type BuckleAttachment = 'additional' | 'integrated';
export type BuckleShape = 'square' | 'round';
export type BuckleMaterial = 'antique-brass' | 'gold-brass' | 'silver' | 'black';

export interface LeatherColor {
  id: string;
  name: string;
  hex: string;
  darkHex: string;
  image?: string; // path to leather texture image in /public/leather/
}

export interface BuckleShapeOption {
  id: BuckleShape;
  name: string;
  image?: string;
}

export interface BuckleMaterialOption {
  id: BuckleMaterial;
  name: string;
  image?: string;
}

export interface BeltDesign {
  waistSize: number;
  actualWaistSize?: number;
  width: BeltWidth;
  colorId: string;
  endShape: BeltEndShape;
  buckleShape: BuckleShape;
  buckleMaterial: BuckleMaterial;
  buckleAttachment: BuckleAttachment;
}

export interface CustomerDetails {
  name: string;
  phone: string;
  email: string;
  notes: string;
}

export interface BeltOrder {
  id: string;
  orderNumber: string;
  date: string;
  design: BeltDesign;
  customer: CustomerDetails;
  totalLength: number;
}
