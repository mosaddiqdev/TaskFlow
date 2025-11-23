import { useRef, useEffect } from 'react';

/**
 * Hook for detecting swipe gestures
 * @param {Object} options - Configuration options
 * @param {Function} options.onSwipeLeft - Callback when swiped left
 * @param {Function} options.onSwipeRight - Callback when swiped right
 * @param {Function} options.onSwipeUp - Callback when swiped up
 * @param {Function} options.onSwipeDown - Callback when swiped down
 * @param {number} options.threshold - Minimum distance for swipe (default: 50px)
 * @param {HTMLElement} options.element - Element to attach listeners to (default: window)
 */
export function useSwipe({
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  threshold = 50,
  element = null,
} = {}) {
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const touchEndX = useRef(0);
  const touchEndY = useRef(0);

  useEffect(() => {
    const target = element || window;

    const handleTouchStart = (e) => {
      touchStartX.current = e.changedTouches[0].screenX;
      touchStartY.current = e.changedTouches[0].screenY;
    };

    const handleTouchEnd = (e) => {
      touchEndX.current = e.changedTouches[0].screenX;
      touchEndY.current = e.changedTouches[0].screenY;
      handleSwipe();
    };

    const handleSwipe = () => {
      const distX = touchStartX.current - touchEndX.current;
      const distY = touchStartY.current - touchEndY.current;
      const absDistX = Math.abs(distX);
      const absDistY = Math.abs(distY);

      // Only trigger if distance exceeds threshold
      if (absDistX < threshold && absDistY < threshold) {
        return;
      }

      // Determine if horizontal or vertical swipe
      if (absDistX > absDistY) {
        // Horizontal swipe
        if (distX > 0 && onSwipeLeft) {
          onSwipeLeft();
        } else if (distX < 0 && onSwipeRight) {
          onSwipeRight();
        }
      } else {
        // Vertical swipe
        if (distY > 0 && onSwipeUp) {
          onSwipeUp();
        } else if (distY < 0 && onSwipeDown) {
          onSwipeDown();
        }
      }
    };

    target.addEventListener('touchstart', handleTouchStart, false);
    target.addEventListener('touchend', handleTouchEnd, false);

    return () => {
      target.removeEventListener('touchstart', handleTouchStart);
      target.removeEventListener('touchend', handleTouchEnd);
    };
  }, [onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown, threshold, element]);
}
