<template>

    <div class="chart-container">
        <div class="text">
            <div class="title">
                Separating groups
            </div>
            <div class="sub-title">
                Framing Groups: How Language Separates 'You' from 'They'
            </div>
        </div>
        <div id="you-chart"></div>
        <div id="tool-tip-bubble"></div>
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
                    .range([this.width/2 +20, this.width-50])
            },
            
        },
        watch: {
            data(newData) {
                if (newData && newData.length) {
                const filteredData = newData
                    .filter(d => d.group === "you" || d.group === "they")
                    .sort((a, b) => b.count - a.count);

                this.drawBubbles(filteredData);
                
                }
            }
        },
        methods:{
            drawBubbles(data) {
                d3.select("#you-chart svg").remove(); 

                const svg = d3.select("#you-chart")
                .append("svg")
                .attr("width", this.width)
                .attr("height", this.height)
                .append("g");

                const toolTip = d3.select('#tool-tip-bubble')

                const node = svg.selectAll("circle")
                .data(data)
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
                            .html(
                                `
                                <strong> Word: </strong> ${data.word} <br>
                                `
                            )
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
                    .force("x", d3.forceX().strength(0.2).x(d => this.xscale(d.group)))
                    .force("y", d3.forceY().strength(0.1).y(this.height / 2))
                    .force("center", d3.forceCenter(this.width / 2, this.height / 2))
                    .force("charge", d3.forceManyBody().strength(1.2))
                    .force("collide", d3.forceCollide().strength(1.3).radius(40).iterations(1));

                simulation.nodes(data).on("tick", () => {
                    node
                        .attr("cx", d => d.x)
                        .attr("cy", d => d.y);
                    });

                this.simulation = simulation;
            },
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

            
        },
        mounted(){
            
        }, 
        updated(){

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
        font-size: 30px;
        font-weight: 800;
    }

    .sub-title{
        font-size: 16px;
    }

    #tool-tip-bubble {
        position: absolute;
        opacity: 0;
        padding: 10px;
        background-color: rgb(126, 126, 126);
        pointer-events: none;    
        color:#fff; 
        text-align: left;
    }

    .tool-tip:hover{
        cursor: pointer;
    }

    .text-svg{
        margin-top: 110px;
        color: white;
        background-color: rgb(197, 197, 197);
    }

    #you-chart{
        width: auto;
        display: flex;
        justify-content: center;
        align-items: center;
        margin-left: auto;
        margin-right: auto;
    }

    #by-size{
        width: auto;
        display: flex;
        justify-content: center;
        align-items: center;
        margin-left: auto;
        margin-right: auto;
    }

    #by-threat{
        width: auto;
        display: flex;
        justify-content: center;
        align-items: center;
        margin-left: auto;
        margin-right: auto;
    }

</style>