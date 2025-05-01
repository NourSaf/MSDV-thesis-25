<template>
  <div class="landing-container">
    <!-- Add v-show to control visibility of main section -->
    <div class="main-section-landing" :class="{ 'fade-in': showMainSection }">
        <div class="project-info-wrapper">
            <h1 class="project-title">Language of Division</h1>
            <p class="project-description">
                The project investigates the rhetoric of Germany's far-right party. It analyzes transcribed speeches from the party's official YouTube channel using artificial intelligence, word frequency analysis, and natural language processing (NLP). Additionally, it introduces a predictive AI model trained on thousands of far-right speeches and the Left Party's election program to classify how closely a speech aligns with far-right discourse. The project reveals how language fosters political division and explores the potential of AI to identify early warning signs of right-wing radicalization.
            </p>
        </div>
    </div>
    <AnimatedWords 
      v-if="thematicWords && !showMainSection"
      :words="thematicWords"
      :class="{ 'fade-out': showMainSection }"
    />
  </div>
</template>

<script>
import AnimatedWords from './AnimatedWords.vue'

export default {
  name: 'Landing',
  components: {
    AnimatedWords
  },
  data() {
    return {
      showMainSection: false
    }
  },
  props: {
    thematicDictionary: {
      type: Object,
      default: null
    }
  },
  mounted() {
    // Show main section after 10 seconds
    setTimeout(() => {
      this.showMainSection = true
    }, 10000)
  },
  computed: {
    thematicWords() {
      if (!this.thematicDictionary) return null;
      
      // Convert thematic dictionary to array of word objects
      return Object.entries(this.thematicDictionary).flatMap(([category, words]) => {
        // Check if words is an array, if not convert object to array
        const wordArray = Array.isArray(words) ? words : Object.entries(words).map(([term, frequency]) => ({
          term,
          frequency
        }));
        
        return wordArray.map(word => ({
          term: typeof word === 'object' ? word.term : word,
          frequency: typeof word === 'object' ? word.frequency : 1,
          category
        }));
      });
    }
  }
}
</script>

<style>
.main-section-landing {
  width: 1200px;
  height: 100vh;
  margin-left: auto;
  margin-right: auto;
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  align-items: center;
  opacity: 0; /* Start hidden */
  visibility: hidden; /* Hide initially */
}

/* Add fade-in animation */
.main-section-landing.fade-in {
  animation: fadeInSection 1.5s forwards;
}

@keyframes fadeInSection {
  0% {
    opacity: 0;
    visibility: hidden;
  }
  100% {
    opacity: 1;
    visibility: visible;
  }
}

/* Keep existing styles */
.project-info-wrapper {
  width: 50%;
  padding-left: auto;
  padding-right: auto;
}

.project-title {
  margin: 0;
  font-size: 56px;
}

.project-description {
  text-align: justify;
}

/* Add fade-out animation for AnimatedWords */
.animated-words-container {
  transition: opacity 1.9s ease;
}

.fade-out {
  opacity: 0;
  pointer-events: none;
}
</style>
