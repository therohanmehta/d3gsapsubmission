"use client";
import React, { useEffect, useRef } from "react";
import * as d3 from "d3";
import json from "@/public/data.json";
const Bubble = () => {
  const svgRef = useRef(null);

  useEffect(() => {
    // Group data by color
    const groupedData = d3.group(json.nodes, (d) => d.color);

    // Set dimensions
    const width = window.innerWidth;
    const height = window.innerHeight;

    // Create an SVG element
    const svg = d3.select(svgRef.current).attr("width", width).attr("height", height).style("background", "#f4f4f4").style("overflow", "visible");

    // Create a scale for the bubbles' radius
    const radiusScale = d3.scaleSqrt().domain([0, 100]).range([10, 50]);

    // Define starting positions for each group
    const groupCenters = Array.from(groupedData.keys()).map((color, index) => ({
      color,
      x: (index + 1) * (width / (groupedData.size + 7)),
      y: height / 2,
    }));

    console.log(groupCenters);

    // Create a simulation for positioning bubbles
    const simulation = d3
      .forceSimulation(json.nodes)
      .force("x", d3.forceX((d) => groupCenters.find((g) => g.color === d.color).x).strength(0.2))
      .force("y", d3.forceY((d) => groupCenters.find((g) => g.color === d.color).y).strength(0.2))
      .force(
        "collide",
        d3.forceCollide((d) => radiusScale(d.size === "large" ? 10 : d.size === "medium" ? 6 : 4) + 2) // Ensures no overlap
      )
      .on("tick", () => {
        svg
          .selectAll("circle")
          .data(json.nodes)
          .join("circle")
          .attr("cx", (d) => d.x)
          .attr("cy", (d) => d.y)
          .attr("r", (d) => radiusScale(d.size === "large" ? 10 : d.size === "medium" ? 6 : 4))
          .attr("fill", (d) => d.color);

        svg
          .selectAll("text")
          .data(json.nodes)
          .join("text")
          .attr("x", (d) => d.x)
          .attr("y", (d) => d.y)
          .attr("text-anchor", "middle")
          .attr("dy", ".3em")
          .text((d) => d.name)
          .style("font-size", "12px")
          .style("fill", "#fff");
      });

    // Cleanup on component unmount
    return () => {
      simulation.stop();
    };
  }, []);

  return <svg ref={svgRef}></svg>;
};

export default Bubble;
