<template>
  <div id="fullpage">
    <div class="section">
      <BubbelChart :data="groupedWords"/>
    </div>

    <div class="section">
      <BubbelChartFear :data="groupedWords"/>
    </div>

    <div class="section">
      <SentimentBarChart :data="emotionData"/>
    </div>

    <div class="section">
      <SentimentFilter :data="emotionData"/>
    </div>
  </div>
</template>

<script>
import fullpage from 'fullpage.js'
import 'fullpage.js/dist/fullpage.css'
import BubbelChart from './BubbelChart.vue'
import BubbelChartFear from './BubbelChartFear.vue'
import SentimentBarChart from './SentimentBarChart.vue'
import SentimentFilter from './SentimentFilter.vue'

export default {
  name: 'FullpageCharts',
  components: {
    BubbelChart,
    BubbelChartFear,
    SentimentBarChart,
    SentimentFilter
  },
  props: {
    groupedWords: {
      type: Array,
      required: true
    },
    emotionData: {
      type: Array,
      required: true
    }
  },
  mounted() {
    // Initialize fullpage.js only when the component is mounted
    this.initializeFullpage();
  },
  methods: {
    initializeFullpage() {
      // Check if data is available before initializing
      if (this.groupedWords && this.groupedWords.length && 
          this.emotionData && this.emotionData.length) {
        
        new fullpage('#fullpage', {
          licenseKey: 'GPL v3', 
          navigation: true,
          navigationPosition: 'right',
          showActiveTooltip: true,
          scrollingSpeed: 2000,
          autoScrolling: true,
          fitToSection: true,
          css3: true,
          // Add these properties:
          verticalCentered: true,
          responsiveWidth: 900,
          afterLoad: function() {
            console.log('Section loaded successfully');
          }
        });
      } else {
        // If data isn't available yet, try again shortly
        setTimeout(() => this.initializeFullpage(), 500);
      }
    }
  },
  beforeUnmount() {
    // // // Destroy fullpage instance when component is unmounted
    // if (fullpage_api) {
    //   fullpage_api.destroy('all');
    // }
  }
}
</script>

<style scoped>
.section {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background: #333;
  color: white;
}

/* .component-chart-section {
  display: flex;
  align-items: center;
  justify-content: center;
} */

/* .fp-watermark{
    display: none !important;
}

.fp-warning, .fp-watermark{
    display: none !important;
}

.fp-warning, .fp-watermark a{
    display: none !important;
}
.fp-section{
    background-color: #121212 !important;
} */
</style>