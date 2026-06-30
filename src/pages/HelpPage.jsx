import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaArrowLeft,
  FaSearch,
  FaChevronDown,
  FaQuestionCircle,
  FaWallet,
  FaBus,
  FaWifi,
  FaIdCard,
  FaShieldAlt,
  FaHeadset,
  FaArrowRight,
} from 'react-icons/fa';
import styles from './Help.module.css';

const FAQ_DATA = [
  {
    id: 'getting-started',
    title: 'Getting Started',
    icon: <FaQuestionCircle />,
    accent: 'primary',
    items: [
      { q: 'What is C-Transit?', a: 'C-Transit is an intelligent mobility payment system that allows students to access campus transportation through a simple tap-and-ride experience.' },
      { q: 'How does C-Transit work?', a: 'Create an account, link your student card at a transit station, fund your wallet, and pay for rides by tapping your card on a C-Transit terminal.' },
      { q: 'How do I register?', a: 'Create an account through the C-Transit platform using your student information and complete card linking at an approved transit station.' },
      { q: 'How do I link my student card?', a: 'Visit a designated C-Transit registration point where your student card will be linked to your account.' },
    ],
  },
  {
    id: 'wallet-payments',
    title: 'Wallet & Payments',
    icon: <FaWallet />,
    accent: 'success',
    items: [
      { q: 'How do I fund my wallet?', a: 'You can add funds to your C-Transit wallet through approved funding channels available on the platform.' },
      { q: 'How can I check my balance?', a: 'Your wallet balance and transaction history are available within your account dashboard.' },
      { q: 'Why was my wallet charged?', a: 'Wallet deductions occur when a ride is successfully approved and recorded by a C-Transit terminal.' },
      { q: 'Are deposits refundable?', a: 'Deposits may be reviewed on a case-by-case basis according to C-Transit policies and operational requirements.' },
    ],
  },
  {
    id: 'rides-transportation',
    title: 'Rides & Transportation',
    icon: <FaBus />,
    accent: 'warning',
    items: [
      { q: 'How do I pay for a ride?', a: 'Simply tap your linked card on the terminal when boarding a participating vehicle.' },
      { q: 'What happens when I tap my card?', a: 'The terminal validates your account and instantly approves or declines the ride.' },
      { q: 'Why was my ride declined?', a: 'A ride may be declined due to insufficient balance, account restrictions, card issues, or synchronization delays.' },
      { q: 'Can I still ride when the network is unavailable?', a: 'Yes. C-Transit is designed to continue operating during temporary internet disruptions using synchronized authorization data.' },
    ],
  },
  {
    id: 'offline-functionality',
    title: 'Offline Functionality',
    icon: <FaWifi />,
    accent: 'navy',
    items: [
      { q: 'How does C-Transit work without internet?', a: 'Transport terminals maintain local authorization records that allow eligible users to continue accessing rides even when connectivity is temporarily unavailable.' },
      { q: 'Why is my balance not updated immediately?', a: 'Some transactions may synchronize after internet connectivity is restored.' },
      { q: 'What is synchronization?', a: 'Synchronization is the process of securely updating ride and payment records between transport terminals and the C-Transit platform.' },
    ],
  },
  {
    id: 'account-card',
    title: 'Account & Card Management',
    icon: <FaIdCard />,
    accent: 'primary',
    items: [
      { q: 'I lost my card. What should I do?', a: 'Contact support immediately so your card can be restricted and your account protected.' },
      { q: 'My card is not working.', a: 'Ensure your card is properly linked and not damaged. If the problem persists, contact support.' },
      { q: 'Can someone else use my card?', a: 'No. Cards are linked to individual accounts and should only be used by the registered owner.' },
      { q: 'How do I update my account information?', a: 'Account information can be updated through your profile settings or by contacting support.' },
    ],
  },
  {
    id: 'safety-security',
    title: 'Safety & Security',
    icon: <FaShieldAlt />,
    accent: 'danger',
    items: [
      { q: 'Is my information secure?', a: 'We take reasonable measures to protect your account, transaction records, and personal information.' },
      { q: 'How is my balance protected?', a: 'All transactions are recorded and monitored to help maintain account integrity and prevent unauthorized activity.' },
      { q: 'What should I do if I notice suspicious activity?', a: 'Contact support immediately so we can investigate and secure your account.' },
    ],
  },
];

export default function HelpCenter({ onBack, onContactSupport }) {
  const navigate = useNavigate();
  const handleBack = onBack || (() => navigate('/'));
  const handleContactSupport = onContactSupport || (() => navigate('/contact'));
  const [searchTerm, setSearchTerm] = useState('');
  const [openItem, setOpenItem] = useState(null); // `${categoryId}-${index}`

  const filteredCategories = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return FAQ_DATA;

    return FAQ_DATA
      .map(category => ({
        ...category,
        items: category.items.filter(
          item =>
            item.q.toLowerCase().includes(term) ||
            item.a.toLowerCase().includes(term)
        ),
      }))
      .filter(category => category.items.length > 0);
  }, [searchTerm]);

  const toggleItem = (key) => {
    setOpenItem(prev => (prev === key ? null : key));
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
        <span className={styles.eyebrow}>Help Center</span>
        <h1>Everything you need to know about using C-Transit</h1>
        <p>
          Learn how C-Transit works, find answers to common questions, and get the
          information you need to ride with confidence.
        </p>

        <div className={styles.searchBox}>
          <FaSearch className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search for an answer..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
        </div>
      </div>

      <motion.div
        className={styles.container}
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        {filteredCategories.length === 0 ? (
          <div className={styles.noResults}>
            <FaQuestionCircle size={32} />
            <p>No results for "{searchTerm}". Try a different search, or contact support below.</p>
          </div>
        ) : (
          filteredCategories.map(category => (
            <motion.section
              key={category.id}
              className={styles.categoryBlock}
              variants={itemVariants}
            >
              <div className={`${styles.categoryHeader} ${styles[category.accent]}`}>
                <span className={styles.categoryIcon}>{category.icon}</span>
                <h2>{category.title}</h2>
              </div>

              <div className={styles.faqList}>
                {category.items.map((item, i) => {
                  const key = `${category.id}-${i}`;
                  const isOpen = openItem === key;
                  return (
                    <div
                      key={key}
                      className={`${styles.faqItem} ${styles[category.accent]} ${isOpen ? styles.open : ''}`}
                    >
                      <button
                        className={styles.faqQuestion}
                        onClick={() => toggleItem(key)}
                        aria-expanded={isOpen}
                      >
                        <span>{item.q}</span>
                        <motion.span
                          className={styles.chevron}
                          animate={{ rotate: isOpen ? 180 : 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <FaChevronDown />
                        </motion.span>
                      </button>
                      <AnimatePresence initial={false}>
                        {isOpen && (
                          <motion.div
                            className={styles.faqAnswerWrap}
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.25 }}
                          >
                            <p className={styles.faqAnswer}>{item.a}</p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            </motion.section>
          ))
        )}

        <motion.div className={styles.ctaCard} variants={itemVariants}>
          <FaHeadset size={28} />
          <h3>Can't find what you're looking for?</h3>
          <p>Our support team is available to help with account issues, card problems, wallet concerns, ride disputes, and general inquiries.</p>
         <button className={styles.ctaBtn} onClick={handleContactSupport}>
            Contact Support <FaArrowRight />
          </button>
        </motion.div>
      </motion.div>
    </div>
  );
}