import styles from './page.module.css';

export default function AboutPage() {
    return (
        <div className={styles.page}>
            {/* Hero */}
            <section className={styles.hero}>
                <span className={styles.heroIcon}>🏮</span>
                <h1>Our Story</h1>
                <p>Crafting premium bakkwa since 1988</p>
            </section>

            <div className={styles.container}>
                {/* Story Section */}
                <section className={styles.story}>
                    <div className={styles.storyContent}>
                        <h2>🧧 A Family Tradition</h2>
                        <p>
                            For over three decades, Bakkwa has been crafting the finest Chinese dried meat
                            using traditional recipes passed down through generations. What started as a
                            small family business in a humble shophouse has grown into one of Singapore and
                            Malaysia&apos;s most beloved CNY treat brands.
                        </p>
                        <p>
                            Every slice of our bakkwa is handcrafted with love, using only the freshest
                            premium meats and our secret blend of spices. We slow-grill each piece over
                            charcoal to achieve that perfect sweet, savory, and slightly charred flavor
                            that makes our bakkwa irresistible.
                        </p>
                    </div>
                    <div className={styles.storyImage}>
                        <span>👨‍🍳</span>
                    </div>
                </section>

                {/* Values */}
                <section className={styles.values}>
                    <h2>✨ Our Values</h2>
                    <div className={styles.valuesGrid}>
                        <div className={styles.valueCard}>
                            <span>🥇</span>
                            <h3>Premium Quality</h3>
                            <p>Only the finest ingredients make it into our products.</p>
                        </div>
                        <div className={styles.valueCard}>
                            <span>🔥</span>
                            <h3>Traditional Methods</h3>
                            <p>Charcoal-grilled using time-honored techniques.</p>
                        </div>
                        <div className={styles.valueCard}>
                            <span>💝</span>
                            <h3>Made with Love</h3>
                            <p>Every piece is handcrafted by our skilled artisans.</p>
                        </div>
                        <div className={styles.valueCard}>
                            <span>🌱</span>
                            <h3>Sustainability</h3>
                            <p>Committed to responsible sourcing and eco-friendly packaging.</p>
                        </div>
                    </div>
                </section>

                {/* CNY Message */}
                <section className={styles.cnyMessage}>
                    <span className={styles.dragon}>🐉</span>
                    <h2>恭喜发财</h2>
                    <p>
                        As Chinese New Year approaches, we&apos;re proud to continue the tradition of
                        bringing families together over delicious bakkwa. May your year be filled
                        with prosperity, good health, and plenty of delicious treats!
                    </p>
                    <span className={styles.redPacket}>🧧</span>
                </section>
            </div>
        </div>
    );
}
