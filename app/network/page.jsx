import React from "react";
import NetworkGraph from "../components/networkGraph/NetworkGraph";
import data from "@/public/data.json";
function Network() {
  return (
    <div>
      <NetworkGraph data={data} />
    </div>
  );
}

export default Network;
