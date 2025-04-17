<template>
  <Modal :scrollPosition="scrollTop"></Modal>

  <div class="you-they">
    <div class="you-section">YOU</div>
    <div class="they-section">THEY</div>
  </div>
  <el-button class="con-btn"
    @click="show_all_text_info = !show_all_text_info" 
      circle
      >
      <el-icon class="plus" v-if="show_all_text_info"><CirclePlusFilled /></el-icon>
      <el-icon class="plus" v-else><RemoveFilled /></el-icon>  
  </el-button>

  <div class="con-section" :class="{'slide-in': show_all_text_info, 'slide-out': !show_all_text_info}">
    <AllScripts :script_data="speeches_data"/>
  </div>
  
  <div class="main-section">
    <div class="component-chart-section">
      <Landing/>
    </div>
    <div id="scrolly">
      <figure >
        <ElectionMap17 
          v-if="currentStep === 0 && election_results_17 && land_data" 
          :electionData="election_results_17" 
          :landData="land_data"
          key="map-2017" 
          class="map" 
        />
        
        <ElectionMap21 
          v-if="currentStep === 1 && election_results_21 && land_data" 
          :electionData="election_results_21" 
          :landData="land_data"
          key="map-2021" 
          class="map" 
        />
        
        <ElectionMap25 
          v-if="currentStep === 2 && election_results_25 && land_data" 
          :electionData="election_results_25" 
          :landData="land_data" 
          key="map-2025" 
          class="map" 
        />
        

      </figure>

      <article>
        <div class="step">
          <div class="step-content">
            <h3>2017 Election Results</h3>
            <p>In 2017, the AfD won 10% of the votes, marking their initial rise to prominence in German politics.</p>
          </div>
        </div>
      </article>
      
      <article>
        <div class="step">
          <div class="step-content">
            <h3>2021 Election Results</h3>
            <p>By 2021, the AfD managed to maintain their position with 10.3% of the vote despite challenges from the pandemic.</p>
          </div>
        </div>
      </article>
      
      <article>
        <div class="step">
          <div class="step-content">
            <h3>2025 Election Results</h3>
            <p>In 2025, the AfD saw a dramatic increase to 22.6% of the vote, more than doubling their previous results.</p>
          </div>
        </div>
      </article>
    </div>

    <div class="scroll-snap-container">
      <div class="snap-section">
        WHY ARE THEY SO POPULAR? <br>
        To invistigate the rise of the AfD, we will analyze the speeches of the party leaders and their supporters.
      </div>
      <div class="snap-section">
        <BubbelChart :data="grouped_words"/>
      </div>

      <div class="snap-section">
        <BubbelChartFear :data="grouped_words"/>
      </div>

      <div class="snap-section">
        <SentimentBarChart :data="emotion_data"/>
      </div>

      <div class="snap-section">
        <SentimentFilter :data="emotion_data"/>
      </div>
    </div>
    
  </div>

</template>

<script>
import Landing from './components/Landing.vue'
import Modal from './components/Modal.vue'
import AllScripts from './components/AllScripts.vue'
import ElectionMap17 from './components/ElectionMap17.vue'
import ElectionMap21 from './components/ElectionMap21.vue'
import ElectionMap25 from './components/ElectionMap25.vue'
import BubbelChart from './components/BubbelChart.vue'
import SentimentBarChart from './components/SentimentBarChart.vue'
import SentimentFilter from './components/SentimentFilter.vue'
import BubbelChartFear from './components/BubbelChartFear.vue'



// import { nextTick } from 'vue';

import * as d3 from 'd3'
import scrollama from "scrollama";
const scroller = scrollama();

export default {
  name: 'App',
  data(){
    return {      
      scrollTop: 0,
      scripts: null,
      grouped_words: null,
      emotion_data: null,
      speeches_data: null,
      show_all_text_info: true,
      currentStep: 0,
      election_results_17: null,
      election_results_21: null,
      election_results_25: null,
      land_data: null,
    }
  },
  computed:{
    all_texts(){
      if(!this.scripts){
        return null
      }
      return this.scripts.map(d => d.script)
    },
    split_array(){
      if (!this.all_texts){
        return null
      }
      return this.all_texts.map(d => d.split(/\s+/))
    },
    compSectionStyle(){
      const div = document.getElementById("con-div")
      return this.show_all_text_info ? div.style.display = "block" : div.style.display = "none"
    },

  },
  components: {
    Landing,
    Modal, 
    AllScripts,
    ElectionMap17,
    ElectionMap21,
    ElectionMap25,
    BubbelChart,
    BubbelChartFear,
    SentimentBarChart,
    SentimentFilter,
  },
  mounted(){
    Promise.all([
      d3.csv('translated_scripts.csv'),
      d3.csv('Grouped_Word_Frequencies.csv'),
      d3.csv('Emotion_Words.csv'),
      d3.json('speeches_de_en.json'),
      d3.json(`maps/202017_election_results.geojson`),
      d3.json(`maps/032021_election_results.geojson`),
      d3.json(`maps/012025_election_results.geojson`),
      d3.json(`maps/germany_land.geojson`)
    ])
      .then(data => {
        this.scripts = data[0];
        this.grouped_words = data[1];
        this.emotion_data = data[2];
        this.speeches_data = data[3];
        this.election_results_17 = data[4];
        this.election_results_21 = data[5];
        this.election_results_25 = data[6];
        this.land_data = data[7];
        
        // Initialize fullpage.js after data is loaded
        
      })
      .then (() =>{
        scroller
          .setup({
            step: ".step",
            offset: 0.5,
            debug: false,
          })
          .onStepEnter(response => {
            console.log('Step Enter:', response.index);
            this.currentStep = response.index;
          })
          .onStepExit(response => {
            console.log('Step Exit:', response.index, response.direction);
          });
      });
      
    
    window.addEventListener("scroll", this.onScroll);
  },
  unmounted() {
    window.removeEventListener("scroll", this.onScroll);
  },
  methods: {
    onScroll(/*event*/){
      this.scrollTop = window.scrollY;
    },
    toggelConPlott() {
      !this.show_all_text_info ? this.show_all_text_info = true : this.show_all_text_info = false;
      console.log(this.show_all_text_info)
    },
   
  }
}
</script>

<style>

.main-section{
  z-index: 0;
}

.you-they{
  position: fixed;
  display: flex;
  width: 100vw;
  height: 100vh;
  justify-content: space-between;
  align-items: center;
  pointer-events: none;
  font-size: large;
}

.they-section{
  padding: 60px;
}
.you-section{
  padding: 60px;
}

.con-section{
  display: flex;
  position: fixed;
  overflow-y: scroll;
  width: 100vw;
  height: 100vh;
  top: 0;
  left: 0;
  background-color: #121212;
  transition: transform 0.5s ease;
  z-index: 10;
  flex-direction: column;
}

.slide-in{
  transform: translateX(-100%);
}
.slide-out{
  transform: translateX(0%);
}
.con-btn{
  position:fixed;
  right: 40px;
  z-index: 200;
  margin: 20px; 
}

.component-chart-section{
  height: 100vh;
  display: flex;
  align-items: center;
}


#scrolly {
  position: relative;
  padding: 0;
  max-width: 100%;
}

article {
  position: relative;
  padding: 0;
  margin: 0;
  min-height: 115vh;
  z-index: 2;
}

figure {
  position: sticky;
  top: 0;
  height: 100vh;
  width: 100%;
  margin: 0;
  z-index: 1;
}

.step {
  padding: auto 0;
  min-height: 50vh;
  z-index: 1000;
}

.step-content {
  background-color: rgba(0, 0, 0, 0.7);
  padding: 20px;
  border-radius: 5px;
  color: #fff;
  max-width: 400px;
  margin-left: auto;
  margin-right: auto;
}

.scroll-snap-container {
  height: 100vh;
  overflow-y: scroll;
  scroll-snap-type: y mandatory;
  scroll-behavior: smooth;
}

.snap-section {
  height: 100vh;
  margin-left: auto;
  margin-right: auto;
  scroll-snap-align: start;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
}

/* Override any component-specific height settings */
.snap-section > * {
  height: 100%;
}

.omponent-chart-section {
  height: 100vh;
  display: flex;
  align-items: center;
}

/* Add these styles to your existing CSS */

/* Make main section a scroll container with snap points */
.main-section {
  height: 100vh;
  overflow-y: scroll;
  overflow-x: hidden;
  scroll-snap-type: y mandatory;
  scroll-behavior: smooth;
  position: relative;
}

/* Make all direct children of main-section snap to viewport */
.main-section > * {
  scroll-snap-align: start;
  height: 100vh;
  width: 100%;
}

/* Special handling for scrollama section */
#scrolly {
  position: relative;
  height: auto; /* Let it take natural height for all steps */
  min-height: 300vh; /* Approximately 3 steps worth of height */
  padding: 0;
  max-width: 100%;
  /* Don't add scroll-snap inside scrolly to avoid conflicts with scrollama */
}

/* Keep figure sticky while maintaining scrollama behavior */
#scrolly figure {
  position: sticky;
  top: 0;
  height: 100vh;
  width: 100%;
  margin: 0;
  z-index: 1;
}

/* Make scroll-snap-container properly snap inside main-section */
.scroll-snap-container {
  height: 100vh; /* Ensure container takes full height */
  overflow-y: auto;
}

/* Don't let nested snapping interfere with page snapping */
.main-section .scroll-snap-container {
  pointer-events: auto;
  scroll-snap-align: start;
}

/* Fix the typo in your class name and ensure it matches component-chart-section */
.component-chart-section {
  height: 100vh;
  display: flex;
  align-items: center;
}

/* Add smooth transition between sections */
html {
  scroll-behavior: smooth;
}


</style>
