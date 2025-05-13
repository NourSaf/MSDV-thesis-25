<template>
  <div class="landing-container">
    <div class="main-section-landing" :class="{ 'fade-in': showMainSection }">
        <div class="project-info-wrapper" :class="{ 'slide-in': showMainSection }">
            <h1 class="project-title" :class="{ 'fade-in-text': showMainSection }">
              Language of Division
            </h1>
            <p class="project-description" :class="{ 'fade-in-text': showMainSection }">
              Language of Division explores how Germany’s far-right party, the AfD, uses language by analyzing their official parliamentary speeches and interviews from their YouTube channels. The project uses Natural Language Processing (NLP) to find common themes and patterns in their speech.
              <br><br>
              It then uses a custom-built model, trained on thousands of political speeches, to predict the political leaning of new texts. This shows how political language can increase division in society and how AI can help detect early signs of radicalization and social tension.
            </p>
        </div>
    </div>
    <AnimatedWords 
      v-if="thematicWords && !hideAnimatedWords"
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
      showMainSection: false,
      hideAnimatedWords: false
    }
  },
  props: {
    thematicDictionary: {
      type: Object,
      default: null
    }
  },
  mounted() {
    setTimeout(() => {
      this.showMainSection = true
    }, 7000);

    setTimeout(() => {
      this.hideAnimatedWords = true
    }, 8000);
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
          frequency: typeof word === 'object' ? word.frequency - 50 : 10,
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
  animation: fadeInSection 0.5s forwards;
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

.project-info-wrapper {
  width: 50%;
  padding-left: auto;
  padding-right: auto;
  transform: translateX(-100%); /* Start off-screen */
  opacity: 0;
}

.project-info-wrapper.slide-in {
  animation: slideIn 1s forwards;
  animation-delay: 0.3s; /* Reduced delay */
}

.project-title {
  margin: 0;
  font-size: 56px;
  opacity: 0;
}

.project-title.fade-in-text {
  animation: fadeInText 1s forwards;
  animation-delay: 0.8s; /* Reduced delay */
}

.project-description {
  text-align: justify;
  opacity: 0;
}

.project-description.fade-in-text {
  animation: fadeInText 1s forwards;
  animation-delay: 1.3s; /* Reduced delay */
}

.animated-words-container {
  transition: opacity 1s ease; /* Reduced from 1.9s */
}

.fade-out {
  opacity: 0;
  pointer-events: none;
}

@keyframes slideIn {
  0% {
    transform: translateY(-100%);
    opacity: 0;
  }
  100% {
    transform: translateY(0);
    opacity: 1;
  }
}

@keyframes fadeInText {
  0% {
    opacity: 0;
    transform: translateY(20px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
