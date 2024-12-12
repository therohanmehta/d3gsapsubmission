"use client";
import React, { useEffect, useState } from "react";
import * as d3 from "d3";
import GUI from "lil-gui";

const CarbonFootprint = () => {
  const [data, setData] = useState(null);
  const [controls, setControls] = useState({
    barWidthOffset: 50,
    barHeightOffset: 0,
    textYOffset: 25,
  });

  useEffect(() => {
    const gui = new GUI();

    gui.add(controls, "barWidthOffset", 0, 100).onChange((value) => {
      setControls((prev) => ({ ...prev, barWidthOffset: value }));
    });
    gui.add(controls, "barHeightOffset", -500, 500).onChange((value) => {
      setControls((prev) => ({ ...prev, barHeightOffset: value }));
    });
    gui.add(controls, "textYOffset", 0, 50).onChange((value) => {
      setControls((prev) => ({ ...prev, textYOffset: value }));
    });

    return () => {
      gui.destroy();
    };
  }, []);

  // Fetch the data from public/data2.json
  useEffect(() => {
    fetch("/data2.json")
      .then((response) => response.json())
      .then((data) => setData(data));
  }, []);

  const drawBarChart = () => {
    const svg = d3.select("#barChart");
    const width = 750;
    const height = 400;

    // Clear any previous SVG content
    svg.selectAll("*").remove();

    if (!data) return;

    const xScale = d3
      .scaleBand()
      .domain(data.categories.map((d) => d.name))
      .range([0, width])
      .padding(0.1);

    const yScale = d3
      .scaleLinear()
      .domain([0, d3.max(data.categories, (d) => d.value)])
      .range([height, 0]);

    // Add horizontal grid lines
    const yAxis = d3.axisLeft(yScale).ticks(3);
    svg.append("g").attr("class", "grid").call(yAxis.tickSize(-width).tickFormat(""));

    svg
      .selectAll(".bar")
      .data(data.categories)
      .enter()
      .append("path")
      .attr("class", "bar")
      .attr("d", (d) => {
        const x = xScale(d.name);
        const y = yScale(d.value);
        const barWidth = xScale.bandwidth() + controls.barWidthOffset;
        const barHeight = height - controls.barHeightOffset;
        const controlPointX = x + barWidth / 2;
        const controlPointY = y - barHeight; // Adjust the control point to create a parabolic top
        return `M${x},${y} Q${controlPointX},${controlPointY} ${x + barWidth},${y} L${x + barWidth},${y + barHeight} L${x},${y + barHeight} Z`;
      })
      .attr("fill", (d) => d.color);

    svg
      .selectAll("text")
      .data(data.categories)
      .enter()
      .append("text")
      .attr("x", (d) => xScale(d.name) + xScale.bandwidth() / 2)
      .attr("y", (d) => yScale(d.value) - controls.textYOffset) // Adjusted to fit above the parabolic top
      .text((d) => d.value)
      .attr("fill", "black")
      .style("text-anchor", "middle");
  };

  useEffect(() => {
    if (data) {
      drawBarChart();
    }
  }, [data, controls]);

  if (!data) {
    return <div>Loading...</div>;
  }

  return (
    <div style={{ fontFamily: "Arial, sans-serif", padding: "20px" }}>
      <h1>Carbon Footprint</h1>
      <div>
        Total amount of emissions: {data.totalEmissions.value} {data.totalEmissions.unit}
      </div>
      <svg style={{ marginTop: "20px", border: "2px solid red" }} id="barChart" width="900" height="400"></svg>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: "20px" }}>
        <div>
          <h3>Purchased Energy</h3>
          <ul>
            {Object.entries(data.purchasedEnergy).map(([key, value]) => (
              <li key={key}>
                {key}: {value}kg
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3>Emission Over Time</h3>
          <svg id="emissionChart" width="400" height="200"></svg>
        </div>
        <div>
          <h3>Total Emissions</h3>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              width: "200px",
              height: "200px",
              borderRadius: "50%",
              background: "linear-gradient(180deg, #C5B4E3, #E3C5D9)",
            }}
          >
            <span style={{ fontSize: "24px", fontWeight: "bold" }}>{data.emissionPercentage}%</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CarbonFootprint;
