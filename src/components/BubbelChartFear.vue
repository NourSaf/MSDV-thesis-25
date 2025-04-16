<template>
    <div class="chart-container">
        <div class="text">
            <div class="title">
                Words that reflects THREAT
            </div>
            <div class="sub-title">
                Words in Speeches that represent threat and make people afraid of the "other"
            </div>
        </div>
        <div class="chart-container">
            <div id="by-threat"></div>
        </div>
        <div id="tool-tip-bubble" class="tool-tip"></div>
    </div>
</template>

<script>
import * as d3 from 'd3'

export default {
    name: 'BubbelChartFear', 
    data(){
        return{
            width: 800, 
            height: 600, 
            margin:{
                top: 20, 
                right: 20, 
                bottom: 20, 
                left: 20
            },
        }
    }, 
    props:{
        data: Array,
    },
    watch:{
        data(newData){
            if (newData && newData.length){
                const threat_group = this.data
                    .filter(d => d.group == "threat")
                    .sort((a, b) => b.count - a.count)
                this.createTreemap(threat_group)
            }
        }
    }, 
    methods: {
        createTreemap(data) {
            // Remove any existing SVG
            d3.select("#by-threat svg").remove();

            // Create the SVG container
            const svg = d3.select("#by-threat")
                .append("svg")
                .attr("width", this.width)
                .attr("height", this.height)
                .append("g")
                .attr("transform", `translate(${this.margin.left},${this.margin.top})`);

            // Create hierarchical data structure required for treemap
            const hierarchyData = {
                name: "threat",
                children: data.map(d => ({
                    name: d.word,
                    value: d.count,
                    originalData: d // Keep original data for tooltip
                }))
            };

            // Create treemap layout
            const root = d3.hierarchy(hierarchyData)
                .sum(d => d.value)
                .sort((a, b) => b.value - a.value);

            // Define the treemap layout
            const treemapLayout = d3.treemap()
                .size([this.width - this.margin.left - this.margin.right, 
                       this.height - this.margin.top - this.margin.bottom])
                .paddingOuter(10)
                .paddingInner(4);

            // Generate the treemap
            treemapLayout(root);

            // Tooltip reference
            const toolTip = d3.select('#tool-tip-bubble');

            // Create the treemap cells
            const cells = svg.selectAll("g")
                .data(root.leaves())
                .enter()
                .append("g")
                .attr("transform", d => `translate(${d.x0},${d.y0})`);

            // Add rectangles for each cell
            cells.append("rect")
                .attr("width", d => d.x1 - d.x0)
                .attr("height", d => d.y1 - d.y0)
                .attr("fill", "white")
                .attr("stroke", "black")
                .attr("stroke-width", 1)
                .on('mouseover', (event, d) => {
                    toolTip
                        .transition()
                        .duration(200)
                        .style('opacity', 1);
                    toolTip
                        .html(`
                            <strong>Word:</strong> ${d.data.name} <br>
                            <strong>Count:</strong> ${d.data.value}
                        `)
                        .style('left', (event.pageX + 10) + 'px')
                        .style('top', (event.pageY + 10) + 'px');
                    
                    d3.select(event.target)
                        .transition()
                        .duration(200)
                        .attr("fill", "#f0f0f0") // Slight gray highlight on hover
                        .style('cursor', 'pointer');
                })
                .on('mousemove', (event) => {
                    toolTip
                        .style('left', (event.pageX + 10) + 'px')
                        .style('top', (event.pageY + 10) + 'px');
                })
                .on('mouseout', (event) => {
                    toolTip
                        .transition()
                        .duration(200)
                        .style('opacity', 0);
                    d3.select(event.target)
                        .transition()
                        .duration(200)
                        .attr("fill", "white");
                });

            // Add text labels to the cells
            cells.append("text")
                .attr("x", 5)
                .attr("y", 15)
                .text(d => d.data.name)
                .attr("font-size", d => {
                    // Dynamically adjust text size based on cell dimensions
                    const cellWidth = d.x1 - d.x0;
                    const cellHeight = d.y1 - d.y0;
                    const cellSize = Math.min(cellWidth, cellHeight);
                    
                    // Only show text if there's enough space
                    if (cellSize < 30) return 0;
                    if (cellSize < 50) return 10;
                    if (cellSize < 80) return 12;
                    return 14;
                })
                .attr("fill", "black")
                .style("pointer-events", "none"); // Prevent text from interfering with hover
        }
    },
    mounted() {
        // Create tooltip if it doesn't exist
        if (!document.getElementById('tool-tip-bubble')) {
            d3.select('body').append('div')
                .attr('id', 'tool-tip-bubble')
                .attr('class', 'tool-tip');
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

.title {
    font-size: 24px;
    font-weight: 800;
    margin-bottom: 8px;
}

.sub-title {
    font-size: 16px;
    margin-bottom: 30px;
    
}

#by-threat {
    width: 1200px;
    height: 600px;
    display: flex;
    justify-content: center;
    align-items: center;
}

/* Make the tooltip position absolute and ensure it's scoped */
:deep(#tool-tip-bubble) {
    position: absolute;
    opacity: 0;
    padding: 10px;
    background-color: rgba(0, 0, 0, 0.8);
    pointer-events: none;
    color: #fff;
    text-align: left;
    border-radius: 4px;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.3);
    max-width: 200px;
}
</style>