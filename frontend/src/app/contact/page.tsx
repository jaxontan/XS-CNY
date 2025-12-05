'use client';

import { useState } from 'react';
import styles from './page.module.css';

export default function ContactPage() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // In production, this would send to an API
        setSubmitted(true);
        setFormData({ name: '', email: '', subject: '', message: '' });
    };

    return (
        <div className={styles.page}>
            {/* Hero */}
            <section className={styles.hero}>
                <span className={styles.heroIcon}>📞</span>
                <h1>Get In Touch</h1>
                <p>We&apos;d love to hear from you!</p>
            </section>

            <div className={styles.container}>
                <div className={styles.grid}>
                    {/* Contact Info */}
                    <div className={styles.info}>
                        <h2>🧧 Contact Information</h2>

                        <div className={styles.infoCards}>
                            <div className={styles.infoCard}>
                                <span>📍</span>
                                <h3>Visit Us</h3>
                                <p>123 CNY Street<br />Singapore 123456</p>
                            </div>

                            <div className={styles.infoCard}>
                                <span>📧</span>
                                <h3>Email Us</h3>
                                <p>hello@bakkwa.com<br />orders@bakkwa.com</p>
                            </div>

                            <div className={styles.infoCard}>
                                <span>📱</span>
                                <h3>WhatsApp</h3>
                                <p>+65 9123 4567<br />+60 12 345 6789</p>
                            </div>

                            <div className={styles.infoCard}>
                                <span>🕐</span>
                                <h3>Operating Hours</h3>
                                <p>Mon-Sat: 9AM - 8PM<br />Sun: 10AM - 6PM</p>
                            </div>
                        </div>

                        <div className={styles.cnyNote}>
                            <span>🎊</span>
                            <p>CNY Special Hours: Extended hours during the festive period. Check our social media for updates!</p>
                        </div>
                    </div>

                    {/* Contact Form */}
                    <div className={styles.formSection}>
                        <h2>✉️ Send a Message</h2>

                        {submitted ? (
                            <div className={styles.success}>
                                <span>🎊</span>
                                <h3>Message Sent!</h3>
                                <p>Thank you for reaching out. We&apos;ll get back to you within 24 hours.</p>
                                <button onClick={() => setSubmitted(false)} className={styles.resetBtn}>
                                    Send Another Message
                                </button>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className={styles.form}>
                                <div className={styles.fieldRow}>
                                    <div className={styles.field}>
                                        <label>Name</label>
                                        <input
                                            type="text"
                                            value={formData.name}
                                            onChange={(e) => setFormData(f => ({ ...f, name: e.target.value }))}
                                            placeholder="Your name"
                                            required
                                        />
                                    </div>
                                    <div className={styles.field}>
                                        <label>Email</label>
                                        <input
                                            type="email"
                                            value={formData.email}
                                            onChange={(e) => setFormData(f => ({ ...f, email: e.target.value }))}
                                            placeholder="your@email.com"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className={styles.field}>
                                    <label>Subject</label>
                                    <select
                                        value={formData.subject}
                                        onChange={(e) => setFormData(f => ({ ...f, subject: e.target.value }))}
                                        required
                                    >
                                        <option value="">Select a topic</option>
                                        <option value="order">Order Inquiry</option>
                                        <option value="bulk">Bulk/Corporate Orders</option>
                                        <option value="delivery">Delivery Questions</option>
                                        <option value="feedback">Feedback</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>

                                <div className={styles.field}>
                                    <label>Message</label>
                                    <textarea
                                        value={formData.message}
                                        onChange={(e) => setFormData(f => ({ ...f, message: e.target.value }))}
                                        placeholder="How can we help you?"
                                        rows={5}
                                        required
                                    />
                                </div>

                                <button type="submit" className={styles.submitBtn}>
                                    Send Message 🧧
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
