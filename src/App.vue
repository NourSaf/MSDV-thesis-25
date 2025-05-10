<template>
  <!-- Add responsive overlay -->
  <div class="screen-size-overlay" v-if="isSmallScreen">
    <div class="overlay-content">
      <div class="overlay-icon">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
          <path d="M8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0zm1 3a1 1 0 0 0-2 0v5a1 1 0 0 0 2 0V3zm0 8a1 1 0 1 0-2 0 1 1 0 0 0 2 0z"/>
        </svg>
      </div>
      <h2>Screen Size Too Small</h2>
      <p>This website is only available on bigger screens.</p>
      <p>Please use a laptop or tablet to see the full content.</p>
    </div>
  </div>

  <Modal :scrollPosition="scrollTop"></Modal>

  <div class="you-they">
    <div 
      class="you-section" 
      :class="{ 'bold-text': youScale > 1 }"
      :style="{ transform: `scale(${youScale})` }"
    >
    <span class="outlined-text">YOU</span>
    </div>
    <div 
      class="they-section" 
      :class="{ 'bold-text': theyScale > 1 }"
      :style="{ transform: `scale(${theyScale})` }"
    >
      THEM
    </div>
  </div>
  <el-button class="con-btn"
    @click="show_all_text_info = !show_all_text_info" 
      circle
      >
      <el-icon class="plus" v-if="show_all_text_info"><CirclePlusFilled /></el-icon>
      <el-icon class="plus" v-else><RemoveFilled /></el-icon>  
  </el-button>

  <div class="con-section" :class="{'slide-in': show_all_text_info, 'slide-out': !show_all_text_info}">
    <AllScripts 
      :script_data="speeches_data" 
      :is-visible="!show_all_text_info" 
    />
  </div>

  <div class="main-section">
    <div class="component-chart-section">
      <Landing :thematicDictionary="thematic_dictionary"/>
    </div>

    <div class="snap-section">
        <h3 class="separator-section">
          MAPPING THE RISE OF THE ALTERNATIVE FOR GERMANY (AFD)
        </h3>   
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
            <p>
                In 2017 the AfD secured <span class="blue-text-highlight">12.6 %</span>  of the vote and won <span class="blue-text-highlight">three constituencies</span>, marking its first significant entry into Germany’s political landscape.
            </p>
          </div>
        </div>
      </article>
      
      <article>
        <div class="step">
          <div class="step-content">
            <h3>2021 Election Results</h3>
            <p>In 2021 the AfD won <span class="blue-text-highlight">16 constituencies</span>, 13 more than in 2017.</p>
          </div>
        </div>
      </article>
      
      <article>
        <div class="step">
          <div class="step-content">
            <h3>2025 Election Results</h3>
            <p>
                In 2025 the AfD’s vote share jumped to <span class="blue-text-highlight">20.6%</span>, twice its 2021 result, and it captured  <span class="blue-text-highlight">42 constituencies</span>.
            </p>
          </div>
        </div>
      </article>
    </div>

    <div class="scroll-snap-container">
      <div class="snap-section">
        <h3 class="separator-section">
          HOW DOES THEIR LANGUAGE HELP REINFORCE THIS DIVISION? <br>
        </h3>
      </div>
    
      <div class="snap-section" ref="identitySection">
        <IdentityComponent 
          v-if="isIdentitySectionVisible"
          :data="identity_analysis"/>
      </div>
      
      <!-- <div class="snap-section">
        <ThematicDictionary 
          :data="thematic_dictionary" 
        />
      </div> -->

      <div class="snap-section">
        <h3 class="separator-section">
         SENTIMENT ANALYSIS - HOW DOES THE AfD SOUND?
        </h3>
      </div>

      <div class="snap-section">
        <SentimentBarChart :data="emotion_data"/>
      </div>

      <div class="snap-section" ref="keySentimentSection">
        <KeyTermSentiment 
          v-if="isKeySentimentSectionVisible"
          :data="key_sentiment"/>
      </div>

      <div class="snap-section">
        <div class="separator-section">
            <h3 class="sep-title">
              CAN AN ALGORITHM DETECT A SPEECH'S POLITICAL LEANING? <br>
            </h3>
            <h6 class="sep-subtitle">
              Division Detector AI converts any speech into a numerical embedding and pass it to a classifier trained on thousands of parliamentary and campaign texts. The model returns whether the speech is left, neutral, or right leaning, making it possible to flag right-leaning rhetoric as an early warning signal of growing political polarization. Visitors can  paste any statement into the interface to see how the model evaluates its ideological lean.
            </h6>  
        </div>

       
      </div>
      
      <div class="snap-section">
        <RightDetector/>
      </div>
      
      <div class="snap-section sources-section">
        <Sources />
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
import SentimentBarChart from './components/SentimentBarChart.vue'
// import ThematicDictionary from './components/ThematicDictionary.vue'
import IdentityComponent from './components/IdentityComponent.vue'
import RightDetector from './components/RightDetector.vue'
import KeyTermSentiment from './components/KeyTermSentiment.vue'
import Sources from './components/Sources.vue'

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
      filteredPosData: null,
      thematic_dictionary: null,
      identity_analysis: null,
      isIdentitySectionVisible: false,
      identityObserver: null,
      key_sentiment: null,
      isKeySentimentSectionVisible: false,
      keySentimentObserver: null,
      mouseX: 0,
      windowWidth: 0,
      isSmallScreen: false,
      screenWidth: window.innerWidth,
      minScreenWidth: 1024
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
    youScale() {
      const bufferZoneWidth = this.windowWidth * 0.06; // 20% of screen width for buffer
      const leftZoneEnd = (this.windowWidth - bufferZoneWidth) / 2;
      return this.mouseX < leftZoneEnd ? 2 : 1;
    },
    theyScale() {
      const bufferZoneWidth = this.windowWidth * 0.06; // 20% of screen width for buffer
      const rightZoneStart = (this.windowWidth + bufferZoneWidth) / 2;
      return this.mouseX > rightZoneStart ? 2 : 1;
    }
  },
  components: {
    Landing,
    Modal, 
    AllScripts,
    ElectionMap17,
    ElectionMap21,
    ElectionMap25,
    SentimentBarChart,
    // ThematicDictionary,
    IdentityComponent,
    RightDetector,
    KeyTermSentiment,
    Sources
  },
  mounted(){
    this.setupIdentityObserver();
    this.setupKeySentimentObserver();
    
    Promise.all([
      d3.csv('translated_scripts.csv'),
      d3.csv('Grouped_Word_Frequencies.csv'),
      d3.csv('Emotion_Words.csv'),
      d3.json('speeches_de_en.json'),
      d3.json(`maps/202017_election_results.geojson`),
      d3.json(`maps/032021_election_results.geojson`),
      d3.json(`maps/012025_election_results.geojson`),
      d3.json(`maps/germany_land.geojson`),
      d3.json(`thematic_dictionary.json`),
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
        this.thematic_dictionary = data[8];
        console.log('Thematic Dictionary:', this.thematic_dictionary);
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
      })
      .catch(error => {
        console.error("Error loading data:", error);
      });
      
    // Add window width tracking
    this.windowWidth = window.innerWidth;
    window.addEventListener('resize', this.handleResize);
    
    // Add mouse movement tracking
    document.addEventListener('mousemove', this.handleMouseMove);
    
    window.addEventListener("scroll", this.onScroll);

    // Check screen size on initial load
    this.checkScreenSize();
    
    // Add resize event listener to check screen size on resize
    window.addEventListener('resize', this.checkScreenSize);
  },
  unmounted() {
    window.removeEventListener("scroll", this.onScroll);
    
    if (this.identityObserver) {
      this.identityObserver.disconnect();
    }
    
    if (this.keySentimentObserver) {
      this.keySentimentObserver.disconnect();
    }
    
    window.removeEventListener('resize', this.handleResize);
    document.removeEventListener('mousemove', this.handleMouseMove);

    // Remove the resize event listener
    window.removeEventListener('resize', this.checkScreenSize);
  },
  methods: {
    onScroll(/*event*/){
      this.scrollTop = window.scrollY;
    },
    toggelConPlott() {
      !this.show_all_text_info ? this.show_all_text_info = true : this.show_all_text_info = false;
      console.log(this.show_all_text_info)
    },
    setupIdentityObserver() {
      this.$nextTick(() => {
        const options = {
          root: null,
          rootMargin: '0px',
          threshold: 0.1
        };
        
        this.identityObserver = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting && !this.identity_analysis) {
              this.isIdentitySectionVisible = true;
              this.loadIdentityData();
            }
          });
        }, options);
        
        if (this.$refs.identitySection) {
          this.identityObserver.observe(this.$refs.identitySection);
        }
      });
    },
    loadIdentityData() {
      if (!this.identity_analysis) {
        d3.json(`identity_analysis.json`)
          .then(data => {
            console.log('Identity data loaded');
            this.identity_analysis = data;
          })
          .catch(error => {
            console.error("Error loading identity data:", error);
          });
      }
    },
    setupKeySentimentObserver() {
      this.$nextTick(() => {
        const options = {
          root: null,
          rootMargin: '0px',
          threshold: 0.1
        };
        
        this.keySentimentObserver = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting && !this.key_sentiment) {
              console.log('Key Sentiment section is visible, loading data...');
              this.isKeySentimentSectionVisible = true;
              this.loadKeySentimentData();
            }
          });
        }, options);
        
        if (this.$refs.keySentimentSection) {
          this.keySentimentObserver.observe(this.$refs.keySentimentSection);
        }
      });
    },
    loadKeySentimentData() {
      if (!this.key_sentiment) {
        d3.json(`combined_key_terms.json`)
          .then(data => {
            console.log('Key sentiment data loaded');
            this.key_sentiment = data;
          })
          .catch(error => {
            console.error("Error loading key sentiment data:", error);
          });
      }
    },
    handleMouseMove(event) {
      this.mouseX = event.clientX;
    },
    handleResize() {
      this.windowWidth = window.innerWidth;
    },
    checkScreenSize() {
      this.screenWidth = window.innerWidth;
      this.isSmallScreen = this.screenWidth < this.minScreenWidth;
    }
  }
}
</script>

<style>

.main-section{
  z-index: 0;
  font-family: "Funnel Display", sans-serif;

}
.sep-title{
  margin: 0;
}

.sep-subtitle{
  margin-top: 10px;
  margin-bottom: 0;
  font-size: 18px;
  font-weight: 200;
  text-align: justify;
}
.you-they{
  position: fixed;
  display: flex;
  width: 100vw;
  height: 100vh;
  justify-content: space-between;
  align-items: center;
  pointer-events: none;
  font-size: 35px;
}

.they-section{
  padding: 20px;
  transition: all 0.3s ease;
  transform-origin: right center;
  font-weight: normal;
}
.you-section{
  padding: 20px;
  transition: all 0.3s ease;
  transform-origin: left center;
  font-weight: normal;
}

.bold-text {
  font-weight: 800;
}

.con-section{
  display: flex;
  position: fixed;
  overflow-y: scroll;
  width: 100vw;
  height: 100vh;
  top: 0;
  left: 0;
  background-color: #212121;
  transition: transform 0.5s ease;
  z-index: 10;
  flex-direction: column;
}
el-button:hover{
  background-color: #212121 !important;
  color: #fff !important;
}
.con-btn span{
  background-color: rgba(255, 0, 0, 0) !important;
  color: rgb(71, 71, 71) !important;
}

.slide-in{
  transform: translateX(-100%);
}
.slide-out{
  transform: translateX(0%);
}
.con-btn{
  position:fixed;
  right: 10px;
  top: 5px;
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
  opacity: 1;
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
  scroll-snap-align: start;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
}

.snap-section > * {
  height: 100%;
}

.omponent-chart-section {
  height: 100vh;
  display: flex;
  align-items: center;
}

.main-section {
  height: 100vh;
  overflow-y: scroll;
  overflow-x: hidden;
  scroll-snap-type: y mandatory;
  scroll-behavior: smooth;
  position: relative;
}

.main-section > * {
  scroll-snap-align: start;
  height: 100vh;
  width: 100%;
}

#scrolly {
  position: relative;
  height: auto;
  min-height: 300vh;
  padding: 0;
  max-width: 100%;
  
}


#scrolly figure {
  position: sticky;
  top: 0;
  height: 100vh;
  width: 100%;
  margin: 0;
  z-index: 1;
}

.scroll-snap-container {
  height: 100vh; 
  overflow-y: auto;
}

.main-section .scroll-snap-container {
  pointer-events: auto;
  scroll-snap-align: start;
}

.component-chart-section {
  height: 100vh;
  display: flex;
  align-items: center;
}

/* Add smooth transition between sections */
html {
  scroll-behavior: smooth;
}
.separator-section{
  display: flex;
  justify-content: center;
  flex-direction: column;
  font-size: 24px;
  max-width: 800px;
  /* align-items: center; */
  text-align: left;
}

.sep-title{
  max-width: 1200px;
  width: 550px;
}

.scroll-snap-container, .main-section, html, body {
  scrollbar-width: none; /* For Firefox */
  -ms-overflow-style: none; /* For Internet Explorer and Edge */
}

.scroll-snap-container::-webkit-scrollbar, 
.main-section::-webkit-scrollbar, 
html::-webkit-scrollbar, 
body::-webkit-scrollbar {
  display: none; /* For Chrome, Safari, and Opera */
}

.blue-text-highlight{
  background:#e74c3c !important;
  border-radius: 2px;
  padding-left: 3px;
  padding-right: 3px;
}

.sources-section {
  background-color: #212121;
  min-height: 100vh;
}

/* Add styles for the screen size overlay */
.screen-size-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: #121212;
  z-index: 10000; /* Ensure it's above everything */
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  color: white;
}

.overlay-content {
  max-width: 90%;
  padding: 2rem;
  background-color: #212121;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
  animation: fadeIn 0.5s ease-out;
}

.overlay-icon {
  margin-bottom: 1rem;
  color: #e74c3c;
}

.overlay-content h2 {
  font-size: 1.5rem;
  margin-bottom: 1rem;
}

.overlay-content p {
  font-size: 1rem;
  margin-bottom: 0.5rem;
  opacity: 0.8;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-20px); }
  to { opacity: 1; transform: translateY(0); }
}

@media (max-width: 1023px) {
  /* Hide scrollbars on small screens */
  body {
    overflow: hidden;
  }
}
</style>

