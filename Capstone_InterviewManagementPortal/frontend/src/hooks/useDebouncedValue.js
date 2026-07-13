import { useEffect, useState } from 'react';

/**
 * Custom React hook to debounce a value.
 * Delays updating the state until after the specified delay has elapsed 
 * since the last time the value changed. This is typically used to optimize 
 * search inputs and reduce the frequency of backend API requests.
 */
export default function useDebouncedValue(value, delay = 400) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    // Schedule a timer to update the debounced value after the delay
    const timer = window.setTimeout(() => setDebouncedValue(value), delay);

    // Clear the timer if the value or delay changes before the timer fires,
    // or when the component using the hook unmounts.
    return () => window.clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}
