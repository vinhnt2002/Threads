import { useEffect, useState } from 'react';

export const useTimeConvert = (createdAt: string) => {
  const [timeElapsed, setTimeElapsed] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      const currentTime = new Date().getTime();
      const creationTime = new Date(createdAt).getTime();
      const difference = currentTime - creationTime;

      const hours = Math.floor(difference / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setTimeElapsed(`${hours}h ${minutes}m ${seconds}s`);
    }, 1000);

    return () => clearInterval(interval);
  }, [createdAt]);

  return timeElapsed;
};
