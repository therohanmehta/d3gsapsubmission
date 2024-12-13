"use client";
import React, { useRef, useEffect, useState } from "react";
import * as d3 from "d3";
import { gsap } from "gsap"; // Import GSAP
import json from "@/public/data.json";
const NetworkGraph = ({ data }) => {
  const svgRef = useRef();
  const [wiggle, setWiggle] = useState(false); // State to control the wiggle animation

  useEffect(() => {
    const width = window.innerWidth;
    const height = window.innerHeight;

    const links = data.links.map((d) => ({ ...d }));
    const nodes = data.nodes.map((d) => ({
      ...d,
      size: d.size === "large" ? 37 : d.size === "medium" ? 18.5 : 9.5, // Set radius based on size
    }));

    // Create the SVG container
    const svg = d3
      .select(svgRef.current)
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", [0, 0, width, height])
      .attr("style", "max-width: 100%; height: auto; border: 1px solid red;");

    // Create the simulation
    const simulation = d3
      .forceSimulation(nodes)
      .force(
        "link",
        d3.forceLink(links).id((d) => d.id)
      )
      .force("charge", d3.forceManyBody().strength(-100)) // Increase repulsion to create gaps
      .force("center", d3.forceCenter(width / 2, height / 2))
      .on("tick", ticked);

    // Create the links (lines between nodes)
    const link = svg
      .append("g")
      .attr("stroke", "#D6D7E1")
      .attr("stroke-opacity", 1)
      .selectAll()
      .data(links)
      .join("line")
      .attr("stroke-width", (d) => Math.sqrt(d.value));

    // Create the nodes (circles)
    const nodeGroup = svg.append("g").attr("stroke", "transparent").attr("stroke-width", 1.5);
    const node = nodeGroup
      .selectAll()
      .data(nodes)
      .join("circle")
      .attr("r", (d) => d.size) // Use the size property for radius
      .attr("fill", (d) => d.color) // Use the color property for fill
      .call(
        d3
          .drag() // Enable dragging for nodes
          .on("start", dragStarted)
          .on("drag", dragged)
          .on("end", dragEnded)
      );

    node.append("title").text((d) => d.id);

    // Function to update positions during simulation ticks
    function ticked() {
      link
        .attr("x1", (d) => d.source.x)
        .attr("y1", (d) => d.source.y)
        .attr("x2", (d) => d.target.x)
        .attr("y2", (d) => d.target.y);

      node.attr("cx", (d) => d.x).attr("cy", (d) => d.y);
    }

    // Dragging event functions
    function dragStarted(event, d) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }

    function dragged(event, d) {
      d.fx = event.x;
      d.fy = event.y;
    }

    function dragEnded(event, d) {
      if (!event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }

    // Add wiggle animation using GSAP (triggered only when wiggle state is true)
    if (wiggle) {
      gsap.to(nodeGroup.selectAll("circle"), {
        duration: 0.2,
        rotation: "+=10", // Wiggle effect
        repeat: 5,
        yoyo: true,
        stagger: 0.1, // Staggering for individual nodes
        onComplete: () => setWiggle(false), // Reset wiggle after completion
      });
    }

    return () => {
      simulation.stop();
    };
  }, []); // Add wiggle state as a dependency



  const handleWig = () => {
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
  };

  return (
    <div>
      <svg ref={svgRef} style={{ width: "100%", height: "500px" }} />
      <button className="px-2 py-3 border bg-blue-300 absolute top-0 left-0 z-50" onClick={handleWig} style={{ marginTop: "20px" }}>
        Wiggle Nodes
      </button>
    </div>
  );
};

export default NetworkGraph;
