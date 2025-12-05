'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { Product, productApi } from '@/lib/api';
import styles from './page.module.css';

// Sample product for demo
const getSampleProduct = (id: string): Product => ({
    $id: id,
    name: 'Signature Sliced Bakkwa',
    price: 38.00,
    category: 'classic',
    stock: 50,
    description: 'Our best-selling classic sliced bakkwa, handcrafted with premium pork and marinated in our secret family recipe. Each slice is carefully grilled over charcoal for that perfect smoky sweetness. Perfect for CNY gifting or treating yourself to traditional taste.',
    images: []
});

export default function ProductPage() {
    const params = useParams();
    const productId = params.id as string;
    const [product, setProduct] = useState<Product | null>(null);
    const [quantity, setQuantity] = useState(1);
    const [loading, setLoading] = useState(true);
    const [added, setAdded] = useState(false);
    const { addItem } = useCart();

    useEffect(() => {
        setLoading(true);
        productApi.getOne(productId)
            .then(setProduct)
            .catch(() => {
                // Use sample product on error
                setProduct(getSampleProduct(productId));
            })
            .finally(() => setLoading(false));
    }, [productId]);

    const handleAddToCart = () => {
        if (product) {
            addItem(product, quantity);
            setAdded(true);
            setTimeout(() => setAdded(false), 2000);
        }
    };

    if (loading) {
        return (
            <div className={styles.loading}>
                <span>🏮</span>
                <p>Loading...</p>
            </div>
        );
    }

    if (!product) {
        return (
            <div className={styles.notFound}>
                <span>😔</span>
                <h1>Product Not Found</h1>
                <Link href="/shop" className={styles.backBtn}>Back to Shop</Link>
            </div>
        );
    }

    return (
        <div className={styles.page}>
            <div className={styles.container}>
                <Link href="/shop" className={styles.breadcrumb}>
                    ← Back to Shop
                </Link>

                <div className={styles.product}>
                    {/* Product Image */}
                    <div className={styles.imageSection}>
                        <div className={styles.mainImage}>
                            <span className={styles.badge}>🧧 CNY Special</span>
                            <div className={styles.imagePlaceholder}>
                                {product.category === 'gift' ? '🎁' : '🥩'}
                            </div>
                        </div>
                        <div className={styles.thumbnails}>
                            {[1, 2, 3, 4].map(i => (
                                <div key={i} className={styles.thumbnail}>
                                    {product.category === 'gift' ? '🎁' : '🥩'}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Product Info */}
                    <div className={styles.infoSection}>
                        <span className={styles.category}>{product.category.toUpperCase()}</span>
                        <h1 className={styles.title}>{product.name}</h1>

                        <div className={styles.priceBlock}>
                            <span className={styles.price}>${product.price.toFixed(2)}</span>
                            <span className={styles.stock}>
                                {product.stock > 0 ? `✓ In Stock (${product.stock})` : '✗ Out of Stock'}
                            </span>
                        </div>

                        <p className={styles.description}>{product.description}</p>

                        <div className={styles.features}>
                            <div className={styles.feature}>
                                <span>🔥</span>
                                <span>Charcoal Grilled</span>
                            </div>
                            <div className={styles.feature}>
                                <span>✨</span>
                                <span>Premium Quality</span>
                            </div>
                            <div className={styles.feature}>
                                <span>🎁</span>
                                <span>Gift Ready</span>
                            </div>
                        </div>

                        {/* Quantity & Add to Cart */}
                        <div className={styles.actions}>
                            <div className={styles.quantity}>
                                <button
                                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                                    disabled={quantity <= 1}
                                >
                                    −
                                </button>
                                <span>{quantity}</span>
                                <button
                                    onClick={() => setQuantity(q => Math.min(product.stock, q + 1))}
                                    disabled={quantity >= product.stock}
                                >
                                    +
                                </button>
                            </div>
                            <button
                                className={`${styles.addBtn} ${added ? styles.added : ''}`}
                                onClick={handleAddToCart}
                                disabled={product.stock === 0}
                            >
                                {added ? '✓ Added!' : 'Add to Cart 🛒'}
                            </button>
                        </div>

                        {/* Delivery Info */}
                        <div className={styles.delivery}>
                            <h3>🚚 Delivery Information</h3>
                            <ul>
                                <li>Singapore: Free delivery for orders over $100</li>
                                <li>Malaysia: Delivery available nationwide</li>
                                <li>Orders under $100 (SG): Pickup only</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
