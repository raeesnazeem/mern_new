import ThreeColumnLayout from "../components/ThreeColumnLayout";
import FrameBuilder from "../components/FrameBuilder";

const FrameBuilderPage = () => {
  const { leftPanelContent, middlePanelContent, rightPanelContent } = FrameBuilder();

  return (
    <ThreeColumnLayout
      leftPanel={leftPanelContent}
      middlePanel={middlePanelContent}
      rightPanel={rightPanelContent}
    />
  );
};

export default FrameBuilderPage;