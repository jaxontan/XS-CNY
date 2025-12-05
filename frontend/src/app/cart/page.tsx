'use client';

import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import styles from './page.module.css';

export default function CartPage() {
    const { items, updateQuantity, removeItem, total, clearCart } = useCart();

    if (items.length === 0) {
        return (
            <div className={styles.empty}>
                <span className={styles.emptyIcon}>🛒</span>
                <h1>Your Cart is Empty</h1>
                <p>Discover our delicious CNY treats!</p>
                <Link href="/shop" className={styles.shopBtn}>
                    Start Shopping 🧧
                </Link>
            </div>
        );
    }

    const deliveryFree = total >= 100;
    const deliveryFee = deliveryFree ? 0 : 8;
    const finalTotal = total + deliveryFee;

    return (
        <div className={styles.page}>
            <div className={styles.container}>
                <h1 className={styles.title}>
                    <span>🛒</span> Your Cart
                </h1>

                <div className={styles.layout}>
                    {/* Cart Items */}
                    <div className={styles.items}>
                        {items.map(({ product, quantity }) => (
                            <div key={product.$id} className={styles.item}>
                                <div className={styles.itemImage}>
                                    {product.category === 'gift' ? '🎁' : '🥩'}
                                </div>
                                <div className={styles.itemInfo}>
                                    <Link href={`/product/${product.$id}`} className={styles.itemName}>
                                        {product.name}
                                    </Link>
                                    <span className={styles.itemCategory}>{product.category}</span>
                                </div>
                                <div className={styles.itemQuantity}>
                                    <button
                                        onClick={() => updateQuantity(product.$id, quantity - 1)}
                                        disabled={quantity <= 1}
                                    >−</button>
                                    <span>{quantity}</span>
                                    <button
                                        onClick={() => updateQuantity(product.$id, quantity + 1)}
                                        disabled={quantity >= product.stock}
                                        title={quantity >= product.stock ? 'Max stock reached' : ''}
                                    >+</button>
                                </div>
                                <div className={styles.itemPrice}>
                                    ${(product.price * quantity).toFixed(2)}
                                </div>
                                <button
                                    className={styles.removeBtn}
                                    onClick={() => removeItem(product.$id)}
                                >
                                    ✕
                                </button>
                            </div>
                        ))}

                        <button className={styles.clearBtn} onClick={clearCart}>
                            Clear Cart
                        </button>
                    </div>

                    {/* Order Summary */}
                    <div className={styles.summary}>
                        <h2>Order Summary</h2>

                        <div className={styles.summaryRow}>
                            <span>Subtotal</span>
                            <span>${total.toFixed(2)}</span>
                        </div>

                        <div className={styles.summaryRow}>
                            <span>Delivery</span>
                            <span className={deliveryFree ? styles.free : ''}>
                                {deliveryFree ? 'FREE' : `$${deliveryFee.toFixed(2)}`}
                            </span>
                        </div>

                        {!deliveryFree && (
                            <div className={styles.freeDeliveryHint}>
                                🚚 Add ${(100 - total).toFixed(2)} more for free delivery in Singapore!
                            </div>
                        )}

                        <div className={styles.divider}></div>

                        <div className={`${styles.summaryRow} ${styles.total}`}>
                            <span>Total</span>
                            <span>${finalTotal.toFixed(2)}</span>
                        </div>

                        <Link href="/checkout" className={styles.checkoutBtn}>
                            Proceed to Checkout 🧧
                        </Link>

                        <div className={styles.paymentMethods}>
                            <span>We accept:</span>
                            <div className={styles.methods}>
                                <span>💳</span>
                                <span>🏦</span>
                                <span>📱</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
