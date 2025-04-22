<template>
  <div class="component-wrapper">
    <div class="text">
      <div class="title">Part of Speech Analysis</div>
      <div class="sub-title">Analysis of word frequencies across different parts of speech</div>
    </div>
    <div id="chart-container">
        <div id="pos-chart"></div>
    </div>
  </div>
</template>

<script>
import * as d3 from 'd3';

export default {
  name: 'Pos',
  props: {
    data: Object
  },
  data() {
    return {
      width: 1200,
      height: 800,
      margin: {
        top: 20,
        right: 20,
        bottom: 50,
        left: 20
      }
    };
  },
  computed: {
    processedData() {
      if (!this.data) return [];
      
      const result = [];
      
      // Transform nested object structure into flat array
      Object.entries(this.data).forEach(([pos, words]) => {
        // Skip empty categories or non-object values
        if (!words || typeof words !== 'object') return;
        
        // Add each word as a data point
        Object.entries(words).forEach(([word, count]) => {
          result.push({
            pos,
            word,
            count
          });
        });
      });
      
      return result;
    }
  },
  methods: {
    createScatterPlot() {
      if (!this.processedData.length) return;
      
      // Clear any previous chart
      d3.select('#pos-chart').html('');
      
      const width = this.width - this.margin.left - this.margin.right;
      const height = this.height - this.margin.top - this.margin.bottom;
      
      // Create SVG element
      const svg = d3.select('#pos-chart')
        .append('svg')
        .attr('width', this.width)
        .attr('height', this.height)
        .append('g')
        .attr('transform', `translate(${this.margin.left}, ${this.margin.top})`);
      
      // Get distinct part of speech categories
      const posCategories = [...new Set(this.processedData.map(d => d.pos))];
      
      // Create X scale - ordinal scale for parts of speech
      const x = d3.scaleBand()
        .domain(posCategories)
        .range([0, width])
        .padding(0.1);
      
      // Create Y scale - log scale for counts (since there's a wide range)
      const y = d3.scaleLog()
        .domain([1, d3.max(this.processedData, d => d.count)])
        .nice()
        .range([height, 0]);
      
      // Create color scale
      const color = d3.scaleOrdinal(d3.schemeCategory10)
        .domain(posCategories);
      
      // Add X axis - keep only labels, no lines or ticks
      svg.append('g')
        .attr('transform', `translate(-9, ${height+15})`)
        .call(d3.axisBottom(x).tickSize(0)) // Set tickSize to 0 to remove tick marks
        .call(g => g.select('.domain').remove()) // Remove the domain line
        .selectAll('text')
        .style('font-size', '12px') // Increased font size for better visibility
        .style('text-anchor', 'middle')
        .style('fill', '#ffffff'); // Make text white

      // Remove Y axis entirely (or keep it but make it invisible)
      svg.append('g')
        .call(d3.axisLeft(y).tickSize(0).tickFormat(''))
        .call(g => g.select('.domain').remove())
        .selectAll('text')
        .style('opacity', 0);

      // Add jitter to x positions to avoid overlap
      const jitterWidth = x.bandwidth() * 0.8;
      
      // Create a scatterToolTip
      const scatterToolTip = d3.select('#pos-chart')
        .append('div')
        .attr('class', 'scatterToolTip')
        .style('opacity', 0)
        .style('position', 'absolute')
        .style('background-color', 'rgba(0, 0, 0, 0.7)')
        .style('color', 'white')
        .style('padding', '8px')
        .style('border-radius', '4px')
        .style('pointer-events', 'none')
        .style('font-size', '12px');
      
      // Add dots
      svg.selectAll('circle')
        .data(this.processedData)
        .enter()
        .append('circle')
        .attr('cx', d => x(d.pos) + jitterWidth / 2 + Math.random() * jitterWidth - jitterWidth / 2)
        .attr('cy', d => y(d.count))
        .attr('r', 2)
        // .attr('fill', d => color(d.pos))
        .attr('fill', "white")
        .attr('fill-opacity', 0.7)
        // .attr('stroke', d => d3.rgb(color(d.pos)).darker())
        .attr('stroke', "white")
        .attr('stroke-width', 1)
        .on('mouseover', function(event, d) {
          d3.select(this)
            .transition()
            .duration(100)
            .attr('r', 6) // Increased from 2 for better hover visibility
            .attr('fill', d => color(d.pos))
            .attr('fill-opacity', 1);
          
          // Get position relative to the container
          const chartRect = document.getElementById('pos-chart').getBoundingClientRect();
          const scatterToolTipX = event.clientX - chartRect.left + 10;
          const scatterToolTipY = event.clientY - chartRect.top + 10;
          
          scatterToolTip.transition()
            .duration(100)
            .style('opacity', 0.9);
          
          scatterToolTip.html(`<strong>${d.word}</strong><br>Count: ${d.count}`)
            .style('left', scatterToolTipX + 'px')
            .style('top', scatterToolTipY + 'px');
        })
        .on('mouseout', function() {
          d3.select(this)
            .transition()
            .duration(100)
            .attr('r', 2) // Match original size from earlier in code
            .attr('fill-opacity', 0.7); // Match original opacity
          
          scatterToolTip.transition()
            .duration(200)
            .style('opacity', 0);
        });
      
    }
  },
  mounted() {
    if (this.data) {
      this.$nextTick(() => {
        this.createScatterPlot();
      });
    }
  },
  watch: {
    data: {
      handler() {
        this.$nextTick(() => {
          this.createScatterPlot();
        });
      },
      deep: true
    }
  }
}
</script>

<style>
#pos-chart {
  width: 100%;
  /* height: 650px; */
  /* position: relative; */
}
</style>