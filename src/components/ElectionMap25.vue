<template>
  <div class="map-container">
    <div class="map-description">
      <div class="description-section">
        <div class="title">
          2025 Election Results
        </div>
        <div class="text">
          in 2025 the AfD won 10% of the votes
        </div>
      </div>
    </div>
    <div id="map-2025-container"></div>
    <div id="map-tool-tip" class="map-tool-tip"></div>
  </div>
</template>

<script>
import * as d3 from 'd3';
import { geoMercator, geoPath } from 'd3-geo';

export default {
  name: 'ElectionMap17',
  data() {
    return {
      width: 600,
      height: 800,
      margin: {
        top: 10,
        right: 10,
        bottom: 10,
        left: 10
      },
      electionData: null,
      landData: null
    };
  },
  mounted() {
    this.loadMapData();
  },
  methods: {
    async loadMapData() {
      try {
        // Load both GeoJSON files in parallel
        const [electionData, landData] = await Promise.all([
          d3.json(`maps/012025_election_results.geojson`),
          d3.json(`maps/germany_land.geojson`)
        ]);

        this.electionData = electionData;
        this.landData = landData;

        // Render the map once the data is loaded
        this.renderMap();
      } catch (error) {
        console.error('Error loading map data:', error);
      }
    },

    renderMap() {
      if (!this.electionData) {
        console.error('Election data not available for rendering map');
        return;
      }

      // Clear any existing SVG
      d3.select('#map-2025-container').selectAll('*').remove();

      const width = this.width;
      const height = this.height;
      const margin = this.margin;
      
      // Create SVG container
      const svg = d3.select('#map-2025-container')
        .append('svg')
        .attr('width', width)
        .attr('height', height)
        .attr('viewBox', `0 0 ${width} ${height}`)
        .attr('preserveAspectRatio', 'xMidYMid meet');
      
      // Create tooltip reference
      const tooltip = d3.select('#map-tool-tip');
      
      try {
        // Create projection and path generator
        const projection = geoMercator()
          .fitSize([width - margin.left - margin.right, height - margin.top - margin.bottom], this.electionData);
        
        const path = geoPath().projection(projection);
        
        // Draw electoral districts
        svg.selectAll('.district')
          .data(this.electionData.features)
          .enter()
          .append('path')
          .attr('class', 'district')
          .attr('d', path)
          .attr('fill', d => {
            // Color AfD districts light blue, others gray
            return d.properties['25_winners_Winner'] === 'AfD' ? '#36A7E4' : '#CCCCCC';
          })
          .attr('stroke', '#000000')
          .attr('stroke-width', 0.3)
          .on('mouseover', (event, d) => {
            // Position tooltip using client coordinates
            const tooltipX = event.clientX + 10;
            const tooltipY = event.clientY + 10;
            const middleScreen = window.innerWidth / 2;
            console.log("this is middle of view", middleScreen)
            console.log("This is x mouse posisition", tooltipX - 10)
            
            // Show tooltip with district information
            tooltip.transition()
              .duration(200)
              .style('opacity', 0.8);
            
            tooltip.html(`
              <strong>${d.properties.WKR_NAME || 'N/A'}</strong><br>
              <strong>District #:</strong> ${d.properties.WKR_NR || 'N/A'}<br>
              <strong>Winner:</strong> ${d.properties['25_winners_Winner'] || 'N/A'}<br>
              <strong>Percent:</strong> ${d.properties['25_winners_Percent'] || 'N/A'}%
            `)
              .style('left', `${tooltipX}px`)
              .style('top', `${tooltipY}px`);
              
            // Highlight the hovered district
            d3.select(event.target)
                .style("cursor", "pointer")
                .style('opacity', 0.5)
          })
          .on('mousemove', (event) => {
            // Update tooltip position as mouse moves
            tooltip
              .style('left', (event.clientX + 10) + 'px')
              .style('top', () =>{
                if (event.clientY > 500){
                  return `${event.clientY - 90}px`
                } else{
                  return `${event.clientY}`
                }
              });
            
            d3.select(event.target)
                .style("cursor", "pointer")
                .style('opacity', 0.5)
        })
          .on('mouseout', (event) => {
            // Hide tooltip and remove highlight
            tooltip.transition()
              .duration(500)
              .style('opacity', 0);
              
            d3.select(event.target)
                .style('opacity', 1)
          });
          
        // Draw state boundaries if land data is available
        if (this.landData) {
          svg.selectAll('.land-border')
            .data(this.landData.features)
            .enter()
            .append('path')
            .attr('class', 'land-border')
            .attr('d', path)
            .attr('fill', 'none')
            .attr('stroke', '#121212')
            .attr('stroke-width', 1.2)
            .attr('pointer-events', 'none')
        }
        const validFeatures = this.landData.features.filter((d) => {
          const c = path.centroid(d);
          return !isNaN(c[0]) && !isNaN(c[1]);
        });
        const labelGroup = svg.append('g')
          .attr('class','label-group')

        labelGroup.selectAll('.land-name')
          .data(validFeatures)
          .enter()
          .append('text')
          .attr('transform', (d) => {
            return `translate(${path.centroid(d)})`
          })

          .attr('class', 'land-name')
          .attr('text-anchor', 'middle')
          .attr('dominant-baseline', 'central') // Center text vertically
          .text((d) => d.properties.lan_name)
          .style('fill','#212121')
          .style('font-size','13px')
        
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
  max-width: 1200px;
  height: 100%;
  margin: 0 auto;
  display: flex;
  align-items: center
}

.map-description{
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  width: 100%;
}

.description-section{
  display: flex;
  justify-content: center;
  flex-direction:column ;
}



#map-2025-container {
  display: flex;
  align-items: center;
  width: 100%;
  height: 100%;
  background-color: transparent;
}

.map-tool-tip {
  position: fixed;
  padding: 10px;
  background-color: rgba(0, 0, 0, 0.8);
  color: white;
  border-radius: 4px;
  pointer-events: none;
  opacity: 0;
  z-index: 10000;
  font-size: 14px;
  max-width: 220px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.5);
}

.district:hover {
  cursor: pointer;
}

.land-border {
  pointer-events: none;
}

.land-name {
  font-size: 8px;
  font-weight: bold;
  pointer-events: none;
  user-select: none;
  z-index: 100;
}
</style>