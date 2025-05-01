<template>
  <div class="animated-words-container">
    <transition-group name="word" tag="div">
      <div 
        v-for="word in visibleWords" 
        :key="word.id"
        class="floating-word"
        :class="word.side"
        :style="{
          fontSize: `${Math.min(16 + word.count/10, 48)}px`,
          opacity: word.opacity
        }"
      >
        {{ word.text }}
      </div>
    </transition-group>
  </div>
</template>

<script>
export default {
  name: 'AnimatedWords',
  props: {
    words: {
      type: Array,
      required: true
    }
  },
  data() {
    return {
      visibleWords: [],
      wordQueue: [],
      currentId: 0
    }
  },
  mounted() {
    this.initializeWordQueue();
    this.startAnimation();
  },
  methods: {
    initializeWordQueue() {
      this.wordQueue = this.words.map(word => ({
        id: this.currentId++,
        text: word.term,
        count: word.frequency || 1,
        side: Math.random() > 0.5 ? 'left' : 'right',
        opacity: 1
      })).sort((a, b) => b.count - a.count);
    },
    startAnimation() {
      const addWord = () => {
        if (this.wordQueue.length > 0) {
          const word = this.wordQueue.shift();
          this.visibleWords.push(word);
          
          // Start fade out animation after a delay
          setTimeout(() => {
            const index = this.visibleWords.findIndex(w => w.id === word.id);
            if (index !== -1) {
              this.visibleWords[index].opacity = 0;
              
              // Remove word after fade out
              setTimeout(() => {
                this.visibleWords = this.visibleWords.filter(w => w.id !== word.id);
              }, 1000);
            }
          }, 2000);
          
          // Schedule next word
          setTimeout(addWord, Math.random() * 200 + 100);
        }
      };
      
      addWord();
    }
  }
}
</script>

<style scoped>
.animated-words-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  pointer-events: none;
  overflow: hidden;
}

.floating-word {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  transition: all 3s ease;
  color: rgba(255, 255, 255, 0.8);
  white-space: nowrap;
}

.floating-word.left {
  animation: floatLeft 3s forwards;
}

.floating-word.right {
  animation: floatRight 3s forwards;
}

@keyframes floatLeft {
  0% {
    left: 50%;
    transform: translate(-50%, -50%);
    opacity: 0;
  }
  20% {
    opacity: 1;
  }
  100% {
    left: -100px;
    transform: translate(0, -50%);
    opacity: 0;
  }
}

@keyframes floatRight {
  0% {
    right: 50%;
    transform: translate(50%, -50%);
    opacity: 0;
  }
  20% {
    opacity: 1;
  }
  100% {
    right: -100px;
    transform: translate(0, -50%);
    opacity: 0;
  }
}

.word-enter-active,
.word-leave-active {
  transition: all 1s;
}

.word-enter-from,
.word-leave-to {
  opacity: 0;
}
</style>