import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { TypeAnimation } from 'react-type-animation';
import styles from '../styles/BotBubble.module.css';
import '../chatbotstyles.css';

// CHANGED: Accept the new 'onTypingEnd' prop
const BotBubble = ({ step, triggerNextStep, onTypingEnd }) => {
  const { message, avatarUrl } = step.component.props;
  const [showCursor, setShowCursor] = useState(true);

  return (
    <div className={styles.botBubbleContainer}>
      <img src={avatarUrl} alt="bot avatar" className={styles.avatarImage} />
      <div className={styles.typewriterBubble}>
        <TypeAnimation
          sequence={[
            '...',
            1200,
            message,
            1500,
            () => {
              setShowCursor(false);
              // CHANGED: Call the function passed from the parent
              onTypingEnd();
              if (triggerNextStep) {
                triggerNextStep();
              }
            },
          ]}
          wrapper="span"
          speed={70}
          cursor={showCursor}
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
  // NEW: Add prop type for our new callback function
  onTypingEnd: PropTypes.func,
};

BotBubble.defaultProps = {
  triggerNextStep: () => {},
  // NEW: Provide a default empty function to prevent errors
  onTypingEnd: () => {},
};

export default BotBubble;