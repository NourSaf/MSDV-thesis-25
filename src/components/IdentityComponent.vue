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
            <div class="chart-divider"></div>
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
                        data: d 
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
            
            // Find the maximum value across both datasets for consistent scaling
            let maxValue = 0;
            
            // Check "You" hierarchy
            if (filteredYouHierarchy && filteredYouHierarchy.children) {
                filteredYouHierarchy.children.forEach(category => {
                    if (category.children) {
                        category.children.forEach(word => {
                            maxValue = Math.max(maxValue, word.value);
                        });
                    }
                });
            }
            
            // Check "They" hierarchy
            if (filteredTheyHierarchy && filteredTheyHierarchy.children) {
                filteredTheyHierarchy.children.forEach(category => {
                    if (category.children) {
                        category.children.forEach(word => {
                            maxValue = Math.max(maxValue, word.value);
                        });
                    }
                });
            }
            
            // Update both charts with animation and consistent scale
            this.updateChart(this.youSvg, filteredYouHierarchy, maxValue);
            this.updateChart(this.theySvg, filteredTheyHierarchy, maxValue);
        },
        
        updateChart(svg, hierarchyData, maxValue) {
            const width = this.width;
            const height = this.height;
            // Increase margin to prevent overflow
            const margin = 60;
            const isTheySvg = svg === this.theySvg;
            const isYouSvg = svg === this.youSvg;
            const isHighestFilter = this.activeCategory === 'highest';
            
            // Apply scaling factor of 4 to you-group SVG when using highest filter
            const scalingFactor = (isYouSvg && isHighestFilter) ? 4 : 1;
            
            // Clear existing content for a fresh start
            svg.selectAll('*').remove();

            // Create a size scale function with different scaling factors
            const sizeScale = d3.scaleSqrt()
                .domain([0, maxValue])
                .range([10 * scalingFactor, Math.min(width, height) / 6 * scalingFactor]); 
            
            // Prepare data for pack layout
            const packData = {
                name: "root",
                children: []
            };
            
            if (hierarchyData.children) {
                hierarchyData.children.forEach(category => {
                    if (category.children) {
                        category.children.forEach(item => {
                            packData.children.push({
                                name: item.name,
                                value: item.value,
                                category: item.category,
                                originalValue: item.value
                            });
                        });
                    }
                });
            }
            
            // Sort by value (largest first) 
            packData.children.sort((a, b) => b.value - a.value);
            
            // Adjust the number of displayed circles based on scaling factor
            const availableArea = (width - margin * 2) * (height - margin * 2);
            // Fewer circles when scaled up
            const maxCircles = Math.min(isHighestFilter && isYouSvg ? 5 : 40, 
                                       Math.floor(availableArea / (5000 * (isYouSvg && isHighestFilter ? 4 : 1))));
            packData.children = packData.children.slice(0, maxCircles);
            
            // Use a different approach - create the pack layout first
            const packLayout = d3.pack()
                .size([width - margin * 2, height - margin * 2])
                .padding(isYouSvg && isHighestFilter ? 8 : 2) // Reduced padding values
                .radius(d => sizeScale(d.value)); // Using sizeScale here with scaling factor
            
            // Create hierarchy and apply pack layout
            let root = packLayout(d3.hierarchy(packData)
                .sum(d => d.value));
            
            // Check if any circles exceed boundaries and rescale if needed
            const leaves = root.leaves();
            let maxRadius = 0;
            leaves.forEach(leaf => {
                maxRadius = Math.max(maxRadius, leaf.r);
            });
            
            // If largest circle is too big, recreate with smaller scale
            if (maxRadius * 2 > Math.min(width, height) - margin * 2) {
                // Reduce the scale range, but maintain the scaling factor for highest you-group
                const adjustedScale = d3.scaleSqrt()
                    .domain([0, maxValue])
                    .range([5 * scalingFactor, Math.min(width, height) / 8 * scalingFactor]);
                
                // Create new pack layout with adjusted radius function
                const adjustedPackLayout = d3.pack()
                    .size([width - margin * 2, height - margin * 2])
                    .padding(isYouSvg && isHighestFilter ? 8 : 2) // Reduced padding values 
                    .radius(d => adjustedScale(d.value));
                
                // Recreate the hierarchy with adjusted scale
                root = adjustedPackLayout(d3.hierarchy(packData)
                    .sum(d => d.value));
            }
            
            // Create a group element for positioning
            const g = svg.append("g")
                .attr("transform", `translate(${margin}, ${margin})`);
            
            // Get leaf nodes
            const nodes = root.leaves();
            
            const tooltip = d3.select('#tool-tip-identity');
            
            const node = g.selectAll("g")
                .data(nodes)
                .join("g")
                .attr("class", "bubble-node")
                .attr("transform", d => `translate(${d.x},${d.y})`);
            
            // Add circle elements with animations
            const circles = node.append("circle")
                .attr("fill", isTheySvg ? "#ffffff" : "#212121")
                .attr("stroke", isTheySvg ? "#212121" : "white")
                .attr("stroke-width", 1)
                .attr("r", 0)
                .attr("fill-opacity", isTheySvg ? 0 : null);
            
            
            circles.transition()
                .duration(isYouSvg && isHighestFilter ? 1200 : 800) 
                .delay((d, i) => i * 30)
                .ease(d3.easeCubicOut)
                .attr("r", d => d.r)
                .attr("fill-opacity", isTheySvg ? 1 : null)
                .on("end", function() {
                    d3.select(this)
                        .on("mouseover", function(event, d) {
                            tooltip
                                .style("opacity", 0.9)
                                .html(`
                                    <div class="id-tool-tip-title">${d.data.name}</div>
                                    <div>Count: ${d.data.originalValue}</div>
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

            // Adjust text size thresholds for scaled circles
            const textThreshold = isYouSvg && isHighestFilter ? 30 : 15;
            const countThreshold = isYouSvg && isHighestFilter ? 40 : 20;

            // Add text labels showing the word with animations
            node.filter(d => d.r > textThreshold)
                .append("text")
                .attr("text-anchor", "middle")
                .attr("dy", "-0.1em")
                // Larger max font size for scaled circles
                .style("font-size", d => Math.min(d.r / 3, isYouSvg && isHighestFilter ? 24 : 16) + "px")
                .style("fill", isTheySvg ? "#212121" : "white")
                .style("pointer-events", "none")
                .style("opacity", 0)
                .style("transform", "translateY(10px)")
                .text(d => {
                    // Adjust truncation thresholds for scaled circles
                    if ((isYouSvg && isHighestFilter) ? d.r < 80 : d.r < 20) {
                        return d.data.name.slice(0, 5) + (d.data.name.length > 5 ? "..." : "");
                    }
                    if ((isYouSvg && isHighestFilter) ? d.r < 120 : d.r < 30) {
                        return d.data.name.slice(0, 8) + (d.data.name.length > 8 ? "..." : "");
                    }
                    return d.data.name;
                })
                .transition()
                .duration(600)
                // Longer delay for scaled animation
                .delay((d, i) => i * 30 + (isYouSvg && isHighestFilter ? 900 : 600))
                .ease(d3.easeCubicOut)
                .style("opacity", 1)
                .style("transform", "translateY(0px)");

            // Add count values with animations
            node.filter(d => d.r > countThreshold)
                .append("text")
                .attr("text-anchor", "middle")
                .attr("dy", "1em")
                // Larger max font size for count in scaled circles
                .style("font-size", d => Math.min(d.r / 4, isYouSvg && isHighestFilter ? 20 : 14) + "px")
                .style("fill", isTheySvg ? "#212121" : "white")
                .style("opacity", 0)
                .style("transform", "translateY(10px)")
                // .style("font-weight", "bold")
                .style("pointer-events", "none")
                .text(d => d.data.originalValue)
                .transition()
                .duration(600)
                // Longer delay for scaled animation
                .delay((d, i) => i * 30 + (isYouSvg && isHighestFilter ? 1100 : 800))
                .ease(d3.easeCubicOut)
                .style("opacity", 1)
                .style("transform", "translateY(0px)");
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

/* .filter-btn.highest {
    border-color: #E16036;
    border-width: 2px;
} */

.filter-btn.highest.active {
    background-color: #ffffff;
    color: black;
}

#charts-container {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 20px;
    height: 100%;    
    position: relative;
}

.chart-divider {
    width: 1px;
    height: 80%;
    background-color: rgba(255, 255, 255, 0.5);
}

.bubbel-chart-id {
    width: 580px; /* Adjusted to account for divider */
    display: flex;
    flex-direction: column;
    align-items: center;
    position: relative;
}

.bubbel-chart-id::before {
    content: attr(data-title);
    position: absolute;
    top: -40px;
    font-size: 18px;
    font-weight: bold;
    color: white;
    text-align: center;
}

.id-tool-tip {
    position: absolute;
    opacity: 0;
    background-color: rgba(0, 0, 0, 0.8);
    color: white;
    padding: 12px;
    border-radius: 6px;
    pointer-events: none;
    font-size: 16px;
    max-width: 200px;
    z-index: 10;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
    transition: opacity 0.3s;
}

.id-tool-tip-title {
    font-weight: bold;
    font-size: 20px;
    margin-bottom: 15px;
    border-bottom: 1px solid rgba(255,255,255,0.3);
    padding-bottom: 3px;
}

.bubble-node {
    cursor: pointer; /* Add pointer cursor to all bubble nodes */
}

.bubble-node circle {
    transition: stroke-width 0.2s, stroke 0.2s;
}

.bubble-node:hover circle {
    opacity: 0.8;
    stroke-width: 4px !important;
}
</style>