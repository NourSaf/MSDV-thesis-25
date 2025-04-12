<template>  
    <div class="you-they">
      <div class="you-section">YOU</div>
      <div class="they-section">THEY</div>
    </div>
    
    <el-button class="con-btn"
      @click="show_all_text_info = !show_all_text_info" 
        circle
        >
        <el-icon class="plus" v-if="show_all_text_info"><CirclePlusFilled/></el-icon>
        <el-icon class="plus" v-else><RemoveFilled /></el-icon>  
    </el-button>
  
    <div class="con-section" :class="{'slide-in': show_all_text_info, 'slide-out': !show_all_text_info}">
      <ConcordancePlot :script_data="split_array"/>
    </div>
  
    <div class="main-section">
      <div class="component-chart-section">
        <BubbelChart :data="grouped_words"/>
      </div>
    </div>
    
  </template>
  
  <script>
  import ConcordancePlot from './ConcordancePlot.vue'
  import BubbelChart from './BubbelChart.vue'
  import * as d3 from 'd3'
  
  export default {
    name: 'Home',
    data(){
      return {      
        scrollTop: 0,
        scripts: null,
        grouped_words: null,
        emotion_data:null, 
        show_all_text_info: true
      }
    },
    components: {
      ConcordancePlot,
      BubbelChart
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
    mounted(){
      Promise.all([
        d3.csv('translated_scripts.csv'),
        d3.csv('Grouped_Word_Frequencies.csv'),
        d3.csv('Emotion_Words.csv')
      ])
        .then(data => {
          this.scripts = data[0];
          this.grouped_words = data[1];
          this.emotion_data = data[2];
        })
      
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
    background-color: #161819;
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
    z-index: 20;
    margin: 20px;
  }
  
  .component-chart-section{
    height: 100vh;
  }
  
  .toggle-container {
    position: absolute;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 100;
    display: flex;
    justify-content: center;
    padding: 15px;
    margin-bottom: 10px;
  }
  
  </style>
