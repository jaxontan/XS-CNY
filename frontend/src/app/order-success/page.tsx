'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { orderApi, Order } from '@/lib/api';
import styles from './page.module.css';

function OrderSuccessContent() {
    const searchParams = useSearchParams();
    const orderId = searchParams.get('orderId');
    const token = searchParams.get('token'); // Get guest token if available
    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (orderId) {
            // Pass token to API for secure guest access
            orderApi.getOne(orderId, token || undefined)
                .then(setOrder)
                .catch(() => setOrder(null))
                .finally(() => setLoading(false));
        } else {
            setLoading(false);
        }
    }, [orderId, token]);

    return (
        <div className={styles.page}>
            <div className={styles.card}>
                <span className={styles.icon}>🎊</span>
                <h1>Order Confirmed!</h1>
                <p>恭喜发财! Your CNY treats are on the way!</p>

                {loading ? (
                    <div className={styles.loading}>Loading order details...</div>
                ) : order ? (
                    <div className={styles.orderDetails}>
                        <div className={styles.orderId}>
                            <span>Order ID:</span>
                            <strong>{order.$id}</strong>
                        </div>

                        <div className={styles.items}>
                            <h3>Items Ordered</h3>
                            {order.items.map((item, i) => (
                                <div key={i} className={styles.item}>
                                    <span>{item.quantity}x {item.name}</span>
                                    <span>${(item.price * item.quantity).toFixed(2)}</span>
                                </div>
                            ))}
                        </div>

                        <div className={styles.summary}>
                            <div className={styles.row}>
                                <span>Delivery Method:</span>
                                <span>{order.delivery_method === 'delivery' ? '🚚 Delivery' : '🏪 Pickup'}</span>
                            </div>
                            <div className={styles.row}>
                                <span>Total:</span>
                                <strong>${order.total.toFixed(2)}</strong>
                            </div>
                        </div>

                        {order.delivery_method === 'pickup' && (
                            <div className={styles.pickupInfo}>
                                <h3>🏪 Pickup Location</h3>
                                <p><strong>Bakkwa CNY Store</strong></p>
                                <p>123 Chinatown Street, #01-01</p>
                                <p>Singapore 123456</p>
                                <p>Operating Hours: 9AM - 9PM Daily</p>
                                <p className={styles.note}>Please bring your Order ID for pickup.</p>
                            </div>
                        )}
                    </div>
                ) : null}

                <div className={styles.info}>
                    <p>📧 A confirmation email has been sent to your inbox.</p>
                    <p>📦 You can track your order in your account.</p>
                </div>

                <div className={styles.actions}>
                    <Link href="/orders" className={styles.btnSecondary}>
                        View My Orders
                    </Link>
                    <Link href="/shop" className={styles.btn}>
                        Continue Shopping 🧧
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default function OrderSuccessPage() {
    return (
        <Suspense fallback={
            <div className={styles.page}>
                <div className={styles.card}>
                    <span className={styles.icon}>🏮</span>
                    <div className={styles.loading}>Loading...</div>
                </div>
            </div>
        }>
            <OrderSuccessContent />
        </Suspense>
    );
}
