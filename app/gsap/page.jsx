"use client";
import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

function Gsap() {
  const textRef = useRef(null);

  useEffect(() => {
    const textElement = textRef.current;

    ScrollTrigger.create({
      trigger: ".bg-green-900", // Target the green section
      start: "top 10%", // When the top of the green section reaches 10% of the viewport
      markers: true,
      onEnter: () => {
        console.log("onEnter");
        gsap.to(textElement, { color: "yellow", duration: 0.5 });
      },
      onLeaveBack: () => {
        console.log("onLeaveBack");
        gsap.to(textElement, { color: "black", duration: 0.5 });
      },
    });
  }, []);

  return (
    <div className="h-screen w-screen relative h-[200vh]">
      <div className="container mx-auto grid grid-cols-2">
        <div className="bg-white h-[90vh] bg-red-400 sticky fixed top-0 w-full">
          <h1 className="text-9xl font-bold" ref={textRef}>
            Hello
          </h1>
        </div>
        <div className="bg-white bg-yellow-300 w-full">
          <div className="bg-blue-900 h-screen w-full"></div>
          <div className="bg-green-900 h-screen w-full"></div>
        </div>
      </div>
    </div>
  );
}

export default Gsap;
