import { Link } from "react-router-dom";
import styles from "../styles/AnswerDisplay.module.css";
import botImage from '../assets/bot-typing.png';

const AnswerDisplay = () => {
  return (
    <div className={styles.answerContainer}>
      <div className="topPart">
        <h2 className={styles.title}>
          <span>
            {" "}
            <img
              src="/bot-avatar.png"
              style={{ maxWidth: "60px", marginBottom: "-25px" }}
              alt="g99 BuildBot"
            />
          </span>
          BuildBot
        </h2>
        <p className={styles.placeholder}>
          Let's get to know some details! Complete the conversation in the chat
          panel on the right and I'll be on my way building it out for you.
        </p>
      </div>

    <div className="middlePart">
    <img src={botImage} style={{maxWidth:'400px', display:'flex', alignSelf:'center'}}/>

    </div>

      <div className="bottomPart">
        <Link to="/dashboard">
          <button className={styles.methodButton}>Skip & go to Dashboard</button>
        </Link>
      </div>
    </div>
  );
};

export default AnswerDisplay;
