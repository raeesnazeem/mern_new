import '../styles/AiLoader.css';
import Lottie from 'lottie-react'; 
import aiLoadingAnimation from '../assets/Layer.json'; 

const AILoader = ({ heading, subHeading }) => {
  return (
    <div className="ai-loader-container">
      <div className="top-bar"></div>
      <div className="ai-loader">
        <Lottie
          animationData={aiLoadingAnimation}
          loop={true}
          autoplay={true}
          style={{ height: 150, width: 150 }}
        />
        <h2 className="ai-text">{heading}</h2>
        <p className="ai-subtext">{subHeading}</p>
      </div>
    </div>
  );
};

export default AILoader;