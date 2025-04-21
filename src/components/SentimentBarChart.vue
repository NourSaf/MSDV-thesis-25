<template>
    <div class="component-wrapper">
      <div class="text">
        <div class="title">Emotional Emphasis</div>
        <div class="sub-title">Total word usage per emotion category</div>
      </div>
      <div id="chart-container">
        <div id="sentiment-bar"></div>
      </div>
    </div>
  </template>
  
  <script>
  import * as d3 from 'd3';
  
  export default {
    name: "SentimentBarChart",
    props: {
      data: Array
    },
    methods: {
      drawBarChart() {
        d3.select("#sentiment-bar").selectAll("*").remove();
  
        const margin = { top: 50, right: 20, bottom: 50, left: 150 }; // Increased left margin for emotion labels
        const width = 1200 - margin.left - margin.right;
        const height = 700 - margin.top - margin.bottom;
  
        const svg = d3.select("#sentiment-bar")
          .append("svg")
          .attr("width", width + margin.left + margin.right)
          .attr("height", height + margin.top + margin.bottom)
          .append("g")
          .attr("transform", `translate(${margin.left},${margin.top})`);
  
        const aggregated = d3.rollups(
          this.data,
          v => d3.sum(v, d => +d.Count),
          d => d.Emotion
        ).map(([emotion, total]) => ({ emotion, total }));
  
        // Flip the scales - y is now a band scale for emotions
        const y = d3.scaleBand()
          .domain(aggregated.map(d => d.emotion))
          .range([0, height]) // Note the range starts from 0
          .padding(0.2);
  
        // x is now a linear scale for counts
        const x = d3.scaleLinear()
          .domain([0, d3.max(aggregated, d => d.total)])
          .nice()
          .range([0, width]);
  
        // Draw x-axis (counts) at the bottom
        svg.append("g")
          .attr("transform", `translate(0,${height})`)
          .call(d3.axisBottom(x).ticks(10))
          .selectAll("text")
          .style("font-size", "14px");
        
        // Add x-axis label
        svg.append("text")
          .attr("transform", `translate(${width/2}, ${height + 40})`)
          .style("text-anchor", "middle")
          .style("fill", "#ffffff")
          .style("font-size", "16px")
  
        // Draw y-axis (emotions) on the left
        svg.append("g")
          .call(d3.axisLeft(y).tickSize(0))
          .selectAll("text")
          .style("font-size", "16px")
          .style("fill", "#ffffff");
  
        // Draw horizontal bars
        svg.selectAll(".bar")
          .data(aggregated)
          .enter()
          .append("rect")
          .attr("class", "bar")
          .attr("y", d => y(d.emotion)) // Y position based on emotion
          .attr("x", 0) // Start from left edge (0)
          .attr("height", y.bandwidth()) // Height based on band scale
          .attr("width", d => x(d.total)) // Width based on count value
          .attr("fill", "#ffffff")
          .attr("stroke", "#000");
  
        // Add value labels at the end of each bar
        svg.selectAll(".bar-label")
          .data(aggregated)
          .enter()
          .append("text")
          .attr("class", "bar-label")
          .attr("y", d => y(d.emotion) + y.bandwidth() / 2) // Center vertically in bar
          .attr("x", d => x(d.total) + 5) // Position just after bar end
          .attr("dominant-baseline", "middle") // Center text vertically
          .text(d => d.total)
          .style("font-size", "14px")
          .style("fill", "#ffffff");
      }
    },
    mounted() {
      if (this.data && this.data.length) {
        this.drawBarChart();
      }
    },
    watch: {
      data(newData) {
        if (newData && newData.length) {
          this.drawBarChart();
        }
      }
    }
  }
  </script>
  
<style>

  #sentiment-bar{
    position: absolute;
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
  }


  .title {
  font-size: 30px;
  font-weight: 800;
  }

  .sub-title {
  font-size: 16px;
  color: #bbbbbb;
  }

</style>
