'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { orderApi, Order } from '@/lib/api';
import styles from './page.module.css';

export default function OrdersPage() {
    const { user, loading: authLoading } = useAuth();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!authLoading && user) {
            orderApi.getMyOrders()
                .then(setOrders)
                .catch(err => setError(err.message))
                .finally(() => setLoading(false));
        } else if (!authLoading && !user) {
            setLoading(false);
        }
    }, [user, authLoading]);

    if (authLoading || loading) {
        return (
            <div className={styles.loading}>
                <span>🏮</span>
                <p>Loading orders...</p>
            </div>
        );
    }

    if (!user) {
        return (
            <div className={styles.empty}>
                <span>🔒</span>
                <h1>Please Log In</h1>
                <p>You need to be logged in to view your orders.</p>
                <Link href="/login?returnUrl=/orders" className={styles.btn}>
                    Log In 🧧
                </Link>
            </div>
        );
    }

    if (error) {
        return (
            <div className={styles.empty}>
                <span>😔</span>
                <h1>Error Loading Orders</h1>
                <p>{error}</p>
                <Link href="/shop" className={styles.btn}>
                    Continue Shopping 🧧
                </Link>
            </div>
        );
    }

    if (orders.length === 0) {
        return (
            <div className={styles.empty}>
                <span>📦</span>
                <h1>No Orders Yet</h1>
                <p>You haven&apos;t placed any orders yet. Start shopping for CNY treats!</p>
                <Link href="/shop" className={styles.btn}>
                    Start Shopping 🧧
                </Link>
            </div>
        );
    }

    const getStatusEmoji = (status: string) => {
        switch (status) {
            case 'pending': return '⏳';
            case 'processing': return '🔄';
            case 'shipped': return '🚚';
            case 'delivered': return '✅';
            case 'cancelled': return '❌';
            default: return '📦';
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending': return '#f59e0b';
            case 'processing': return '#3b82f6';
            case 'shipped': return '#8b5cf6';
            case 'delivered': return '#22c55e';
            case 'cancelled': return '#ef4444';
            default: return '#666';
        }
    };

    return (
        <div className={styles.page}>
            <div className={styles.container}>
                <h1 className={styles.title}>
                    <span>📦</span> My Orders
                </h1>

                <div className={styles.orders}>
                    {orders.map(order => (
                        <div key={order.$id} className={styles.orderCard}>
                            <div className={styles.orderHeader}>
                                <div className={styles.orderId}>
                                    <span>Order ID:</span>
                                    <strong>{order.$id}</strong>
                                </div>
                                <div
                                    className={styles.status}
                                    style={{ backgroundColor: getStatusColor(order.status) }}
                                >
                                    {getStatusEmoji(order.status)} {order.status.toUpperCase()}
                                </div>
                            </div>

                            <div className={styles.orderItems}>
                                {order.items.slice(0, 3).map((item, i) => (
                                    <div key={i} className={styles.item}>
                                        <span>{item.quantity}x {item.name}</span>
                                        <span>${(item.price * item.quantity).toFixed(2)}</span>
                                    </div>
                                ))}
                                {order.items.length > 3 && (
                                    <div className={styles.moreItems}>
                                        +{order.items.length - 3} more items
                                    </div>
                                )}
                            </div>

                            <div className={styles.orderFooter}>
                                <div className={styles.delivery}>
                                    {order.delivery_method === 'delivery' ? '🚚 Delivery' : '🏪 Pickup'}
                                </div>
                                <div className={styles.total}>
                                    Total: <strong>${order.total.toFixed(2)}</strong>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
