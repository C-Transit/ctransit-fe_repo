import { useNavigate } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import {
  FaArrowLeft,
  FaArrowRight,
  FaUserPlus,
  FaIdCard,
  FaWallet,
  FaBolt,
  FaCompressArrowsAlt,
  FaTools,
  FaHandshake,
  FaForward,
  FaEnvelope,
} from 'react-icons/fa';
import styles from './About.module.css';

/* ── Data ──────────────────────────────────────────────────────────────────── */
const STATS = [
  { value: 4, suffix: '+', label: 'Campuses Targeted' },
  { value: 99, suffix: '%', label: 'Uptime Goal' },
  { value: 1, suffix: ' tap', label: 'To Board a Ride' },
  { value: 0, suffix: ' cash', label: 'Required' },
];

const PAIN_POINTS = [
  'Driver has no change. Lecture missed.',
  'Mobile transfer fails. Student stranded.',
  'Long queues at payment booths.',
  'No receipt. No record. No accountability.',
];

const STEPS = [
  { icon: <FaUserPlus />, step: '01', title: 'Create Account', desc: 'Sign up with your student credentials in under a minute.' },
  { icon: <FaIdCard />,   step: '02', title: 'Link Student Card', desc: 'Bind your NFC-enabled student ID to your C-Transit profile.' },
  { icon: <FaWallet />,   step: '03', title: 'Fund Wallet', desc: 'Top up once. Ride anytime — even offline.' },
  { icon: <FaBolt />,     step: '04', title: 'Tap & Ride', desc: 'One tap at the terminal. Board instantly.' },
];

const VALUES = [
  { icon: <FaCompressArrowsAlt />, title: 'Remove Friction',     desc: 'Every decision we make must simplify movement for the student.' },
  { icon: <FaTools />,             title: 'Build for Reality',   desc: 'We design for real-world conditions — unreliable networks, cash dependency, infrastructure gaps.' },
  { icon: <FaHandshake />,         title: 'Earn Trust',          desc: 'Security, reliability, and accountability sit at the center of every feature we ship.' },
  { icon: <FaForward />,           title: 'Keep Moving Forward', desc: 'Progress comes from continuous learning, shipping, testing, and improving.' },
];

/* ── Animated Counter ──────────────────────────────────────────────────────── */
function Counter({ value, suffix }) {
  const [display, setDisplay] = useState(0);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  useEffect(() => {
    if (!inView) return;
    if (value === 0) { setDisplay(0); return; }
    const duration = 1200;
    const start = performance.now();
    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(eased * value));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [inView, value]);

  return (
    <span ref={ref} className={styles.statValue}>
      {display}{suffix}
    </span>
  );
}

/* ── Staggered text lines ──────────────────────────────────────────────────── */
const lineVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.18 } },
};
const lineChild = {
  hidden: { opacity: 0, x: -28 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } },
};

/* ── Hero text reveal ──────────────────────────────────────────────────────── */
const heroVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.14, delayChildren: 0.2 } },
};
const heroChild = {
  hidden: { opacity: 0, y: 22 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] } },
};

/* ── Step cards left→right ─────────────────────────────────────────────────── */
const stepsVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.13 } },
};
const stepChild = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } },
};

/* ── Component ─────────────────────────────────────────────────────────────── */
export default function AboutPage() {
  const navigate = useNavigate();

  return (
    <div className={styles.page}>

      {/* ── 1. HERO ──────────────────────────────────────────────────────── */}
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <button className={styles.backBtn} onClick={() => navigate('/')}>
            <FaArrowLeft /> Back
          </button>

          <motion.div
            className={styles.heroBody}
            variants={heroVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.span className={styles.eyebrow} variants={heroChild}>
              About C-Transit
            </motion.span>

            <motion.h1 className={styles.heroHeadline} variants={heroChild}>
              Campus transport.<br />
              <em>Finally fixed.</em>
            </motion.h1>

            <motion.p className={styles.heroSub} variants={heroChild}>
              We're building the mobility payment infrastructure that African campuses
              have always needed — fast, offline-capable, and built for how students
              actually live.
            </motion.p>

            <motion.div className={styles.heroCta} variants={heroChild}>
              <button className={styles.ctaPrimary} onClick={() => navigate('/contact')}>
                Get in Touch <FaArrowRight />
              </button>
              <button className={styles.ctaGhost} onClick={() => navigate('/app')}>
                Try the App
              </button>
            </motion.div>
          </motion.div>

          <div className={styles.heroDecor} aria-hidden>
            <div className={styles.decor1} />
            <div className={styles.decor2} />
          </div>
        </div>
      </section>

      {/* ── 2. PROOF BAR ─────────────────────────────────────────────────── */}
      <motion.section
        className={styles.proofBar}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.4 }}
        variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.1 } } }}
      >
        {STATS.map((s) => (
          <motion.div className={styles.statItem} key={s.label} variants={fadeUp}>
            <Counter value={s.value} suffix={s.suffix} />
            <span className={styles.statLabel}>{s.label}</span>
          </motion.div>
        ))}
      </motion.section>

      {/* ── 3. THE PROBLEM ───────────────────────────────────────────────── */}
      <section className={styles.problemSection}>
        <div className={styles.problemInner}>
          <motion.div
            className={styles.problemLeft}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={fadeUp}
          >
            <span className={styles.sectionLabel}>The Problem</span>
            <h2 className={styles.sectionTitle}>
              The same friction,<br />every single day.
            </h2>
            <p className={styles.sectionBody}>
              Thousands of Nigerian students face the same avoidable barriers to
              transportation every morning. The tools exist to fix this. We're building them.
            </p>
          </motion.div>

          <motion.ul
            className={styles.painList}
            variants={lineVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
          >
            {PAIN_POINTS.map((point) => (
              <motion.li className={styles.painItem} key={point} variants={lineChild}>
                <span className={styles.painDash} aria-hidden>—</span>
                {point}
              </motion.li>
            ))}
          </motion.ul>
        </div>
      </section>

      {/* ── 4. PIVOT LINE ────────────────────────────────────────────────── */}
      <section className={styles.pivotSection}>
        <motion.p
          className={styles.pivotText}
          initial={{ opacity: 0, scale: 0.97 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          Transportation should simply <em>work.</em>
        </motion.p>
      </section>

      {/* ── 5. HOW IT WORKS ──────────────────────────────────────────────── */}
      <section className={styles.howSection}>
        <motion.div
          className={styles.howHeader}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.4 }}
          variants={fadeUp}
        >
          <span className={styles.sectionLabel}>How It Works</span>
          <h2 className={styles.sectionTitle}>One tap, the whole journey.</h2>
        </motion.div>

        <motion.div
          className={styles.stepsRow}
          variants={stepsVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          {STEPS.map((s, i) => (
            <motion.div className={styles.stepCard} key={s.step} variants={stepChild}>
              <div className={styles.stepTop}>
                <div className={styles.stepIcon}>{s.icon}</div>
                <span className={styles.stepNumber}>{s.step}</span>
              </div>
              <h3 className={styles.stepTitle}>{s.title}</h3>
              <p className={styles.stepDesc}>{s.desc}</p>
              {i < STEPS.length - 1 && (
                <div className={styles.stepArrow} aria-hidden><FaArrowRight /></div>
              )}
            </motion.div>
          ))}
        </motion.div>

        <motion.p
          className={styles.howNote}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.4 }}
          variants={fadeUp}
        >
          Our system continues functioning during temporary internet disruptions —
          because reliability isn't optional on a campus.
        </motion.p>
      </section>

      {/* ── 6. OUR STORY ─────────────────────────────────────────────────── */}
      <motion.section
        className={styles.storySection}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={fadeUp}
      >
        <div className={styles.storyInner}>
          <div className={styles.storyText}>
            <span className={styles.sectionLabelLight}>Our Story</span>
            <p>
              C-Transit began as a conversation among students tired of experiencing
              the same problems every day. The more we looked, the more we realized
              transportation was one of the most important yet overlooked challenges
              in student life.
            </p>
            <p>
              Rather than accepting the problem, we built a team — engineers,
              designers, and product thinkers — working to create a smarter
              transportation experience from the ground up.
            </p>
          </div>

          <div className={styles.missionBox}>
            <span className={styles.missionEye}>Our Mission</span>
            <p>
              To create reliable, accessible, and intelligent mobility solutions
              that eliminate transportation friction — and improve everyday
              movement for students and communities across Africa.
            </p>
          </div>
        </div>
      </motion.section>

      {/* ── 7. VALUES ────────────────────────────────────────────────────── */}
      <section className={styles.valuesSection}>
        <motion.div
          className={styles.valuesHeader}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.4 }}
          variants={fadeUp}
        >
          <span className={styles.sectionLabel}>Core Principles</span>
          <h2 className={styles.sectionTitle}>What we stand on.</h2>
        </motion.div>

        <motion.div
          className={styles.valuesGrid}
          variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.1 } } }}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          {VALUES.map((v) => (
            <motion.div className={styles.valueCard} key={v.title} variants={fadeUp}>
              <div className={styles.valueIcon}>{v.icon}</div>
              <h3>{v.title}</h3>
              <p>{v.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ── 8. CLOSE ─────────────────────────────────────────────────────── */}
      <section className={styles.closeSection}>
        <motion.div
          className={styles.closeInner}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.4 }}
          variants={heroVariants}
        >
          <motion.span className={styles.eyebrow} variants={heroChild}>
            Join the Journey
          </motion.span>
          <motion.h2 className={styles.closeHeadline} variants={heroChild}>
            We're still building.<br />Come build with us.
          </motion.h2>
          <motion.p className={styles.closeSub} variants={heroChild}>
            Every test, every ride, every improvement gets us closer to a campus
            where transportation just works. We'd love to have you along.
          </motion.p>
          <motion.div className={styles.heroCta} variants={heroChild}>
            <button className={styles.ctaPrimary} onClick={() => navigate('/contact')}>
              <FaEnvelope /> Get in Touch
            </button>
          </motion.div>
        </motion.div>

        <div className={styles.tapRideMove} aria-hidden>
          {['Tap.', 'Ride.', 'Move.'].map((word, i) => (
            <motion.span
              key={word}
              className={styles.tapWord}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.2, ease: [0.22, 1, 0.36, 1] }}
            >
              {word}
            </motion.span>
          ))}
        </div>
      </section>

    </div>
  );
}