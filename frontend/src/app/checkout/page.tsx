'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { orderApi, ShippingAddress } from '@/lib/api';
import styles from './page.module.css';

export default function CheckoutPage() {
    const router = useRouter();
    const { items, total, clearCart } = useCart();
    const { user } = useAuth();

    const [address, setAddress] = useState<ShippingAddress>({
        street: '',
        city: '',
        postal_code: '',
        country: 'Singapore'
    });
    const [deliveryMethod, setDeliveryMethod] = useState<'delivery' | 'pickup'>('delivery');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Guest checkout fields
    const [guestEmail, setGuestEmail] = useState('');
    const [guestName, setGuestName] = useState('');

    // SG delivery rule: orders under $100 must be pickup
    const mustPickup = address.country === 'Singapore' && total < 100;
    const deliveryFee = deliveryMethod === 'delivery' && total < 100 ? 8 : 0;
    const finalTotal = total + deliveryFee;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validate guest info if not logged in
        if (!user) {
            if (!guestEmail || !guestName) {
                setError('Please enter your name and email to continue.');
                return;
            }
        }

        if (mustPickup && deliveryMethod === 'delivery') {
            setError('Singapore orders under $100 must be pickup only.');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const order = await orderApi.create({
                items: items.map(({ product, quantity }) => ({
                    product_id: product.$id,
                    quantity
                })),
                shipping_address: address,
                delivery_method: deliveryMethod,
                // Include guest info for guest checkout
                ...((!user) && { guest_email: guestEmail, guest_name: guestName })
            });

            clearCart();
            // Securely pass guest token if present
            const tokenQuery = order.guest_token ? `&token=${order.guest_token}` : '';
            router.push(`/order-success?orderId=${order.$id}${tokenQuery}`);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Order failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (items.length === 0) {
        return (
            <div className={styles.empty}>
                <span>🛒</span>
                <h1>Your cart is empty</h1>
                <Link href="/shop" className={styles.shopBtn}>Continue Shopping</Link>
            </div>
        );
    }

    return (
        <div className={styles.page}>
            <div className={styles.container}>
                <h1 className={styles.title}>🧧 Checkout</h1>

                <div className={styles.layout}>
                    {/* Checkout Form */}
                    <form onSubmit={handleSubmit} className={styles.form}>
                        {error && <div className={styles.error}>{error}</div>}

                        {/* Guest Checkout Section - only show if not logged in */}
                        {!user && (
                            <section className={styles.section}>
                                <h2>👤 Your Details</h2>
                                <p className={styles.guestNote}>Checkout as guest - no account needed!</p>
                                <div className={styles.fields}>
                                    <div className={styles.field}>
                                        <label>Full Name *</label>
                                        <input
                                            type="text"
                                            value={guestName}
                                            onChange={(e) => setGuestName(e.target.value)}
                                            placeholder="Your full name"
                                            required
                                        />
                                    </div>
                                    <div className={styles.field}>
                                        <label>Email Address *</label>
                                        <input
                                            type="email"
                                            value={guestEmail}
                                            onChange={(e) => setGuestEmail(e.target.value)}
                                            placeholder="your@email.com"
                                            required
                                        />
                                    </div>
                                </div>
                            </section>
                        )}

                        {/* Country Selection */}
                        <section className={styles.section}>
                            <h2>📍 Delivery Country</h2>
                            <div className={styles.countryBtns}>
                                <button
                                    type="button"
                                    className={`${styles.countryBtn} ${address.country === 'Singapore' ? styles.active : ''}`}
                                    onClick={() => setAddress(a => ({ ...a, country: 'Singapore' }))}
                                >
                                    🇸🇬 Singapore
                                </button>
                                <button
                                    type="button"
                                    className={`${styles.countryBtn} ${address.country === 'Malaysia' ? styles.active : ''}`}
                                    onClick={() => setAddress(a => ({ ...a, country: 'Malaysia' }))}
                                >
                                    🇲🇾 Malaysia
                                </button>
                            </div>
                        </section>

                        {/* Delivery Method */}
                        <section className={styles.section}>
                            <h2>🚚 Delivery Method</h2>
                            {mustPickup && (
                                <div className={styles.notice}>
                                    ⚠️ Singapore orders under $100 are pickup only
                                </div>
                            )}
                            <div className={styles.deliveryBtns}>
                                <button
                                    type="button"
                                    className={`${styles.deliveryBtn} ${deliveryMethod === 'delivery' ? styles.active : ''}`}
                                    onClick={() => setDeliveryMethod('delivery')}
                                    disabled={mustPickup}
                                >
                                    <span>🚚</span>
                                    <span>Delivery</span>
                                    <span className={styles.fee}>
                                        {total >= 100 ? 'FREE' : '$8.00'}
                                    </span>
                                </button>
                                <button
                                    type="button"
                                    className={`${styles.deliveryBtn} ${deliveryMethod === 'pickup' ? styles.active : ''}`}
                                    onClick={() => setDeliveryMethod('pickup')}
                                >
                                    <span>🏪</span>
                                    <span>Self Pickup</span>
                                    <span className={styles.fee}>FREE</span>
                                </button>
                            </div>
                        </section>

                        {/* Address */}
                        <section className={styles.section}>
                            <h2>📦 {deliveryMethod === 'pickup' ? 'Contact Details' : 'Shipping Address'}</h2>
                            <div className={styles.fields}>
                                <div className={styles.field}>
                                    <label>Street Address</label>
                                    <input
                                        type="text"
                                        value={address.street}
                                        onChange={(e) => setAddress(a => ({ ...a, street: e.target.value }))}
                                        placeholder="123 CNY Street"
                                        required
                                    />
                                </div>
                                <div className={styles.fieldRow}>
                                    <div className={styles.field}>
                                        <label>City</label>
                                        <input
                                            type="text"
                                            value={address.city}
                                            onChange={(e) => setAddress(a => ({ ...a, city: e.target.value }))}
                                            placeholder="City"
                                            required
                                        />
                                    </div>
                                    <div className={styles.field}>
                                        <label>Postal Code</label>
                                        <input
                                            type="text"
                                            value={address.postal_code}
                                            onChange={(e) => setAddress(a => ({ ...a, postal_code: e.target.value }))}
                                            placeholder="123456"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>
                        </section>

                        <button type="submit" className={styles.submitBtn} disabled={loading}>
                            {loading ? 'Processing...' : `Place Order - $${finalTotal.toFixed(2)} 🎊`}
                        </button>
                    </form>

                    {/* Order Summary */}
                    <div className={styles.summary}>
                        <h2>Order Summary</h2>
                        <div className={styles.items}>
                            {items.map(({ product, quantity }) => (
                                <div key={product.$id} className={styles.item}>
                                    <span className={styles.itemQty}>{quantity}x</span>
                                    <span className={styles.itemName}>{product.name}</span>
                                    <span className={styles.itemPrice}>${(product.price * quantity).toFixed(2)}</span>
                                </div>
                            ))}
                        </div>
                        <div className={styles.totals}>
                            <div className={styles.row}>
                                <span>Subtotal</span>
                                <span>${total.toFixed(2)}</span>
                            </div>
                            <div className={styles.row}>
                                <span>Delivery</span>
                                <span className={deliveryFee === 0 ? styles.free : ''}>
                                    {deliveryFee === 0 ? 'FREE' : `$${deliveryFee.toFixed(2)}`}
                                </span>
                            </div>
                            <div className={`${styles.row} ${styles.totalRow}`}>
                                <span>Total</span>
                                <span>${finalTotal.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
