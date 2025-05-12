<template>
  <div class="sources-wrapper">
    <div class="sources-content">
      
      <div class="tech-section">
        <h3>This project was built with</h3>
        <div class="tech-grid">
          <div class="tech-item">
            <div class="tech-icon"><img src="../assets/vue-logo.svg" alt="Vue.js" /></div>
            <div class="tech-name">Vue.js</div>
          </div>
          <div class="tech-item">
            <div class="tech-icon"><img src="../assets/d3-logo.svg" alt="D3.js" /></div>
            <div class="tech-name">D3.js</div>
          </div>
          <div class="tech-item">
            <div class="tech-icon"><img src="../assets/element-plus-logo.svg" alt="Element UI" /></div>
            <div class="tech-name">Element UI</div>
          </div>
          <div class="tech-item">
            <div class="tech-icon"><img src="../assets/nodejs-logo.svg" alt="Node.js" /></div>
            <div class="tech-name">Node.js</div>
          </div>
          <div class="tech-item">
            <div class="tech-icon"><img src="../assets/npm.svg" alt="npm" /></div>
            <div class="tech-name">npm</div>
          </div>
          <div class="tech-item">
            <div class="tech-icon"><img src="../assets/qgis-logo.svg" alt="QGIS" /></div>
            <div class="tech-name">QGIS</div>
          </div>
          <div class="tech-item">
            <div class="tech-icon"><img src="../assets/git-logo.svg" alt="git" /></div>
            <div class="tech-name">git</div>
          </div>
        </div>
      </div>
      
      <div class="dataset-section">
        <h3>Data Information</h3>
        <p>
          This project analyzes 1,912 speeches from Germany's political spectrum, primarily from the AfD and Die Linke parties. 
          The speeches were transcribed, translated, and processed using natural language processing techniques.
        </p>
        <div>
            The analysis is supplemented by official German federal election results data from:
            <ul class="dataset-sources">
                <li>Bundeswahlleiterin. (2017). <br> <a class="link-data" href="https://bundeswahlleiterin.de/bundestagswahlen/2017/ergebnisse.html" target="_blank">2017 Federal Election Results (Open Data)</a></li>
                <li>Bundeswahlleiterin. (2021). <br> <a class="link-data" href="https://www.bundeswahlleiterin.de/bundestagswahlen/2021/ergebnisse/opendata.html" target="_blank">2021 Federal Election Results (Open Data)</a></li>
                <li>Bundeswahlleiterin. (2025). <br> <a class="link-data" href="https://www.bundeswahlleiterin.de/bundestagswahlen/2025/ergebnisse/opendata.html" target="_blank">2025 Federal Election Results (Open Data)</a></li>
            </ul>
        </div>
        <a href="https://huggingface.co/spaces/NourSafadi95/right-detector-ai/tree/main" target="_blank" class="source-link">
          <img src="../assets/huggingface-logo.svg" alt="Hugging Face" class="source-icon" />
          View the model on Hugging Face
        </a>
      </div>
      
      <div class="implementation-section">
        <h3>Machine Learning Model Implementation</h3>
        <p>
          The AI model is hosted on Hugging Face and integrated with this webpage using Gradio client. <br>
          The interface allows real-time analysis of political speech patterns and ideological leanings.
        </p>
        <p>
          Visualizations were created using D3.js and deployed through GitHub Pages.
        </p>
      </div>
      
      <div class="thesis-info">
        <p>
          This project was created as part of a Master's of Science thesis at Parsons School of Design and Technology, The New School in New York under the supervision of Professor of Data Visualization Daniel Sauter and Machine Learning Professor Thiago Hersan.
        </p>
      </div>
      
      <div class="copyright">
        © 2025 Nour Safadi
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Sources'
}
</script>

<style scoped>
.sources-wrapper {
    width: 100%;
    max-width: 1200px;
    margin: 0 auto;
    padding: 40px 20px;
    color: #ffffff;
    display: flex;
    align-items: center;
}

.sources-content {
  max-width: 800px;
  margin: 0 auto;
}

h2 {
  font-size: 32px;
  margin-bottom: 40px;
  font-weight: 500;
}

h3 {
  font-size: 20px;
  margin: 15px 0 15px;
  font-weight: 400;
}

p {
  font-size: 16px;
  line-height: 1.6;
  margin-bottom: 20px;
}

.tech-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  margin: 20px 0;
}

.tech-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 95px;
}

.tech-icon {
  width: 50px;
  height: 50px;
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.tech-icon img {
  max-width: 100%;
  max-height: 100%;
}

.tech-name {
  font-size: 12px;
  text-align: center;
}

.source-link {
  display: inline-flex;
  align-items: center;
  color: #3d5ec9;
  text-decoration: none;
  padding: 8px 12px;
  background: rgba(61, 94, 201, 0.1);
  border-radius: 4px;
  margin: 10px 0;
  transition: background-color 0.2s;
}

.source-link:hover {
  background: rgba(61, 94, 201, 0.2);
}

.source-icon {
  width: 24px;
  height: 24px;
  margin-right: 8px;
}

.dataset-section, .implementation-section {
  margin: 30px 0;
}

.thesis-info {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.link-data {
    color: #757575;
    text-decoration: none;
    text-decoration: underline;
}

.copyright {
  margin-top: 40px;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.5);
  text-align: center;
}
</style>