<template>
    <div class="component-wrapper">
        <div class="text">
            <div class="title">
                Thematic Dictionary
            </div>
            <div class="sub-title">
                Thematic Dictionary of words that reflect the themes across the speeches
            </div>
        </div>
        <div id="chart-container">
            <div id="thematic-chart"></div>
        </div>
    </div>
</template>

<script>
import * as d3 from 'd3';

export default {
    name: 'ThematicDictionary',
    props: {
        data: Object
    },
    data() {
        return {
            width: 1200,
            height: 800, // Making this square for better circle packing
            svg: null,
            view: null,
            focus: null,
            root: null,
            localData: null
        };
    },
    methods: {
        createCirclePacking() {
            if (!this.localData) return;
            
            // Clear any existing chart
            d3.select('#thematic-chart').html('');
            
            const width = this.width;
            const height = this.height;
            
            // Transform data into hierarchical structure
            const hierarchyData = {
                name: "Themes",
                children: Object.entries(this.localData).map(([theme, words]) => ({
                    name: theme,
                    children: Object.entries(words).map(([word, count]) => ({
                        name: word,
                        value: count,
                        displayName: `${word}: ${count}`
                    }))
                }))
            };
            
            // Create pack layout
            const pack = data => d3.pack()
                .size([width, height])
                .padding(3)(d3.hierarchy(data)
                    .sum(d => d.value)
                    .sort((a, b) => b.value - a.value));
            
            // Create the root hierarchy
            const root = pack(hierarchyData);
            this.root = root;
            let focus = root;
            this.focus = focus;
            
            // Initialize view variable to track zoom state
            let view;
            
            // Create SVG
            const svg = d3.select('#thematic-chart')
                .append('svg')
                .attr('viewBox', `-${width / 1.35} -${height / 1.35} ${width*1.5} ${height*1.5}`)
                .attr('width', width)
                .attr('height', height)
                .style('display', 'block')
                .style('margin', '0 -14px')
                .style('background', 'transparent')
                .style('cursor', 'pointer')
                .on('click', (event) => zoom(event, root));
            
            this.svg = svg;
            
            // Create nodes (circles) with pointer cursor
            const node = svg.append('g')
                .selectAll('circle')
                .data(root.descendants().slice(1)) 
                .join('circle')
                .attr('fill', d => d.children ? '#212121' : 'white') // Dark fill for themes, white for words
                .attr('stroke', d => d.children ? 'white' : 'gray') // White stroke for themes, gray for words
                .attr('stroke-width', 1.5)
                .attr('pointer-events', d => !d.children ? 'none' : null)
                .style('cursor', 'pointer') // Add pointer cursor
                .on('mouseover', function() {
                    d3.select(this)
                        .attr('stroke', d => d.children ? 'white' : 'black')
                        .attr('stroke-width', 3);
                })
                .on('mouseout', function() {
                    d3.select(this)
                        .attr('stroke', d => d.children ? 'white' : 'gray')
                        .attr('stroke-width', 1.5);
                })
                .on('click', (event, d) => {
                    if (focus !== d) {
                        zoom(event, d);
                        event.stopPropagation();
                    }
                });

            // Update text styling with white text for parent circles with background
            const label = svg.append('g')
                .style('font-size', '20px')
                .attr('pointer-events', 'none')
                .attr('text-anchor', 'middle')
                .selectAll('text')
                .data(root.descendants())
                .join('text')
                .style('fill', d => d.children ? 'black' : 'black') // White text for parents, black for leaves
                .style('fill-opacity', d => d.parent === root ? 1 : 0)
                .style('display', d => d.parent === root ? 'inline' : 'none')
                .style('font-weight', d => d.children ? 'bold' : 'normal') // Make theme labels bold
                .style('paint-order', 'stroke')  // Setting paint order to add background
                .style('stroke', d => d.children ? 'rgba(255, 255, 255)' : 'none') // Semi-transparent white background for parent labels
                .style('stroke-width', d => d.children ? '10px' : '0') // Background width
                .style('stroke-linecap', 'round')
                .style('stroke-linejoin', 'round')
                .text(d => d.data.name);

            // Create word count labels (only for leaf nodes)
            const wordCount = svg.append('g')
                .style('font-size', '20px')
                .attr('pointer-events', 'none')
                .attr('text-anchor', 'middle')
                .selectAll('text')
                .data(root.descendants().filter(d => !d.children))
                .join('text')
                .attr('dy', '1.2em') // Position below the word name
                .style('fill', 'black')
                .style('fill-opacity', 0)
                .style('display', 'none')
                .text(d => d.value);
            
            // Initial zoom to root
            zoomTo([root.x, root.y, root.r * 2]);
            
            // Function to set zoom position
            function zoomTo(v) {
                const k = width / v[2];
                
                view = v; // Store current view
                
                // Position each node and label with individual transforms
                node.attr('transform', d => `translate(${(d.x - v[0]) * k},${(d.y - v[1]) * k})`);
                node.attr('r', d => d.r * k);
                
                label.attr('transform', d => `translate(${(d.x - v[0]) * k},${(d.y - v[1]) * k})`);
                
                // Position count labels
                wordCount.attr('transform', d => `translate(${(d.x - v[0]) * k},${(d.y - v[1]) * k})`);
            }
            
            // Handle zoom transitions
            function zoom(event, d) {
                focus = d;
                
                const transition = svg.transition()
                    .duration(750)
                    .tween('zoom', () => {
                        const i = d3.interpolateZoom(
                            view, 
                            [focus.x, focus.y, focus.r * 2]
                        );
                        return t => zoomTo(i(t));
                    });
                
                // Update label visibility
                label
                    .filter(function(d) { 
                        // Show if it's a direct child of current focus, or was previously visible
                        return d.parent === focus || this.style.display === 'inline'; 
                    })
                    .transition(transition)
                    .style('fill-opacity', d => d.parent === focus ? 1 : 0)
                    .on('start', function(d) { 
                        // Show at start of transition if it's a child of new focus
                        if (d.parent === focus) this.style.display = 'inline'; 
                    })
                    .on('end', function(d) { 
                        // Hide at end if not a child of new focus
                        if (d.parent !== focus) this.style.display = 'none'; 
                    });
                
                // Update word count labels
                wordCount
                    .filter(function(d) { 
                        return d.parent === focus || this.style.display === 'inline'; 
                    })
                    .transition(transition)
                    .style('fill-opacity', d => d.parent === focus ? 1 : 0)
                    .on('start', function(d) { 
                        if (d.parent === focus) this.style.display = 'inline'; 
                    })
                    .on('end', function(d) { 
                        if (d.parent !== focus) this.style.display = 'none'; 
                    });
            }
        }
    },
    mounted() {
        // If data is provided as a prop
        if (this.data) {
            this.localData = JSON.parse(JSON.stringify(this.data)); // Deep copy
            this.createCirclePacking();
        } else {
            // Otherwise load from JSON
            d3.json('thematic_dictionary.json')
                .then(data => {
                    this.localData = data;
                    this.createCirclePacking();
                })
                .catch(error => console.error('Error loading data:', error));
        }
    },
    watch: {
        data: {
            handler(newData) {
                if (newData) {
                    this.localData = JSON.parse(JSON.stringify(newData));
                    this.createCirclePacking();
                }
            },
            deep: true
        }
    }
}
</script>

<style>
#chart-container {
    width: 100%;
    display: flex;
    justify-content: center;
}

#thematic-chart {
    /* width: 1000px; */
    /* height: 1000px; */
    position: relative;
}

/* Add additional style to ensure cursor pointer works consistently */
#thematic-chart circle {
    cursor: pointer;
}
</style>