// Global variables
let userName = '';
let isAuthenticated = false;
let cakeAnimationCompleted = false;

// DOM elements - Declared globally
let candlesBottom, candlesMiddle, candlesTop, addCandleBtn, startMicBtn, volumeMeter, micMessage, controls;

// Variables for audio API
let audioContext;
let analyser;
let microphone;
let javascriptNode;
let isBlowing = false;
let blowingTimeout;

// Candle configuration
let candleCount = 0;
let totalCandles = 0;
const maxCandlesPerLayer = 10;
let layers = [];

// STEP 1: Authentication when page loads
document.addEventListener('DOMContentLoaded', function() {
    initializeAuth();
});

function initializeAuth() {
    const authModal = document.getElementById('auth-modal');
    const nameInput = document.getElementById('name-input');
    const authButton = document.getElementById('auth-button');
    
    // Auto-focus on input
    setTimeout(() => {
        nameInput.focus();
    }, 500);
    
    // Real-time validation
    nameInput.addEventListener('input', function() {
        const name = this.value.trim();
        authButton.disabled = name.length < 2;
        
        if (name.length >= 2) {
            authButton.style.opacity = '1';
            authButton.style.transform = 'scale(1)';
        } else {
            authButton.style.opacity = '0.5';
            authButton.style.transform = 'scale(0.95)';
        }
    });
    
    // Validation with Enter key
    nameInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter' && this.value.trim().length >= 2) {
            processAuthentication();
        }
    });
    
    // Validation with click
    authButton.addEventListener('click', function() {
        if (nameInput.value.trim().length >= 2) {
            processAuthentication();
        }
    });
    
    function processAuthentication() {
        const name = nameInput.value.trim();
        if (name.length < 2) return;
        
        // STEP 2: Get first name
        userName = name;
        isAuthenticated = true;
        console.log(`Name fetched: ${userName}`);
        
        // Disable interactions
        nameInput.disabled = true;
        authButton.disabled = true;
        authButton.innerHTML = 'Preparing the cake ... ✨';
        
        // Auth exit animation
        const authModal = document.getElementById('auth-modal');
        authModal.classList.add('auth-fade-out');
        
        // Wait for animation to finish then start sequence
        setTimeout(() => {
            // Hide auth
            authModal.style.display = 'none';
            
            // STEP 3: Start animation sequence
            startAnimationSequence();
            
        }, 1000);
    }
}

// STEP 3: Animation sequence in correct order
function startAnimationSequence() {
    console.log('🎬 Starting animation sequence');
    
    // 1. Reveal main content
    revealMainContent();
    
    // 2. Start cake animation (2 seconds after reveal)
    setTimeout(() => {
        startCakeAnimations();
    }, 2000);
    
    // 3. Display title with first name (after cake animation)
    setTimeout(() => {
        revealTitle();
    }, 4000);
    
    // 4. Initialize controls and add candles (after title)
    setTimeout(() => {
        initializeCakeControls();
        addInitialCandles();
    }, 5500);
}

function revealMainContent() {
    console.log('📱 Revealing main content');
    const mainContainer = document.getElementById('main-container');
    
    // Show main content
    mainContainer.classList.remove('hidden');
    mainContainer.classList.add('main-entrance');
}

// STEP 4: Cake animation
function startCakeAnimations() {
    console.log(`🎂 Cake animation started for ${userName}!`);
    cakeAnimationCompleted = false;
    
    // Add animation classes to cake
    const cake = document.querySelector('.cake');
    const layers = document.querySelectorAll('.layer');
    const icings = document.querySelectorAll('.icing');
    
    // Cake layer appearance animation
    cake.classList.add('cake-entrance');
    
    layers.forEach((layer, index) => {
        setTimeout(() => {
            layer.classList.add('layer-appear');
        }, index * 300);
    });
    
    // Icing animation
    setTimeout(() => {
        icings.forEach((icing, index) => {
            setTimeout(() => {
                icing.classList.add('icing-appear');
            }, index * 200);
        });
    }, 900);
    
    // Mark animation as completed
    setTimeout(() => {
        cakeAnimationCompleted = true;
        console.log('✅ Finished animation');
    }, 2000);
}

// STEP 5: Reveal title with first name
function revealTitle() {
    console.log(`📝 Displaying title for ${userName}`);
    
    // Update page title
    document.title = `Happy birthday ${userName} ! 🎂`;
    
    // Update title content
    const mainTitle = document.getElementById('main-title');
    const namePlaceholder = document.getElementById('name-placeholder');
    
    // Insert first name
    namePlaceholder.textContent = userName;
    
    // Title animation
    mainTitle.classList.add('title-reveal');
}

// STEP 6: Initialize controls and add candles
function initializeCakeControls() {
    console.log('🕹️ Initializing controls');
    
    // Get DOM elements
    candlesBottom = document.getElementById('candles-bottom');
    candlesMiddle = document.getElementById('candles-middle');
    candlesTop = document.getElementById('candles-top');
    addCandleBtn = document.getElementById('add-candle');
    startMicBtn = document.getElementById('start-mic');
    volumeMeter = document.getElementById('volume-meter');
    micMessage = document.getElementById('mic-message');
    controls = document.querySelector('.controls');
    
    // Configure layers
    layers = [
        { container: candlesBottom, name: 'bottom', count: 0 },
        { container: candlesMiddle, name: 'middle', count: 0 },
        { container: candlesTop, name: 'top', count: 0 }
    ];
    
    // Show controls with animation
    controls.style.opacity = '0';
    controls.style.transform = 'translateY(30px)';
    controls.style.transition = 'all 0.8s ease';
    
    setTimeout(() => {
        controls.style.opacity = '1';
        controls.style.transform = 'translateY(0)';
    }, 500);
    
    // Add events
    addCandleBtn.addEventListener('click', () => {
        if (cakeAnimationCompleted) addCandle();
    });

    startMicBtn.addEventListener('click', () => {
        if (!cakeAnimationCompleted) return;
        
        if (!audioContext) {
            initMicrophone();
        } else {
            stopMicrophone();
        }
    });
    
    // Initialize volume meter to start from left
    volumeMeter.style.setProperty('--volume-width', '0%');
}

// Add default candles
function addInitialCandles() {
    console.log('Adding candles by default');
    
    // Add 3 candles with delay between each
    for (let i = 0; i < 3; i++) {
        setTimeout(() => {
            addCandle();
        }, i * 500);
    }
}

// Function to add a candle
function addCandle() {
    if (!cakeAnimationCompleted) {
        console.log('Animation of the candles in progress...');
        return;
    }
    
    // Find next available layer
    let targetLayer = null;
    for (let layer of layers) {
        if (layer.count < maxCandlesPerLayer) {
            targetLayer = layer;
            break;
        }
    }
    
    // If all layers are full, replace a candle from the first layer
    if (!targetLayer) {
        targetLayer = layers[0];
        const firstCandle = targetLayer.container.firstChild;
        if (firstCandle) {
            firstCandle.remove();
            targetLayer.count--;
            totalCandles--;
        }
    }
    
    // Create the candle
    const candle = document.createElement('div');
    candle.className = 'candle';
    candle.id = `candle-${totalCandles}`;
    
    // Create the flame
    const flame = document.createElement('div');
    flame.className = 'flame';
    
    candle.appendChild(flame);
    candle.style.animationDelay = `${totalCandles * 0.15}s`;
    
    // Add candle to appropriate container
    targetLayer.container.appendChild(candle);
    targetLayer.count++;
    totalCandles++;
    
    console.log(`🕯️ Candle ${totalCandles} added to ${targetLayer.name} layer`);
    playAddCandleSound();
}

function createFloatingEmoji(emoji) {
    const element = document.createElement('div');
    element.innerHTML = emoji;
    element.style.position = 'fixed';
    element.style.fontSize = '2.5em';
    element.style.pointerEvents = 'none';
    element.style.zIndex = '999';
    element.style.left = (Math.random() * (window.innerWidth - 100)) + 'px';
    element.style.top = window.innerHeight + 'px';
    element.style.transition = 'all 4s ease-out';
    element.style.opacity = '1';
    
    document.body.appendChild(element);
    
    setTimeout(() => {
        element.style.top = '-100px';
        element.style.opacity = '0';
        element.style.transform = 'rotate(360deg) scale(1.5)';
    }, 100);
    
    setTimeout(() => {
        if (element.parentNode) {
            element.parentNode.removeChild(element);
        }
    }, 4100);
}

// Function to simulate a sound effect
function playAddCandleSound() {
    if (window.AudioContext || window.webkitAudioContext) {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        
        oscillator.frequency.setValueAtTime(800, audioCtx.currentTime);
        gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);
        
        oscillator.start(audioCtx.currentTime);
        oscillator.stop(audioCtx.currentTime + 0.1);
    }
}

// ========== MICROPHONE FUNCTIONS ==========

// Initialize microphone
function initMicrophone() {
    try {
        navigator.mediaDevices.getUserMedia({ audio: true })
            .then((stream) => {
                startMicBtn.textContent = 'Stop the Mic';
                startMicBtn.style.background = 'linear-gradient(135deg, #ff6b6b, #ff8e8e)';
                micMessage.textContent = 'Blow the candles!';
                
                audioContext = new (window.AudioContext || window.webkitAudioContext)();
                analyser = audioContext.createAnalyser();
                microphone = audioContext.createMediaStreamSource(stream);
                javascriptNode = audioContext.createScriptProcessor(2048, 1, 1);
                
                microphone.connect(analyser);
                analyser.connect(javascriptNode);
                javascriptNode.connect(audioContext.destination);
                
                analyser.fftSize = 256;
                analyser.smoothingTimeConstant = 0.85;
                
                javascriptNode.onaudioprocess = processAudio;
            })
            .catch((error) => {
                console.error('Error accessing the mic:', error);
                micMessage.textContent = ' Error: can\'t access the mic';
                micMessage.style.color = 'white';
            });
    } catch (error) {
        console.error('Error while initialising the mic:', error);
        micMessage.textContent = 'Microphone not supported';
        micMessage.style.color = '#ff6b6b';
    }
}

// Stop microphone
function stopMicrophone() {
    if (audioContext) {
        javascriptNode.disconnect();
        analyser.disconnect();
        microphone.disconnect();
        audioContext.close();
        audioContext = null;
        
        startMicBtn.textContent = 'Blow the candles';
        startMicBtn.style.background = 'linear-gradient(135deg, #667eea, #764ba2)';
        micMessage.textContent = 'Mic stopped';
        micMessage.style.color = 'rgba(255, 255, 255, 0.7)';
        volumeMeter.style.setProperty('--volume-width', '0%');
    }
}

// Process microphone audio data
function processAudio(event) {
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    
    analyser.getByteFrequencyData(dataArray);
    
    let sum = 0;
    const startFreq = Math.floor(bufferLength * 0.1);
    const endFreq = Math.floor(bufferLength * 0.4);
    
    for (let i = startFreq; i < endFreq; i++) {
        sum += dataArray[i];
    }
    const average = sum / (endFreq - startFreq);
    
    const volumePercent = Math.min(100, average * 1.8);
    volumeMeter.style.setProperty('--volume-width', volumePercent + '%');
    
    if (volumePercent > 45 && !isBlowing) {
        isBlowing = true;
        blowOutCandles();
        
        clearTimeout(blowingTimeout);
        blowingTimeout = setTimeout(() => {
            isBlowing = false;
        }, 2000);
    }
}

// Blow out candles
function blowOutCandles() {
    const allFlames = document.querySelectorAll('.flame');
    
    if (allFlames.length === 0) {
        micMessage.textContent = 'No candles to blow out!';
        return;
    }
    
    createBlowEffect();
    
    allFlames.forEach((flame, index) => {
        setTimeout(() => {
            flame.style.animation = 'extinguish 0.6s forwards';
            flame.parentElement.classList.add('extinguished');
            createSmokeEffect(flame);
        }, index * 150);
    });
    
    setTimeout(() => {
        micMessage.textContent = `🎉 Happy birthday ${userName} 🎂`;
        micMessage.style.fontSize = '18px';
        micMessage.style.color = '#ffd93d';
        createConfetti();
    }, allFlames.length * 150 + 500);
}

// Visual effects
function createBlowEffect() {
    const blowEffect = document.createElement('div');
    blowEffect.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        width: 100px;
        height: 50px;
        background: radial-gradient(ellipse, rgba(255,255,255,0.3), transparent);
        border-radius: 50%;
        transform: translate(-50%, -50%) scale(0);
        animation: blowWave 0.8s ease-out forwards;
        pointer-events: none;
        z-index: 1000;
    `;
    
    document.body.appendChild(blowEffect);
    setTimeout(() => blowEffect.remove(), 800);
}

function createSmokeEffect(flame) {
    const smoke = document.createElement('div');
    const rect = flame.getBoundingClientRect();
    
    smoke.style.cssText = `
        position: fixed;
        left: ${rect.left + rect.width / 2}px;
        top: ${rect.top}px;
        width: 10px;
        height: 20px;
        background: rgba(128, 128, 128, 0.6);
        border-radius: 50%;
        animation: smokeRise 2s ease-out forwards;
        pointer-events: none;
        z-index: 1000;
    `;
    
    document.body.appendChild(smoke);
    setTimeout(() => smoke.remove(), 2000);
}

function createConfetti() {
    const colors = ['#ff6b6b', '#ffd93d', '#6bcf7f', '#667eea', '#ff9a9e'];
    
    for (let i = 0; i < 50; i++) {
        setTimeout(() => {
            const confetti = document.createElement('div');
            confetti.style.cssText = `
                position: fixed;
                left: ${Math.random() * 100}vw;
                top: -10px;
                width: ${Math.random() * 8 + 4}px;
                height: ${Math.random() * 8 + 4}px;
                background: ${colors[Math.floor(Math.random() * colors.length)]};
                animation: confettiFall ${Math.random() * 2 + 2}s linear forwards;
                pointer-events: none;
                z-index: 1000;
            `;
            
            document.body.appendChild(confetti);
            setTimeout(() => confetti.remove(), 4000);
        }, i * 50);
    }
}


function checkAuth() {
    return isAuthenticated;
}

function getUserName() {
    return userName;
}

// Additional animation styles
const additionalStyles = document.createElement('style');
additionalStyles.textContent = `
    @keyframes blowWave {
        from { transform: translate(-50%, -50%) scale(0); opacity: 0.8; }
        to { transform: translate(-50%, -50%) scale(3); opacity: 0; }
    }
    
    @keyframes smokeRise {
        from { transform: translateY(0) scale(1); opacity: 0.6; }
        to { transform: translateY(-50px) scale(2); opacity: 0; }
    }
    
    @keyframes confettiFall {
        from { transform: translateY(-10px) rotateZ(0deg); }
        to { transform: translateY(100vh) rotateZ(360deg); }
    }
`;
document.head.appendChild(additionalStyles);