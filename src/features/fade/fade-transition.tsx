import React, { useEffect, useState } from "react";

type FadeTransitionProps = {
  show: boolean;
  onlyFadeOut: boolean;
  children: React.ReactNode;
};

const FadeTransition: React.FC<FadeTransitionProps> = ({ show, onlyFadeOut, children }) => {
  const [isMounted, setIsMounted] = useState(show);

  useEffect(() => {
    if (show) setIsMounted(true);
  }, [show]);

  const handleAnimationEnd = () => {
    if (!show) setIsMounted(false);
  };

  return (
    isMounted && (
      <div
        className={`h-full w-full absolute inset-0 ${
          show ? (onlyFadeOut ? "" : "animate-fade-in") : "animate-fade-out"
        }`}
        onAnimationEnd={handleAnimationEnd}
      >
        {children}
      </div>
    )
  );
};

export default FadeTransition;
