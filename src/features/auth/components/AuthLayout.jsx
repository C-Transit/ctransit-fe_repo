import LeftPanel from './LeftPanel';
import RightPanel from './RightPanel';
import CurveDivider from './CurveDivider';
import styles from './AuthLayout.module.css';

export default function AuthLayout() {
  return (
    <div className={styles.authLayout}>
      <LeftPanel />
      <div className={styles.dividerContainer}>
        <CurveDivider />
      </div>
      <RightPanel />
    </div>
  );
}
