import React, { useState } from 'react'; // Import useState
import PropTypes from 'prop-types';
import { TypeAnimation } from 'react-type-animation';
import styles from '../styles/BotBubble.module.css';


const BotBubble = ({ step, triggerNextStep }) => {
  // Get our custom props from the step object
  const { message, avatarUrl } = step.component.props;

  // 1. ADD STATE TO CONTROL THE CURSOR'S VISIBILITY
  const [showCursor, setShowCursor] = useState(true);

  return (
    <div className={styles.botBubbleContainer}>
      <img src={avatarUrl} alt="bot avatar" className={styles.avatarImage} />
      <div className={styles.typewriterBubble}>
        <TypeAnimation
          // 2. UPDATE THE SEQUENCE TO HANDLE ALL REFINEMENTS
          sequence={[
            // First, type the "thinking" dots. The number sets the pause time after.
            '...',
            1200,
            // Next, automatically delete the dots and type the real message.
            message,
            1500, // Wait 1.5 seconds after the message is typed.
            // Finally, call a function to hide the cursor and trigger the next step.
            () => {
              setShowCursor(false); // Hide the cursor
              if (triggerNextStep) {
                triggerNextStep(); // Proceed to the next step
              }
            },
          ]}
          wrapper="span"
          speed={70} // Typing speed
          cursor={showCursor} // 3. CONTROL THE CURSOR WITH OUR STATE
          repeat={0}
          style={{ display: 'inline-block', verticalAlign: 'middle' }}
        />
      </div>
    </div>
  );
};

BotBubble.propTypes = {
  step: PropTypes.object.isRequired,
  triggerNextStep: PropTypes.func,
};

BotBubble.defaultProps = {
  triggerNextStep: () => {},
};

export default BotBubble;