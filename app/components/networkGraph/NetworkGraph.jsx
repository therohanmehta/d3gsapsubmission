"use client";
import React, { useRef, useEffect, useState } from "react";
import * as d3 from "d3";
import { gsap } from "gsap"; // Import GSAP

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
    // Select all circles in the SVG
    const circles = Array.from(svgRef.current.querySelectorAll("circle")); // Convert NodeList to Array
    const lines = svgRef.current.querySelectorAll("line");
    console.log(circles[0].__data__);

    const filterdCircles = circles.filter((circle) => circle.__data__.color == "#D6D7E1");

    gsap.to(lines, {
      opacity: 0,
      duration: 0.2,
    });

    gsap.to(filterdCircles, {
      attr: {
        fill: "#D7EEF3",
        r: 50,
        cx: 100,
        cy: 400,
      },
      duration: 2,
    });

    // Create an object to store the count of each color (excluding #D6D7E1)
    const colorCounts = {};

    // Loop through all circles
    circles.forEach((circle) => {
      // Get the color of each circle (assuming it's stored as a 'color' attribute or in styles)
      const color = circle.getAttribute("fill");

      // Skip the color we don't want to filter
      if (color !== "#D6D7E1") {
        if (colorCounts[color]) {
          colorCounts[color]++;
        } else {
          colorCounts[color] = 1;
        }
      }
    });

    // Now `colorCounts` holds the count of each color
    console.log(colorCounts);

    // Convert the colorCounts object to an array for the bar graph
    const barData = Object.entries(colorCounts).map(([color, count]) => ({
      color,
      count,
    }));

    // You can use D3 to create the bar graph with `barData`
    setTimeout(() => {
      createBarGraph(barData);
    }, 2000);
  };

  // Function to generate the bar graph using D3.js
  const createBarGraph = (data) => {
    const margin = { top: 20, right: 30, bottom: 40, left: 40 };
    const width = 1000 - margin.left - margin.right;
    const height = 500 - margin.top - margin.bottom;

    const svg = d3
      .select(svgRef.current)
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const x = d3
      .scaleBand()
      .domain(data.map((d) => d.color))
      .range([0, width])
      .padding(0.1);

    const y = d3
      .scaleLinear()
      .domain([0, d3.max(data, (d) => d.count)])
      .nice()
      .range([height, 0]);

    svg
      .selectAll(".bar")
      .data(data)
      .enter()
      .append("rect")
      .attr("class", "bar")
      .attr("x", (d) => x(d.color))
      .attr("y", (d) => y(d.count))
      .attr("width", x.bandwidth())
      .attr("height", (d) => height - y(d.count))
      .attr("fill", (d) => d.color);

    // svg.append("g").attr("class", "x axis").attr("transform", `translate(0,${height})`).call(d3.axisBottom(x));

    // svg.append("g").attr("class", "y axis").call(d3.axisLeft(y));
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
