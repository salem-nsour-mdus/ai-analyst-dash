import { useState, useEffect, useRef } from 'react';

export function CountingNumber({ value, duration = 2000, className = '', suffix = '' }) {
  const [count, setCount] = useState(0);
  const countRef = useRef(null);
  const startedRef = useRef(false);

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;

    const startTime = Date.now();
    const endValue = value;
    
    const updateCount = () => {
      const now = Date.now();
      const progress = Math.min((now - startTime) / duration, 1);
      
      // Easing function for smooth animation (easeOutExpo)
      const easeOutExpo = 1 - Math.pow(2, -10 * progress);
      const currentCount = Math.floor(easeOutExpo * endValue);
      
      setCount(currentCount);
      
      if (progress < 1) {
        countRef.current = requestAnimationFrame(updateCount);
      } else {
        setCount(endValue);
      }
    };
    
    countRef.current = requestAnimationFrame(updateCount);
    
    return () => {
      if (countRef.current) {
        cancelAnimationFrame(countRef.current);
      }
    };
  }, [value, duration]);

  return (
    <span className={`${className} transition-all duration-300`}>
      {count}{suffix}
    </span>
  );
}