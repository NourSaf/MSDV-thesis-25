<template>
    <div class="chart-container">
      <div class="text">
        <div class="title">Emotional Emphasis</div>
        <div class="sub-title">Total word usage per emotion category</div>
      </div>
      <div id="sentiment-bar"></div>
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
  
        const margin = { top: 50, right: 20, bottom: 50, left: 100 };
        const width = 1000 - margin.left - margin.right;
        const height = 500 - margin.top - margin.bottom;
  
        const svg = d3.select("#sentiment-bar")
          .append("svg")
          .attr("width", width + margin.left + margin.right)
          .attr("height", height + margin.top + margin.bottom)
          .append("g")
          .attr("transform", `translate(${margin.left},${margin.top})`);
  
        // Aggregate total word count per emotion
        const aggregated = d3.rollups(
          this.data,
          v => d3.sum(v, d => +d.Count),
          d => d.Emotion
        ).map(([emotion, total]) => ({ emotion, total }));
  
        // Scales
        const x = d3.scaleBand()
          .domain(aggregated.map(d => d.emotion))
          .range([0, width])
          .padding(0.2);
  
        const y = d3.scaleLinear()
          .domain([0, d3.max(aggregated, d => d.total)])
          .nice()
          .range([height, 0]);
  
        // Axes
        svg.append("g")
          .attr("transform", `translate(0,${height})`)
          .call(d3.axisBottom(x).tickSize(0))
          .selectAll("text")
          .style("font-size", "16px");
  
        svg.append("g")
          .call(d3.axisLeft(y).ticks(10))
          .selectAll("text")
          .style("font-size", "14px");
  
        // Bars
        svg.selectAll(".bar")
          .data(aggregated)
          .enter()
          .append("rect")
          .attr("x", d => x(d.emotion))
          .attr("y", d => y(d.total))
          .attr("width", x.bandwidth())
          .attr("height", d => height - y(d.total))
          .attr("fill", "#ffffff")
          .attr("stroke", "#000");
  
        // Labels
        svg.selectAll(".bar-label")
          .data(aggregated)
          .enter()
          .append("text")
          .attr("x", d => x(d.emotion) + x.bandwidth() / 2)
          .attr("y", d => y(d.total) - 10)
          .attr("text-anchor", "middle")
          .text(d => d.total)
          .style("font-size", "12px")
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
  
  <style scoped>
  .chart-container {
    width: 1200px;
    margin-left: auto;
    margin-right: auto;
    display: flex;
    flex-direction: column;
    justify-content: space-around;
  }

  #sentiment-bar{
    display:flex;
    justify-content: center
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
  