import { useRef, useCallback, useEffect } from 'react';

export const useScrollManagement = () => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const scrollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const clearScrollInterval = useCallback(() => {
    if (scrollIntervalRef.current) {
      clearInterval(scrollIntervalRef.current);
      scrollIntervalRef.current = null;
    }
  }, []);

  const handleDragUpdateWithScroll = useCallback((result: any) => {
    if (!scrollContainerRef.current) return;

    // Clear any existing scroll interval
    clearScrollInterval();

    // Get current mouse position from the document
    let mouseY = 0;
    if (window.event && window.event instanceof MouseEvent) {
      mouseY = window.event.clientY;
    } else {
      // Fallback: try to get from the drag update result if available
      mouseY = (result as any).clientY || 0;
    }

    const container = scrollContainerRef.current;
    const containerRect = container.getBoundingClientRect();
    const scrollSpeed = 15; // Reduced scroll speed for smoother control
    const scrollThreshold = 250; // Increased threshold for better detection

    // Only start scrolling if we're near the edges and not already scrolling
    if (!scrollIntervalRef.current) {
      // Check if dragging near the top edge
      if (mouseY - containerRect.top < scrollThreshold) {
        // Start continuous scrolling up
        scrollIntervalRef.current = setInterval(() => {
          if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollTop -= scrollSpeed;
          }
        }, 16); // ~60fps
      }
      // Check if dragging near the bottom edge
      else if (containerRect.bottom - mouseY < scrollThreshold) {
        // Start continuous scrolling down
        scrollIntervalRef.current = setInterval(() => {
          if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollTop += scrollSpeed;
          }
        }, 16); // ~60fps
      }
    }
  }, [clearScrollInterval]);

  // Cleanup effect for scroll intervals
  useEffect(() => {
    return () => {
      clearScrollInterval();
    };
  }, [clearScrollInterval]);

  return {
    scrollContainerRef,
    scrollIntervalRef,
    clearScrollInterval,
    handleDragUpdateWithScroll
  };
};
