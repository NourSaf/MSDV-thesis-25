<template>
    <div class="component-wrapper">
        <div class="text">
            <div class="title">
                Identity Words Analysis
            </div>
            <div class="sub-title">
                Comparing "Us" vs. "Them" identity words across speeches
            </div>
                    <!-- Category filter buttons -->
        <div class="filter-controls">
            <button 
                class="filter-btn all"
                :class="{ active: activeCategory === 'all' }"
                @click="setFilter('all')">
                All Categories
            </button>
            <button 
                class="filter-btn national"
                :class="{ active: activeCategory === 'national' }"
                @click="setFilter('national')">
                National
            </button>
            <button 
                class="filter-btn ideological"
                :class="{ active: activeCategory === 'ideological_political' }"
                @click="setFilter('ideological_political')">
                Ideological/Political
            </button>
            <button 
                class="filter-btn racial"
                :class="{ active: activeCategory === 'racial_ethnic' }"
                @click="setFilter('racial_ethnic')">
                Racial/Ethnic
            </button>
            <button 
                class="filter-btn cultural"
                :class="{ active: activeCategory === 'cultural' }"
                @click="setFilter('cultural')">
                Cultural
            </button>
            <button 
                class="filter-btn religious"
                :class="{ active: activeCategory === 'religious' }"
                @click="setFilter('religious')">
                Religious
            </button>
            <button 
                class="filter-btn highest"
                :class="{ active: activeCategory === 'highest' }"
                @click="setFilter('highest')">
                Highest Count Only
            </button>
        </div>
        </div>
        
        <div id="charts-container">
                <div id="chart-you-id" class="bubbel-chart-id"></div>
                <div id="chart-they-id" class="bubbel-chart-id"></div>
        </div>

        <div id="tool-tip-identity" class="id-tool-tip"></div>
    </div>
</template>

<script>
import * as d3 from 'd3';

export default {
    name: 'IdentityComponent',
    props: {
        data: Array
    },
    data() {
        return {
            width: 600,
            height: 620,
            activeCategory: 'all',
            youGroupData: [],
            theyGroupData: [],
            youSvg: null,
            theySvg: null,
            youHierarchy: null,
            theyHierarchy: null,
            circlePool: [],
            textPool: []
        };
    },
    methods: {
        initializeData() {
            if (!this.data || !this.data.length) return;
            
            // Split data into groups
            this.youGroupData = this.data.filter(d => d.group === 'you_group');
            this.theyGroupData = this.data.filter(d => d.group === 'they_group');
            
            // Create the SVG containers only once
            if (!this.youSvg) {
                this.youSvg = d3.select('#chart-you-id')
                    .append('svg')
                    .attr('width', this.width)
                    .attr('height', this.height)
                    .attr('viewBox', [0, 0, this.width, this.height]);
            }
            
            if (!this.theySvg) {
                this.theySvg = d3.select('#chart-they-id')
                    .append('svg')
                    .attr('width', this.width)
                    .attr('height', this.height)
                    .attr('viewBox', [0, 0, this.width, this.height]);
            }
            
            // Create hierarchical data structures for fast filtering
            this.processHierarchicalData();
        },
        
        processHierarchicalData() {
            // Process "You" group data
            const youByCategory = d3.group(this.youGroupData, d => d.category);
            const youHierarchy = {
                name: "you_group",
                children: Array.from(youByCategory, ([category, words]) => ({
                    name: category,
                    children: words.map(d => ({
                        name: d.word,
                        value: d.count,
                        category: d.category,
                        group: d.group,
                        data: d // Keep original data for reference
                    }))
                }))
            };
            
            // Process "They" group data
            const theyByCategory = d3.group(this.theyGroupData, d => d.category);
            const theyHierarchy = {
                name: "they_group",
                children: Array.from(theyByCategory, ([category, words]) => ({
                    name: category,
                    children: words.map(d => ({
                        name: d.word,
                        value: d.count,
                        category: d.category,
                        group: d.group,
                        data: d // Keep original data for reference
                    }))
                }))
            };
            
            this.youHierarchy = youHierarchy;
            this.theyHierarchy = theyHierarchy;
        },
        
        setFilter(category) {
            if (this.activeCategory !== category) {
                this.activeCategory = category;
                this.updateBubbleCharts();
            }
        },
        
        getFilteredHierarchy(hierarchy) {
            if (this.activeCategory === 'all') {
                return hierarchy;
            } else if (this.activeCategory === 'highest') {
                // For 'highest' filter, find the highest count word across all categories
                let allWords = [];
                hierarchy.children.forEach(category => {
                    allWords = allWords.concat(category.children);
                });
                
                // Sort all words by count and get the highest
                if (allWords.length === 0) return { name: hierarchy.name, children: [] };
                
                const highestWord = allWords.reduce((max, word) => 
                    max.value > word.value ? max : word, allWords[0]);
                
                // Create a new hierarchy with just this word
                return {
                    name: hierarchy.name,
                    children: [{
                        name: highestWord.category,
                        children: [highestWord]
                    }]
                };
            } else {
                // Existing category filtering logic
                return {
                    name: hierarchy.name,
                    children: hierarchy.children
                        .filter(category => category.name === this.activeCategory)
                };
            }
        },
        
        createBubbleCharts() {
            this.initializeData();
            if (!this.youHierarchy || !this.theyHierarchy) return;
            
            this.updateBubbleCharts();
        },
        
        updateBubbleCharts() {
            // Get filtered hierarchies based on current category
            const filteredYouHierarchy = this.getFilteredHierarchy(this.youHierarchy);
            const filteredTheyHierarchy = this.getFilteredHierarchy(this.theyHierarchy);
            
            // Update both charts with animation
            this.updateChart(this.youSvg, filteredYouHierarchy);
            this.updateChart(this.theySvg, filteredTheyHierarchy);
        },
        
        updateChart(svg, hierarchyData) {
            const width = this.width;
            const height = this.height;
            const margin = 10;
            
            // Clear existing content for a fresh start
            svg.selectAll('*').remove();
            
            // Create pack layout
            const pack = d3.pack()
                .size([width - margin * 2, height - margin * 2])
                .padding(3);
            
            // Create the hierarchy and apply the pack layout
            const root = pack(d3.hierarchy(hierarchyData)
                .sum(d => d.value)
                .sort((a, b) => b.value - a.value));
            
            // Create a group element for positioning
            const g = svg.append("g")
                .attr("transform", `translate(${margin}, ${margin})`);
            
            // Get leaf nodes (actual word bubbles)
            const nodes = root.leaves();

            // Only render nodes that are in view or close to view
            const visibleNodes = nodes.filter(d => {
                return d.x >= -100 && d.x <= width + 100 && 
                       d.y >= -100 && d.y <= height + 100;
            });
            
            // Limit number of nodes for performance
            const nodesToRender = visibleNodes.length > 100 
                ? visibleNodes.sort((a, b) => b.value - a.value).slice(0, 100)
                : visibleNodes;
            
            // Create the tooltip
            const tooltip = d3.select('#tool-tip-identity');
            
            // Add bubbles with animation - create groups for each node
            const node = g.selectAll("g")
                .data(nodesToRender)
                .join("g")
                .attr("transform", d => `translate(${d.x},${d.y})`)
                .attr('class', 'bubble-node');
            
            
            node.append("circle")
                .attr("fill", "#ffffff") // Use fixed white color instead of sentiment
                .attr("stroke", "#ffffff")
                .attr("stroke-width", 1)
                .attr("r", 0) 
                .attr("fill-opacity", 0) 
                .transition() 
                .duration(800) 
                .delay((d, i) => i * 30) 
                .ease(d3.easeCubicOut) 
                .attr("r", d => d.r) 
                .attr("fill-opacity", 1) // Fade in to full opacity
                .on("end", function() {
                    // After animation completes, attach event handlers
                    d3.select(this)
                        .on("mouseover", function(event, d) {
                            tooltip
                                .style("opacity", 0.9)
                                .html(`
                                    <div class="tooltip-title">${d.data.name}</div>
                                    <div>Count: ${d.data.value}</div>
                                    <div>Category: ${d.data.category}</div>
                                `)
                                .style("left", (event.pageX + 10) + "px")
                                .style("top", (event.pageY - 28) + "px");
                        })
                        .on("mousemove", function(event) {
                            tooltip
                                .style("left", (event.pageX + 10) + "px")
                                .style("top", (event.pageY - 28) + "px");
                        })
                        .on("mouseout", function() {
                            tooltip.style("opacity", 0);
                        });
                });
            
            // Add text labels with delayed fade-in animation
            node.filter(d => d.r > 20)
                .append("text")
                .attr("text-anchor", "middle")
                .style("font-size", d => Math.min(2 * d.r / 7, 14) + "px")
                .style("fill", "black")
                .style("pointer-events", "none")
                .style("opacity", 0) // Start invisible
                .text(d => d.data.name)
                .transition()
                .duration(400)
                .delay(600) // Wait for circles to mostly grow
                .style("opacity", 1); // Fade in
            
            // Add counts with delayed fade-in animation
            node.filter(d => d.r > 30)
                .append("text")
                .attr("text-anchor", "middle")
                .attr("dy", "1em")
                .style("font-size", d => Math.min(d.r / 7, 12) + "px")
                .style("fill", "black")
                .style("pointer-events", "none")
                .style("opacity", 0) // Start invisible
                .text(d => d.data.value)
                .transition()
                .duration(400)
                .delay(800) // Wait longer than labels
                .style("opacity", 0.7);
            
            // Create a single mousemove handler at the SVG level
            svg.on("mousemove", function(event) {
                if (tooltip.style("opacity") > 0) {
                    tooltip
                        .style("left", (event.pageX + 10) + "px")
                        .style("top", (event.pageY - 28) + "px");
                }
            });
        },
        
        formatCategory(category) {
            switch (category) {
                case 'national':
                    return 'National';
                case 'ideological_political':
                    return 'Ideological/Political';
                case 'racial_ethnic':
                    return 'Racial/Ethnic';
                case 'cultural':
                    return 'Cultural';
                case 'religious':
                    return 'Religious';
                default:
                    return category;
            }
        }
    },
    mounted() {
        this.$nextTick(() => {
            if (this.data) {
                this.createBubbleCharts();
            }
        });
    },
    watch: {
        data: {
            handler(newData) {
                if (newData && newData.length) {
                    this.initializeData();
                    this.createBubbleCharts();
                }
            },
            deep: true
        }
    }
}
</script>

<style>
.component-wrapper{
    width: 1200px;
    margin-left: auto;
    margin-right: auto;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
}

.text{
    padding-top:24px
}

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

    
.chart-toggle {
    margin-top: 16px;
    display: flex;
    gap: 16px;
    justify-content: center;
}

.filter-controls {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    margin-bottom: 30px;
}

.filter-btn {
    background: transparent;
    color: white;
    border: 1px solid white;
    padding: 8px 15px;
    border-radius: 20px;
    cursor: pointer;
    transition: all 0.3s ease;
    font-size: 14px;
}

.filter-btn:hover {
    background-color: rgba(255, 255, 255, 0.1);
}

.filter-btn.active {
    background-color: white;
    color: black;
}

.filter-btn.highest {
    border-color: #E16036;
    border-width: 2px;
}

.filter-btn.highest.active {
    background-color: #E16036;
    color: white;
}

#charts-container {
    display: flex;
    justify-content: center;
    gap: 12px;
    height: 100%;    
}

.charts-column {
    display: flex;
    flex-direction: column;
    align-items: center;
}

.bubbel-chart-id {
    width: 1200px;
    display: flex;
    align-items: center;
    position: relative;
}

.id-tool-tip {
    position: absolute;
    opacity: 0;
    background-color: rgba(0, 0, 0, 0.8);
    color: white;
    padding: 12px;
    border-radius: 6px;
    pointer-events: none;
    font-size: 14px;
    max-width: 200px;
    z-index: 10;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
    transition: opacity 0.3s;
}

.tooltip-title {
    font-weight: bold;
    font-size: 16px;
    margin-bottom: 5px;
    border-bottom: 1px solid rgba(255,255,255,0.3);
    padding-bottom: 3px;
}
.bubble-node circle {
    transition: stroke-width 0.2s, stroke 0.2s;
}

.bubble-node:hover circle {
    opacity: 0.8;
    stroke-width: 4px !important;
}
</style>