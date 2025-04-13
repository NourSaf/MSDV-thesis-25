<template>
    <div class="section-all-scripts">
        <div class="title">All speeches</div>
        <div class="main-text-wrapper" v-if="script_data && script_data.length > 0">
            <div class="speech-wrapper" v-for="(speech, index) in script_data" :key="index">
                <div class="speech-title">{{ speech.title }}</div>
                <div class="speech-id">ID: {{ speech.id }}</div>
                <div class="speech-duration">Duration: {{ speech.duration }}</div>
                <div class="view-count">Views: {{ speech.viewCount }}</div>
                <div class="speech-url">
                    <a :href="speech.url" target="_blank">Watch Video</a>
                </div>
                <div class="speech-script-en">{{ speech.translated }}</div>
            </div>
        </div>
        <div v-else class="no-data">
            No speech data available
        </div>
    </div>
</template>

<script>
// import * as d3 from 'd3'

export default {
    name:'AllScripts',
    data(){
        return {
            othering_we_group: ["we", "us", "our", "germans", "patriots", "homeland", "people", "german","home","citizens", "citizen", "patriot"],
            othering_they_group: ["they", "them", "migrants", "muslims", "muslim", "arab", "arabs", "criminals", "refugess", "foreigner","foreigners", "islamist", "immigrants", "immigrant", "leftists", "liberals", "liberal", "outsiders", "outsider", "woke", "enemy"],
            threat :["threat", "danger", "invasion", "war", "crisis","flood","wave","violence","crime","terrorism","loss", "Islamization", "remigration", "re-migration"],
            width: 900,
            height: 100,
            margin: {
                top:20,
                right: 20,
                bottom: 20,
                left: 20
            }
        }
    }, 
    props:{
        script_data: Object,
    },
    computed:{
        data_filter(){
            if (!this.script_data || !Array.isArray(this.script_data)) return [];
            const title = this.script_data.map(d => d.title);

            return console.log("This is title",title)
            // return console.log("This is script",this.script_data)
        }
    },
    methods:{

    },
    mounted(){

    }, 
    updated(){        
        
    }
}

</script>

<style scoped>
.section-all-scripts{

    width: 1200px;
    padding-left: 16px;
    margin-left: auto;
    margin-right: auto;
}
.main-text-wrapper{
    display: flex;
    width: 1200px;
    flex-wrap: wrap;
    gap: 16px;
    margin-left: auto;
    margin-right: auto;
    justify-content: space-between;
}
.speech-wrapper {
    width: 22.5%;
    height: 300px;
    border: 0.5px solid #8f8f8f;
    overflow-y: scroll;
    padding: 8px;
}

.speech-title {
  font-size: 0.8rem;
  font-weight: bold;
  margin-bottom: 3px;
}

.speech-id, .speech-duration, .view-count {
  font-size: 0.5rem;
  color: #888;
  margin-bottom: 1px;
}

.speech-url {
  margin: 3px 0;
  font-size: 0.6rem;
}

.speech-url a {
  color:  #888;
  text-decoration: none;
}

.speech-url a:hover {
  text-decoration: underline;
}

.speech-script-en {
    font-size: 0.6rem;
    line-height: 1.6;
    
    white-space: pre-wrap;
    max-height: 200px;
    overflow-y: auto;
    border-radius: 4px;
    text-align: justify;
}

.no-data {
  text-align: center;
  padding: 40px;
  color: #666;
}

</style>