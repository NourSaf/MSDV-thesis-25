<template>
  <div class="component-wrapper">
    <div class="text">
      <div class="title">Mood Barometer</div>
      <div class="sub-title">
        This bar chart measures ten core emotions, positive, negative, trust, fear, anticipation, sadness, anger, joy, surprise, and disgust—embedded in AfD speeches.
      </div>
    </div>
    <div id="chart-container">
      <div id="sentiment-bar"></div>
    </div>
    <div id="emotion-bar-tool-tip" class="tooltip"></div>
  </div>
</template>

<script>
import * as d3 from 'd3';

export default {
  name: "SentimentBarChart",
  props: {
    data: Array
  },
  data() {
    return {
      observer: null,
      hasAnimated: false
    }
  },
  methods: {
    drawBarChart(withAnimation = true) {
      d3.select("#sentiment-bar").selectAll("*").remove();

      const margin = { top: 50, right: 100, bottom: 50, left: 150 }; 
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

      // Sort by total count for better visualization
      aggregated.sort((a, b) => b.total - a.total);

      const y = d3.scaleBand()
        .domain(aggregated.map(d => d.emotion))
        .range([0, height]) 
        .padding(0.2);

      const x = d3.scaleLinear()
        .domain([0, d3.max(aggregated, d => d.total)])
        .nice()
        .range([0, width]);

      // Create tooltip reference
      const tooltip = d3.select("#emotion-bar-tool-tip");

      // Draw emotion labels (instead of y-axis)
      svg.selectAll(".emotion-label")
        .data(aggregated)
        .enter()
        .append("text")
        .attr("class", "emotion-label")
        .attr("x", -10)
        .attr("y", d => y(d.emotion) + y.bandwidth() / 2)
        .attr("text-anchor", "end")
        .attr("dominant-baseline", "middle")
        .text(d => d.emotion)
        .style("font-size", "16px")
        .style("fill", "#ffffff")
        .style("opacity", withAnimation ? 0 : 1) // Start invisible if animating
        .style("font-weight", "500");
      
      // Draw horizontal bars with enhanced animation
      const bars = svg.selectAll(".bar")
        .data(aggregated)
        .enter()
        .append("rect")
        .attr("class", "bar")
        .attr("y", d => y(d.emotion)) 
        .attr("x", 0) 
        .attr("height", y.bandwidth()) 
        .attr("width", 0) // Start with width 0
        .attr("fill", "#ffffff")
        .attr("opacity", withAnimation ? 0 : 1) // Start invisible if animating
        .attr("rx", 4) // Rounded corners
        .attr("ry", 4)
        .on("mouseover", function(event, d) {
          // Show tooltip on hover
          tooltip.style("opacity", 1)
            .html(`
              <div class="tooltip-title">${d.emotion}</div>
              <div class="tooltip-count">Count: ${d.total}</div>
            `)
            .style("left", (event.clientX + 10) + "px")
            .style("top", (event.clientY - 40) + "px");
          
          // Highlight the hovered bar
          d3.select(this)
            .attr("opacity", 0.7)
            .attr("stroke", "#FFF")
            .attr("stroke-width", 2)
            .style("cursor", "pointer");
        })
        .on("mousemove", function(event) {
          // Move tooltip with cursor
          tooltip
            .style("left", (event.clientX + 10) + "px")
            .style("top", (event.clientY - 40) + "px");
        })
        .on("mouseout", function() {
          // Hide tooltip and remove highlight
          tooltip.style("opacity", 0);
          d3.select(this)
            .attr("opacity", 1)
            .attr("stroke", "none");
        });

      // If animation is enabled, create a more dramatic entrance
      if (withAnimation) {
        // Animate labels
        svg.selectAll(".emotion-label")
          .transition()
          .duration(800)
          .delay((d, i) => 300 + i * 100)
          .style("opacity", 1);

        
        bars.transition()
          .duration(1500)
          .delay((d, i) => i ) 
          // .ease(d3.easeElasticOut.amplitude(0.001)) // More pronounced elastic effect
          .attr("width", d => x(d.total))
          .attr("opacity", 1);
      } else {
        bars.attr("width", d => x(d.total));
      }
    },

    setupIntersectionObserver() {
      // Create observer to detect when chart is in viewport
      const options = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1 // Trigger when 10% of the element is visible
      };

      this.observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting && !this.hasAnimated) {
            // Chart is now visible, draw with animation
            this.drawBarChart(true);
            this.hasAnimated = true;
          }
        });
      }, options);

      // Start observing the chart container
      const chartContainer = document.getElementById('chart-container');
      if (chartContainer) {
        this.observer.observe(chartContainer);
      }
    }
  },
  
  mounted() {
    if (this.data && this.data.length) {
      this.setupIntersectionObserver();
      // Initial render without animation, will be replaced when in view
      this.drawBarChart(false);
    }
  },
  
  beforeUnmount() {
    // Clean up the observer when component is destroyed
    if (this.observer) {
      this.observer.disconnect();
    }
  },
  
  watch: {
    data(newData) {
      if (newData && newData.length) {
        this.hasAnimated = false;
        this.setupIntersectionObserver();
        this.drawBarChart(false);
      }
    }
  }
}
</script>

<style>
#sentiment-bar {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.title {
  font-size: 30px;
  font-weight: 800;
  margin-bottom: 5px;
}

.sub-title {
  font-size: 16px;
  color: #bbbbbb;
  margin-bottom: 40px;
}

/* Tooltip Styling */
.tooltip {
  position: absolute;
  opacity: 0;
  padding: 10px 14px;
  background-color: rgba(30, 30, 30, 0.9);
  color: white;
  border-radius: 6px;
  pointer-events: none;
  box-shadow: 0 2px 10px rgba(0,0,0,0.4);
  transition: opacity 0.2s;
  z-index: 10;
  max-width: 200px;
}

.tooltip-title {
  font-weight: bold;
  font-size: 16px;
  margin-bottom: 4px;
  border-bottom: 1px solid rgba(255,255,255,0.2);
  padding-bottom: 4px;
}

.tooltip-count {
  font-size: 14px;
}

/* Bar hover effect */
.bar {
  transition: opacity 0.3s, stroke-width 0.3s;
}
</style>
