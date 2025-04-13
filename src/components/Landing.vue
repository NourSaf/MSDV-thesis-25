<template>
    <div class="main-section-landing">
        <div class="project-info-wrapper">
            <h1 class="project-title">Language of Division</h1>
            <p class="project-description">
                The project investigates the rhetoric of Germany’s far-right party. It analyzes transcribed speeches from the party’s official YouTube channel using artificial intelligence, word frequency analysis, and natural language processing (NLP). Additionally, it introduces a predictive AI model trained on thousands of far-right speeches and the Left Party’s election program to classify how closely a speech aligns with far-right discourse. The project reveals how language fosters political division and explores the potential of AI to identify early warning signs of right-wing radicalization.
            </p>
        </div>
    </div>
  </template>
  
  <script>
  export default {
    name: 'Landing',
    props: {

    },
    computed: {
        
    }
  }
  </script>
  
  <style>
  

  .main-section-landing{
    width: 1200px;
    height: 100vh;
    margin-left: auto;
    margin-right: auto;
    display: flex;
    flex-direction: column;
    justify-content: space-around;
        
  }

  .project-info-wrapper{
    width: 50%;
    padding-left: auto;
    padding-right: auto;
  }

  .project-title{
    margin: 0;
    font-size:56px;
  }

  .project-description{
    text-align: justify;
  }

  </style>
  