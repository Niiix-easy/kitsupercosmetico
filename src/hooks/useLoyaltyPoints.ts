import { useState, useEffect } from 'react';

/**
 * Hook to simulate loyalty points accumulation based on navigation and time spent.
 */
export const useLoyaltyPoints = () => {
  const [points, setPoints] = useState(0);

  useEffect(() => {
    // Initial points from session storage if available
    const savedPoints = sessionStorage.getItem('dyusar_loyalty_points');
    if (savedPoints) {
      setPoints(parseInt(savedPoints, 10));
    } else {
      // Start with some base points for visiting
      const basePoints = 50;
      setPoints(basePoints);
      sessionStorage.setItem('dyusar_loyalty_points', basePoints.toString());
    }

    // Accumulate points over time (simulating browsing depth)
    const interval = setInterval(() => {
      setPoints((prev) => {
        const next = prev + Math.floor(Math.random() * 5) + 1;
        sessionStorage.setItem('dyusar_loyalty_points', next.toString());
        return next;
      });
    }, 15000); // every 15 seconds

    return () => clearInterval(interval);
  }, []);

  return points;
};
