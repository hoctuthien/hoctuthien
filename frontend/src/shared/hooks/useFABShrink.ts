import { useState, useEffect, useCallback } from 'react';

export interface UseFABShrinkOptions {
  threshold?: number;
  shrinkOnScrollDelay?: number;
}

export function useFABShrink({ threshold = 50, shrinkOnScrollDelay = 100 }: UseFABShrinkOptions = {}) {
  const [isShrunk, setIsShrunk] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);

  const handleScroll = useCallback(() => {
    const currentScrollY = window.scrollY;
    
    if (currentScrollY > threshold && currentScrollY > lastScrollY) {
      setIsShrunk(true);
    } else if (currentScrollY < lastScrollY || currentScrollY <= threshold) {
      setIsShrunk(false);
    }
    
    setLastScrollY(currentScrollY);
  }, [lastScrollY, threshold]);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const throttledScroll = () => {
      if (timeoutId) return;
      timeoutId = setTimeout(() => {
        handleScroll();
        timeoutId = undefined as any;
      }, shrinkOnScrollDelay);
    };

    window.addEventListener('scroll', throttledScroll);
    return () => {
      window.removeEventListener('scroll', throttledScroll);
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [handleScroll, shrinkOnScrollDelay]);

  return isShrunk;
}
