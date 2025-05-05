<template>
    <div class="section-all-scripts">
        <div class="title-all">All speeches</div>
        
        <!-- Controls for scrolling (uncomment if you want user control) -->
        <div class="auto-scroll-control">
            <!-- <button @click="toggleAutoScroll" class="auto-scroll-toggle">
                {{ isPaused ? "Resume Auto-Scroll" : "Pause Auto-Scroll" }}
            </button> -->
        </div>
        
        <!-- Add ref to the main wrapper for scrolling -->
        <div 
            class="main-text-wrapper" 
            ref="mainContainer"
            v-if="script_data && script_data.length > 0"
        >
            <div class="speech-wrapper" v-for="(speech, index) in script_data" :key="index">
                <!-- Content remains the same -->
                <div class="speech-title">{{ speech.title }}</div>
                <div class="speech-id">ID: {{ speech.id }}</div>
                <div class="speech-duration">Duration: {{ speech.duration }}</div>
                <div class="view-count">Views: {{ speech.viewCount }}</div>
                <div class="speech-url">
                    <a :href="speech.url" target="_blank">Watch Video</a>
                </div>
                
                <div 
                    class="speech-script-en" 
                    v-html="highlightOtheringSpeech(speech.translated)"
                    :id="`speech-${index}`"
                ></div>
            </div>
        </div>
        <div v-else class="no-data">
            No speech data available
        </div>
    </div>
</template>

<script>
export default {
    name:'AllScripts',
    props:{
        script_data: Object,
        isVisible: {
            type: Boolean,
            default: false
        }
    },
    data() {
        return {
            // Existing data properties
            othering_we_group: ["we", "us", "our", "germans", "patriots", "homeland", "people", "german","home","citizens", "citizen", "patriot"],
            othering_they_group: ["they", "them", "migrants", "muslims", "muslim", "arab", "arabs", "criminals", "refugess", "foreigner","foreigners", "islamist", "immigrants", "immigrant", "leftists", "liberals", "liberal", "outsiders", "outsider", "woke", "enemy"],
            threat: ["threat", "danger", "invasion", "war", "crisis","flood","wave","violence","crime","terrorism","loss", "Islamization", "remigration", "re-migration"],
            width: 900,
            height: 100,
            margin: {
                top:20,
                right: 20,
                bottom: 20,
                left: 20
            },
            // Track current highlight positions for each speech
            inGroupIndices: {},
            outGroupIndices: {},
            
            // Multiple timers for each speech
            speechTimers: {},
            inGroupTurn: {}, // Track whether it's in-group or out-group's turn for each speech
            autoScrollInterval: 2500, // Time in ms between scrolls
            isPaused: false,

            // Add main scrolling properties
            mainScrollTimer: null,
            mainScrollSpeed: 0.5, // pixels per animation frame
            mainScrollPaused: false
        }
    },
    
    watch: {
        // Watch for changes in visibility
        isVisible(newValue) {
            if (newValue) {
                // Panel is now visible, start animations
                this.$nextTick(() => {
                    this.initializeComponent();
                });
            } else {
                // Panel is now hidden, stop animations
                this.cleanupComponent();
            }
        }
    },
    
    mounted() {
        // Only initialize if already visible (typically not on first render)
        if (this.isVisible) {
            this.$nextTick(() => {
                this.initializeComponent();
            });
        }
    },
    
    beforeUnmount() {
        // Always clean up before component is destroyed
        this.cleanupComponent();
    },
    
    methods:{
        highlightOtheringSpeech(text) {
            if (!text) return '';
            
            // Define regex patterns for word boundaries to ensure we match whole words
            const inGroupWords = /\b(we|us|our|you|your|germans|patriots|homeland|people|german|home|citizens|citizen|patriot|nation|countrymen|fatherland|motherland|compatriots|nationals|folk|community|society|culture|heritage|tradition|values|history|ancestors|descendants|future|children|families|country|native|roots|brothers|sisters|locals|residents)\b/gi;
            const outGroupWords = /\b(they|them|different|migrants|muslims|muslim|arab|arabs|criminals|refugees|foreigner|foreigners|islamist|immigrants|immigrant|leftists|liberals|liberal|outsiders|outsider|woke|enemy|aliens|minorities|asylum-seekers|non-citizens|illegal|undocumented|radical|extremist|foreign|non-native|opponents|critics|activists|globalists|elites|establishment|radicals|extremists|socialists|marxists|communists|those people|others|strangers|intruders|invaders|infiltrators|terrorist|terrorists|threat|outsider|alien|minority|refugee|invader|occupier|trespasser|burden|parasite|lawbreaker)\b/gi;
            
            // Replace in-group words with blue highlighting
            text = text.replace(inGroupWords, match => 
                `<span class="in-group-highlight" tabindex="-1">${match}</span>`);
            
            // Replace out-group words with red highlighting
            text = text.replace(outGroupWords, match => 
                `<span class="out-group-highlight" tabindex="-1">${match}</span>`);
            
            return text;
        },
        
        // Animation utility function
        animateScrollToElement(element) {
            if (!element) return;
            
            // Get the speech container (parent scroll container)
            const speechContainer = element.closest('.speech-script-en');
            if (!speechContainer) return;
            
            // Remove active class from all highlights within the same speech container
            speechContainer.querySelectorAll('.highlight-active').forEach(el => {
                el.classList.remove('highlight-active');
            });
            
            // Add active class to the target element
            element.classList.add('highlight-active');
            
            // Calculate the position of the element relative to the container
            const elementRect = element.getBoundingClientRect();
            const containerRect = speechContainer.getBoundingClientRect();
            
            // Calculate where to scroll to center the element in the container
            const scrollOffset = elementRect.top - containerRect.top - (containerRect.height / 2) + (elementRect.height / 2);
            
            // Smooth scroll within the container only
            speechContainer.scrollBy({
                top: scrollOffset,
                behavior: 'smooth'
            });
            
            // Remove the highlight effect after a delay
            setTimeout(() => {
                element.classList.remove('highlight-active');
            }, 100);
        },
        
        // Start animation for a specific speech
        startSpeechAnimation(speechIndex) {
            // Don't restart if timer already exists
            if (this.speechTimers[speechIndex]) return;
            
            // Initialize the in-group/out-group turn tracker for this speech
            if (this.inGroupTurn[speechIndex] === undefined) {
                this.inGroupTurn[speechIndex] = true;
            }
            
            this.speechTimers[speechIndex] = setInterval(() => {
                if (this.isPaused) return;
                
                const speechContainer = document.getElementById(`speech-${speechIndex}`);
                if (!speechContainer) return;
                
                // Determine whether to highlight in-group or out-group words
                if (this.inGroupTurn[speechIndex]) {
                    const highlights = speechContainer.querySelectorAll('.in-group-highlight');
                    if (highlights.length) {
                        // Initialize or increment the index
                        if (this.inGroupIndices[speechIndex] === undefined) {
                            this.inGroupIndices[speechIndex] = 0;
                        } else {
                            this.inGroupIndices[speechIndex] = (this.inGroupIndices[speechIndex] + 1) % highlights.length;
                        }
                        
                        // Highlight the term
                        this.animateScrollToElement(highlights[this.inGroupIndices[speechIndex]]);
                    }
                } else {
                    const highlights = speechContainer.querySelectorAll('.out-group-highlight');
                    if (highlights.length) {
                        // Initialize or increment the index
                        if (this.outGroupIndices[speechIndex] === undefined) {
                            this.outGroupIndices[speechIndex] = 0;
                        } else {
                            this.outGroupIndices[speechIndex] = (this.outGroupIndices[speechIndex] + 1) % highlights.length;
                        }
                        
                        // Highlight the term
                        this.animateScrollToElement(highlights[this.outGroupIndices[speechIndex]]);
                    }
                }
                
                // Toggle between in-group and out-group for this speech
                this.inGroupTurn[speechIndex] = !this.inGroupTurn[speechIndex];
                
            }, this.autoScrollInterval);
        },
        
        stopSpeechAnimation(speechIndex) {
            if (this.speechTimers[speechIndex]) {
                clearInterval(this.speechTimers[speechIndex]);
                delete this.speechTimers[speechIndex];
            }
        },
        
        stopAllAnimations() {
            // Clear all timers
            Object.keys(this.speechTimers).forEach(index => {
                clearInterval(this.speechTimers[index]);
            });
            this.speechTimers = {};
            
            // Reset indices and turn states
            this.inGroupIndices = {};
            this.outGroupIndices = {};
            this.inGroupTurn = {};
        },
        
        toggleAutoScroll() {
            this.isPaused = !this.isPaused;
            this.mainScrollPaused = this.isPaused;
            
            // Restart speech animations if needed
            if (!this.isPaused && this.script_data && this.script_data.length) {
                this.script_data.forEach((_, index) => {
                    if (!this.speechTimers[index]) {
                        this.startSpeechAnimation(index);
                    }
                });
            }
        },

        // Add new methods for main container scrolling
        startMainScroll() {
            if (this.mainScrollTimer) {
                this.stopMainScroll(); // Clear any existing timer first
            }
            
            const container = this.$refs.mainContainer;
            if (!container) return;
            
            // Make the container element scrollable
            if (container.parentElement) {
                container.parentElement.style.overflow = 'hidden';
                container.parentElement.style.height = 'calc(100vh - 150px)';
            }
            
            // Save initial scroll position
            let lastScrollPosition = 0;
            
            // Start the smooth scrolling animation
            const scrollStep = () => {
                if (this.mainScrollPaused) {
                    this.mainScrollTimer = requestAnimationFrame(scrollStep);
                    return;
                }
                
                const container = this.$refs.mainContainer;
                if (!container || !container.parentElement) return;
                
                const parentElement = container.parentElement;
                const maxScroll = container.scrollHeight - parentElement.clientHeight;
                
                // Increment scroll position
                lastScrollPosition += this.mainScrollSpeed;
                
                // Create infinite loop effect by resetting position when reaching end
                if (lastScrollPosition >= maxScroll) {
                    // Seamless reset - instantly move back to top without animation
                    lastScrollPosition = 0;
                    parentElement.scrollTop = 0;
                } else {
                    // Apply scroll position to container's parent
                    parentElement.scrollTop = lastScrollPosition;
                }
                
                // Continue scrolling
                this.mainScrollTimer = requestAnimationFrame(scrollStep);
            };
            
            // Start animation
            this.mainScrollTimer = requestAnimationFrame(scrollStep);
        },
        
        stopMainScroll() {
            if (this.mainScrollTimer) {
                cancelAnimationFrame(this.mainScrollTimer);
                this.mainScrollTimer = null;
            }
        },
        
        toggleMainScroll() {
            this.mainScrollPaused = !this.mainScrollPaused;
        },
        
        // New method to centralize initialization
        initializeComponent() {
            // Start animations for each speech
            if (this.script_data && this.script_data.length) {
                this.script_data.forEach((_, index) => {
                    this.startSpeechAnimation(index);
                });
                
                // Start main container scrolling
                this.startMainScroll();
            }
        },
        
        // New method to centralize cleanup
        cleanupComponent() {
            // Stop all speech animations
            this.stopAllAnimations();
            
            // Stop main scrolling
            this.stopMainScroll();
        }
    }
}
</script>

<style scoped>
.section-all-scripts {
    width: 1200px;
    padding-left: 16px;
    margin-left: auto;
    margin-right: auto;
    height: 100vh !important; /* Adjust based on your header/footer heights */
    position: relative;
    overflow: hidden;
}

.main-text-wrapper {
    display: flex;
    width: 1200px;
    flex-wrap: wrap;
    gap: 16px;
    margin-left: auto;
    margin-right: auto;
    justify-content: space-between;
    padding-bottom: 60px; /* Add extra padding at bottom for smoother scrolling experience */
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

.in-group-highlight {
    color: #e74c3c;
    background: rgba(231, 76, 60, 0.1);
    padding: 2px 2px;
    border-radius: 2px;
    font-weight: bold;
}

.out-group-highlight {
    color: #e74c3c;
    background: rgba(231, 76, 60, 0.1);
    padding: 2px 2px;
    border-radius: 2px;
    font-weight: bold;
}

/* Fix for scoped styles with v-html content */
:deep(.in-group-highlight) {
    
    font-weight: bold;
    color: #3d5ec9;
    background: rgba(65, 84, 255, 0.259);
    padding: 2px 2px;
    border-radius: 2px;
    font-weight: bold;
}

:deep(.out-group-highlight) {
    color: #e74c3c;
    background: rgba(231, 76, 60, 0.1);
    padding: 2px 2px;
    border-radius: 2px;
    font-weight: bold;
}

/* Enhance the existing highlight styles */
:deep(.highlight-active) {
    transform: scale(1.2);
    z-index: 10;
    transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    box-shadow: 0 0 8px rgba(255, 255, 255, 0.7);
}

:deep(.in-group-highlight), :deep(.out-group-highlight) {
    transition: all 0.2s ease;
}

:deep(.in-group-highlight:focus), :deep(.out-group-highlight:focus) {
    outline: none;
}

/* Add this new style */
.auto-scroll-control {
    display: flex;
    justify-content: center;
    /* margin: 10px 0 20px; */
}

.auto-scroll-toggle {
    background-color: rgba(255, 255, 255, 0.2);
    color: white;
    border: 1px solid rgba(255, 255, 255, 0.4);
    border-radius: 15px;
    padding: 5px 15px;
    font-size: 12px;
    cursor: pointer;
    transition: all 0.2s ease;
}

.auto-scroll-toggle:hover {
    background-color: rgba(255, 255, 255, 0.3);
}

.title-all{
    font-size: 1.5rem;
    font-weight: bold;
    margin-bottom: 20px;
    text-align: center;
    color: #ffffff;
    position: fixed;
    top: 11px;
    left: 20px;
}
</style>