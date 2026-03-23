import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

const CountdownTimer = ({ dueDate }) => {
  const [timeLeft, setTimeLeft] = useState('');
  const [isPastDue, setIsPastDue] = useState(false);

  useEffect(() => {
    if (!dueDate) return;

    const calculateTimeLeft = () => {
      const difference = new Date(dueDate) - new Date();
      
      if (difference <= 0) {
        setTimeLeft('Past Due');
        setIsPastDue(true);
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((difference / 1000 / 60) % 60);

      let timeString = '';
      if (days > 0) timeString += `${days}d `;
      if (hours > 0 || days > 0) timeString += `${hours}h `;
      timeString += `${minutes}m`;

      setTimeLeft(timeString);
      setIsPastDue(false);
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 60000); // Update every minute

    return () => clearInterval(timer);
  }, [dueDate]);

  if (!dueDate) return null;

  return (
    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm font-medium transition-colors ${
      isPastDue 
        ? 'bg-red-500/10 border-red-500/20 text-red-400' 
        : 'bg-orange-500/10 border-orange-500/20 text-orange-400'
    }`}>
      <Clock className={`w-4 h-4 ${isPastDue ? 'text-red-400' : 'text-orange-400'}`} />
      <span>{isPastDue ? 'Expired' : `${timeLeft} left`}</span>
    </div>
  );
};

export default CountdownTimer;
