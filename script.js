document.addEventListener('DOMContentLoaded', () => {
    // Éléments du DOM
    const candlesBottom = document.getElementById('candles-bottom');
    const candlesMiddle = document.getElementById('candles-middle');
    const candlesTop = document.getElementById('candles-top');
    const addCandleBtn = document.getElementById('add-candle');
    const startMicBtn = document.getElementById('start-mic');
    const volumeMeter = document.getElementById('volume-meter');
    const micMessage = document.getElementById('mic-message');
    const controls = document.querySelector('.controls');
    
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
    const layers = [
        { container: candlesBottom, name: 'bottom', count: 0 },
        { container: candlesMiddle, name: 'middle', count: 0 },
        { container: candlesTop, name: 'top', count: 0 }
    ];
    
    // Cacher les contrôles initialement
    controls.style.opacity = '0';
    
    // Afficher les contrôles après l'animation du gâteau
    setTimeout(() => {
        controls.style.opacity = '1';
    }, 5000);

    // Ajouter une bougie
    addCandleBtn.addEventListener('click', () => {
        addCandle();
    });

    // Démarrer le microphone et écouter le souffle
    startMicBtn.addEventListener('click', () => {
        if (!audioContext) {
            initMicrophone();
        } else {
            stopMicrophone();
        }
    });

    // Fonction pour ajouter une bougie
    function addCandle() {
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
            // Supprimer la première bougie
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
        
        // Ajouter la flamme à la bougie
        candle.appendChild(flame);
        
        // Définir le délai d'animation
        candle.style.animationDelay = `${totalCandles * 0.15}s`;
        
        // Ajouter la bougie au conteneur approprié
        targetLayer.container.appendChild(candle);
        targetLayer.count++;
        totalCandles++;
        
        // Effet sonore simulé (optionnel)
        playAddCandleSound();
    }

    // Ajouter 3 bougies par défaut avec un délai
    setTimeout(() => {
        for (let i = 0; i < 3; i++) {
            setTimeout(() => addCandle(), i * 300);
        }
    }, 4500);

    // Fonction pour simuler un effet sonore
    function playAddCandleSound() {
        // Créer un court bip avec Web Audio API si disponible
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
        
        // Calculer le volume en se concentrant sur les fréquences moyennes (souffle)
        let sum = 0;
        const startFreq = Math.floor(bufferLength * 0.1);
        const endFreq = Math.floor(bufferLength * 0.4);
        
        for (let i = startFreq; i < endFreq; i++) {
            sum += dataArray[i];
        }
        const average = sum / (endFreq - startFreq);
        
        const volumePercent = Math.min(100, average * 1.8);
        volumeMeter.style.setProperty('--volume-width', volumePercent + '%');
        
        // Détecter un souffle plus sensible
        if (volumePercent > 45 && !isBlowing) {
            isBlowing = true;
            blowOutCandles();
            
            clearTimeout(blowingTimeout);
            blowingTimeout = setTimeout(() => {
                isBlowing = false;
            }, 2000);
        }
    }
    
    // Souffler les bougies avec une belle animation
    function blowOutCandles() {
        const allFlames = document.querySelectorAll('.flame');
        
        if (allFlames.length === 0) {
            micMessage.textContent = 'Aucune bougie à souffler!';
            return;
        }
        
        // Animation de souffle visuel
        createBlowEffect();
        
        // Éteindre les flammes une par une
        allFlames.forEach((flame, index) => {
            setTimeout(() => {
                flame.style.animation = 'extinguish 0.6s forwards';
                flame.parentElement.classList.add('extinguished');
                
                // Particules de fumée (effet visuel)
                createSmokeEffect(flame);
            }, index * 150);
        });
        
        setTimeout(() => {
            micMessage.textContent = '🎉 Joyeux Anniversaire #####! 🎂';
            micMessage.style.fontSize = '18px';
            micMessage.style.color = '#ffd93d';
            
            // Confettis effect
            createConfetti();
        }, allFlames.length * 150 + 500);
    }
    
    // Effet visuel de souffle
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
    
    // Effet de fumée
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
    
    // Confettis
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
});

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