import { useEffect } from 'react';

/**
 * Shows the browser's native confirmation prompt before a user leaves the page.
 * @param {object} options
 * @param {boolean} options.isBlocked - A boolean to control whether the prompt is active.
 */
export const useBeforeUnload = ({ isBlocked = true }) => {
  useEffect(() => {
    // If blocking is disabled, do nothing.
    if (!isBlocked) {
      return;
    }

    // This is the function that will be called when the user tries to leave.
    const handleBeforeUnload = (event) => {
      // Prevent the default action, which is required by most browsers.
      event.preventDefault();
      // For older browser compatibility, set a return value.
      event.returnValue = '';
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    // The cleanup function removes the event listener when the component unmounts.
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isBlocked]); // The effect re-runs if the 'isBlocked' status changes.
};