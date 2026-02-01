import type { BeltOrder } from '../types';

const STORAGE_KEY = 'belt-tool-orders';

export function generateOrderNumber(): string {
  const now = new Date();
  const y = now.getFullYear().toString().slice(-2);
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  const seq = String(Math.floor(Math.random() * 9000) + 1000);
  return `BLT-${y}${m}${d}-${seq}`;
}

export function generateOrderId(): string {
  return crypto.randomUUID();
}

export function formatDate(date?: Date): string {
  const d = date ?? new Date();
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function saveOrder(order: BeltOrder): void {
  const orders = loadOrders();
  orders.unshift(order);
  // Keep last 100 orders
  if (orders.length > 100) orders.length = 100;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
}

export function loadOrders(): BeltOrder[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function deleteOrder(id: string): void {
  const orders = loadOrders().filter(o => o.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
}
