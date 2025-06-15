// Variables globales
let userName = '';
let isAuthenticated = false;
let cakeAnimationCompleted = false;

// Éléments du DOM - Déclarés globalement
let candlesBottom, candlesMiddle, candlesTop, addCandleBtn, startMicBtn, volumeMeter, micMessage, controls;

// Variables pour l'API audio
let audioContext;
let analyser;
let microphone;
let javascriptNode;
let isBlowing = false;
let blowingTimeout;

// Configuration des bougies
let candleCount = 0;
let totalCandles = 0;
const maxCandlesPerLayer = 10;
let layers = [];

// ÉTAPE 1: Authentification au chargement de la page
document.addEventListener('DOMContentLoaded', function() {
    initializeAuth();
});

function initializeAuth() {
    const authModal = document.getElementById('auth-modal');
    const nameInput = document.getElementById('name-input');
    const authButton = document.getElementById('auth-button');
    
    // Focus automatique sur l'input
    setTimeout(() => {
        nameInput.focus();
    }, 500);
    
    // Validation en temps réel
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
    
    // Validation avec Entrée
    nameInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter' && this.value.trim().length >= 2) {
            processAuthentication();
        }
    });
    
    // Validation avec clic
    authButton.addEventListener('click', function() {
        if (nameInput.value.trim().length >= 2) {
            processAuthentication();
        }
    });
    
    function processAuthentication() {
        const name = nameInput.value.trim();
        if (name.length < 2) return;
        
        // ÉTAPE 2: Récupération du prénom
        userName = name;
        isAuthenticated = true;
        console.log(`✅ Prénom récupéré: ${userName}`);
        
        // Désactiver les interactions
        nameInput.disabled = true;
        authButton.disabled = true;
        authButton.innerHTML = 'Préparation du gâteau... ✨';
        
        // Animation de sortie de l'auth
        const authModal = document.getElementById('auth-modal');
        authModal.classList.add('auth-fade-out');
        
        // Attendre la fin de l'animation puis commencer la séquence
        setTimeout(() => {
            // Cacher l'auth
            authModal.style.display = 'none';
            
            // ÉTAPE 3: Démarrer la séquence d'animations
            startAnimationSequence();
            
        }, 1000);
    }
}

// ÉTAPE 3: Séquence d'animations dans l'ordre correct
function startAnimationSequence() {
    console.log('🎬 Début de la séquence d\'animations');
    
    // 1. Révéler le contenu principal
    revealMainContent();
    
    // 2. Démarrer l'animation du gâteau (2 secondes après révélation)
    setTimeout(() => {
        startCakeAnimations();
    }, 2000);
    
    // 3. Afficher le titre avec le prénom (après animation gâteau)
    setTimeout(() => {
        revealTitle();
    }, 4000);
    
    // 4. Initialiser les contrôles et ajouter les bougies (après le titre)
    setTimeout(() => {
        initializeCakeControls();
        addInitialCandles();
    }, 5500);
}

function revealMainContent() {
    console.log('📱 Révélation du contenu principal');
    const mainContainer = document.getElementById('main-container');
    
    // Afficher le contenu principal
    mainContainer.classList.remove('hidden');
    mainContainer.classList.add('main-entrance');
}

// ÉTAPE 4: Animation du gâteau
function startCakeAnimations() {
    console.log(`🎂 Animation du gâteau démarrée pour ${userName}!`);
    cakeAnimationCompleted = false;
    
    // Ajouter les classes d'animation au gâteau
    const cake = document.querySelector('.cake');
    const layers = document.querySelectorAll('.layer');
    const icings = document.querySelectorAll('.icing');
    
    // Animation d'apparition des couches du gâteau
    cake.classList.add('cake-entrance');
    
    layers.forEach((layer, index) => {
        setTimeout(() => {
            layer.classList.add('layer-appear');
        }, index * 300);
    });
    
    // Animation des nappages
    setTimeout(() => {
        icings.forEach((icing, index) => {
            setTimeout(() => {
                icing.classList.add('icing-appear');
            }, index * 200);
        });
    }, 900);
    
    // Marquer l'animation comme terminée
    setTimeout(() => {
        cakeAnimationCompleted = true;
        console.log('✅ Animation du gâteau terminée');
    }, 2000);
}

// ÉTAPE 5: Révéler le titre avec le prénom
function revealTitle() {
    console.log(`📝 Affichage du titre pour ${userName}`);
    
    // Mettre à jour le titre de la page
    document.title = `Joyeux Anniversaire ${userName} ! 🎂`;
    
    // Mettre à jour le contenu du titre
    const mainTitle = document.getElementById('main-title');
    const namePlaceholder = document.getElementById('name-placeholder');
    
    // Insérer le prénom
    namePlaceholder.textContent = userName;
    
    // Animation du titre
    mainTitle.classList.add('title-reveal');
}

// ÉTAPE 6: Initialiser les contrôles et ajouter les bougies
function initializeCakeControls() {
    console.log('🕹️ Initialisation des contrôles');
    
    // Récupérer les éléments du DOM
    candlesBottom = document.getElementById('candles-bottom');
    candlesMiddle = document.getElementById('candles-middle');
    candlesTop = document.getElementById('candles-top');
    addCandleBtn = document.getElementById('add-candle');
    startMicBtn = document.getElementById('start-mic');
    volumeMeter = document.getElementById('volume-meter');
    micMessage = document.getElementById('mic-message');
    controls = document.querySelector('.controls');
    
    // Configurer les couches
    layers = [
        { container: candlesBottom, name: 'bottom', count: 0 },
        { container: candlesMiddle, name: 'middle', count: 0 },
        { container: candlesTop, name: 'top', count: 0 }
    ];
    
    // Afficher les contrôles avec animation
    controls.style.opacity = '0';
    controls.style.transform = 'translateY(30px)';
    controls.style.transition = 'all 0.8s ease';
    
    setTimeout(() => {
        controls.style.opacity = '1';
        controls.style.transform = 'translateY(0)';
    }, 500);
    
    // Ajouter les événements
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
}

// Ajouter les bougies par défaut
function addInitialCandles() {
    console.log('🕯️ Ajout des bougies par défaut');
    
    // Ajouter 3 bougies avec un délai entre chacune
    for (let i = 0; i < 3; i++) {
        setTimeout(() => {
            addCandle();
        }, i * 500);
    }
}

// Fonction pour ajouter une bougie
function addCandle() {
    if (!cakeAnimationCompleted) {
        console.log('⏳ Animation du gâteau en cours, bougie en attente...');
        return;
    }
    
    // Trouver le prochain étage disponible
    let targetLayer = null;
    for (let layer of layers) {
        if (layer.count < maxCandlesPerLayer) {
            targetLayer = layer;
            break;
        }
    }
    
    // Si tous les étages sont pleins, remplacer une bougie du premier étage
    if (!targetLayer) {
        targetLayer = layers[0];
        const firstCandle = targetLayer.container.firstChild;
        if (firstCandle) {
            firstCandle.remove();
            targetLayer.count--;
            totalCandles--;
        }
    }
    
    // Créer la bougie
    const candle = document.createElement('div');
    candle.className = 'candle';
    candle.id = `candle-${totalCandles}`;
    
    // Créer la flamme
    const flame = document.createElement('div');
    flame.className = 'flame';
    
    candle.appendChild(flame);
    candle.style.animationDelay = `${totalCandles * 0.15}s`;
    
    // Ajouter la bougie au conteneur approprié
    targetLayer.container.appendChild(candle);
    targetLayer.count++;
    totalCandles++;
    
    console.log(`🕯️ Bougie ${totalCandles} ajoutée sur l'étage ${targetLayer.name}`);
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

// Fonction pour simuler un effet sonore
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

// ========== FONCTIONS MICROPHONE ==========

// Initialiser le microphone
function initMicrophone() {
    try {
        navigator.mediaDevices.getUserMedia({ audio: true })
            .then((stream) => {
                startMicBtn.textContent = 'Arrêter le micro';
                startMicBtn.style.background = 'linear-gradient(135deg, #ff6b6b, #ff8e8e)';
                micMessage.textContent = 'Soufflez pour éteindre les bougies!';
                
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
                console.error('Erreur d\'accès au microphone:', error);
                micMessage.textContent = '🙀 Erreur: impossible d\'accéder au microphone';
                micMessage.style.color = 'white';
            });
    } catch (error) {
        console.error('Erreur lors de l\'initialisation du microphone:', error);
        micMessage.textContent = 'Microphone non supporté';
        micMessage.style.color = '#ff6b6b';
    }
}

// Arrêter le microphone
function stopMicrophone() {
    if (audioContext) {
        javascriptNode.disconnect();
        analyser.disconnect();
        microphone.disconnect();
        audioContext.close();
        audioContext = null;
        
        startMicBtn.textContent = 'Souffler les bougies';
        startMicBtn.style.background = 'linear-gradient(135deg, #667eea, #764ba2)';
        micMessage.textContent = 'Micro arrêté';
        micMessage.style.color = 'rgba(255, 255, 255, 0.7)';
        volumeMeter.style.setProperty('--volume-width', '0%');
    }
}

// Traiter les données audio du microphone
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

// Souffler les bougies
function blowOutCandles() {
    const allFlames = document.querySelectorAll('.flame');
    
    if (allFlames.length === 0) {
        micMessage.textContent = 'Aucune bougie à souffler!';
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
        micMessage.textContent = `🎉 Joyeux Anniversaire ${userName} 🎂`;
        micMessage.style.fontSize = '18px';
        micMessage.style.color = '#ffd93d';
        createConfetti();
    }, allFlames.length * 150 + 500);
}

// Effets visuels
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

// Styles d'animation supplémentaires
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