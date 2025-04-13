<template>
  <div class="map-container">
    <div id="map-container"></div>
    <div id="map_tool_tip" class="map_tool_tip"></div>
  </div>
</template>

<script>
import * as d3 from 'd3';

export default {
  mounted() {
    this.loadData();
  },
  methods: {
    async loadData() {
      try {
        // Use the correct path - use require to load from public folder
        const [electionData, stateData] = await Promise.all([
          d3.json('maps/01_17_results.geojson'),
          d3.json('maps/201_land.geojson')
        ]);

        console.log('Data loaded successfully:', {
          electionFeatures: electionData?.features?.length,
          stateFeatures: stateData?.features?.length
        });

        // Debug check for coordinates
        if (electionData?.features?.length) {
          const coord = electionData.features[0].geometry.coordinates;
          console.log('Sample coordinates:', coord);
        }

        this.drawMap(electionData, stateData);
      } catch (error) {
        console.error('Error loading data:', error);
      }
    },
    
    drawMap(wahlkreis, land) {
      if (!wahlkreis || !land) {
        console.error('Data not available for rendering');
        return;
      }

      // Clear existing map
      d3.select('#map-container').html('');
      
      const width = 800, height = 600;
      const margin = { top: 20, right: 20, bottom: 20, left: 20 };

      const svg = d3.select('#map-container')
        .append('svg')
        .attr('width', width)
        .attr('height', height)
        .style('background-color', 'rgba(0,0,0,0)')
        .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

      const map_tool_tip = d3.select('#map_tool_tip');

      // const container = document.getElementById('map-container');
      // const containerRect = container.getBoundingClientRect();
      try {
        const projection = d3.geoMercator()
          .fitExtent([[margin.left, margin.top], [width - margin.right, height - margin.bottom]], wahlkreis);
        
        const path = d3.geoPath().projection(projection);

        // Check if path functions work for some coordinates
        if (wahlkreis.features.length) {
          const testPath = path(wahlkreis.features[0]);
          console.log('Test path generation:', testPath);
        }

        // Draw election district fills with AfD highlighting
        svg.selectAll('.wahlkreis')
          .data(wahlkreis.features)
          .enter()
          .append('path')
          .attr('class', 'wahlkreis')
          .attr('d', path)
          .attr('fill', d => {
            return d.properties['17_winners_Winner'] === 'AfD' ? '#3366cc' : '#cccccc';
          })
          .attr('stroke', '#fff')
          .attr('stroke-width', 0.5)
          .on('mouseover', (event, d) => {

            // position clacualtaino 
            const tooltipX = event.clientX + 10;
            const tooltipY = event.clientY + 10;


            map_tool_tip.transition().duration(200).style('opacity', 0.9);
            map_tool_tip.html(`
              <strong>${d.properties.WKR_NAME || ''}</strong><br/>
              <strong>Winner:</strong> ${d.properties['17_winners_Winner'] || 'N/A'}<br/>
              <strong>Votes:</strong> ${d.properties['17_winners_Votes'] || 'N/A'}<br/>
              <strong>Percent:</strong> ${d.properties['17_winners_Percent'] || 'N/A'}%
            `)
            .style('left', tooltipX  + 'px')
            .style('top', tooltipY  + 'px');
          })
          .on('mousemove', (event) => {
            map_tool_tip.style('left', (event.tooltipX + 10) + 'px')
                   .style('top', (event.tooltipY + 10) + 'px');
          })
          .on('mouseout', () => {
            map_tool_tip.transition().duration(200).style('opacity', 0);
          });

        // Draw state-level outlines on top
        svg.selectAll('.land')
          .data(land.features)
          .enter()
          .append('path')
          .attr('class', 'land')
          .attr('d', path)
          .attr('fill', 'none')
          .attr('stroke', '#333')
          .attr('stroke-width', .6);
      } catch (error) {
        console.error('Error rendering map:', error);
      }
    }
  }
};
</script>

<style scoped>
.map-container {
  position: relative;
  width: 100%;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
}

#map-container {
  width: 800px;
  height: 600px;
  /* background-color: #f9f9f9; */
  border-radius: 8px;
}

.map_tool_tip {
  position: fixed;
  padding: 10px;
  background-color: rgba(0, 0, 0, 0.8);
  color: white;
  border-radius: 4px;
  pointer-events: none;
  opacity: 0;
  z-index: 10000;
  font-size: 14px;
  max-width: 250px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.5);
}
</style>
