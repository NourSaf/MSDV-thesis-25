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
            height: 800, 
            svg: null,
            view: null,
            focus: null,
            root: null,
            localData: null,
            observer: null,
            hasAnimated: false
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
            
            // Create SVG with background element
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

            // Add a background rectangle that will fade in
            const background = svg.append('rect')
                .attr('x', -width)
                .attr('y', -height)
                .attr('width', width * 3) // Make it large enough to cover the entire viewBox
                .attr('height', height * 3)
                .attr('fill', 'rgba(255, 255, 255, 0.0)') // Very subtle white background
                .attr('opacity', 0); // Start invisible

            this.svg = svg;
            
            // Create nodes (circles) with invisible initial state for animation
            const node = svg.append('g')
                .selectAll('circle')
                .data(root.descendants().slice(1)) 
                .join('circle')
                .attr('fill', d => d.children ? 'white' : 'white')
                .attr('stroke', d => d.children ? 'white' : 'gray')
                .attr('stroke-width', 1.5)
                .attr('r', 0) // Start with radius 0 for animation
                .attr('opacity', 0) // Start invisible
                .attr('pointer-events', d => !d.children ? 'none' : null)
                .style('cursor', 'pointer')
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
                .style('fill', d => d.children ? 'black' : 'black')
                .style('fill-opacity', 0) // Start with 0 opacity
                .style('display', d => d.parent === root ? 'inline' : 'none')
                .style('paint-order', 'stroke')
                
                
                .text(d => d.data.name);

            // Create word count labels (only for leaf nodes)
            const wordCount = svg.append('g')
                .style('font-size', '20px')
                .attr('pointer-events', 'none')
                .attr('text-anchor', 'middle')
                .selectAll('text')
                .data(root.descendants().filter(d => !d.children))
                .join('text')
                .attr('dy', '1.2em')
                .style('fill', 'black')
                .style('fill-opacity', 0) // Start with 0 opacity
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
            
            // Update the animateBubbles function to include background animation
            this.animateBubbles = () => {
                if (this.hasAnimated) return;
                
                // First animate the background with subtle fade in
                background.transition()
                    .duration(800)
                    .ease(d3.easeQuadOut)
                    .attr('opacity', 1);
                
                // Then animate parent circles
                node.transition()
                    .duration(d => d.children ? 800 : 600)
                    .delay((d, i) => {
                        // Parent circles appear first with fixed delay
                        if (d.children) return i * 100;
                        // Child nodes appear after with staggered delay
                        return 800 + i * 15;
                    })
                    .attr('r', d => d.r * (width / view[2]))
                    .attr('opacity', 1);
                
                // Animate labels after circles start appearing
                label.filter(d => d.parent === focus)
                    .transition()
                    .duration(500)
                    .delay(1000)
                    .style('fill-opacity', 1);
                
                this.hasAnimated = true;
            };
            
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
        },
        
        // Set up the Intersection Observer to detect when chart enters viewport
        setupObserver() {
            const options = {
                root: null, // Use viewport as root
                rootMargin: '0px',
                threshold: 0.2 // Trigger when 20% of the element is visible
            };
            
            this.observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting && !this.hasAnimated) {
                        this.animateBubbles();
                    }
                });
            }, options);
            
            // Observe the chart container
            const chartEl = document.getElementById('thematic-chart');
            if (chartEl) this.observer.observe(chartEl);
        }
    },
    mounted() {
        // If data is provided as a prop
        if (this.data) {
            this.localData = JSON.parse(JSON.stringify(this.data));
            this.createCirclePacking();
            this.$nextTick(() => {
                this.setupObserver();
            });
        } else {
            // Otherwise load from JSON
            d3.json('thematic_dictionary.json')
                .then(data => {
                    this.localData = data;
                    this.createCirclePacking();
                    this.$nextTick(() => {
                        this.setupObserver();
                    });
                })
                .catch(error => console.error('Error loading data:', error));
        }
    },
    beforeUnmount() {
        // Clean up observer when component is destroyed
        if (this.observer) {
            this.observer.disconnect();
        }
    },
    watch: {
        data: {
            handler(newData) {
                if (newData) {
                    this.localData = JSON.parse(JSON.stringify(newData));
                    this.hasAnimated = false; // Reset animation flag
                    this.createCirclePacking();
                    this.$nextTick(() => {
                        this.setupObserver();
                    });
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
    position: relative;
}

/* Add additional style to ensure cursor pointer works consistently */
#thematic-chart circle {
    cursor: pointer;
}
</style>