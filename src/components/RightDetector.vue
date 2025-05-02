<template>
  <div class="component-wrapper">
    <!-- Title and Subtitle -->
    <div class="text">
      <div class="title">
        The Right-Detector AI
      </div>
      <div class="sub-title">
        This model is traind on 1912 speeches from both <br> Germany's left-wing party "Die Linke" and right-wing party the "AfD". <br>
        The Right-Detector AI allows users to enter any <br> speech and get a result wether the speech is considered left or right party speech.
      </div>
    </div>

    <!-- Input Interface -->
    <!-- <div class="input-greet fade-in-out ">Hi, let's detect party speeches</div> -->
    <div 
    v-if="!showResults && !isLoading" 
    class="detector-interface fade-in-out"
    :class="{ 'fade-out': isProcessing }"
    >
      
      <div class="relative-text-container">
          <div class="text-area-section">
            <textarea 
              v-model="inputText" 
              class="input-area" 
              :disabled="isLoading"
              rows="6"
            ></textarea>
          </div>
          <div class="submit-btn-container">
            <button 
              @click="handleSubmit" 
              class="analyze-btn arrow-btn" 
              :disabled="isLoading || !inputText.trim()"
              >
              <svg xmlns="http://www.w3.org/2000/svg" width="30px" height="30px" viewBox="0 0 16 16" fill="white">
                <path d="M10.7 8.64l-2.5 2.5h-.7L5 8.64l.7-.71 1.65 1.64V4h1v5.57L10 7.92l.7.72z"/>
              </svg>
            </button>
          </div>
        </div>
    </div>

    <!-- Loading Indicator -->
    <div v-if="isLoading" class="loading-indicator">
      <div class="spinner"></div>
      <div class="loading-text">Thinking</div>
    </div>

    <!-- Results Section -->
    <div 
      v-if="showResults" 
      class="result-container fade-in-out"
      :class="{ 'fade-out': isResetting }"
    >
      <div class="result-header">Analysis Results:</div>
      
      <div class="classification fade-in">
        <strong>This is {{ result.label.toLowerCase() }} party speech</strong>
      </div>
      
      <div class="result-meter fade-in">
        <div class="meter-info" style="margin-bottom: 6px;">
          
          <div class="probability">
            The speech is {{ Math.round(result.confidence) }}% similar to {{ result.label === 'Left-wing' ? 'Die Linke' : 'AfD' }} party speeches in Germany.
          </div>
        </div>
        <div class="meter-bar">
          <div 
            class="meter-fill animate-width" 
            :style="{
              '--final-width': `${result.confidence}%`,
              backgroundColor: result.label === 'Left-wing' ? '#3498db' : '#e74c3c'
            }"
          ></div>
        </div>
      </div>
      
      <button 
        @click="resetInterface" 
        class="reset-btn"
      >
        Classify Another Speech
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: "RightDetector",
  data() {
    return {
      inputText: "",
      isLoading: false,
      error: null,
      result: null,
      apiUrl: "https://noursafadi95-right-detector-ai.hf.space/gradio_api/call/predict",
      showResults: false,
      isProcessing: false,
      isResetting: false
    };
  },
  methods: {
    async handleSubmit() {
      if (!this.inputText.trim()) return;
      this.isProcessing = true;

      // Simulate fade-out before processing
      setTimeout(async () => {
        this.isLoading = true;
        this.error = null;

        try {
          console.log("Sending prediction request...");
          const callResponse = await fetch(this.apiUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              data: [this.inputText]
            })
          });

          if (!callResponse.ok) {
            throw new Error(`API error on init: ${callResponse.status}`);
          }

          const initJson = await callResponse.json();
          if (!initJson.event_id) {
            throw new Error(`API error, no id was found: ${initJson.event_id}`);
          }

          const eventId = initJson.event_id;
          const resultResponse = await fetch(`${this.apiUrl}/${eventId}`);
          if (!resultResponse.ok) {
            throw new Error(`API error on result fetch: ${resultResponse.status}`);
          }

          const resultText = await resultResponse.text();
          const dataMatch = resultText.match(/data: (\[.+\])/s);
          if (dataMatch && dataMatch[1]) {
            const jsonArray = JSON.parse(dataMatch[1]);
            const structuredData = {
              party: jsonArray[0],
              confidence: jsonArray[1],
              transcript: jsonArray[2]
            };

            this.result = {
              label: structuredData.party === "Die Linke" ? "Left-wing" : "Right-wing",
              confidence: structuredData.confidence
            };
          }
        } catch (error) {
          console.error("Error analyzing text:", error);
          this.error = `Analysis failed: ${error.message}`;
        } finally {
          // Ensure the spinner is shown for at least 3 seconds
          setTimeout(() => {
            this.isLoading = false;
            this.isProcessing = false;
            this.showResults = true;
          }, 2000); // 3-second delay
        }
      }, 500); // Delay for fade-out animation
    },
    resetInterface() {
      this.isResetting = true;

      // Simulate fade-out before resetting
      setTimeout(() => {
        this.result = null;
        this.inputText = "";
        this.showResults = false;
        this.isResetting = false;
      }, 500); // Delay for fade-out animation
    }
  }
};
</script>

<style>
/* Center the detector-interface */
.detector-interface {
  font-family: "Funnel Display", sans-serif;

  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 80%;
  max-width: 600px;
  text-align: center;
  opacity: 1;
  transition: opacity 0.5s ease;
}

.text-area-section{
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  border-radius: 120px;
  box-sizing: border-box;
  
  align-items: center; 
  justify-content: center; /* Flexbox alignment for horizontal centering */
}

.input-area {
  width: 100%;
  height: 100%;
  z-index: 1;
  background-color: transparent;
  color: white; 
  font-size: 16px; 
  resize: none;
  border: none;
  box-sizing: border-box;
  margin-left: 6px;
  line-height: 26.2px;

}

.input-area:focus {
  outline: none;
}

.input-area::placeholder {
  color: rgba(255, 255, 255, 0.6); 
  text-align: center; 
}
.relative-text-container{
  position: relative;
  width: 100%;
  padding: 20px;
  height: 100px;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: row;
  gap: 10px;
  border: 1px solid #ababab;
  border-radius: 120px;
}


.result-container {
  display: flex;
  flex-direction: column;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 80%;
  max-width: 800px;
  gap: 20px;
  opacity: 1;
  transition: opacity 0.5s ease;
}

.fade-in-out.fade-out {
  opacity: 0;
}

.submit-btn-container{
  display: flex;
  justify-content: center;
  align-items: center;
}

/* Arrow button styling */
.arrow-btn {
  background-color: transparent;
  display: flex;
  padding: 0;
  margin: 0;
  cursor: pointer;
  border: 1px solid #cbcbcb;
  border-radius: 100%;
  transform: rotate(180deg);
  transition: transform 0.3s ease;
}

.arrow-btn:hover {
  transform: rotate(180deg) scale(1);
  background-color: #121212;
}

/* Reset button styling */
.reset-btn {
  margin-top: 20px;
  padding: 10px 20px;
  background-color: #d9d9d9;
  color: rgb(23, 23, 23);
  border: none;
  border-radius: 20px;
  cursor: pointer;
  border: #040404 1px solid;
  transition: background-color 0.3s ease;
}

.reset-btn:hover {
  background-color: #121212;
  color: white;
  border: #ffffff 1px solid;
}

/* Meter bar animation */
.meter-bar {
  height: 20px;
  background-color: #444;
  border-radius: 10px;
  overflow: hidden;
  margin-bottom: 10px;
}

.meter-fill {
  height: 100%;
  width: 0; 
  transition: width 1s ease; 
}

.meter-fill.animate-width {
  width: var(--final-width); /* Animate to final width */
}

/* Loading Indicator */
.loading-indicator {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 5px solid rgba(255, 255, 255, 0.3);
  border-top: 5px solid white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.loading-text {
  margin-top: 10px;
  color: white;
  font-size: 16px;
}
</style>