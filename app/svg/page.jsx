"use client";
import React, { useState } from "react";
import { gsap } from "gsap";

const SvgAnimation = () => {
  const [isSquare, setIsSquare] = useState(false);

  // Handle the animation
  const animateShape = () => {
    setIsSquare(!isSquare); // Toggle between circle and square

    // If the state is set to square, animate the circle to a square
    gsap.to("#circle", {
      duration: 1, // Animation duration
      attr: {
        r: isSquare ? 50 : 0, // Reset radius to 0 to make a square, or revert
        width: isSquare ? 0 : 100, // Animate to square width
        height: isSquare ? 0 : 100, // Animate to square height
        rx: isSquare ? 50 : 0, // Radius X for circle, 0 for square
        ry: isSquare ? 50 : 0, // Radius Y for circle, 0 for square
      },
      ease: "power2.inOut",
    });
  };

  return (
    <div>
      <svg width="200" height="200" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
        <rect
          id="circle"
          x="50" // Initial position of square's top left corner
          y="50" // Initial position of square's top left corner
          width="100" // Square width
          height="100" // Square height
          rx="50" // Corner radius (for circle)
          ry="50" // Corner radius (for circle)
          fill="teal"
        />
      </svg>
      <button onClick={animateShape}>Animate Shape</button>
    </div>
  );
};

export default SvgAnimation;
