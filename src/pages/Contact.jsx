import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FaArrowLeft,
  FaEnvelope,
  FaWhatsapp,
  FaPhone,
  FaClock,
  FaCheckCircle,
  FaExclamationCircle,
  FaPaperPlane,
} from 'react-icons/fa';
import styles from './Contact.module.css';

const CONTACT_CARDS = [
  { icon: <FaEnvelope />, label: 'Email Support', value: 'support@ctransit.me' }, // ⚠️ confirm real address
  { icon: <FaWhatsapp />, label: 'WhatsApp Support', value: '+234 XXX XXX XXXX' }, // ⚠️ fill in real number
  { icon: <FaPhone />, label: 'Phone Support', value: '+234 XXX XXX XXXX' }, // ⚠️ fill in real number
  { icon: <FaClock />, label: 'Support Hours', value: 'Mon – Fri, 8:00 AM – 6:00 PM' },
];

const COMMON_ISSUES = [
  'Account registration problems',
  'Card linking issues',
  'Lost or damaged cards',
  'Wallet funding concerns',
  'Ride payment disputes',
  'Transaction history questions',
  'Technical difficulties',
  'Suggestions and feedback',
];

const BEFORE_CONTACTING = [
  'Full Name',
  'Registered Email Address',
  'Phone Number',
  'Card ID (if available)',
  'Description of the issue',
];

const CATEGORIES = [
  'Account Issues',
  'Card Problems',
  'Wallet & Payments',
  'Ride Issues',
  'Driver Complaint',
  'Technical Problem',
  'Suggestion / Feedback',
  'Other',
];

export default function ContactSupport({ onBack }) {
  const navigate = useNavigate();
  const handleBack = onBack || (() => navigate('/'));
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    category: '',
    subject: '',
    description: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const validate = () => {
    const next = {};
    if (!form.fullName.trim()) next.fullName = 'Enter your full name.';
    if (!form.email.trim()) next.email = 'Enter your registered email address.';
    else if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) next.email = 'Enter a valid email address.';
    if (!form.phone.trim()) next.phone = 'Enter your phone number.';
    if (!form.category) next.category = 'Select a category.';
    if (!form.subject.trim()) next.subject = 'Briefly describe your issue.';
    if (!form.description.trim()) next.description = 'Provide more detail so we can assist you.';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;
    if (!validate()) return;

    setSubmitting(true);
    // TODO(backend): POST `form` to /api/support once the endpoint is ready
    setTimeout(() => {
      setSubmitting(false);
      setSubmitted(true);
    }, 600);
  };

  const resetForm = () => {
    setForm({ fullName: '', email: '', phone: '', category: '', subject: '', description: '' });
    setErrors({});
    setSubmitted(false);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.35 } },
  };

  return (
    <div className={styles.page}>
      <div className={styles.topBar}>
<button className={styles.backBtn} onClick={handleBack}>
          <FaArrowLeft /> Back
        </button>
      </div>

      <div className={styles.hero}>
        <span className={styles.eyebrow}>Contact Support</span>
        <h1>Need help? We're here for you.</h1>
        <p>
          If you're experiencing issues with your account, card, wallet, or
          transportation services, our support team is ready to assist.
        </p>
        <p className={styles.heroSub}>
          We aim to provide quick, helpful, and reliable support to every member
          of the C-Transit community.
        </p>
      </div>

      <motion.div className={styles.container} initial="hidden" animate="visible" variants={containerVariants}>

        {/* Contact Info Cards */}
        <motion.div className={styles.contactGrid} variants={itemVariants}>
          {CONTACT_CARDS.map(card => (
            <div key={card.label} className={styles.contactCard}>
              <div className={styles.contactIcon}>{card.icon}</div>
              <div>
                <p className={styles.contactLabel}>{card.label}</p>
                <p className={styles.contactValue}>{card.value}</p>
              </div>
            </div>
          ))}
          <div className={styles.contactCard}>
            <div className={styles.contactIcon}><FaClock /></div>
            <div>
              <p className={styles.contactLabel}>Average Response Time</p>
              <p className={styles.contactValue}>Most inquiries receive a response within 24–48 hours.</p>
            </div>
          </div>
        </motion.div>

        {/* Common Issues + Before Contacting */}
        <motion.div className={styles.infoGrid} variants={itemVariants}>
          <div className={styles.infoCard}>
            <h3>Common Issues We Can Help With</h3>
            <ul className={styles.checkList}>
              {COMMON_ISSUES.map(issue => (
                <li key={issue}><FaCheckCircle /> {issue}</li>
              ))}
            </ul>
          </div>
          <div className={styles.infoCard}>
            <h3>Before Contacting Support</h3>
            <p className={styles.infoCardIntro}>Please have the following information available where applicable:</p>
            <ul className={styles.checkList}>
              {BEFORE_CONTACTING.map(item => (
                <li key={item}><FaCheckCircle /> {item}</li>
              ))}
            </ul>
            <p className={styles.infoCardFooter}>Providing accurate details helps us resolve issues faster.</p>
          </div>
        </motion.div>

        {/* Support Form */}
        <motion.div className={styles.formCard} variants={itemVariants}>
          {submitted ? (
            <div className={styles.successState}>
              <FaCheckCircle className={styles.successIcon} />
              <h2>Request Submitted</h2>
              <p>Our team will review your request and respond as soon as possible.</p>
              <button className={styles.secondaryBtn} onClick={resetForm}>
                Submit Another Request
              </button>
            </div>
          ) : (
            <>
              <span className={styles.eyebrowSmall}>Support Form</span>
              <h2>Submit a Support Request</h2>
              <p className={styles.formIntro}>
                Having trouble with your account, card, wallet, or rides?
                Send us a message and we'll do our best to help.
              </p>

              <form onSubmit={handleSubmit} className={styles.form} noValidate>
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label htmlFor="fullName">Full Name</label>
                    <input
                      id="fullName"
                      type="text"
                      className={styles.input}
                      placeholder="Enter your full name"
                      value={form.fullName}
                      onChange={e => handleChange('fullName', e.target.value)}
                    />
                    {errors.fullName && <p className={styles.fieldError}><FaExclamationCircle /> {errors.fullName}</p>}
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="email">Email Address</label>
                    <input
                      id="email"
                      type="email"
                      className={styles.input}
                      placeholder="Enter your registered email address"
                      value={form.email}
                      onChange={e => handleChange('email', e.target.value)}
                    />
                    {errors.email && <p className={styles.fieldError}><FaExclamationCircle /> {errors.email}</p>}
                  </div>
                </div>

                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label htmlFor="phone">Phone Number</label>
                    <input
                      id="phone"
                      type="tel"
                      className={styles.input}
                      placeholder="Enter your phone number"
                      value={form.phone}
                      onChange={e => handleChange('phone', e.target.value)}
                    />
                    {errors.phone && <p className={styles.fieldError}><FaExclamationCircle /> {errors.phone}</p>}
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="category">Category</label>
                    <select
                      id="category"
                      className={styles.select}
                      value={form.category}
                      onChange={e => handleChange('category', e.target.value)}
                    >
                      <option value="">Select a category</option>
                      {CATEGORIES.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                    {errors.category && <p className={styles.fieldError}><FaExclamationCircle /> {errors.category}</p>}
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="subject">Subject</label>
                  <input
                    id="subject"
                    type="text"
                    className={styles.input}
                    placeholder="Briefly describe your issue"
                    value={form.subject}
                    onChange={e => handleChange('subject', e.target.value)}
                  />
                  {errors.subject && <p className={styles.fieldError}><FaExclamationCircle /> {errors.subject}</p>}
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="description">Describe Your Issue</label>
                  <textarea
                    id="description"
                    rows={5}
                    className={styles.textarea}
                    placeholder="Provide as much detail as possible so we can assist you effectively"
                    value={form.description}
                    onChange={e => handleChange('description', e.target.value)}
                  />
                  {errors.description && <p className={styles.fieldError}><FaExclamationCircle /> {errors.description}</p>}
                </div>

                <button type="submit" className={styles.submitBtn} disabled={submitting}>
                  <FaPaperPlane /> {submitting ? 'Submitting...' : 'Submit Request'}
                </button>
              </form>
            </>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
}