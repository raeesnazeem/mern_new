import styles from '../styles/ChatBoardLayout.module.css';


const DashboardLayout = ({ leftPanel, rightPanel, topBar, children }) => { 
  return (
    <div className={styles.dashboard}>
      {topBar && <div className={styles.topBar}>{topBar}</div>}
      <div className={styles.content}>
        <div className={styles.leftPanel}>{leftPanel}</div>
        <div className={styles.rightPanel}>{rightPanel}</div>
      </div>
      {children}
    </div>
  );
};

export default DashboardLayout;