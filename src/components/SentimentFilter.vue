<template>
    <div class="chart-container">
      <div class="chart-container-title">
        <div class="text">
          <div class="title">Emotional Emphasis</div>
          <div class="sub-title">Total word usage per emotion category</div>
        </div>
        <div id="sentiment-bar"></div>
      </div>
      <div class="viz-container">
        <!-- Top: Emotion Filter Buttons -->
        <div class="button-container">
          <button
              v-for="emotion in uniqueEmotions"
              :key="emotion"
              :class="['emotion-btn', { active: selectedEmotions.includes(emotion) }]"
              @click="toggleEmotion(emotion)"
              :style="{
                  backgroundColor: selectedEmotions.includes(emotion) ? emotionColor(emotion) : '#fff',
                  color: selectedEmotions.includes(emotion) ? '#fff' : '#000'
              }"
              >
              {{ emotion }}
              </button>
          
          <button class="reset-btn" @click="resetSelection">Reset</button>

            <el-switch
                v-model="sortBy"
                class="custom-switch"
                style="--el-switch-on-color: #13ce66; --el-switch-off-color: #ff4949"
                active-text="Alphabetic order"
                inactive-text="Frequency order"
                active-color="gray"
                inactive-color="gray"
            />
        </div>
    
        <!-- Bottom: Word Circles -->
        <div class="circle-container">
            <div
              v-for="word in allWords"
              :key="word.ArrayID"
              class="word-circle"
              :style="{
                  backgroundColor: selectedEmotions.includes(word.Emotion) ? emotionColor(word.Emotion) : '#fff',
                  borderColor: selectedEmotions.includes(word.Emotion) ? emotionColor(word.Emotion) : '#ccc'
              }"
              >
              <span class="tooltip">{{ word.Word }} ({{ word.Count }})</span>
            </div>
        </div>
      </div>
      </div>
  </template>
  
  <script>
  export default {
    name: 'EmotionFilterViz',
    props: {
      data: Array
    },
    data() {
      return {
        selectedEmotions: [],
        sortBy: false // true == count or false 'alphabetical'
      };
    },
    computed: {
      uniqueEmotions() {
        return this.data && Array.isArray(this.data)
          ? [...new Set(this.data.map(d => d.Emotion))]
          : [];
      },
      allWords() {
        const base = this.data || [];
  
        if (!this.sortBy) {
          return base.slice().sort((a, b) => +b.Count - +a.Count);
        } else {
          return base.slice().sort((a, b) => a.Word.localeCompare(b.Word));
        }
      }
    },
    methods: {
        toggleEmotion(emotion) {
            if (this.selectedEmotions.includes(emotion)) {
            this.selectedEmotions = this.selectedEmotions.filter(e => e !== emotion);
            } else {
            this.selectedEmotions.push(emotion);
            }
        },
      resetSelection() {
        this.selectedEmotions = [];
      },
      toggleSort() {
        this.sortBy === true ? false : true;
      },
      emotionColor(emotion) {
        const colorScale = {
          anger: '#e74c3c',
          fear: '#8e44ad',
          trust: '#27ae60',
          joy: '#f1c40f',
          anticipation: '#e67e22',
          sadness: '#3498db',
          surprise: '#1abc9c',
          disgust: '#2c3e50',
          positive: '#2ecc71',
          negative: '#c0392b'
        };
        return colorScale[emotion] || '#999';
      }
    }
  };
  </script>
  
<style>

  .viz-container {
    display: flex;
    flex-direction: column;
    width: 1200px;
    align-items: center;
    justify-content: center;
    justify-content: space-around
  }
  
  .button-container {
    font-family: "Funnel Display", sans-serif;
    display: flex;
    flex-wrap: wrap;
    gap: 0.6rem;
    justify-content: center;
  }

  .emotion-btn,
  .sort-btn,
  .reset-btn {
    font-family: "Funnel Display", sans-serif;
    padding: 0.5rem 1rem;
    border: 2px solid #ffffff;
    border-radius: 20px;
    cursor: pointer;
    transition: all 0.3s ease;
    font-size: 14px;
    text-transform: capitalize;
  }
  
  .sort-btn,
  .reset-btn {
    background: #f0f0f0;
    font-weight: normal;
  }
  
  .circle-container {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
    justify-content: center;
  }
  
  .word-circle {
    width: 15px;
    height: 15px;
    border-radius: 50%;
    background-color: rgb(255, 255, 255);
    position: relative;
    cursor: pointer;
    transition: background-color 0.3s;
  }
  
  .word-circle:hover .tooltip {
    visibility: visible;
    opacity: 1;
  }
  
  .tooltip {
    visibility: hidden;
    opacity: 0;
    background: rgba(0, 0, 0, 0.85);
    color: #fff;
    font-size: 16px;
    padding: 5px 8px;
    border-radius: 4px;
    position: absolute;
    top: -35px;
    left: 50%;
    transform: translateX(-50%);
    white-space: nowrap;
    transition: opacity 0.3s;
  }
  </style>