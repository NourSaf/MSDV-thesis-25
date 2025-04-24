<template>
  <div class="component-wrapper">
    <div class="text">
      <div class="title">
        Key Terms Sentiment Analysis
      </div>
      <div class="sub-title">
        Sentiment of key terms across speeches (normalized -100 to 100)
      </div>
      
      <div class="theme-filters">
        <button 
          :class="['filter-btn', { active: activeTheme === 'all' }]"
          @click="filterByTheme('all')">
          All Themes
        </button>
        <button 
          :class="['filter-btn', 'identity-btn', { active: activeTheme === 'identity' }]"
          @click="filterByTheme('identity')">
          Identity
        </button>
        <button 
          :class="['filter-btn', 'economic-btn', { active: activeTheme === 'economic' }]"
          @click="filterByTheme('economic')">
          Economic
        </button>
        <button 
          :class="['filter-btn', 'environment-btn', { active: activeTheme === 'environment' }]"
          @click="filterByTheme('environment')">
          Environment
        </button>
        <!-- New theme buttons -->
        <button 
          :class="['filter-btn', 'political-btn', { active: activeTheme === 'political' }]"
          @click="filterByTheme('political')">
          Political
        </button>
        <button 
          :class="['filter-btn', 'security-btn', { active: activeTheme === 'security' }]"
          @click="filterByTheme('security')">
          Security
        </button>
        <button 
          :class="['filter-btn', 'health-social-btn', { active: activeTheme === 'health_social' }]"
          @click="filterByTheme('health_social')">
          Health & Social
        </button>
      </div>
    </div>
    
    <div id="chart-container">
      <div id="diverging-chart"></div>
    </div>

    <div id="tool-tip-sentiment" class="tool-tip"></div>
  </div>
</template>

<script>
import * as d3 from 'd3';

export default {
  name: 'KeyTermSentiment', 
  data() {
    return {
      width: 1200, 
      height: 800, 
      margin: {
        top: 60, 
        right: 120, 
        bottom: 60, 
        left: 220
      },
      activeTheme: 'all',
      chart: null,
      xScale: null,
      yScale: null,
      colorScale: null,
      tooltip: null,
      sortedData: null,
      limitedData: null,
      wordCount: 20, 
    }
  }, 
  props: {
    data: Array,
  },
  methods: {
    // Normalize sentiment scores to -100 to 100 scale
    normalizeScore(score) {
      return score * 100; // The sentiment scores are already in range of roughly -1 to 1
    },
    
    filterByTheme(theme) {
      this.activeTheme = theme;
      this.updateChart();
    },
    
    // Main chart initialization
    initChart() {
      if (!this.data || !this.data.length) return;
      
      const containerWidth = this.width;
      const containerHeight = this.height;
      const chartWidth = containerWidth - this.margin.left - this.margin.right;
      const chartHeight = containerHeight - this.margin.top - this.margin.bottom;
      
      // Prepare the tooltip
      this.tooltip = d3.select('#tool-tip-sentiment');
      
      // Set up the SVG container
      this.chart = d3.select('#diverging-chart')
        .append('svg')
        .attr('width', containerWidth)
        .attr('height', containerHeight)
        .append('g')
        .attr('transform', `translate(${this.margin.left}, ${this.margin.top})`);
      
      // Set up scales
      this.xScale = d3.scaleLinear()
        .range([0, chartWidth]);
      
      this.colorScale = d3.scaleLinear()
        .domain([-100, 0, 100])
        .range(['#d73027', '#f7f7f7', '#1a9850']);
      
      // Create x-axis group
      this.chart.append('g')
        .attr('class', 'x-axis')
        .attr('transform', `translate(0, ${chartHeight})`);
      
      // Create y-axis group - it will be positioned in updateChart
      this.chart.append('g')
        .attr('class', 'y-axis');
      
      // Initial chart rendering
      this.updateChart();
    },
    
    // Update chart based on active theme filter
    updateChart() {
      if (!this.data || !this.data.length) return;
      
      const chartHeight = this.height - this.margin.top - this.margin.bottom;
      
      // Filter data by theme
      let filteredData = this.data;
      if (this.activeTheme !== 'all') {
        filteredData = this.data.filter(d => d.theme === this.activeTheme);
      }
      
      // Sort by the absolute value of sentiment and take the top N words
      this.sortedData = [...filteredData]
        .sort((a, b) => Math.abs(b.sentiment) - Math.abs(a.sentiment))
        .slice(0, this.wordCount);
      
      // Sort for display - positive values on top, negative values on bottom
      this.sortedData.sort((a, b) => a.sentiment - b.sentiment);
      
      // Update scales
      const maxSentiment = d3.max(this.sortedData, d => Math.abs(this.normalizeScore(d.sentiment)));
      this.xScale.domain([-maxSentiment, maxSentiment]);
      
      this.yScale = d3.scaleBand()
        .domain(this.sortedData.map(d => d.word))
        .range([chartHeight, 0])
        .padding(0.2);
      
      // Update x-axis with transitions
      const xAxis = d3.axisBottom(this.xScale)
        .tickFormat(d => `${Math.abs(d)}%`)
        .ticks(5);
      
      this.chart.select('.x-axis')
        .transition()
        .duration(1000)
        .call(xAxis);
      
      // Don't display y-axis at all
      this.chart.select('.y-axis')
        .style('display', 'none');
      
      // Bind data to bars
      const barGroups = this.chart.selectAll('.bar-group')
        .data(this.sortedData, d => d.word);
      
      // Remove exiting bars
      barGroups.exit()
        .transition()
        .duration(500)
        .attr('width', 0)
        .remove();
      
      // Create new bar groups for entering data
      const enterGroups = barGroups.enter()
        .append('g')
        .attr('class', 'bar-group');
      
      // Add rectangles to entering groups
      enterGroups.append('rect')
        .attr('class', 'bar')
        .attr('y', d => this.yScale(d.word))
        .attr('height', this.yScale.bandwidth())
        .attr('x', this.xScale(0))
        .attr('width', 0)
        .attr('fill', d => this.colorScale(this.normalizeScore(d.sentiment)))
        .attr('data-word', d => d.word)
        .style('opacity', 0.8);
      
      // Merge and update all bars
      const allGroups = enterGroups.merge(barGroups);
      
      // Update all rectangles with transitions
      allGroups.select('.bar')
        .transition()
        .duration(1000)
        .attr('y', d => this.yScale(d.word))
        .attr('height', this.yScale.bandwidth())
        .attr('x', d => d.sentiment < 0 ? this.xScale(this.normalizeScore(d.sentiment)) : this.xScale(0))
        .attr('width', d => Math.abs(this.xScale(this.normalizeScore(d.sentiment)) - this.xScale(0)))
        .attr('fill', d => this.colorScale(this.normalizeScore(d.sentiment)));
      
      // Add mouseover effects
      allGroups.selectAll('.bar')
        .on('mouseover', (event, d) => {
          const normalizedScore = this.normalizeScore(d.sentiment).toFixed(1);
          
          // Enhanced tooltip with word display
          this.tooltip
            .style('opacity', 0.9)
            .html(`
              <div class="tooltip-title">${d.word}</div>
              <div>Theme: ${d.theme}</div>
              <div>Sentiment: ${normalizedScore}%</div>
              <div>Frequency: ${d.frequency}</div>
            `)
            .style('left', (event.clientX + 10) + 'px')  // Changed to clientX for better positioning
            .style('top', (event.clientY - 28) + 'px');  // Changed to clientY for better positioning
          
          // Just highlight the bar
          d3.select(event.target)
            .style('opacity', 1)
            .style('stroke', '#333')
            .style('stroke-width', 2);
        })
        .on('mousemove', (event) => {
          // Update tooltip position on mouse move
          this.tooltip
            .style('left', (event.clientX + 10) + 'px')
            .style('top', (event.clientY - 28) + 'px');
        })
        .on('mouseout', (event) => {
          this.tooltip.style('opacity', 0);
          
          d3.select(event.target)
            .style('opacity', 0.8)
            .style('stroke', 'none');
        });
    },
  },
  mounted() {
    this.$nextTick(() => {
      if (this.data && this.data.length) {
        this.initChart();
      }
    });
  },
  watch: {
    data: {
      handler(newData) {
        if (newData && newData.length) {
          if (!this.chart) {
            this.initChart();
          } else {
            this.updateChart();
          }
        }
      },
      deep: true
    }
  }
}
</script>

<style>


.theme-filters {
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
}

.filter-btn {
  background: transparent;
  border: 1px solid white;
  color: white;
  padding: 8px 16px;
  border-radius: 20px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s ease;
}

.filter-btn:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.filter-btn.active {
  background-color: white;
  color: black;
}

#chart-container {
  width: 100%;
  height: 100%;
}

.tool-tip {
  position: absolute;
  opacity: 0;
  padding: 10px;
  background-color: rgba(0, 0, 0, 0.8);
  color: white;
  border-radius: 4px;
  pointer-events: none;
  max-width: 200px;
  z-index: 10;
  transition: opacity 0.3s;
}

.tooltip-title {
  font-weight: bold;
  font-size: 16px;
  margin-bottom: 5px;
  border-bottom: 1px solid rgba(255,255,255,0.3);
  padding-bottom: 3px;
}

/* D3 specific styles */
:deep(.x-axis path),
:deep(.y-axis path),
:deep(.x-axis line),
:deep(.y-axis line) {
  stroke: #888;
}

:deep(.x-axis text),
:deep(.y-axis text) {
  fill: #cccccc;
  font-size: 12px;
}
</style>