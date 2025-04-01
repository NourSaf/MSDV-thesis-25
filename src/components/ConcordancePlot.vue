<template>
        <div id="plot-container"></div>
        <div id="tool-tip" class="tool-tip"></div>
        <div id="plot-title"></div>
</template>

<script>
import * as d3 from 'd3'

export default {
    name:'ConcordancePlot',
    data(){
        return {
            othering_we_group: ["we", "us", "our", "germans", "patriots", "homeland", "people", "german","home","citizens", "citizen", "patriot"],
            othering_they_group: ["they", "them", "migrants", "muslims", "muslim", "arab", "arabs", "criminals", "refugess", "foreigner","foreigners", "islamist", "immigrants", "immigrant", "leftists", "liberals", "liberal", "outsiders", "outsider", "woke", "enemy"],
            threat :["threat", "danger", "invasion", "war", "crisis","flood","wave","violence","crime","terrorism","loss", "Islamization", "remigration", "re-migration"],
            width: 900,
            height: 100,
            margin: {
                top:20,
                right: 20,
                bottom: 20,
                left: 20
            }
        }
    }, 
    props:{
        script_data: Array,
    },
    computed:{
        //processing the text
        text_filter() {
            if (!this.script_data || !Array.isArray(this.script_data)) return [];
            console.log("This is script",this.script_data)
            const result = this.script_data.flatMap((array, arrayIndex) => {
                const filteredArray = array.map((word, wordIndex) => ({
                    word,
                    arrayIndex,
                    wordIndex, 
                    arrayLength: array.length,
                    
                }))
                .filter(d => {
                    const cleanedWord = d.word.toLowerCase().replace(/[^a-zA-Z]/g, '');
                    return this.othering_we_group.includes(cleanedWord) || this.othering_they_group.includes(cleanedWord) || this.threat.includes(cleanedWord);
                });

                // console.log(`Array ${arrayIndex}:`, filteredArray);

                return filteredArray;
            });

            // console.log("Final filtered result:", result);
            return result;
        },
    },
    methods:{
        drawPlots(){
            const plotContainer = d3.selectAll('#plot-container')
            plotContainer.selectAll('svg').remove();
            
            const toolTip = d3.select('#tool-tip')

            const allData = this.text_filter;

            const groupedData = d3.group(allData, d => d.arrayIndex)

            // console.log("ThIS IS GOURP",groupedData)
            groupedData.forEach((dataArray, plotIndex) => {
                const svg = plotContainer
                    .append('svg')
                    .attr('width', this.width)
                    .attr('height', this.height)
                    .attr('class', `con-plot plot-${plotIndex}`)
                    .style('margin-bottom','20px')

                // const position = dataArray.map(d => d.wordIndex)
                // console.log("THIS IS POSITION",position)

                const textLength = dataArray.map(d => d.arrayLength)
                
                const scaler = d3.scaleLinear()
                    .domain([0, d3.max(textLength)])
                    .range([this.margin.left, this.width - this.margin.right]);

                svg.selectAll('line')
                    .data(dataArray)
                    .enter().append('line')
                    .attr('x1', d => scaler(d.wordIndex))
                    .attr('x2', d => scaler(d.wordIndex))
                    .attr('y1', this.margin.top)
                    .attr('y2', this.height - this.margin.bottom)
                    .attr('stroke', d => 
                        d.word && this.othering_we_group.includes(d.word.toLowerCase().replace(/[^a-zA-Z]/g, '')) ? "blue" : //We
                        d.word && this.othering_they_group.includes(d.word.toLowerCase().replace(/[^a-zA-Z]/g, '')) ? "red" :
                        d.word && this.threat.includes(d.word.toLowerCase().replace(/[^a-zA-Z]/g, '')) ? "green" :
                        "black"
                    )
                    .attr('stroke-width', 5)
                    .on('mouseover', (event, data) => { 
                        toolTip
                            .transition()
                            .duration(200)
                            .style('opacity', 1)
                            .style('cursor','pointer');
                        toolTip
                            .html(
                                `
                                <strong> Word: </strong> ${data.word} <br>
                                <strong> Word Index: </strong> ${data.wordIndex} <br>
                                `
                            )
                            .style('left', (event.pageX+10) + 'px')
                            .style('top', (event.pageY+10)+ 'px')
                        
                        d3.select(event.target)
                            .transition()
                            .duration(200)
                            .style('opacity', 0.6)
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
                            .style('opacity', 1)
                       
                    });

                // const xAxis = d3.axisBottom(scaler).tickFormat(d => d);
               
                svg.append('text')
                    .text(`Array Index: ${plotIndex}`)
                    .attr('x', this.margin.left)
                    .attr('y', this.margin.top)
                    .attr('class', 'text-svg')
                    .style('fill', 'white')
                    .style('font-size', '14px');

                svg.append('g')
                    .attr("transform", `translate(0,${this.height - this.margin.bottom})`);
            });

        },

    },
    mounted(){
        this.drawPlots();
    }, 
    updated(){
        this.drawPlots();
    }
}


</script>
<style>



.con-plot{
    border: solid 0.001REM;
    align-items: left;
}

.plot-text{
    font-size: large;
}

.tool-tip {
    position: absolute;
    opacity: 0;
    padding: 10px;
    background-color: rgb(215, 215, 215);
    pointer-events: none;    
    color:#252525; 
    text-align: left;
}

.tool-tip:hover{
    cursor: pointer;
}

.text-svg{
    margin-top: 110px;
    color: white;
    background-color: red;
}

#plot-container{
    display: flex;
    align-items: center;
    flex-direction: column;
    margin: 50px;
}
</style>