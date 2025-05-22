import styles from '../styles/DashboardLayout.module.css';

const DashboardLayout = ({ leftPanel, rightPanel, topBar, children }) => { // Add 'children' to destructuring
  return (
    <div className={styles.dashboard}>
      {topBar && <div className={styles.topBar}>{topBar}</div>}
      <div className={styles.content}>
        <div className={styles.leftPanel}>{leftPanel}</div>
        <div className={styles.rightPanel}>{rightPanel}</div>
      </div>
      {children} {/* Render the children here */}
    </div>
  );
};

export default DashboardLayout;