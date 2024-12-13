"use client";
import React, { useRef, useEffect, useState } from "react";
import * as d3 from "d3";
import { gsap } from "gsap"; // Import GSAP
import json from "@/public/data.json";
import { ScrollTrigger } from "gsap/all";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger);
const NetworkGraph = ({ data }) => {
  const svgRef = useRef();
  const [wiggle, setWiggle] = useState(false);
  // State to control the wiggle animation
  const [initialLeaveBack, setInitialLeaveBack] = useState(false);

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
      .attr("style", "max-width: 100%; height: 100vh; ");

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
        d3.drag() // Enable dragging for nodes
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

    return () => {
      simulation.stop();
    };
  }, []); // Add wiggle state as a dependency

  const handleWig = () => {
    // Get all circles and extract data

    const lines = Array.from(svgRef.current.querySelectorAll("line"));
    const circles = Array.from(svgRef.current.querySelectorAll("circle"));
    const circleData = circles.map((circle) => circle.__data__);

    gsap.to(lines, {
      opacity: 0,
      duration: 0.2,
    });
    // Filter out nodes with the color #D6D7E1
    const filteredData = circleData.filter((node) => node.color !== "#D6D7E1");

    // Group data by color
    const groupedData = d3.group(filteredData, (d) => d.color);

    // Sort groups by the number of items in each group
    const sortedGroups = Array.from(groupedData.entries()).sort((a, b) => b[1].length - a[1].length);

    // Set dimensions
    const width = window.innerWidth;
    const height = window.innerHeight;

    // Create an SVG element
    const svg = d3.select(svgRef.current).attr("width", width).attr("height", height).style("background", "#f4f4f4").style("overflow", "visible");

    // Create a scale for the bubbles' radius
    const radiusScale = d3.scaleSqrt().domain([0, 90]).range([10, 100]);

    // Define starting positions for each sorted group
    const groupCenters = sortedGroups.map(([color], index) => ({
      color,
      x: (index + 1) * (width / (sortedGroups.length + 4)),
      y: height / 2,
    }));

    console.log(groupCenters); // Debug group positions

    // Flatten sorted grouped data into a single array while tagging the group center
    const nodes = sortedGroups.flatMap(([color, nodes]) =>
      nodes.map((node) => ({
        ...node,
        groupX: groupCenters.find((g) => g.color === color).x,
        groupY: groupCenters.find((g) => g.color === color).y,
      }))
    );

    // Create a simulation for positioning bubbles
    const simulation = d3
      .forceSimulation(nodes)
      .force("x", d3.forceX((d) => d.groupX).strength(0.2))
      .force("y", d3.forceY((d) => d.groupY).strength(0.2))
      .force(
        "collide",
        d3.forceCollide((d) => radiusScale(4)) // Ensures no overlap
      )
      .on("tick", () => {
        // Bind and update circle elements
        svg
          .selectAll("circle")
          .data(nodes)
          .join("circle")
          .attr("cx", (d) => d.x)
          .attr("cy", (d) => d.y)
          .attr("r", (d) => radiusScale(d.size === "large" ? 10 : d.size === "medium" ? 6 : 4))
          .attr("fill", (d) => d.color)
          .transition() // Add transition for animation
          .duration(2000); // 2 seconds

        // Bind and update text elements (optional, kept here for labels if needed)
        svg
          .selectAll("text")
          .data(nodes)
          .join("text")
          .attr("x", (d) => d.x)
          .attr("y", (d) => d.y)
          .attr("text-anchor", "middle")
          .attr("dy", ".3em")
          .style("font-size", "0px")
          .style("fill", "#fff");
      });

    // Cleanup on component unmount
    return () => {
      simulation.stop();
    };
  };

  const createBarGraph = () => {
    const barData = [
      ["#e1e3f4", 2.5],
      ["#f3d7f0", 2.2],
      ["#d7eef3", 2],
      ["#f3ecd7", 1.8],
    ];

    const width = window.innerWidth / 2;
    const height = window.innerHeight / 1.5; // Set a fixed height for the chart

    // Create SVG element
    const svg = d3.select(svgRef.current).attr("width", width).attr("height", height);

    // Set the maximum bar height you want
    const maxBarHeight = 400;

    // Create a scale for the x-axis based on the number of bars
    const xScale = d3
      .scaleBand()
      .domain(barData.map((d) => d[0])) // Map over the colors
      .range([0, width])
      .padding(0.1);

    // Create a scale for the y-axis based on the values
    const yScale = d3
      .scaleLinear()
      .domain([0, d3.max(barData, (d) => d[1])]) // Max value in the dataset
      .range([0, maxBarHeight]); // Max height for the bars

    // Append bars for the bar chart
    svg
      .selectAll("rect")
      .data(barData)
      .join("rect")
      .attr("x", (d, i) => xScale(d[0])) // Set x position for each bar
      .attr("y", (d) => height - yScale(d[1])) // Position the bar from the bottom of the SVG
      .attr("width", xScale.bandwidth() + 200) // Width of the bars
      .attr("height", (d) => yScale(d[1])) // Bar height based on the value
      .attr("fill", (d) => d[0]); // Fill the bars with the color

    // Add x-axis labels
    svg
      .append("g")
      .selectAll("text")
      .data(barData)
      .join("text")
      .attr("x", (d, i) => xScale(d[0]) + xScale.bandwidth() / 2)
      .attr("y", height - 10) // Position labels at the bottom of each bar
      .attr("text-anchor", "middle")
      .text((d) => d[0])
      .style("font-size", "0px");

    // Optional: Add a y-axis for better readability
  };

  useGSAP(() => {
    const trigger = ScrollTrigger.create({
      trigger: "#bar-graph",
      start: "top 50%",
      end: "top 50%",
      markers: false,
      reverse: true,
      onEnter: () => {
        console.log("onEnter Triggered");
        // Handle forward animation: fade out network graph, show bar graph
        const circles = Array.from(svgRef.current.querySelectorAll("circle"));
        handleWig();
        gsap.to(circles, {
          opacity: 0,
          duration: 1,
          onEnter: () => {
            createBarGraph();
            const barGraph = d3.select(svgRef.current).selectAll("rect");
            gsap.fromTo(barGraph.nodes(), { opacity: 0 }, { opacity: 1, duration: 0.5 });
          },
        });
        setInitialLeaveBack(true);
      },
      onLeaveBack: () => {
        if (initialLeaveBack) {
          console.log("onLeaveBack Triggered");
          handleReverseGraph();
        }
      },
    });

    // Cleanup on component unmount
    // return () => {
    //   trigger.kill();
    // };
  }, [initialLeaveBack]); // Add dependencies to reinitialize ScrollTrigger

  const handleReverseGraph = () => {
    const svg = d3.select(svgRef.current);
    const rects = svg.selectAll("rect");
    const lines = svg.selectAll("line");
    const circles = Array.from(svgRef.current.querySelectorAll("circle"));
    console.log(circles);

    // Fade out rectangles (bar graph)
    gsap.to(rects.nodes(), {
      opacity: 0,
      duration: 0.5,
      onComplete: () => {
        rects.remove(); // Remove bar graph elements
      },
    });

    // handleWig();

    // Fade in lines (connections)
    // gsap.to(lines.nodes(), {
    //   opacity: 1,
    //   duration: 0.5,
    // });

    // Resize and reposition circles based on their __data__ properties
    // gsap.to(circles, {
    //   opacity: 1,
    //   duration: 0.5,
    //   onComplete: () => {
    //     circles.forEach((circle) => {
    //       const data = circle.__data__;
    //       console.log(data);
    //       if (data) {
    //         d3.select(circle).attr("cx", data.x).attr("cy", data.y).attr("r", data.size);
    //       }
    //     });
    //   },
    // });
    // {
    //     "id": "Marguerite",
    //     "group": 3,
    //     "size": 18.5,
    //     "color": "#F3ECD7",
    //     "index": 84,
    //     "x": 1033.4027462516526,
    //     "y": 573.3966848895259,
    //     "vy": 9.638464007869634e-7,
    //     "vx": -0.0028503675523365336,
    //     "groupX": 960,
    //     "groupY": 540
    // }
    gsap.to(circles, {
      opacity: 1,
      duration: 0.5,

      onComplete: () => {
        console.log("its completing now we can run the network graph again");
      },
      // x: 100,
    });
    // makeNetworkGraph();
  };

  function makeNetworkGraph() {
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
      .attr("style", "max-width: 100%; height: 100vh; ");

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
        d3.drag() // Enable dragging for nodes
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

    return () => {
      simulation.stop();
    };
  }

  return (
    <div className="w-full h-full  container mx-auto">
      <div className="w-full  grid grid-cols-12 gap-4 ">
        <div className="w-full h-full col-span-11 ">
          {" "}
          <svg className="sticky top-0 left-0 h-screen" ref={svgRef} style={{ width: "100%" }} />
          {/* <button
            className="px-2 py-3 border bg-blue-300 fixed top-0 left-0 z-50"
            onClick={() => {
              makeNetworkGraph();
            }}
            style={{ marginTop: "20px" }}
          >
            Wiggle Nodes
          </button> */}
        </div>
        <div className="w-full h-[200vh] col-span-1 opacity-0 ">
          <div id="network-graph" className="h-screen text-gray-300 font-extrathin flex flex-col items-center justify-center text-6xl text-center">
            This is the bubble chart
          </div>
          <div id="bar-graph" className="h-screen text-gray-300 font-extrathin flex flex-col items-center justify-center text-6xl text-center">
            Transitioning To Bar Chart{" "}
          </div>
        </div>
      </div>
      {/* <svg ref={svgRef} style={{ width: "100%", height: "500px" }} />
      <button className="px-2 py-3 border bg-blue-300 absolute top-0 left-0 z-50" onClick={handleWig} style={{ marginTop: "20px" }}>
        Wiggle Nodes
      </button> */}
    </div>
  );
};

export default NetworkGraph;
