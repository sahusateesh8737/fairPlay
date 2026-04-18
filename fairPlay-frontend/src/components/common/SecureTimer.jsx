import React, { useState, useEffect, useRef } from 'react';
import { Clock, AlertTriangle } from 'lucide-react';

const SecureTimer = ({ serverEndTime, onTimeUp }) => {
  const [timeLeft, setTimeLeft] = useState('');
  const [isCritical, setIsCritical] = useState(false);

  const isFinishedRef = useRef(false);

  useEffect(() => {
    if (!serverEndTime || isFinishedRef.current) return;

    const calculateTime = () => {
      if (isFinishedRef.current) return false;

      const now = new Date().getTime();
      const end = new Date(serverEndTime).getTime();
      const distance = end - now;

      if (distance <= 0) {
        setTimeLeft("00:00");
        setIsCritical(true);
        if (!isFinishedRef.current) {
          isFinishedRef.current = true;
          onTimeUp();
        }
        return false;
      }

      const m = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const s = Math.floor((distance % (1000 * 60)) / 1000);

      const minutes = m < 10 ? `0${m}` : m;
      const seconds = s < 10 ? `0${s}` : s;
      
      setTimeLeft(`${minutes}:${seconds}`);
      
      if (m < 5) setIsCritical(true);
      else setIsCritical(false);
      
      return true;
    };

    // Initial calculation
    calculateTime();

    const interval = setInterval(() => {
      const active = calculateTime();
      if (!active) {
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [serverEndTime, onTimeUp]);

  return (
    <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all duration-500 font-mono shadow-sm ${
      isCritical 
        ? 'bg-red-500/10 border-red-500/30 text-red-500 animate-pulse' 
        : 'bg-primary/5 border-primary/20 text-primary'
    }`}>
      {isCritical ? <AlertTriangle className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
      <span className="text-sm font-bold tracking-wider">
        {timeLeft || 'Calculating...'}
      </span>
    </div>
  );
};

export default SecureTimer;
