'use client';

import Link from 'next/link';
import styles from './Header.module.css';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';

export default function Header() {
    const { itemCount } = useCart();
    const { user, logout } = useAuth();

    return (
        <header className={styles.header}>
            <div className={styles.container}>
                <Link href="/" className={styles.logo}>
                    <span className={styles.logoIcon}>🧧</span>
                    <span className={styles.logoText}>Bakkwa</span>
                </Link>

                <nav className={styles.nav}>
                    <Link href="/shop" className={styles.navLink}>Shop</Link>
                    <Link href="/about" className={styles.navLink}>About</Link>
                    <Link href="/contact" className={styles.navLink}>Contact</Link>
                </nav>

                <div className={styles.actions}>
                    <Link href="/cart" className={styles.cartBtn}>
                        <span className={styles.cartIcon}>🛒</span>
                        <span className={styles.cartCount}>{itemCount}</span>
                    </Link>
                    {user ? (
                        <>
                            <Link href="/orders" className={styles.ordersLink}>📦 Orders</Link>
                            <button onClick={logout} className={styles.loginBtn}>Logout</button>
                        </>
                    ) : (
                        <Link href="/login" className={styles.loginBtn}>Login</Link>
                    )}
                </div>
            </div>
        </header>
    );
}

