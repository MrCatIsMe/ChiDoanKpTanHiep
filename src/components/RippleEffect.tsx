import React, { useState, useLayoutEffect } from 'react';

interface RippleProps {
  color?: string;
  duration?: number;
}

export const Ripple: React.FC<RippleProps> = ({ color = 'rgba(255, 255, 255, 0.28)', duration = 650 }) => {
  const [rippleList, setRippleList] = useState<{ x: number; y: number; size: number; id: number }[]>([]);

  const addRipple = (event: React.MouseEvent<HTMLDivElement>) => {
    const container = event.currentTarget.getBoundingClientRect();
    const size = container.width > container.height ? container.width * 2 : container.height * 2;
    const x = event.clientX - container.left - size / 2;
    const y = event.clientY - container.top - size / 2;
    const newRipple = {
      x,
      y,
      size,
      id: Date.now() + Math.random(),
    };
    setRippleList((prev) => [...prev, newRipple]);
  };

  useLayoutEffect(() => {
    if (rippleList.length > 0) {
      const timer = setTimeout(() => {
        setRippleList((prev) => prev.slice(1));
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [rippleList, duration]);

  return (
    <div
      className="absolute inset-0 overflow-hidden rounded-[inherit] pointer-events-none"
      onMouseDown={addRipple}
      style={{ pointerEvents: 'all' }}
    >
      {rippleList.map((ripple) => (
        <span
          key={ripple.id}
          className="absolute rounded-full pointer-events-none animate-ripple"
          style={{
            top: ripple.y,
            left: ripple.x,
            width: ripple.size,
            height: ripple.size,
            background: color,
          }}
        />
      ))}
    </div>
  );
};

export default Ripple;
