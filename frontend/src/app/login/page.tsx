'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import styles from './page.module.css';

function LoginContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const returnUrl = searchParams.get('returnUrl') || '/';
    const { login } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await login(email, password);
            // PF-006 FIX: Redirect to returnUrl after login
            router.push(returnUrl);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.page}>
            <div className={styles.container}>
                <div className={styles.card}>
                    <div className={styles.header}>
                        <span className={styles.icon}>🧧</span>
                        <h1>Welcome Back</h1>
                        <p>Sign in to continue your CNY shopping</p>
                    </div>

                    <form onSubmit={handleSubmit} className={styles.form}>
                        {error && <div className={styles.error}>{error}</div>}

                        <div className={styles.field}>
                            <label htmlFor="email">Email</label>
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="your@email.com"
                                required
                            />
                        </div>

                        <div className={styles.field}>
                            <label htmlFor="password">Password</label>
                            <input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                required
                            />
                        </div>

                        <button type="submit" className={styles.submitBtn} disabled={loading}>
                            {loading ? 'Signing in...' : 'Sign In 🎊'}
                        </button>
                    </form>

                    <div className={styles.footer}>
                        <p>Don&apos;t have an account?</p>
                        <Link href="/register" className={styles.link}>
                            Create Account
                        </Link>
                    </div>
                </div>

                <div className={styles.decor}>
                    <span>🏮</span>
                    <span>🐉</span>
                    <span>🎋</span>
                </div>
            </div>
        </div>
    );
}

export default function LoginPage() {
    return (
        <Suspense fallback={
            <div className={styles.page}>
                <div className={styles.container}>
                    <div className={styles.card}>
                        <div className={styles.header}>
                            <span className={styles.icon}>🏮</span>
                            <p>Loading...</p>
                        </div>
                    </div>
                </div>
            </div>
        }>
            <LoginContent />
        </Suspense>
    );
}
