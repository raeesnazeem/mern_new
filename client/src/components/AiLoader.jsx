import '../styles/AiLoader.css';

const AILoader = ({heading, subHeading}) => {
  return (
    <div className="ai-loader">
      <div className="dots-container">
        <span className="dot"></span>
        <span className="dot"></span>
        <span className="dot"></span>
      </div>
      <h2 className="ai-text">{heading}</h2>
      <p className="ai-subtext">{subHeading}</p>
    </div>
  );
};

export default AILoader;