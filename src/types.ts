export type LeatherFinish = 'smooth' | 'textured' | 'distressed' | 'oiled' | 'suede';
export type BeltStyle = 'casual' | 'dress' | 'work';
export type BeltWidth = 1 | 1.25 | 1.5 | 1.75;
export type BeltEndShape = 'round' | 'square' | 'square-taper' | 'spear';
export type BuckleAttachment = 'additional' | 'integrated';

export interface LeatherColor {
  id: string;
  name: string;
  hex: string;
  darkHex: string;
  image?: string; // path to leather texture image in /public/leather/
}

export interface BuckleOption {
  id: string;
  name: string;
  description: string;
  style: 'casual' | 'dress' | 'western' | 'work';
  priceModifier: number;
  image?: string; // path to image in /public/buckles/
  shape: 'square' | 'round';
}

export interface BeltDesign {
  waistSize: number;
  actualWaistSize?: number;
  width: BeltWidth;
  colorId: string;
  finish: LeatherFinish;
  style: BeltStyle;
  endShape: BeltEndShape;
  buckleId: string;
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
  price: number;
}
