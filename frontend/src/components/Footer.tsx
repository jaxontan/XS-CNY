import Link from 'next/link';
import styles from './Footer.module.css';

export default function Footer() {
    return (
        <footer className={styles.footer}>
            <div className={styles.container}>
                <div className={styles.grid}>
                    <div className={styles.section}>
                        <h3 className={styles.title}>
                            <span>🧧</span> Bakkwa
                        </h3>
                        <p className={styles.description}>
                            Premium CNY treats delivered to your doorstep in Singapore & Malaysia.
                        </p>
                    </div>

                    <div className={styles.section}>
                        <h4 className={styles.subtitle}>Quick Links</h4>
                        <nav className={styles.links}>
                            <Link href="/shop">Shop</Link>
                            <Link href="/about">About Us</Link>
                            <Link href="/faq">FAQ</Link>
                            <Link href="/contact">Contact</Link>
                        </nav>
                    </div>

                    <div className={styles.section}>
                        <h4 className={styles.subtitle}>Contact Us</h4>
                        <div className={styles.contact}>
                            <p>📧 hello@bakkwa.com</p>
                            <p>📱 WhatsApp: +65 9123 4567</p>
                        </div>
                    </div>

                    <div className={styles.section}>
                        <h4 className={styles.subtitle}>Delivery Areas</h4>
                        <div className={styles.badges}>
                            <span className={styles.badge}>🇸🇬 Singapore</span>
                            <span className={styles.badge}>🇲🇾 Malaysia</span>
                        </div>
                    </div>
                </div>

                <div className={styles.bottom}>
                    <p>© 2024 Bakkwa. All rights reserved. 恭喜发财 🎊</p>
                </div>
            </div>
        </footer>
    );
}
