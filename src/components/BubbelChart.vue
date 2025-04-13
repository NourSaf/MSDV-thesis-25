<template>
    <div class="chart-container">
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
                <el-switch
                    v-model="showAlphabeticOrder"
                    class="custom-switch"
                    style="--el-switch-on-color: #13ce66; --el-switch-off-color: #ff4949"
                    active-text="Most Frequent words"
                    inactive-text="Seperating words"
                    active-color="gray"
                    inactive-color="gray"
                    :active-value="false"
                    :inactive-value="true"
                    @change="handleChartToggle"
                />
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
            
            handleChartToggle() {
                this.toggleCount++;
                console.log(`Switched to ${this.showAlphabeticOrder ? 'Alphabetic' : 'Frequency'} chart`);
                
                // Clear any existing SVGs
                this.clearCharts();
                
                // Draw the active chart
                this.$nextTick(() => {
                    this.renderActiveChart();
                });
            },
            
            clearCharts() {
                d3.select("#you-chart svg").remove();
                d3.select("#by-size svg").remove();
            },
            
            seperatingGroupChart() {
                const filteredData = this.data
                    .filter(d => d.group === "you" || d.group === "they")
                    .sort((a, b) => d3.ascending(a.word, b.word));

                d3.select("#you-chart svg").remove(); 

                const svg = d3.select("#you-chart")
                    .append("svg")
                    .attr("width", this.width)
                    .attr("height", this.height)
                    .append("g");

                const toolTip = d3.select('#tool-tip-bubble')

                const node = svg.selectAll("circle")
                    .data(filteredData)
                    .enter()
                    .append("circle")
                    .attr("class", d => `regular-${d.word}`)
                    .attr("r", 40)
                    .attr("cx", this.width/2)
                    .attr("cy", this.height /2)
                    .style("fill", d => this.color_scale(d.group))
                    .attr("stroke", "black")
                    .style("stroke-width", 2)
                    .call(d3.drag()
                        .on("start", this.dragstarted)
                        .on("drag", this.dragged)
                        .on("end", this.dragended)
                    )
                    .on('mouseover', (event, data) =>{
                        toolTip
                            .transition()
                            .duration(200)
                            .style('opacity',1)
                            .style('cursor','pointer');
                        toolTip
                            .html(`<strong> Word: </strong> ${data.word} <br>`)
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
                
                const simulation = d3.forceSimulation()
                    .force("x", d3.forceX().strength(0.25).x(d => this.xscale(d.group)))
                    .force("y", d3.forceY().strength(0.2).y(this.height / 2))
                    .force("center", d3.forceCenter(this.width / 2, this.height / 2))
                    .force("charge", d3.forceManyBody().strength(8))
                    .force("collide", d3.forceCollide().strength(0.7).radius(42).iterations(1));

                simulation.nodes(filteredData).on("tick", () => {
                    node
                        .attr("cx", d => d.x)
                        .attr("cy", d => d.y);
                });
                
                this.simulation = simulation;
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
                    .on('mouseover', (event, data) =>{
                        toolTip
                            .transition()
                            .duration(200)
                            .style('opacity',1)
                            .style('cursor','pointer');
                        toolTip
                            .html(`<strong> Word: </strong> ${data.word} <br>`)
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
    .chart-container{
        width: 1200px;
        height: 100vh;
        margin-left: auto;
        margin-right: auto;
        display: flex;
        flex-direction: column;
        justify-content: space-around;
    }

    .title{
        font-size: 32px;
        font-weight: 800;
    }

    .sub-title{
        font-size: 16px;
    }
    
    .chart-toggle {
        margin-top: 16px;
    }

    #chart-container {
        position: relative;
        height: 800px;
    }

    .tool-tip {
        position: absolute;
        opacity: 0;
        padding: 8px;
        background-color: rgb(126, 126, 126);
        pointer-events: none;    
        color:#fff; 
        text-align: left;
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