import type { BeltOrder } from '../../types';
import { LEATHER_COLORS, BUCKLE_SHAPES, BUCKLE_MATERIALS } from '../../constants';
import { loadOrders, deleteOrder } from '../../utils/orderUtils';
import { useEffect, useState } from 'react';
import s from './OrderHistory.module.css';

interface Props {
  open: boolean;
  onClose: () => void;
  onLoad: (order: BeltOrder) => void;
  onDuplicate: (order: BeltOrder) => void;
}

export default function OrderHistory({ open, onClose, onLoad, onDuplicate }: Props) {
  const [orders, setOrders] = useState<BeltOrder[]>([]);

  useEffect(() => {
    if (open) setOrders(loadOrders());
  }, [open]);

  if (!open) return null;

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    deleteOrder(id);
    setOrders(prev => prev.filter(o => o.id !== id));
  };

  const handleDuplicate = (e: React.MouseEvent, order: BeltOrder) => {
    e.stopPropagation();
    onDuplicate(order);
    onClose();
  };

  return (
    <div className={s.overlay} onClick={onClose}>
      <div className={s.panel} onClick={e => e.stopPropagation()}>
        <div className={s.header}>
          <span className={s.headerTitle}>Order History</span>
          <button className={s.closeBtn} onClick={onClose}>&times;</button>
        </div>
        <div className={s.list}>
          {orders.length === 0 ? (
            <div className={s.empty}>No orders yet. Complete your first order to see it here.</div>
          ) : (
            orders.map(order => {
              const color = LEATHER_COLORS.find(c => c.id === order.design.colorId);
              const buckleShape = BUCKLE_SHAPES.find(s => s.id === order.design.buckleShape);
              const buckleMaterial = BUCKLE_MATERIALS.find(m => m.id === order.design.buckleMaterial);
              return (
                <div
                  key={order.id}
                  className={s.orderCard}
                  onClick={() => { onLoad(order); onClose(); }}
                >
                  <div className={s.orderTop}>
                    <span className={s.orderNumber}>{order.orderNumber}</span>
                    <span className={s.orderDate}>{order.date}</span>
                  </div>
                  <div className={s.orderCustomer}>
                    {order.customer.name || 'No name'}
                  </div>
                  <div className={s.orderSpecs}>
                    {order.design.waistSize}&Prime; waist &middot; {order.design.width}&Prime; wide &middot;{' '}
                    {color?.name} &middot; {buckleShape?.name} {buckleMaterial?.name}
                  </div>
                  <div className={s.orderActions}>
                    <button
                      className={s.actionBtn}
                      onClick={e => handleDuplicate(e, order)}
                    >
                      Duplicate
                    </button>
                    <button
                      className={`${s.actionBtn} ${s.deleteBtn}`}
                      onClick={e => handleDelete(e, order.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
