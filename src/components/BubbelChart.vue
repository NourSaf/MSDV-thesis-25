<template>
    <div class="component-wrapper"> 
        <div class="text">
            <div class="title">
                Separating groups
            </div>
            <div class="sub-title">
                <transition name="fade" mode="out-in">
                    <div :key="'subtitle-' + toggleCount" class="animated-text">
                        <template v-if="showAlphabeticOrder">
                            <span v-for="(letter, index) in 'Seperating Groups'" :key="index" 
                                  :style="{ animationDelay: `${index * 100}ms` }" 
                                  class="animated-letter">
                                {{ letter }}
                            </span>
                        </template>
                        <template v-else>
                            <span v-for="(letter, index) in 'Most Count'" :key="index" 
                                  :style="{ animationDelay: `${index * 100}ms` }" 
                                  class="animated-letter">
                                {{ letter }}
                            </span>
                        </template>
                    </div>
                </transition>
            </div>
            
            <div class="chart-toggle">
                <button 
                    class="toggle-btn" 
                    :class="{ 'active': showAlphabeticOrder }"
                    @click="setChartType(true)"
                >
                    Seperating words
                </button>
                <button 
                    class="toggle-btn" 
                    :class="{ 'active': !showAlphabeticOrder }"
                    @click="setChartType(false)"
                >
                    Most Frequent words
                </button>
            </div>
        </div>
        
        <div id="chart-container">
            <div id="you-chart" v-show="showAlphabeticOrder"></div>
            <div id="by-size" v-show="!showAlphabeticOrder"></div>
        </div>
        
        <div id="tool-tip-bubble" class="tool-tip"></div>
    </div>
</template>

<script>
    import * as d3 from 'd3'

    export default {
        name:'BubbelChart',
        data(){
            return {
                width: 1200,
                height: 800,
                margin: {
                    top:20,
                    right: 20,
                    bottom: 20,
                    left: 20
                },
                showAlphabeticOrder: true,
                toggleCount: 0
            }
        },
        props:{
            data: Array,
        },
        computed:{
            color_scale() {
                return d3.scaleOrdinal()
                    .domain([ "you", "they" ])
                    .range([ "#ffffff", "#ffffff" ])
            },
            xscale(){
                return d3.scalePoint()
                    .domain(["you", "they"])
                    .range([50, this.width/2 - 20])
            },
            xscaleFrequency(){
                return d3.scalePoint()
                    .domain(["you", "they"])
                    .range([50, this.width/2 - 20])
            }
        },
        watch: {
            data(newData) {
                if (newData && newData.length) {
                    // Initially render the active chart
                    this.renderActiveChart();
                }
            }
        },
        methods:{
            renderActiveChart() {
                if (this.showAlphabeticOrder) {
                    this.seperatingGroupChart();
                } else {
                    this.mostUsedWord();
                }
            },
            
            setChartType(isAlphabetic) {
                if (this.showAlphabeticOrder !== isAlphabetic) {
                    this.showAlphabeticOrder = isAlphabetic;
                    this.toggleCount++;
                    console.log(`Switched to ${isAlphabetic ? 'Alphabetic' : 'Frequency'} chart`);
                    
                    // Clear any existing SVGs
                    this.clearCharts();
                    
                    // Draw the active chart
                    this.$nextTick(() => {
                        this.renderActiveChart();
                    });
                }
            },
            
            clearCharts() {
                d3.select("#you-chart svg").remove();
                d3.select("#by-size svg").remove();
            },
            
            seperatingGroupChart() {
                // Filter data and split by group
                const filteredData = this.data
                    .filter(d => d.group === "you" || d.group === "they");
                
                // Split into two groups
                const youData = filteredData.filter(d => d.group === "you")
                    .sort((a, b) => d3.descending(a.count, b.count));
                
                const theyData = filteredData.filter(d => d.group === "they")
                    .sort((a, b) => d3.descending(a.count, b.count));
                
                // Clear any existing SVG
                d3.select("#you-chart svg").remove(); 

                // Create SVG
                const svg = d3.select("#you-chart")
                    .append("svg")
                    .attr("width", this.width)
                    .attr("height", this.height);
                
                // Define chart dimensions
                const chartWidth = this.width / 2 - 60;  // Half width for each chart minus padding
                const chartHeight = this.height - 100;   // Height minus padding for axis labels
                
                // Create scales for "you" chart
                const youXScale = d3.scaleBand()
                    .domain(youData.map(d => d.word))
                    .range([0, chartWidth])
                    .padding(0.2);
                
                // USE FIXED Y-SCALE FOR BOTH CHARTS - MAX 600
                const fixedYScale = d3.scaleLinear()
                    .domain([0, 600]) // Fixed y-scale with max of 600
                    .range([chartHeight, 0]);
                
                // Create scales for "they" chart - X scale only, Y scale is shared
                const theyXScale = d3.scaleBand()
                    .domain(theyData.map(d => d.word))
                    .range([0, chartWidth])
                    .padding(0.2);
                
                // Create tooltip
                const toolTip = d3.select('#tool-tip-bubble');
                
                // Create "you" chart group
                const youChart = svg.append("g")
                    .attr("transform", `translate(40, 40)`);
                
                // Add label for "you" chart
                youChart.append("text")
                    .attr("x", chartWidth / 2)
                    .attr("y", -15)
                    .attr("text-anchor", "middle")
                    .attr("font-size", "16px")
                    .style("fill", "white")
                    .text("YOU");
                
                // Add Y axis to "you" chart - using the fixed scale
                youChart.append("g")
                    .call(d3.axisLeft(fixedYScale).ticks(5).tickFormat(d => d))
                    .style("font-size", "12px")
                    .style("color", "white");
                
                // Add X axis to "you" chart - rotated labels
                youChart.append("g")
                    .attr("transform", `translate(0, ${chartHeight})`)
                    .call(d3.axisBottom(youXScale))
                    .selectAll("text")
                    .style("text-anchor", "end")
                    .style("font-size", "12px")
                    .style("fill", "white")
                    .attr("transform", "rotate(-45)")
                    .attr("dx", "-.8em")
                    .attr("dy", ".15em");
                
                // Add "you" data points with animation
                youChart.selectAll(".data-point")
                    .data(youData)
                    .enter()
                    .append("circle")
                    .attr("class", d => `data-point-${d.word}`)
                    .attr("cx", d => youXScale(d.word) + youXScale.bandwidth() / 2)
                    .attr("cy", chartHeight) // Start at bottom of chart
                    .attr("r", 0) // Start with radius 0
                    .attr("fill", "white")
                    .attr("stroke", "black")
                    .attr("stroke-width", 1.5)
                    // Add staggered animation
                    .transition()
                    .duration(800)
                    .delay((d, i) => i * 20) // Staggered delay based on index
                    .attr("cy", d => fixedYScale(+d.count)) // Animate to actual position
                    .attr("r", 8) // Grow to full size
                    .on('end', function() {
                        // After animation completes, attach event handlers
                        d3.select(this)
                            .on('mouseover', function(event) {
                                const data = d3.select(this).datum();
                                toolTip
                                    .transition()
                                    .duration(200)
                                    .style('opacity', 1)
                                    .style('cursor', 'pointer');
                                toolTip
                                    .html(`<strong>Word:</strong> ${data.word}<br><strong>Count:</strong> ${data.count}`)
                                    .style('left', (event.pageX+10) + 'px')
                                    .style('top', (event.pageY+10) + 'px');
                                
                                d3.select(this)
                                    .transition()
                                    .duration(200)
                                    .attr("r", 12)
                                    .attr("fill", "gray")
                                    .style('cursor', 'pointer');
                            })
                            .on('mouseout', function() {
                                toolTip
                                    .transition()
                                    .duration(200)
                                    .style('opacity', 0);
                                
                                d3.select(this)
                                    .transition()
                                    .duration(200)
                                    .attr("r", 8)
                                    .attr("fill", "white");
                            });
                    });
                
                // Create "they" chart group
                const theyChart = svg.append("g")
                    .attr("transform", `translate(${chartWidth + 80}, 40)`);
                
                // Add label for "they" chart
                theyChart.append("text")
                    .attr("x", chartWidth / 2)
                    .attr("y", -15)
                    .attr("text-anchor", "middle")
                    .attr("font-size", "16px")
                    .style("fill", "white")
                    .text("THEY");
                
                // Add Y axis to "they" chart - using the same fixed scale
                theyChart.append("g")
                    .call(d3.axisLeft(fixedYScale).ticks(5).tickFormat(d => d))
                    .style("font-size", "12px")
                    .style("color", "white");
                
                // Add X axis to "they" chart - rotated labels
                theyChart.append("g")
                    .attr("transform", `translate(0, ${chartHeight})`)
                    .call(d3.axisBottom(theyXScale))
                    .selectAll("text")
                    .style("text-anchor", "end")
                    .style("font-size", "12px")
                    .style("fill", "white") 
                    .attr("transform", "rotate(-45)")
                    .attr("dx", "-.8em")
                    .attr("dy", ".15em");
                
                // Add "they" data points with animation
                theyChart.selectAll(".data-point")
                    .data(theyData)
                    .enter()
                    .append("circle")
                    .attr("class", d => `data-point-${d.word}`)
                    .attr("cx", d => theyXScale(d.word) + theyXScale.bandwidth() / 2)
                    .attr("cy", chartHeight) // Start at bottom of chart
                    .attr("r", 0) // Start with radius 0
                    .attr("fill", "white")
                    .attr("stroke", "black")
                    .attr("stroke-width", 1.5)
                    // Add staggered animation
                    .transition()
                    .duration(800)
                    .delay((d, i) => i * 20 + youData.length * 20) // Start after "you" animations
                    .attr("cy", d => fixedYScale(+d.count)) // Animate to actual position
                    .attr("r", 8) // Grow to full size
                    .on('end', function() {
                        // After animation completes, attach event handlers
                        d3.select(this)
                            .on('mouseover', function(event) {
                                const data = d3.select(this).datum();
                                toolTip
                                    .transition()
                                    .duration(200)
                                    .style('opacity', 1)
                                    .style('cursor', 'pointer');
                                toolTip
                                    .html(`<strong>Word:</strong> ${data.word}<br><strong>Count:</strong> ${data.count}`)
                                    .style('left', (event.pageX+10) + 'px')
                                    .style('top', (event.pageY+10) + 'px');
                                
                                d3.select(this)
                                    .transition()
                                    .duration(200)
                                    .attr("r", 12)
                                    .attr("fill", "gray")
                                    .style('cursor', 'pointer');
                            })
                            .on('mouseout', function() {
                                toolTip
                                    .transition()
                                    .duration(200)
                                    .style('opacity', 0);
                                
                                d3.select(this)
                                    .transition()
                                    .duration(200)
                                    .attr("r", 8)
                                    .attr("fill", "white");
                            });
                    });
            },
            
            mostUsedWord() {
                const topPerGroup = Object.values(
                    this.data.reduce((acc, obj) => {
                        const group = obj.group;
                        const count = Number(obj.count);
                        if (!acc[group] || count > Number(acc[group].count)) {
                            acc[group] = obj;
                        }
                        return acc;
                    }, {})
                );
                
                const top_grouped_count = topPerGroup
                    .filter(d => d.group == "they" || d.group == "you")
                    .sort((a, b) => b.count - a.count);
                
                d3.select("#by-size svg").remove();

                const svg = d3.select("#by-size")
                    .append("svg")
                    .attr("class", "svg-container")
                    .attr("width", this.width)
                    .attr("height", this.height)
                    .append("g")
                    .attr("class", "top-words");

                const toolTip = d3.select('#tool-tip-bubble')

                const node = svg.selectAll("circle")
                    .data(top_grouped_count)
                    .enter()
                    .append("circle")
                    .attr("class", d => `top-words-${d.word}`)
                    .attr("r", (d) => d.count - 230)        
                    .attr("cx", this.width/2)
                    .attr("cy", this.height /2)
                    .style("fill", d => this.color_scale(d.group))
                    .attr("stroke", "black")
                    .style("stroke-width", 2)
                    .call(d3.drag()
                        .on("start", this.dragstarted_top)
                        .on("drag", this.dragged_top)
                        .on("end", this.dragended_top)
                    )
                    .on('mouseover', (event, data) => {
                        toolTip
                            .transition()
                            .duration(200)
                            .style('opacity',1)
                            .style('cursor','pointer');
                        toolTip
                            .html(`<strong>Word:</strong> ${data.word}<br><strong>Count:</strong> ${data.count}`)
                            .style('left', (event.pageX+10) + 'px')
                            .style('top', (event.pageY+10)+ 'px')
                        
                        d3.select(event.target)
                            .transition()
                            .duration(200)
                            .style('fill', "gray")
                            .style('cursor','pointer');                        
                    })
                    .on('mousemove', (event) => {
                        toolTip
                            .style('cursor','pointer')  
                            .style('left', (event.pageX+10)+'px')
                            .style('top', (event.pageY+10)+'px')
                    })
                    .on('mouseout', (event) =>{
                        toolTip
                            .transition()
                            .duration(200)
                            .style('opacity',0)
                        d3.select(event.target)
                            .transition()
                            .duration(200)
                            .style('fill', "white")
                    });

                const simulation_top = d3.forceSimulation()
                    .force("x", d3.forceX().strength(0.3).x(d => this.xscaleFrequency(d.group)))
                    .force("y", d3.forceY().strength(0.1).y(this.height / 2))
                    .force("center", d3.forceCenter(this.width / 2, this.height / 2))
                    .force("charge", d3.forceManyBody().strength(1))
                    .force("collide", d3.forceCollide().strength(1).radius(90).iterations(1));

                simulation_top.nodes(top_grouped_count).on("tick", () => {
                    node
                        .attr("cx", d => d.x)
                        .attr("cy", d => d.y);
                });
                
                this.simulation_top = simulation_top;
            },
            
            // Drag handlers for alphabetic chart
            dragstarted(event, d) {
                if (!event.active) this.simulation.alphaTarget(0.03).restart();
                d.fx = event.x;
                d.fy = event.y;
            },
            dragged(event, d) {
                d.fx = event.x;
                d.fy = event.y;
            },
            dragended(event, d) {
                if (!event.active) this.simulation.alphaTarget(0);
                d.fx = null;
                d.fy = null;
            },
            
            // Drag handlers for frequency chart
            dragstarted_top(event, d) {
                if (!event.active) this.simulation_top.alphaTarget(0.03).restart();
                d.fx = event.x;
                d.fy = event.y;
            },
            dragged_top(event, d) {
                d.fx = event.x;
                d.fy = event.y;
            },
            dragended_top(event, d) {
                if (!event.active) this.simulation_top.alphaTarget(0);
                d.fx = null;
                d.fy = null;
            }
        },
        mounted(){
            if (this.data && this.data.length) {
                this.renderActiveChart();
            }
        }
    }
</script>

<style>
    .title{
        font-size: 32px;
        font-weight: 800;
    }

    .sub-title{
        font-size: 16px;
    }
    
    .chart-toggle {
        margin-top: 16px;
        display: flex;
        gap: 16px;
        justify-content: center;
    }

    .toggle-btn {
        padding: 8px 16px;
        border: 1px solid #ffffff;
        background: transparent;
        color: #ffffff;
        border-radius: 20px;
        cursor: pointer;
        font-family: inherit;
        font-size: 14px;
        transition: all 0.3s ease;
    }

    .toggle-btn:hover {
        background-color: rgba(255, 255, 255, 0.1);
    }

    .toggle-btn.active {
        background-color: #ffffff;
        color: #000000;
        font-weight: 500;
    }

    #chart-container {
        position: relative;
        height: 800px;
    }

    .tool-tip {
        position: absolute;
        opacity: 0;
        padding: 10px;
        min-width: 120px;
        background-color: rgb(126, 126, 126);
        pointer-events: none;    
        color:#fff; 
        text-align: left;
        border-radius: 4px;
    }

    .tool-tip:hover{
        cursor: pointer;
    }

    #you-chart, #by-size {
        position: absolute;
        width: 100%;
        height: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
    }

    /* Animation styles */
    .animated-text {
        display: inline-block;
    }

    .animated-letter {
        display: inline-block;
        opacity: 0;
        animation: fadeInLetter 0.5s forwards;
    }

    @keyframes fadeInLetter {
        from {
            opacity: 0;
            transform: translateX(-0.5px);
        }
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }

    /* Transition effects for switching between texts */
    .fade-enter-active,
    .fade-leave-active {
        transition: opacity 0.3s;
    }

    .fade-enter-from,
    .fade-leave-to {
        opacity: 0;
    }
</style>