import styles from "../styles/FrameBuilder.module.css";
import TopBar from "../components/TopBar";

const ThreeColumnLayout = ({ leftPanel, middlePanel, rightPanel }) => {
  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      {<TopBar />}
      <div
        className={styles.threeColumnLayout}
        style={{ display: "flex", height: "100vh", width:"100%" }}
      >
        {leftPanel}
        {middlePanel}
        {rightPanel}
      </div>
    </div>
  );
};

export default ThreeColumnLayout;
