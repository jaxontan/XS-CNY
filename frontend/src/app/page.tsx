import styles from './page.module.css';
import Link from 'next/link';

export default function Home() {
  return (
    <div className={styles.page}>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <span className={styles.heroEmoji}>🧨 🧧 🍊</span>
          <h1 className={styles.heroTitle}>
            Celebrate CNY with <span className={styles.highlight}>Premium Bakkwa</span>
          </h1>
          <p className={styles.heroSubtitle}>
            Handcrafted Chinese New Year treats delivered fresh to Singapore & Malaysia
          </p>
          <div className={styles.heroCta}>
            <Link href="/shop" className={styles.ctaPrimary}>
              Shop Now 🎁
            </Link>
            <Link href="/about" className={styles.ctaSecondary}>
              Learn More
            </Link>
          </div>
          <div className={styles.heroFeatures}>
            <div className={styles.feature}>
              <span>🚚</span>
              <span>Free Delivery over $100</span>
            </div>
            <div className={styles.feature}>
              <span>🇸🇬</span>
              <span>Singapore</span>
            </div>
            <div className={styles.feature}>
              <span>🇲🇾</span>
              <span>Malaysia</span>
            </div>
          </div>
        </div>
        <div className={styles.heroDecor}>
          <div className={styles.lantern}>🏮</div>
          <div className={styles.dragon}>🐉</div>
        </div>
      </section>

      {/* Featured Products */}
      <section className={styles.featured}>
        <div className={styles.container}>
          <h2 className={styles.sectionTitle}>
            <span className={styles.titleIcon}>✨</span>
            Featured Products
          </h2>
          <div className={styles.productGrid}>
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className={styles.productCard}>
                <div className={styles.productImage}>
                  <span className={styles.productBadge}>CNY Special</span>
                </div>
                <div className={styles.productInfo}>
                  <h3>Premium Bakkwa Set {i}</h3>
                  <p className={styles.productPrice}>$38.00</p>
                  <button className={styles.addToCart}>Add to Cart</button>
                </div>
              </div>
            ))}
          </div>
          <Link href="/shop" className={styles.viewAll}>
            View All Products →
          </Link>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className={styles.whyUs}>
        <div className={styles.container}>
          <h2 className={styles.sectionTitle}>
            <span className={styles.titleIcon}>🎊</span>
            Why Choose Bakkwa?
          </h2>
          <div className={styles.reasonGrid}>
            <div className={styles.reasonCard}>
              <span className={styles.reasonIcon}>🥇</span>
              <h3>Premium Quality</h3>
              <p>Handcrafted with the finest ingredients and traditional recipes.</p>
            </div>
            <div className={styles.reasonCard}>
              <span className={styles.reasonIcon}>🎁</span>
              <h3>Gift Ready</h3>
              <p>Beautiful packaging perfect for CNY gifting.</p>
            </div>
            <div className={styles.reasonCard}>
              <span className={styles.reasonIcon}>🚀</span>
              <h3>Fast Delivery</h3>
              <p>Same-day delivery available in Singapore & Malaysia.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
