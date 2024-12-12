"use client";
import React, { useEffect, useRef } from "react";
import NetworkGraph from "./components/networkGraph/NetworkGraph";
import data from "@/public/data.json";
import ScrollAnimation from "./scrollAnimation/page";
function Home() {
  return (
    <>
      <div className="">
        {/* <NetworkGraph data={data} /> */}
        <ScrollAnimation />
      </div>
    </>
  );
}

export default Home;
