"use client";
import React, { useEffect } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Image from "next/image";
import styles from "./scrollAnimation.module.css";

gsap.registerPlugin(ScrollTrigger);

function ScrollAnimation() {
  useGSAP(() => {
    const images = gsap.utils.toArray(".scroll-image");

    images.forEach((image, index) => {
      gsap.fromTo(
        image,
        { y: 100 * index, rotateZ: index % 2 == 0 ? 2 * index : -2 * index },
        {
          y: 0,
          x: 0,
          rotateZ: 0,
          scrollTrigger: {
            trigger: image,
            start: "top 100%",
            end: "top 10%",
            scrub: 1,
            markers: false,
          },
        }
      );
    });
  });

  //   useEffect(() => {}, []);

  return (
    <>
      <div className="w-full h-[200vh] relative  flex items-center justify-center">
        <div className="w-[70%]">
          <h3 className={`${styles.combined} text-center`}>Sustainable goals together</h3>
        </div>
        <Image
          id="image1"
          src={"/Card 1.png"}
          height={500}
          width={500}
          alt="image1"
          className="absolute top-[10%] left-[10%] w-[25vw] h-auto scroll-image"
        />
        <Image
          id="image2"
          src={"/Card 2.png"}
          height={500}
          width={500}
          alt="image1"
          className="absolute top-[10%]  w-[25vw] h-auto right-[10%] scroll-image"
        />
        <Image
          id="image3"
          src={"/Card 1.png"}
          height={500}
          width={500}
          alt="image1"
          className="absolute top-[40%] left-[15%] w-[25vw] h-auto scroll-image"
        />
        <Image
          id="image4"
          src={"/Card 2.png"}
          height={500}
          width={500}
          alt="image1"
          className="absolute top-[40%] right-[15%] w-[25vw] h-auto scroll-image"
        />
        <Image
          id="image5"
          src={"/Card 1.png"}
          height={500}
          width={500}
          alt="image1"
          className="absolute bottom-[10%] left-[10%] w-[25vw] h-auto scroll-image"
        />
        <Image
          id="image6"
          src={"/Card 2.png"}
          height={500}
          width={500}
          alt="image1"
          className="absolute bottom-[10%] right-[10%] w-[25vw] h-auto scroll-image"
        />
      </div>
      <div className="h-screen"></div>
    </>
  );
}

export default ScrollAnimation;
