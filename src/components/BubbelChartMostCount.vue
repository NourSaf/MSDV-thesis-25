<template>
    <div class="chart-container">
        <div class="text">
            <div class="title">
                Separating groups
            </div>
            <div class="sub-title">
                The most used words
            </div>
        </div>
        <div id="by-size"></div>
    </div>
</template>
<script>
import * as d3 from 'd3'

export default{
    name:'BubbelChartMostCount', 
    data(){
        return {
            width:1200,
            height:800, 
            margin:{
                top:20, 
                right:20, 
                bottom:20, 
                left:20
            }
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
            
            const topPerGroup = Object.values(
                this.data.reduce((acc, obj) => {
                    const group = obj.group;
                    const count = Number(obj.count); // Convert to number
                    if (!acc[group] || count > Number(acc[group].count)) {
                    acc[group] = obj;
                    }
                    return acc;
                }, {})
                );
            
            const top_grouped_count = topPerGroup
                .filter(d => d.group == "they" || d.group == "you")

            this.drawbiggestBubbles(top_grouped_count)
            
            }
        }
    },
    methods:{
        drawbiggestBubbles(data) {
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
                    .data(data)
                    .enter()
                    .append("circle")
                    .attr("class", d => `top-words-${d.word}`)
                    .attr("r", (d) => d.count -100)        
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

                const simulation_top = d3.forceSimulation()
                    .force("x", d3.forceX().strength(0.3).x(d => this.xscale(d.group)))
                    .force("y", d3.forceY().strength(0.1).y(this.height / 2))
                    .force("center", d3.forceCenter(this.width / 2, this.height / 2))
                    .force("charge", d3.forceManyBody().strength(1))
                    .force("collide", d3.forceCollide().strength(1).radius(40).iterations(1));

                simulation_top.nodes(data).on("tick", () => {
                    node
                        .attr("cx", d => d.x)
                        .attr("cy", d => d.y);
                    });
                this.simulation_top = simulation_top
                
            },
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