'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { Product, productApi } from '@/lib/api';
import styles from './page.module.css';

// Sample products only used as last resort fallback
const sampleProducts: Product[] = [
    { $id: 'sample-1', name: 'Signature Sliced Bakkwa', price: 38.00, category: 'classic', stock: 50, description: 'Our best-selling classic sliced bakkwa, perfect for CNY gifting.', images: [] },
    { $id: 'sample-2', name: 'Minced Pork Bakkwa', price: 35.00, category: 'classic', stock: 40, description: 'Tender minced pork bakkwa with a sweet and savory glaze.', images: [] },
    { $id: 'sample-3', name: 'Spicy Bakkwa', price: 40.00, category: 'spicy', stock: 30, description: 'For those who like it hot! Infused with chili for an extra kick.', images: [] },
    { $id: 'sample-4', name: 'Chicken Bakkwa', price: 36.00, category: 'chicken', stock: 35, description: 'Leaner alternative made with premium chicken meat.', images: [] },
    { $id: 'sample-5', name: 'CNY Gift Box (500g)', price: 58.00, category: 'gift', stock: 20, description: 'Beautifully packaged gift set, perfect for visiting relatives.', images: [] },
    { $id: 'sample-6', name: 'Premium Gift Hamper', price: 128.00, category: 'gift', stock: 15, description: 'Luxurious hamper with assorted bakkwa and CNY treats.', images: [] },
    { $id: 'sample-7', name: 'Beef Bakkwa', price: 45.00, category: 'beef', stock: 25, description: 'Premium beef bakkwa with a rich, savory flavor.', images: [] },
    { $id: 'sample-8', name: 'Mini Bakkwa Rolls', price: 32.00, category: 'snacks', stock: 45, description: 'Bite-sized bakkwa rolls, perfect for snacking.', images: [] },
];

const categories = [
    { id: 'all', name: 'All Products', emoji: '🎁' },
    { id: 'classic', name: 'Classic', emoji: '🥩' },
    { id: 'spicy', name: 'Spicy', emoji: '🌶️' },
    { id: 'chicken', name: 'Chicken', emoji: '🐔' },
    { id: 'beef', name: 'Beef', emoji: '🐄' },
    { id: 'gift', name: 'Gift Sets', emoji: '🎊' },
    { id: 'snacks', name: 'Snacks', emoji: '🍡' },
];

export default function ShopPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [loading, setLoading] = useState(true);
    const { addItem } = useCart();

    useEffect(() => {
        // Fetch from API first, fallback to samples only on error
        setLoading(true);
        productApi.getAll()
            .then(data => {
                // Always use API data (even empty array means DB is connected)
                setProducts(data.length > 0 ? data : sampleProducts);
            })
            .catch(() => {
                // Only use sample products if API completely fails
                setProducts(sampleProducts);
            })
            .finally(() => setLoading(false));
    }, []);

    const filteredProducts = selectedCategory === 'all'
        ? products
        : products.filter(p => p.category === selectedCategory);

    const handleAddToCart = (product: Product) => {
        addItem(product);
    };

    return (
        <div className={styles.page}>
            {/* Hero Banner */}
            <section className={styles.hero}>
                <div className={styles.heroContent}>
                    <span className={styles.heroEmoji}>🏮</span>
                    <h1>Our Premium Bakkwa Collection</h1>
                    <p>Handcrafted with love for Chinese New Year celebrations</p>
                </div>
            </section>

            <div className={styles.container}>
                {/* Category Filters */}
                <aside className={styles.sidebar}>
                    <h2 className={styles.sidebarTitle}>Categories</h2>
                    <div className={styles.categories}>
                        {categories.map(cat => (
                            <button
                                key={cat.id}
                                className={`${styles.categoryBtn} ${selectedCategory === cat.id ? styles.active : ''}`}
                                onClick={() => setSelectedCategory(cat.id)}
                            >
                                <span>{cat.emoji}</span>
                                <span>{cat.name}</span>
                            </button>
                        ))}
                    </div>

                    <div className={styles.promo}>
                        <span className={styles.promoEmoji}>🧧</span>
                        <h3>CNY Special</h3>
                        <p>Free delivery for orders over $100!</p>
                    </div>
                </aside>

                {/* Products Grid */}
                <main className={styles.main}>
                    <div className={styles.gridHeader}>
                        <h2>{categories.find(c => c.id === selectedCategory)?.name || 'Products'}</h2>
                        <span className={styles.count}>{filteredProducts.length} products</span>
                    </div>

                    {loading ? (
                        <div className={styles.loading}>
                            <span>🏮</span>
                            <p>Loading delicious treats...</p>
                        </div>
                    ) : (
                        <div className={styles.grid}>
                            {filteredProducts.map(product => (
                                <div key={product.$id} className={styles.card}>
                                    <div className={styles.cardImage}>
                                        <span className={styles.cardBadge}>🧧 CNY</span>
                                        <div className={styles.imagePlaceholder}>
                                            {product.category === 'gift' ? '🎁' : '🥩'}
                                        </div>
                                    </div>
                                    <div className={styles.cardContent}>
                                        <Link href={`/product/${product.$id}`} className={styles.cardTitle}>
                                            {product.name}
                                        </Link>
                                        <p className={styles.cardDesc}>{product.description}</p>
                                        <div className={styles.cardFooter}>
                                            <span className={styles.price}>${product.price.toFixed(2)}</span>
                                            <button
                                                className={styles.addBtn}
                                                onClick={() => handleAddToCart(product)}
                                            >
                                                Add 🛒
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}
