import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { FaWifi, FaCreditCard, FaWallet, FaBan, FaSignal, FaCoins, FaChartLine, FaShieldAlt, FaLightbulb, FaCheck, FaChartBar, FaBus, FaRedo, FaTwitter, FaInstagram, FaLinkedin, FaFacebook, FaBars, FaTimes, FaStar } from 'react-icons/fa';
import styles from './Home.module.css';

// ── Count-up Hook ─────────────────────────────────────────────────────────────
function useCountUp(target, duration = 2000, start = false) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!start) return;
    let startTime = null;
    const numericTarget = parseFloat(target);

    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      setCount((eased * numericTarget).toFixed(target.includes('.') ? 1 : 0));
      if (progress < 1) requestAnimationFrame(step);
    };

    requestAnimationFrame(step);
  }, [start, target, duration]);

  return count;
}

// ── Typing Effect Hook ────────────────────────────────────────────────────────
function useTypingEffect(texts, typingSpeed = 80, pauseDuration = 1800) {
  const [displayText, setDisplayText] = useState('');
  const [textIndex, setTextIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const current = texts[textIndex];

    const timeout = setTimeout(() => {
      if (!isDeleting) {
        setDisplayText(current.slice(0, charIndex + 1));
        if (charIndex + 1 === current.length) {
          setTimeout(() => setIsDeleting(true), pauseDuration);
        } else {
          setCharIndex(c => c + 1);
        }
      } else {
        setDisplayText(current.slice(0, charIndex - 1));
        if (charIndex - 1 === 0) {
          setIsDeleting(false);
          setCharIndex(0);
          setTextIndex(i => (i + 1) % texts.length);
        } else {
          setCharIndex(c => c - 1);
        }
      }
    }, isDeleting ? typingSpeed / 2 : typingSpeed);

    return () => clearTimeout(timeout);
  }, [charIndex, isDeleting, textIndex, texts, typingSpeed, pauseDuration]);

  return displayText;
}

// ── Fade-in on Scroll Hook ────────────────────────────────────────────────────
function useFadeInOnScroll() {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.15 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return [ref, visible];
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function Home() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [navTransparent, setNavTransparent] = useState(true);

  // Stats animation trigger
  const statsRef = useRef(null);
  const [statsAnimated, setStatsAnimated] = useState(false);

  // Typing effect texts
  const typingText = useTypingEffect([
    'The Smarter Way to Move.',
    'Tap. Ride. Repeat.',
    'Cashless. Contactless. Effortless.',
    'Built for the Campus. Built for You.',
  ]);

  // Count-up values
  const riders   = useCountUp('1', 2000, statsAnimated);
  const trips    = useCountUp('1.5',  2200, statsAnimated);
  const ontime   = useCountUp('98.5', 1800, statsAnimated);
  const vehicles = useCountUp('100', 1600, statsAnimated);

  // Fade-in refs for each section
  const [featuresRef, featuresVisible]       = useFadeInOnScroll();
  const [whyRef, whyVisible]                 = useFadeInOnScroll();
  const [howRef, howVisible]                 = useFadeInOnScroll();
  const [testimonialsRef, testimonialsVisible] = useFadeInOnScroll();


   const [showScrollTop, setShowScrollTop] = useState(false); 
  // Navbar scroll
useEffect(() => {
  const handleScroll = () => {
    setNavTransparent(window.scrollY < 50);
    setShowScrollTop(window.scrollY > 400);
  };
  window.addEventListener('scroll', handleScroll);
  return () => window.removeEventListener('scroll', handleScroll);
}, []);
  // Stats trigger
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting && !statsAnimated) setStatsAnimated(true); },
      { threshold: 0.3 }
    );
    if (statsRef.current) observer.observe(statsRef.current);
    return () => observer.disconnect();
  }, [statsAnimated]);

 

  return (
    <main className={styles.home}>

      {/* ── NAVBAR ── */}
      <nav className={`${styles.navbar} ${navTransparent ? styles.transparent : styles.solid}`}>
        <div className={styles.navContainer}>
          <div className={styles.logo}>
            <FaWifi className={styles.logoIcon} />
            <span className={styles.logoText}>C-Transit</span>
          </div>

          <div className={styles.navLinks}>
            <a href="#how-it-works">How It Works</a>
            <a href="#why-ctransit">Solutions</a>
          </div>

          <div className={styles.navRight}>
            <Link to="/auth/login" className={styles.ghostBtn}>Login</Link>
            <Link to="/register" className={styles.primaryBtn}>Get Started</Link>
          </div>

          <button className={styles.hamburger} onClick={() => setMobileMenuOpen(o => !o)}>
            {mobileMenuOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className={styles.mobileMenu}>
            <a href="#features"    onClick={() => setMobileMenuOpen(false)}>Features</a>
            <a href="#how-it-works" onClick={() => setMobileMenuOpen(false)}>How It Works</a>
            <a href="#why-ctransit" onClick={() => setMobileMenuOpen(false)}>Solutions</a>
            <Link to="/auth/login"  onClick={() => setMobileMenuOpen(false)} className={styles.mobileLogin}>Login</Link>
            <Link to="/register"    onClick={() => setMobileMenuOpen(false)} className={styles.mobileGetStarted}>Get Started</Link>
          </div>
        )}
      </nav>

      {/* ── HERO ── */}
      <section className={styles.hero}>
        <div className={styles.heroContainer}>
          <div className={`${styles.heroLeft} ${styles.fadeInUp}`}>
            <div className={styles.heroBadge}>
              <span>Smart Transit Payments</span>
            </div>
            <h1 className={styles.heroTitle}>
              Tap & Ride.<br />
              <span className={styles.typingText}>
                {typingText}
                <span className={styles.cursor}>|</span>
              </span>
            </h1>
            <p className={styles.heroSubtitle}>
              Cashless. Contactless. Effortless. Just tap your C-transit card or student ID and ride across the campus.
            </p>
            <div className={styles.heroButtons}>
              <Link to="/register" className={styles.primaryBtn}>Get Started</Link>
              <Link to="/auth/login" className={styles.ghostBtn}>Login</Link>
            </div>
          </div>

          <div className={`${styles.heroRight} ${styles.fadeInRight}`}>
            <div className={styles.phoneMockup}>
              <div className={styles.phoneScreen}>
                <div className={styles.statusBar}>
                  <span>C-Transit</span>
                  <span className={styles.checkmark}>✓</span>
                  <span>10:30 AM</span>
                </div>
                <div className={styles.screenContent}>
                  <div className={styles.nfcAnimation}>
                    <div className={styles.nfcRing}></div>
                    <div className={styles.nfcRing} style={{ animationDelay: '0.5s' }}></div>
                    <div className={styles.nfcRing} style={{ animationDelay: '1s' }}></div>
                  </div>
                  <p className={styles.tapText}>TAP YOUR CARD</p>
                  <p className={styles.tapSubtext}>Place your C-transit card on the terminal</p>
                </div>
              </div>
              <div className={styles.phoneGlow}></div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURES STRIP ── */}
      <section
        id="features"
        ref={featuresRef}
        className={`${styles.featuresStrip} ${featuresVisible ? styles.fadeInUp : styles.hidden}`}
      >
        <div className={styles.featuresContainer}>
          {[
            { icon: <FaCreditCard />, title: 'Cashless Payments', sub: 'Secure & instant' },
            { icon: <FaWallet />,     title: 'Smart Wallet',       sub: 'Top up and manage' },
            { icon: <FaChartLine />,  title: 'Real-time Analytics', sub: 'Track & save more' },
            { icon: <FaShieldAlt />,  title: 'Safe & Secure',      sub: 'Bank grade security' },
          ].map((f, i) => (
            <div key={i} className={styles.featureItem} style={{ transitionDelay: `${i * 100}ms` }}>
              <div className={styles.featureIcon}>{f.icon}</div>
              <h4>{f.title}</h4>
              <p>{f.sub}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── WHY C-TRANSIT ── */}
      <section
        id="why-ctransit"
        ref={whyRef}
        className={`${styles.whySection} ${whyVisible ? styles.fadeInUp : styles.hidden}`}
      >
        <div className={styles.sectionContainer}>
          <div className={styles.sectionHeader}>
            <h2>Why Choose C-Transit?</h2>
            <p>A complete mobility ecosystem built for the future of smart cities.</p>
          </div>
          <div className={styles.cardsGrid}>
            {[
              { icon: <FaLightbulb />, title: 'Instant Access', desc: 'Tap your C-transit card and get instant access to buses, Keke, and other vehicles.' },
              { icon: <FaWallet />,    title: 'Smart Wallet',       desc: 'Load money, set limits, and enjoy seamless transactions and savings.' },
              { icon: <FaChartBar />,  title: 'Track & Analyze',    desc: 'Get insights on your travel, spending, and destination patterns.' },
              { icon: <FaShieldAlt />, title: 'Reliable & Secure',  desc: 'Your data and payments are 100% secure with advanced encryption.' },
            ].map((c, i) => (
              <div key={i} className={styles.card} style={{ transitionDelay: `${i * 120}ms` }}>
                <div className={styles.cardIconBox}>{c.icon}</div>
                <h3>{c.title}</h3>
                <p>{c.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      {/* ── CASHLESS SECTION ── */}
<section className={styles.cashlessSection}>
  <div className={styles.sectionContainer}>
    <div className={styles.sectionHeader}>
      <h2>Finally. Cashless Done Right.</h2>
      <p>No more wahala at the bus stop.</p>
    </div>
    <div className={styles.cashlessGrid}>
      {[
        { icon: <FaCoins />, pain: '"Change no de"', fix: 'Your card handles the exact fare. Always.' },
        { icon: <FaSignal />, pain: '"Network no de"', fix: 'C-Transit works even when internet is down.' },
        { icon: <FaBan />, pain: '"I no de collect transfer"', fix: 'No driver approval needed. Just tap and ride.' },
      ].map((item, i) => (
        <div key={i} className={styles.cashlessCard}>
          <div className={styles.cashlessIcon}>{item.icon}</div>
          <p className={styles.cashlessPain}>{item.pain}</p>
          <p className={styles.cashlessFix}>{item.fix}</p>
        </div>
      ))}
    </div>
  </div>
</section>

      {/* ── HOW IT WORKS ── */}
      <section
        id="how-it-works"
        ref={howRef}
        className={`${styles.howSection} ${howVisible ? styles.fadeInUp : styles.hidden}`}
      >
        <div className={styles.sectionContainer}>
          <div className={styles.sectionHeader}>
            <h2>How It Works</h2>
            <p>Just Tap, Ride & Go.</p>
          </div>
          <div className={styles.stepsContainer}>
            {[
              { icon: <FaCreditCard />, title: 'Tap Card',  desc: 'Tap your C-transit card or student ID on the terminal.' },
              { icon: <FaCheck />,      title: 'Validate',  desc: 'System validates your card and deducts the correct fare.' },
              { icon: <FaBus />,        title: 'Ride',      desc: 'Enjoy your ride seamlessly.' },
              { icon: <FaRedo />,       title: 'Go Again',  desc: 'Tap again at every boarding and destination stop.' },
            ].map((s, i) => (
              <>
                <div key={i} className={styles.step} style={{ transitionDelay: `${i * 150}ms` }}>
                  <div className={styles.stepBadge}>{i + 1}</div>
                  <div className={styles.stepIcon}>{s.icon}</div>
                  <h3>{s.title}</h3>
                  <p>{s.desc}</p>
                </div>
                {i < 3 && <div className={styles.arrow}></div>}
              </>
            ))}
          </div>
        </div>
      </section>

      {/* ── STATS BAR ── */}
      <section ref={statsRef} className={styles.statsBar}>
        <div className={styles.statsContainer}>
          {[
            { value: riders,   suffix: 'K+', label: 'Happy Riders' },
            { value: trips,    suffix: 'K+', label: 'Trips Completed' },
            { value: ontime,   suffix: '%',  label: 'On-time Performance' },
            { value: vehicles, suffix: '+',  label: 'Active Vehicles' },
          ].map((s, i) => (
            <>
              <div key={i} className={`${styles.stat} ${statsAnimated ? styles.fadeInUp : styles.hidden}`} style={{ transitionDelay: `${i * 150}ms` }}>
                <div className={styles.statNumber}>
                  {s.value}<span>{s.suffix}</span>
                </div>
                <p>{s.label}</p>
              </div>
              {i < 3 && <div className={styles.statDivider}></div>}
            </>
          ))}
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section
        ref={testimonialsRef}
        className={`${styles.testimonialSection} ${testimonialsVisible ? styles.fadeInUp : styles.hidden}`}
      >
        <div className={styles.sectionContainer}>
          <div className={styles.sectionHeader}>
            <h2>What Riders Say</h2>
          </div>
          <div className={styles.testimonialGrid}>
            {[
              { initials: 'DE', name: 'Destiny E.',  role: 'Student',         text: 'C-Transit makes my daily commute so easy and convenient.' },
              { initials: 'MM', name: 'Muhammed M.',  role: 'Lecturer',  text: 'Love the tap & ride experience. Fast, secure and reliable.' },
              { initials: 'AA', name: 'AbdulAzeez A.',   role: 'Student',        text: 'Best transit card system I\'ve used. Super convenient!' },
            ].map((t, i) => (
              <div key={i} className={styles.testimonialCard} style={{ transitionDelay: `${i * 120}ms` }}>
                <div className={styles.avatar}>{t.initials}</div>
                <h4>{t.name}</h4>
                <span className={styles.role}>{t.role}</span>
                <p>"{t.text}"</p>
                <div className={styles.stars}>
                  {[...Array(5)].map((_, j) => <FaStar key={j} className={styles.star} />)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className={styles.footer}>
        <div className={styles.footerContainer}>
          <div className={styles.footerColumn}>
            <div className={styles.footerLogo}>
              <FaWifi className={styles.footerLogoIcon} />
              <span>C-Transit</span>
            </div>
            <p className={styles.footerTagline}>The Smarter Way to Move.</p>
            <div className={styles.socialIcons}>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer"><FaTwitter /></a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer"><FaInstagram /></a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer"><FaLinkedin /></a>
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer"><FaFacebook /></a>
            </div>
          </div>

          <div className={styles.footerColumn}>
            <h5>Product</h5>
            <a href="#features">Features</a>
            <a href="#how-it-works">How It Works</a>
          </div>

         <div className={styles.footerColumn}>
            <h5>Company</h5>
            <Link to="/about">About Us</Link>
            <Link to="/contact">Contact</Link>
          </div>

          <div className={styles.footerColumn}>
            <h5>Support</h5>
            <Link to="/help">Help Center</Link>
            <a href="/privacy">Privacy Policy</a>
            <a href="/terms">Terms of Service</a>
            <a href="#status">Status</a>
          </div>
        </div>

        <div className={styles.footerBottom}>
          <p>© {new Date().getFullYear()} C-Transit. All rights reserved.</p>
          <p>Made with care for Nigerian University</p>
        </div>
      </footer>
      {/* ── SCROLL TO TOP ── */}
{showScrollTop && (
  <button
    className={styles.scrollTop}
    onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
    aria-label="Scroll to top"
  >
    ▲
  </button>
)}
    </main>
  );
}