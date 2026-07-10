import { useEffect } from 'react';

/**
 * Alert notification component.
 * Displays error, success, or info messages to the user.
 * Automatically dismisses itself after 4 seconds by calling the onClose callback.
 */
export default function Alert({ message, type = 'error', onClose }) {
  useEffect(() => {
    if (!message || !onClose) return undefined;

    // Set a timer to automatically trigger the onClose callback after 4 seconds
    const timer = window.setTimeout(onClose, 4000);

    // Clear the timer if the alert message or onClose handler changes, or on unmount
    return () => window.clearTimeout(timer);
  }, [message, onClose]);

  // Render nothing if there is no message to display
  if (!message) return null;

  return (
    <div className={`alert alert-${type}`} role="alert">
      {/* Capitalized message category title (e.g. Error, Info, Success) */}
      <strong>{type === 'error' ? 'Error' : type === 'info' ? 'Info' : 'Success'}</strong>
      <span>{message}</span>
    </div>
  );
}
