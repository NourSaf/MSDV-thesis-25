<template>
  <div class="component-wrapper">
    <div class="text">
      <div class="title">
        The Right-Detector AI
      </div>
      <div class="sub-title">
        This model was trained on 1912 speeches from both right-wing and left-wing parties.
        <br> 
        The speeches were collected from the official YouTube channels of the parties.
        <br>
        Enter any text to analyze its political leaning.
      </div>
    </div>
    <div v-if="result" class="result-container">
        <div class="result-header">Analysis Results:</div>
        
        <!-- Classification with simple fade animation -->
        <div class="classification" :class="{'fade-in': showClassification}">
          <strong>This is {{ result.label.toLowerCase() }} party speech</strong>
        </div>
        
        <!-- Meter animation second -->
        <div class="result-meter">
          <!-- Label and probability together -->
          <div class="meter-info" :class="{'fade-in': showMeterLabel}">
            <div class="meter-label">{{ result.label }} confidence</div>
            <div class="probability">
              {{ Math.round(result.confidence) }}% confidence
            </div>
          </div>
          
          <!-- Meter bar last -->
          <div class="meter-bar" :class="{'fade-in': showMeterBar}">
            <div 
              class="meter-fill" 
              :class="{'animate-width': showMeterBar}"
              :style="{
                '--final-width': `${result.confidence}%`,
                backgroundColor: result.label === 'Left-wing' ? '#3498db' : '#e74c3c'
              }"
            ></div>
          </div>
        </div>
    </div>
    <div v-if="error" class="error-message">
        {{ error }}
      </div>
    <div class="detector-interface">
      <textarea 
        v-model="inputText" 
        class="input-area" 
        placeholder="Enter a political sppeech here... The speech should be longer THAN XX in length"
        :disabled="isLoading"
        rows="6"
      ></textarea>
      
      <button 
        @click="getJsonResponse" 
        class="analyze-btn" 
        :disabled="isLoading || !inputText.trim()"
      >
        {{ isLoading ? 'Analyzing...' : 'Analyze Text' }}
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
      showClassification: false,
      showMeterLabel: false,
      showMeterBar: false
    };
  },
  methods: {
    async getJsonResponse() {
      if (!this.inputText.trim()) return;
      if (this.inputText.length < 2500) {
        this.error = "Please enter a longer text. At least 1000 words";
        return;
      }
    
      this.isLoading = true;
      this.error = null;

      try {
          console.log("Sending prediction request...");
      
          // Step 1: Initiate the prediction job
          const callResoponse = await fetch(this.apiUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              data: [this.inputText]
            })
          });
          
          if (!callResoponse.ok) {
            throw new Error(`API error on init: ${callResoponse.status}`);
          }
          
          const initJson = await callResoponse.json();
          console.log("01 - response RAW:", callResoponse);
          console.log("02 - response Json:", initJson);

          if (!initJson.event_id) {
              throw new Error(`API error, no id was found: ${initJson.event_id}`);
          } 
          
          if (initJson.event_id) {
              const eventId = initJson.event_id;
              console.log("Found Event ID:", eventId);
              
              const resultResponse = await fetch(`${this.apiUrl}/${eventId}`);
              if (!resultResponse.ok) {
                throw new Error(`API error on result fetch: ${resultResponse.status}`);
              }
              
              // Get the response as text first
              const resultText = await resultResponse.text();
              console.log("03 - Response TEXT:", resultText);

              // Extract the JSON part from SSE format
              try {
                  // Extract the data JSON part using a more reliable regex pattern
                  const dataMatch = resultText.match(/data: (\[.+\])/s);
                  if (dataMatch && dataMatch[1]) {
                      // Parse the array data
                      const jsonArray = JSON.parse(dataMatch[1]);
                      console.log("04 - Parsed JSON array:", jsonArray);
                      
                      // Create a structured object from the array elements
                      const structuredData = {
                          party: jsonArray[0],             // Party name (string)
                          confidence: jsonArray[1],        // Confidence score (number)
                          transcript: jsonArray[2]         // Original text transcript (string)
                      };
                      
                      console.log("05 - Structured data:", structuredData);
                      
                      // Simplified result format that only shows the detected party
                      this.result = {
                          label: structuredData.party === "Die Linke" ? "Left-wing" : "Right-wing",
                          confidence: structuredData.confidence, // Direct confidence score
                          party: structuredData.party
                      };
                      
                      console.log("06 - Formatted result for UI:", this.result);
                      
                      if (this.result) {
                        // Reset animation states
                        this.showClassification = false;
                        this.showMeterLabel = false;
                        this.showMeterBar = false;
                        
                        // Start animation sequence with clean timing
                        setTimeout(() => {
                          // Show classification first
                          this.showClassification = true;
                          
                          // Show meter label + probability after classification
                          setTimeout(() => {
                            this.showMeterLabel = true;
                            
                            // Show meter bar last
                            setTimeout(() => {
                              this.showMeterBar = true;
                            }, 400);
                          }, 600);
                        }, 100);
                      }
                  }
              } catch (e) {
                  console.error("Failed to parse SSE data:", e);
                  throw new Error("Could not parse model response");
              }
          }
      } catch (error) {
          console.error("Error analyzing text:", error);
          this.error = `Analysis failed: ${error.message}`;
      } finally {
          this.isLoading = false;
      }
    }
  },
  watch: {
    result(newVal) {
      if (newVal) {
        // Use nextTick to ensure DOM is updated
        this.$nextTick(() => {
          // Set the CSS variable for the final width
          const meterFill = document.querySelector('.meter-fill');
          if (meterFill) {
            meterFill.style.setProperty('--final-width', `${this.result.confidence}%`);
          }
        });
      }
    }
  }
};
</script>

<style>
/* .detector-interface {
  border-radius: 12px;
  margin-bottom: 30px;
} */

.input-area {
  width: 100%;
  padding: 15px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  background-color: rgba(23, 23, 23, 0.2);
  color: white;
  font-size: 12px;
  /* resize: vertical; */
  margin-bottom: 20px;
}

.analyze-btn {
  color: rgb(255, 255, 255);
  background-color: rgba(0, 0, 0, 0);
  border:1px solid white;
  border-radius: 30px;
  padding: 12px 24px;
  font-size: 13px;
  cursor: pointer;
  transition: background-color 0.3s;
  margin-bottom: 20px;
  
}

.analyze-btn:hover {
    background-color: white;
    color: black;
    padding: 12px 24px;
    border-radius: 30px;
    margin-bottom: 20px;
}

.analyze-btn:disabled {
  background-color: #858585;
  color: white;
  cursor: not-allowed;

}

.error-message {
  color: #e74c3c;
  margin: 10px 0;
  padding: 10px;
  background-color: rgba(231, 76, 60, 0.2);
  border-radius: 5px;
}

.result-container {
  display: flex;
  flex-direction: column;
  background-color: rgba(69, 69, 69, 0.3);
  padding: 20px;
  
  margin-top: 20px;
}

.result-header {
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 20px;
  color: white;
}

.result-meter {
  order: 2;
  margin-bottom: 20px;
}

/* Group label and probability */
.meter-info {
  display: flex;
  gap: 10px;
  align-items: center;
  margin-bottom: 5px;
  opacity: 0; /* Start invisible */
}

.meter-info.fade-in {
  opacity: 1;
}

.meter-label {
  color: white;
}

.probability {
  font-style: italic;
  color: #bbb;
  text-align: right;
}

/* Meter bar styling */
.meter-bar {
  height: 20px;
  background-color: #444;
  border-radius: 10px;
  overflow: hidden;
  margin-bottom: 10px;
  opacity: 0; /* Start invisible */
}

.meter-bar.fade-in {
  opacity: 1;
}

.meter-fill {
  height: 100%;
  width: 0; /* Start with width 0 */
}

/* Add separate animation class */
.meter-fill.animate-width {
  animation: growWidth 1s ease-out forwards;
}

@keyframes growWidth {
  from { width: 0; }
  to { width: var(--final-width); }
}

.fade-in {
  animation: fadeIn 0.5s ease forwards;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.classification {
  order: 1;
  font-size: 18px;
  
  margin-bottom: 20px;
  opacity: 0; /* Start invisible */
}

.classification.fade-in {
  opacity: 1;
}
</style>