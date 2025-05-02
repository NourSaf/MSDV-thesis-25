<template>
  <div class="component-wrapper">
    <!-- Title and Subtitle -->
    <!-- <div class="text">
      <div class="title">
        The Right-Detector AI
      </div>
      <div class="sub-title">
        This model is trained on 1912 speeches from both <br> Germany's left-wing party "Die Linke" and right-wing party the "AfD". <br>
        The Right-Detector AI allows users to enter any <br> speech and get a result whether the speech is considered left or right party speech.
      </div>
    </div> -->

    <!-- Input Interface -->
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
            placeholder="Enter a speech to analyze..."
            @keydown.enter.prevent="handleSubmit"
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

    <!-- Error Message -->
    <div v-if="showError" class="error-message fade-in">
      {{ error }}
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
      <div class="result-header">Analysis Results</div>
      
      <div class="classification fade-in">
        <strong>{{ analysisConclusion }}</strong>
      </div>
      
      <div class="result-visualization fade-in">
  
        </div>
        
        <div class="charts-container">
          <div class="chart-column">
            <div class="chart-title">Similarity</div>
            <div class="radial-chart" ref="similarityChart"></div>
            <div class="chart-value">{{ result.similarity.toFixed(1) }}%</div>
          </div>
          <div class="chart-column">
            <div class="chart-title">{{ dominantParty }} Confidence</div>
            <div class="radial-chart" ref="confidenceChart"></div>
            <div class="chart-value">{{ dominantConfidence.toFixed(1) }}%</div>
          </div>
        </div>
        <div class="probability">
          <div class="meter-info" style="margin-bottom: 16px;" v-html="analysisDescription"></div>
        </div>
<!--       
      <div v-if="result.similarSpeech" class="similar-speech">
        <div class="similar-speech-header">Most similar speech excerpt:</div>
        <div class="similar-speech-text">{{ truncatedSimilarSpeech }}</div>
      </div> -->
      
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
import * as d3 from 'd3';

export default {
  name: "RightDetector",
  data() {
    return {
      inputText: "",
      isLoading: false,
      error: null,
      showError: false,
      result: null,
      apiUrl: "https://noursafadi95-right-detector-ai.hf.space/gradio_api/call/predict",
      showResults: false,
      isProcessing: false,
      isResetting: false,
      chart: null
    };
  },
  computed: {
    analysisConclusion() {
      if (!this.result) return "";
      
      if (this.result.rightConfidence > 60) {
        return "This is right-wing party speech";
      } else if (this.result.leftConfidence > 70) {
        return "This is very likely to be left-wing party speech";
      } else {
        return "Your speech is neutral";
      }
    },
    analysisDescription() {
      if (!this.result) return "";
      
      const similarityHighlight = `<span style="background:#4CAF50; border-radius: 2px; padding-left: 3px; padding-right: 3px;">${this.result.similarity.toFixed(1)}%</span>`;
      
      if (this.result.rightConfidence > 60) {
        const confidenceHighlight = `<span style="background:#e74c3c; border-radius: 2px; padding-left: 3px; padding-right: 3px;">${this.result.rightConfidence.toFixed(1)}%</span>`;
        return `The speech is ${similarityHighlight} similar to AfD party speeches <br> in Germany with ${confidenceHighlight} confidence.`;
      } else if (this.result.leftConfidence > 70) {
        const confidenceHighlight = `<span style="background:#3498db; border-radius: 2px; padding-left: 3px; padding-right: 3px;">${this.result.leftConfidence.toFixed(1)}%</span>`;
        return `The speech is ${similarityHighlight} similar to Die Linke party speeches <br> in Germany with ${confidenceHighlight} confidence.`;
      } else {
        const confidenceHighlight = `<span style="background:${this.dominantParty === "Right-wing" ? "#e74c3c" : "#3498db"}; border-radius: 2px; padding-left: 3px; padding-right: 3px;">${this.dominantConfidence.toFixed(1)}%</span>`;
        return `The speech appears neutral but has ${similarityHighlight} similarity to ${this.result.party === "AFD" ? "AfD" : "Die Linke"} speeches <br> with ${confidenceHighlight} confidence.`;
      }
    },
    truncatedSimilarSpeech() {
      if (!this.result || !this.result.similarSpeech) return "";
      // Truncate long speeches to a reasonable length
      const maxLength = this.result.similarSpeech.length;
      const speech = this.result.similarSpeech;
      return speech.length > maxLength ? speech.substring(0, maxLength) + "..." : speech;
    },
    dominantParty() {
      if (!this.result) return "";
      
      if (this.result.rightConfidence > this.result.leftConfidence) {
        return "Right-wing";
      } else {
        return "Left-wing";
      }
    },
    dominantConfidence() {
      if (!this.result) return 0;
      
      return this.result.rightConfidence > this.result.leftConfidence 
        ? this.result.rightConfidence 
        : this.result.leftConfidence;
    }
  },
  methods: {
    async handleSubmit() {
      if (!this.inputText.trim()) return;
      
      // Reset error state for each new submission attempt
      this.showError = false;
      this.error = null;
      
      // Word count validation
      const wordCount = this.inputText.trim().split(/\s+/).length;
      if (wordCount < 100) {
        this.error = "This is an invalid speech. Please enter a speech with at least 100 words.";
        this.showError = true;
        return;
      }
      
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
          console.log("Initial API response:", initJson);

          if (!initJson.event_id) {
            throw new Error(`API error, no id was found: ${initJson.event_id}`);
          }

          const eventId = initJson.event_id;
          console.log("Fetching results with event ID:", eventId);
          
          const resultResponse = await fetch(`${this.apiUrl}/${eventId}`);
          if (!resultResponse.ok) {
            throw new Error(`API error on result fetch: ${resultResponse.status}`);
          }

          const resultText = await resultResponse.text();
          console.log("Raw result text:", resultText);
          
          const dataMatch = resultText.match(/data: (\[.+\])/s);
          if (dataMatch && dataMatch[1]) {
            const jsonData = dataMatch[1];
            console.log("Extracted JSON string:", jsonData);
            
            const jsonArray = JSON.parse(jsonData);
            console.log("Parsed JSON array:", jsonArray);
            
            // Structure the full data from the response
            const structuredData = {
              party: jsonArray[0],                 // "AFD" or "Die Linke"
              similarity: jsonArray[1],            // Similarity score
              rightConfidence: jsonArray[2],       // Right-wing confidence
              leftConfidence: jsonArray[3],        // Left-wing confidence
              similarSpeech: jsonArray[4] || ""    // Most similar speech
            };
            console.log("Structured data:", structuredData);

            this.result = structuredData;
            console.log("Final result object:", this.result);
          } else {
            console.error("Failed to extract data from response:", resultText);
            throw new Error("Could not parse API response");
          }
        } catch (error) {
          console.error("Error analyzing text:", error);
          this.error = `Analysis failed: ${error.message}`;
        } finally {
          // Ensure the spinner is shown for at least 2 seconds
          setTimeout(() => {
            this.isLoading = false;
            this.isProcessing = false;
            this.showResults = true;
            
            // Create radial chart after results are shown
            this.$nextTick(() => {
              this.createRadialChart();
            });
          }, 2000); // 2-second delay
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
        
        // Clean up chart if it exists
        if (this.chart) {
          d3.select(this.$refs.radialChart).selectAll("*").remove();
          this.chart = null;
        }
      }, 500); // Delay for fade-out animation
    },
    
    createRadialChart() {
      if (!this.result || !this.$refs.similarityChart || !this.$refs.confidenceChart) return;
      
      // Clear any existing charts
      d3.select(this.$refs.similarityChart).selectAll("*").remove();
      d3.select(this.$refs.confidenceChart).selectAll("*").remove();
      
      // Create similarity chart with light green color
      this.createSingleRadialChart(
        this.$refs.similarityChart, 
        this.result.similarity, 
        "#4CAF50" // Nice light green color
      );
      
      // Create confidence chart
      this.createSingleRadialChart(
        this.$refs.confidenceChart, 
        this.dominantConfidence, 
        this.dominantParty === "Right-wing" ? "#e74c3c" : "#3498db"
      );
    },
    
    createSingleRadialChart(container, value, color) {
      const width = 200;
      const height = 200;
      const margin = 10;
      const innerRadius = 70;
      const outerRadius = Math.min(width, height) / 2 - margin;
      
      // Create SVG element
      const svg = d3.select(container)
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", `translate(${width / 2}, ${height / 2})`);
      
    
      const scale = d3.scaleLinear()
        .domain([0, 100])
        .range([0, 2 * Math.PI]);
      
      const backgroundArc = d3.arc()
        .innerRadius(innerRadius)
        .outerRadius(outerRadius)
        .startAngle(0)
        .endAngle(2 * Math.PI);
      
      // Create foreground arc - will be animated
      const arc = d3.arc()
        .innerRadius(innerRadius)
        .outerRadius(outerRadius)
        .startAngle(0)
        .endAngle(scale(0)); // Start at 0
      
      // Add background arc
      svg.append("path")
        .attr("d", backgroundArc)
        .style("fill", "#212121");
      
      // Add foreground arc with animation
      const foreground = svg.append("path")
        .datum({value: value})
        .style("fill", color)
        .attr("d", arc);
      
      // Animate the foreground arc
      foreground.transition()
        .duration(1500)
        .attrTween("d", function(d) {
          const interpolate = d3.interpolate(0, d.value);
          return function(t) {
            return arc.endAngle(scale(interpolate(t)))();
          };
        });
      
      // Add center circle
      svg.append("circle")
        .attr("r", innerRadius - 2)
        .style("fill", "none")
        .style("stroke", "white")
        .style("stroke-width", 1);
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
  justify-content: center;
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
  height: 30px;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: row;
  gap: 10px;
  border: 1px solid #ffffff;
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
  align-items: center;
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
  transform: rotate(180deg) scale(1.05);
  background-color: #323232;
}

/* Reset button styling */
.reset-btn {
  width: 200px;
  margin-top: 20px;
  padding: 10px 20px;
  background-color: #d9d9d9;
  color: rgb(23, 23, 23);
  border: none;
  border-radius: 20px;
  cursor: pointer;
  border: #212121 1px solid;
  transition: background-color 0.3s ease;
}

.reset-btn:hover {
  background-color: #212121;
  color: white;
  border: #ffffff 1px solid;
}

/* Radial chart container */
.radial-chart {
  width: 300px;
  height: 300px;
  margin: 0 auto;
  position: relative;
}

.result-header {
  font-size: 50px;
  margin-bottom: 10px;
  text-align: center;
  font-weight: bold;
}

.classification {
  font-size: 20px;
  text-align: center;
  margin-bottom: 10px;
}

/* Legend for the chart */
.chart-legend {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-top: 20px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.legend-color {
  width: 16px;
  height: 16px;
  border-radius: 4px;
}

.right-color {
  background: linear-gradient(135deg, #c0392b, #e74c3c);
}

.left-color {
  background: linear-gradient(135deg, #c0392b, #e74c3c);
}

.similar-speech {
  margin-top: 20px;
  padding: 15px;
  border: 1px solid #555;
  border-radius: 8px;
  background-color: rgba(255, 255, 255, 0.05);
}

.similar-speech-header {
  font-weight: bold;
  margin-bottom: 8px;
}

.similar-speech-text {
  font-style: italic;
  font-size: 14px;
  line-height: 1.4;
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

.result-visualization {
  margin: 20px 0;
}

.probability {
  text-align: center;
  margin-bottom: 10px;
}

/* Transition effects */
.fade-in {
  animation: fadeIn 0.8s ease-in-out forwards;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Add these new styles: */

.charts-container {
  display: flex;
  justify-content: center;
  gap: 40px;
  margin: 30px 0;
}

.chart-column {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 200px;
}

.chart-title {
  font-size: 16px;
  font-weight: 500;
  margin-bottom: 10px;
  text-align: center;
}

.chart-value {
  font-size: 24px;
  font-weight: bold;
  margin-top: 10px;
}

.radial-chart {
  width: 200px;
  height: 200px;
  position: relative;
}

.error-message {
  font-family: "Funnel Display", sans-serif;
  display: flex; 
  flex-direction: row;
  align-items: center;
  justify-content: center;
  position: absolute;
  top: calc(50% + 70px); /* Position below the input area */
  left: 31.7%;
  transform: translate(-50%, 0); /* Use translate for perfect centering */
  width: 80%;
  max-width: 600px;
  text-align: center;
  color: #e74c3c;
  background-color: rgba(231, 76, 60, 0.1);
  border: 1px solid #e74c3c;
  border-radius: 8px;
  padding: 12px 16px;
  font-size: 16px;
}
</style>