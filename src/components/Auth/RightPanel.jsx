import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import gsap from 'gsap';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';
import styles from './RightPanel.module.css';

export default function RightPanel() {
  const [isLogin, setIsLogin] = useState(true);
  const panelRef = useRef(null);
  const formContainerRef = useRef(null);

  useEffect(() => {
    // Initial slide-in animation
    gsap.fromTo(
      panelRef.current,
      { opacity: 0, x: 100 },
      {
        opacity: 1,
        x: 0,
        duration: 0.8,
        ease: 'power3.out',
      }
    );
  }, []);

  const handleToggle = () => {
    // Fade out animation
    gsap.to(formContainerRef.current, {
      opacity: 0,
      x: isLogin ? 30 : -30,
      duration: 0.3,
      ease: 'power2.in',
      onComplete: () => {
        setIsLogin(!isLogin);
        // Fade in with new form
        gsap.fromTo(
          formContainerRef.current,
          { opacity: 0, x: !isLogin ? 30 : -30 },
          {
            opacity: 1,
            x: 0,
            duration: 0.4,
            ease: 'power3.out',
          }
        );
      },
    });
  };

  return (
    <div ref={panelRef} className={styles.rightPanel}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h2 className={styles.title}>
            {isLogin ? 'Welcome Back' : 'Join C-Transit'}
          </h2>
          <p className={styles.subtitle}>
            {isLogin
              ? 'Sign in to your account to continue'
              : 'Create your account to get started'}
          </p>
        </div>

        <div ref={formContainerRef} className={styles.formContainer}>
          {isLogin ? <LoginForm /> : <RegisterForm />}
        </div>

        <div className={styles.divider}>
          <span>or</span>
        </div>

        <div className={styles.toggle}>
          <p>
            {isLogin ? "Don't have an account? " : 'Already have an account? '}
            <motion.button
              className={styles.toggleBtn}
              onClick={handleToggle}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {isLogin ? 'Register here' : 'Login here'}
            </motion.button>
          </p>
        </div>
      </div>
    </div>
  );
}
