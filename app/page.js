"use client";
import React, { useEffect, useRef } from "react";
import NetworkGraph from "./components/networkGraph/NetworkGraph";
import data from "@/public/data.json";
function Home() {
  return (
    <>
      <div className="w-screen h-screen bg-white">
        <NetworkGraph data={data} />
      </div>
    </>
  );
}

export default Home;
