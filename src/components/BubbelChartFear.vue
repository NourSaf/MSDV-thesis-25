<template>
    <div class="chart-container">
            <div class="text">
                <div class="title">
                    Words that reflects THREAT
                </div>
                <div class="sub-title">
                    Words in Alice Weidel Speeches that represtents threat and makes people afraid of the "other"
                </div>
            </div>
            <div id="by-threat"></div>
        </div>
</template>

<script>
import * as d3 from 'd3'

export default {
    name: 'BubbelChartFear', 
    data(){
        return{
            width: 1200, 
            height:800, 
            margin:{
                top:20, 
                right:20, 
                bottom:20, 
                left:20
            },
        }
    }, 
    props:{
        data: Array,
    }, 
    computed:{
        color_scale_threat() {
                return d3.scaleOrdinal()
                    .domain(["threat"])
                    .range(["#ffffff"])
        },
        xscale_threat(){
            return d3.scalePoint()
                .domain(["threat"])
                .range([this.width, this.width])
        },
        rScale(){
            return d3.scaleLinear()
                .domain(d3.extent(this.lotteriesWithStats, d => d.aggregates.numOfUnits))
                .range([5, 20])
    }
    }, 
    watch:{
        data(newData){
            if (newData && newData.length){
                const threat_group = this.data
                    .filter(d => d.group == "threat")
                    .sort( (a , b) => b.count - a.count)
                this.threat_bubbel(threat_group)
                }
        }
    }, 
    methods: {
        threat_bubbel(data) {
                d3.select("#by-threat svg").remove();

                const svg = d3.select("#by-threat")
                    .append("svg")
                    .attr("width", this.width)
                    .attr("height", this.height)
                    .append("g")
                    .attr("class", "bubbel");

                const toolTip = d3.select('#tool-tip-bubble')

                const node = svg.selectAll("circle")
                    .data(data)
                    .enter()
                    .append("circle")
                    .attr("class", d => `threat-${d.word}`)
                    .attr("r", (d) => d.count *7)        
                    .style("fill", d => this.color_scale_threat(d.group))
                    .attr("stroke", "black")
                    .style("stroke-width", 2)
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

                function tick() {
                    node.attr("cx", d => d.x).attr("cy", d => d.y);
                }
                
                const center = [this.width / 2, this.height / 2];

                const simulation_threat = d3.forceSimulation(data)
                    .on("tick", tick)
                    .force("collide", d3.forceCollide().radius(d => 100 + d.r))
                    .force("center", d3.forceCenter(this.width / 2, this.height / 2))
                    .force("x", d3.forceX(center[0]).strength(0.01))
                    .force("y", d3.forceY(center[1]).strength(0.01))
                
                simulation_threat.restart();

                    // .force("x", d3.forceX(this.width/2).strength(0.3).x(d => this.xscale_threat(d.group)))
                    // .force("y", d3.forceY(this.height/2).strength(0.3).y(this.height / 2))
                    // .force("center", d3.forceCenter(this.width / 2, this.height / 2))
                    // .force("collide", d3.forceCollide().radius(d => 1 + d.r))

                // simulation_threat.nodes(data).on("tick", () => {
                //     node
                //         .attr("cx", d => d.x)
                //         // .attr("cy", d => d.y);
                //     });
                // this.simulation_threat = simulation_threat
                
            },
            dragstarted_threat(event, d) {
                if (!event.active) this.simulation_threat.alphaTarget(0.03).restart();
                d.fx = event.x;
                d.fy = event.y;
            },
            dragged_threat(event, d) {
                d.fx = event.x;
                d.fy = event.y;
            },
            dragended_threat(event, d) {
                if (!event.active) this.simulation_threat.alphaTarget(0);
                d.fx = null;
                d.fy = null;
            },
    }, 
    mounted(){
        // d3.select('#by-threat')
        //             .append('svg')
        //             .attr('class', "svg-container")
        //             .attr('height', this.height)
        //             .attr('width', this.width);
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