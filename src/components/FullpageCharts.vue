<template>
  <div id="fullpage">
    <div class="section component-chart-section">
      <BubbelChart :data="groupedWords"/>
    </div>

    <div class="section component-chart-section">
      <BubbelChartFear :data="groupedWords"/>
    </div>

    <div class="section component-chart-section">
      <SentimentBarChart :data="emotionData"/>
    </div>

    <div class="section component-chart-section">
      <SentimentFilter :data="emotionData"/>
    </div>
  </div>
</template>

<script>
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
   
  },
  methods: {
  },
  beforeUnmount() {
  
  }
}
</script>

<style scoped>


.component-chart-section {
  display: flex;
  align-items: center;
  justify-content: center;
}

</style>