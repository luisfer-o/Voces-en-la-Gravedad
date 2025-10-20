// ===========================================
// CLASES Y MÓDULOS PRINCIPALES
// ===========================================

/**
 * Clase para manejar el simulador de órbitas planetarias
 */
class OrbitSimulator {
    constructor() {
        this.simulationSpeed = 1;
        this.isRunning = false;
        this.animationId = null;
        this.angle = 0;
        this.canvas = null;
        this.ctx = null;
        this.centerX = 0;
        this.centerY = 0;
        this.planets = [];
        this.maxRadius = 0;
        this.scale = 1;
    }

    /**
     * Inicializa el canvas del simulador de órbitas
     */
    initCanvas() {
        try {
            this.canvas = document.getElementById('orbitCanvas');
            if (!this.canvas) {
                throw new Error('Canvas de órbitas no encontrado');
            }

            this.ctx = this.canvas.getContext('2d');
            const devicePixelRatio = window.devicePixelRatio || 1;
            const rect = this.canvas.getBoundingClientRect();

            this.canvas.width = rect.width * devicePixelRatio;
            this.canvas.height = rect.height * devicePixelRatio;
            this.ctx.scale(devicePixelRatio, devicePixelRatio);
            this.canvas.style.width = rect.width + 'px';
            this.canvas.style.height = rect.height + 'px';

            this.centerX = rect.width / 2;
            this.centerY = rect.height / 2;
            this.maxRadius = Math.min(this.centerX, this.centerY) - 30;
            this.scale = this.maxRadius / 350;

            this.initPlanets();
            this.setupEventListeners();
            this.draw(); // Dibujar estado inicial
            this.start(); // Iniciar la simulación automáticamente
        } catch (error) {
            console.error('Error inicializando canvas de órbitas:', error);
            Utils.showNotification('Error al inicializar el simulador de órbitas', 'error');
        }
    }

    /**
     * Inicializa los datos de los planetas
     */
    initPlanets() {
        this.planets = [
            { radius: 50 * this.scale, speed: 0.02, color: '#8C7853', size: Math.max(4, 8 * this.scale), name: 'Mercurio' },
            { radius: 80 * this.scale, speed: 0.015, color: '#E39E54', size: Math.max(6, 12 * this.scale), name: 'Venus' },
            { radius: 110 * this.scale, speed: 0.01, color: '#4A7CB8', size: Math.max(6.5, 13 * this.scale), name: 'Tierra' },
            { radius: 140 * this.scale, speed: 0.008, color: '#C1440E', size: Math.max(5, 10 * this.scale), name: 'Marte' },
            { radius: 200 * this.scale, speed: 0.004, color: '#D8CA9D', size: Math.max(12.5, 25 * this.scale), name: 'Júpiter' },
            { radius: 250 * this.scale, speed: 0.003, color: '#FAD5A5', size: Math.max(11, 22 * this.scale), name: 'Saturno' },
            { radius: 300 * this.scale, speed: 0.002, color: '#4FD0E7', size: Math.max(9, 18 * this.scale), name: 'Urano' },
            { radius: 350 * this.scale, speed: 0.001, color: '#4B70DD', size: Math.max(8.5, 17 * this.scale), name: 'Neptuno' }
        ];
    }

    /**
     * Configura los event listeners para el canvas
     */
    setupEventListeners() {
        // Event listener para clics en planetas
        this.canvas.addEventListener('click', (event) => {
            this.handlePlanetClick(event);
        });

        // Soporte táctil para móviles
        if (Utils.isMobile()) {
            this.canvas.addEventListener('touchstart', (event) => {
                event.preventDefault();
                this.handlePlanetClick(event.touches[0]);
            });
        }
    }

    /**
     * Maneja los clics en planetas para mostrar información
     */
    handlePlanetClick(event) {
        const rect = this.canvas.getBoundingClientRect();
        const clickX = event.clientX - rect.left;
        const clickY = event.clientY - rect.top;

        this.planets.forEach(planet => {
            const x = this.centerX + Math.cos(this.angle * planet.speed) * planet.radius;
            const y = this.centerY + Math.sin(this.angle * planet.speed) * planet.radius;

            const distance = Math.sqrt((clickX - x) ** 2 + (clickY - y) ** 2);
            if (distance <= planet.size) {
                this.showPlanetPanel(planet.name.toLowerCase());
            }
        });
    }

    /**
     * Dibuja las órbitas y planetas
     */
    draw() {
        if (!this.ctx) return;

        this.clearCanvas();
        this.drawBackground();
        this.drawOrbits();
        this.update();
        this.drawPlanets();

        if (this.isRunning) {
            this.animationId = requestAnimationFrame(() => this.draw());
        }
    }

    /**
     * Limpia el canvas
     */
    clearCanvas() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    /**
     * Dibuja el fondo estelar
     */
    drawBackground() {
        // Dibujar estrellas de fondo
        for (let i = 0; i < 100; i++) {
            const x = Math.random() * this.canvas.width;
            const y = Math.random() * this.canvas.height;
            const radius = Math.random() * 1.5;

            this.ctx.fillStyle = 'white';
            this.ctx.beginPath();
            this.ctx.arc(x, y, radius, 0, Math.PI * 2);
            this.ctx.fill();
        }
    }

    /**
     * Dibuja las órbitas de los planetas
     */
    drawOrbits() {
        this.planets.forEach(planet => {
            this.ctx.beginPath();
            this.ctx.arc(this.centerX, this.centerY, planet.radius, 0, Math.PI * 2);
            this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
            this.ctx.stroke();
        });
    }

    /**
     * Dibuja los planetas en sus posiciones actuales
     */
    drawPlanets() {
        // Dibujar sol
        this.ctx.beginPath();
        this.ctx.arc(this.centerX, this.centerY, 20, 0, Math.PI * 2);
        this.ctx.fillStyle = '#FDB813';
        this.ctx.fill();

        // Dibujar planetas
        this.planets.forEach(planet => {
            const x = this.centerX + Math.cos(this.angle * planet.speed) * planet.radius;
            const y = this.centerY + Math.sin(this.angle * planet.speed) * planet.radius;

            this.ctx.beginPath();
            this.ctx.arc(x, y, planet.size, 0, Math.PI * 2);
            this.ctx.fillStyle = planet.color;
            this.ctx.fill();
        });
    }

    /**
     * Inicia la simulación
     */
    start() {
        if (!this.isRunning) {
            this.isRunning = true;
            this.draw();
            Utils.showNotification('Simulación de órbitas iniciada', 'success');
        }
    }

    /**
     * Pausa la simulación
     */
    pause() {
        this.isRunning = false;
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        Utils.showNotification('Simulación de órbitas pausada', 'warning');
    }

    /**
     * Reinicia la simulación
     */
    reset() {
        this.isRunning = false;
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        this.angle = 0;
        this.draw();
        Utils.showNotification('Simulación de órbitas reiniciada', 'success');
    }

    /**
     * Actualiza la velocidad de simulación
     */
    setSpeed(speed) {
        this.simulationSpeed = parseFloat(speed);
        Utils.showNotification(`Velocidad: ${this.simulationSpeed}x`, 'success');
    }

    /**
     * Actualiza el ángulo para la animación
     */
    update() {
        this.angle += 0.02 * this.simulationSpeed;
    }

    /**
     * Muestra el panel de información de planetas
     */
    showPlanetPanel(planetKey) {
        // Información detallada de cada planeta
        const planetInfo = {
            'mercurio': {
                name: 'Mercurio',
                description: 'Mercurio es el planeta más cercano al Sol y el más pequeño del sistema solar. Tiene una superficie rocosa con cráteres similares a la Luna.',
                facts: [
                    'Temperatura: -173°C a 427°C',
                    'Diámetro: 4,879 km',
                    'Distancia al Sol: 58 millones de km',
                    'Período orbital: 88 días terrestres'
                ]
            },
            'venus': {
                name: 'Venus',
                description: 'Venus es el segundo planeta desde el Sol y es conocido como el "planeta gemelo" de la Tierra debido a su tamaño similar.',
                facts: [
                    'Temperatura: 462°C (el más caliente)',
                    'Diámetro: 12,104 km',
                    'Distancia al Sol: 108 millones de km',
                    'Período orbital: 225 días terrestres'
                ]
            },
            'tierra': {
                name: 'Tierra',
                description: 'La Tierra es el tercer planeta desde el Sol y el único conocido que alberga vida. Tiene una atmósfera rica en oxígeno y agua líquida.',
                facts: [
                    'Temperatura: -89°C a 58°C',
                    'Diámetro: 12,756 km',
                    'Distancia al Sol: 150 millones de km',
                    'Período orbital: 365.25 días'
                ]
            },
            'marte': {
                name: 'Marte',
                description: 'Marte es conocido como el "planeta rojo" debido a su color característico causado por el óxido de hierro en su superficie.',
                facts: [
                    'Temperatura: -87°C a -5°C',
                    'Diámetro: 6,792 km',
                    'Distancia al Sol: 228 millones de km',
                    'Período orbital: 687 días terrestres'
                ]
            },
            'júpiter': {
                name: 'Júpiter',
                description: 'Júpiter es el planeta más grande del sistema solar, un gigante gaseoso con una Gran Mancha Roja que es una tormenta gigante.',
                facts: [
                    'Temperatura: -108°C',
                    'Diámetro: 142,984 km',
                    'Distancia al Sol: 778 millones de km',
                    'Período orbital: 12 años terrestres'
                ]
            },
            'saturno': {
                name: 'Saturno',
                description: 'Saturno es famoso por sus espectaculares anillos compuestos principalmente de hielo y roca. Es el segundo planeta más grande.',
                facts: [
                    'Temperatura: -139°C',
                    'Diámetro: 120,536 km',
                    'Distancia al Sol: 1,427 millones de km',
                    'Período orbital: 29 años terrestres'
                ]
            },
            'urano': {
                name: 'Urano',
                description: 'Urano es un gigante helado que rota sobre su lado, con un eje de rotación casi paralelo a su plano orbital.',
                facts: [
                    'Temperatura: -197°C',
                    'Diámetro: 51,118 km',
                    'Distancia al Sol: 2,871 millones de km',
                    'Período orbital: 84 años terrestres'
                ]
            },
            'neptuno': {
                name: 'Neptuno',
                description: 'Neptuno es el planeta más distante del Sol y tiene vientos supersónicos, siendo el más ventoso del sistema solar.',
                facts: [
                    'Temperatura: -201°C',
                    'Diámetro: 49,528 km',
                    'Distancia al Sol: 4,498 millones de km',
                    'Período orbital: 165 años terrestres'
                ]
            }
        };

        const info = planetInfo[planetKey];
        if (!info) return;

        // Crear o actualizar el panel de información
        let panel = document.getElementById('planet-panel');
        if (!panel) {
            panel = document.createElement('div');
            panel.id = 'planet-panel';
            panel.className = 'planet-panel';
            document.body.appendChild(panel);
        }

        panel.innerHTML = `
            <div class="planet-panel-header">
                <h3>${info.name}</h3>
                <button class="close-panel" onclick="orbitSimulator.closePlanetPanel()">×</button>
            </div>
            <div class="planet-panel-content">
                <p class="planet-description">${info.description}</p>
                <div class="planet-facts">
                    <h4>Datos curiosos:</h4>
                    <ul>
                        ${info.facts.map(fact => `<li>${fact}</li>`).join('')}
                    </ul>
                </div>
            </div>
        `;

        panel.classList.add('active');
        Utils.showNotification(`Información de ${info.name}`, 'success');
    }

    /**
     * Cierra el panel de información de planetas
     */
    closePlanetPanel() {
        const panel = document.getElementById('planet-panel');
        if (panel) {
            panel.classList.remove('active');
        }
    }
}

// Instancia global del simulador de órbitas
const orbitSimulator = new OrbitSimulator();

// ===========================================
// UTILIDADES GLOBALES
// ===========================================

/**
 * Clase de utilidades generales
 */
class Utils {
    /**
     * Muestra notificaciones al usuario
     */
    static showNotification(message, type) {
        // Crear elemento de notificación
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;

        // Agregar al cuerpo del documento
        document.body.appendChild(notification);

        // Mostrar notificación
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);

        // Ocultar y eliminar después de 3 segundos
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    /**
     * Verifica si el dispositivo es móvil
     */
    static isMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }
}

// Funciones globales para compatibilidad con HTML
window.startOrbitSimulation = function() {
    orbitSimulator.start();
};

window.pauseOrbitSimulation = function() {
    orbitSimulator.pause();
};

window.resetOrbitSimulation = function() {
    orbitSimulator.reset();
};

function initWeightCalculator() {
    // Inicializar calculadora de peso en diferentes planetas
    const planetSelect = document.getElementById('planetSelect');
    const weightInput = document.getElementById('earthWeight');
    const calculateBtn = document.getElementById('calculateWeight');
    const resultDiv = document.getElementById('weightResult');

    if (!planetSelect || !weightInput || !calculateBtn || !resultDiv) return;

    // Datos de gravedad relativa (Tierra = 1)
    const gravityFactors = {
        mercury: 0.38,
        venus: 0.91,
        mars: 0.38,
        jupiter: 2.34,
        saturn: 0.93,
        uranus: 0.92,
        neptune: 1.12,
        moon: 0.165
    };

    calculateBtn.addEventListener('click', function() {
        const planet = planetSelect.value;
        const weight = parseFloat(weightInput.value);

        if (isNaN(weight) || weight <= 0) {
            Utils.showNotification('Por favor ingresa un peso válido', 'error');
            return;
        }

        const factor = gravityFactors[planet];
        const newWeight = weight * factor;

        resultDiv.innerHTML = `
            <p>Tu peso en ${planet.charAt(0).toUpperCase() + planet.slice(1)} sería:</p>
            <strong>${newWeight.toFixed(2)} kg</strong>
        `;

        Utils.showNotification('Peso calculado', 'success');
    });
}

function initGallery() {
    // Aquí podríamos agregar funcionalidad para abrir imágenes en modal
    // Por ahora, solo agregamos un efecto visual simple
    const galleryItems = document.querySelectorAll('.gallery-item');

    galleryItems.forEach(item => {
        item.addEventListener('click', function() {
            Utils.showNotification('Galería: ' + this.querySelector('.gallery-caption').textContent, 'success');
        });
    });
}

function initOrbitSimulator() {
    // Inicializar controles
    document.getElementById('startOrbit').addEventListener('click', function() {
        startOrbitSimulation();
    });
    document.getElementById('pauseOrbit').addEventListener('click', function() {
        pauseOrbitSimulation();
    });
    document.getElementById('resetOrbit').addEventListener('click', function() {
        resetOrbitSimulation();
    });

    // Agregar control de velocidad
    const speedControl = document.getElementById('speedControl');
    if (speedControl) {
        speedControl.addEventListener('input', function() {
            orbitSimulator.setSpeed(this.value);
        });
    }

    // Detectar si es dispositivo móvil para ajustes táctiles
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    if (isMobile) {
        // Ajustes para móviles: aumentar áreas táctiles y mejorar feedback
        const controls = document.querySelectorAll('.orbit-controls button');
        controls.forEach(button => {
            button.style.minHeight = '48px';
            button.style.minWidth = '48px';
            button.style.fontSize = '16px';
        });

        // Mejorar feedback táctil
        controls.forEach(button => {
            button.addEventListener('touchstart', function() {
                this.style.transform = 'scale(0.95)';
            }, { passive: true });
            button.addEventListener('touchend', function() {
                this.style.transform = 'scale(1)';
            }, { passive: true });
        });
    }
}

document.addEventListener('DOMContentLoaded', function() {
    // Inicializar todas las funcionalidades
    initNavigation();
    initThemeToggle();
    initSatelliteCards();
    initQuiz();
    initGallery();
    initOrbitSimulator();
    initWeightCalculator();
    initGlossary();
    initMusicControl();

    // Mostrar notificación de bienvenida
    Utils.showNotification('¡Bienvenido a Explora el Espacio!', 'success');
});

// ===========================================
// SISTEMA DE NAVEGACIÓN ENTRE SECCIONES
// ===========================================

function initNavigation() {
    // Navegación por enlaces del menú
    const navLinks = document.querySelectorAll('nav a, .section-button');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetSection = this.getAttribute('data-section');
            showSection(targetSection);
        });
    });

    // Detectar si es dispositivo móvil para ajustes táctiles
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    if (isMobile) {
        // Ajustes para móviles: aumentar áreas táctiles
        navLinks.forEach(link => {
            link.style.minHeight = '48px';
            link.style.minWidth = '48px';
            link.style.display = 'flex';
            link.style.alignItems = 'center';
            link.style.justifyContent = 'center';
        });

        // Mejorar feedback táctil
        navLinks.forEach(link => {
            link.addEventListener('touchstart', function() {
                this.style.transform = 'scale(0.95)';
            }, { passive: true });
            link.addEventListener('touchend', function() {
                this.style.transform = 'scale(1)';
            }, { passive: true });
        });
    }

    // Mostrar la sección de inicio por defecto
    showSection('inicio');
}

function showSection(sectionId) {
    // Ocultar todas las secciones
    const sections = document.querySelectorAll('section');
    sections.forEach(section => {
        section.classList.remove('active');
    });

    // Mostrar la sección seleccionada
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.classList.add('active');

        // Si es la sección de órbitas, iniciar el canvas
        if (sectionId === 'orbita') {
            setTimeout(initOrbitCanvas, 100);
        }

        // Si es la sección del mapa estelar, iniciar el mapa
        if (sectionId === 'mapa') {
            setTimeout(initStarMap, 100);
        }
    }
}

// ===========================================
// ALTERNAR MODO OSCURO/CLARO
// ===========================================

function initThemeToggle() {
    const themeToggle = document.getElementById('themeToggle');
    themeToggle.addEventListener('click', function() {
        document.body.classList.toggle('light-mode');
        this.textContent = document.body.classList.contains('light-mode') ? '🌞' : '🌙';
        Utils.showNotification('Modo ' + (document.body.classList.contains('light-mode') ? 'claro' : 'oscuro') + ' activado', 'success');
    });

    // Detectar si es dispositivo móvil para ajustes táctiles
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    if (isMobile) {
        // Ajustes para móviles: aumentar áreas táctiles
        themeToggle.style.minHeight = '48px';
        themeToggle.style.minWidth = '48px';
        themeToggle.style.fontSize = '24px';
        themeToggle.style.display = 'flex';
        themeToggle.style.alignItems = 'center';
        themeToggle.style.justifyContent = 'center';

        // Mejorar feedback táctil
        themeToggle.addEventListener('touchstart', function() {
            this.style.transform = 'scale(0.95)';
        });
        themeToggle.addEventListener('touchend', function() {
            this.style.transform = 'scale(1)';
        });
    }
}

// ===========================================
// TARJETAS DE SATÉLITES EXPANDIBLES
// ===========================================

function initSatelliteCards() {
    const satelliteCards = document.querySelectorAll('.satellite-card');
    satelliteCards.forEach(card => {
        card.addEventListener('click', function() {
            this.classList.toggle('expanded');
        });
    });

    // Detectar si es dispositivo móvil para ajustes táctiles
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    if (isMobile) {
        // Ajustes para móviles: aumentar áreas táctiles
        satelliteCards.forEach(card => {
            card.style.minHeight = '48px';
            card.style.minWidth = '48px';
        });

        // Mejorar feedback táctil
        satelliteCards.forEach(card => {
            card.addEventListener('touchstart', function() {
                this.style.transform = 'scale(0.98)';
            });
            card.addEventListener('touchend', function() {
                this.style.transform = 'scale(1)';
            });
        });
    }
}

// ===========================================
// SISTEMA DE QUIZ INTERACTIVO
// ===========================================

let currentQuestion = 1;
let score = 0;

function initQuiz() {
    const totalQuestions = 10;

    const prevButton = document.getElementById('prevQuestion');
    const nextButton = document.getElementById('nextQuestion');
    const restartButton = document.getElementById('restartQuiz');

    // Navegación entre preguntas
    prevButton.addEventListener('click', function() {
        if (currentQuestion > 1) {
            showQuestion(currentQuestion - 1);
            currentQuestion--;
            updateQuizNav();
        }
    });

    nextButton.addEventListener('click', function() {
        if (currentQuestion < totalQuestions) {
            showQuestion(currentQuestion + 1);
            currentQuestion++;
            updateQuizNav();
        } else {
            showResults();
        }
    });

    // Reiniciar quiz
    restartButton.addEventListener('click', function() {
        currentQuestion = 1;
        score = 0;
        showQuestion(1);
        updateQuizNav();
        document.querySelector('.results').style.display = 'none';
        document.querySelector('.quiz-nav').style.display = 'flex';
    });

    // Manejar selección de respuestas
    document.querySelectorAll('.option').forEach(option => {
        option.addEventListener('click', function() {
            // Quitar selección anterior
            const options = this.parentElement.querySelectorAll('.option');
            options.forEach(opt => opt.classList.remove('selected'));

            // Seleccionar opción actual
            this.classList.add('selected');
        });
    });

    // Detectar si es dispositivo móvil para ajustes táctiles
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    if (isMobile) {
        // Ajustes para móviles: aumentar áreas táctiles y mejorar feedback
        const quizButtons = document.querySelectorAll('.quiz-nav button, .option');
        quizButtons.forEach(button => {
            button.style.minHeight = '48px';
            button.style.minWidth = '48px';
        });

        // Mejorar feedback táctil para opciones del quiz
        document.querySelectorAll('.option').forEach(option => {
            option.addEventListener('touchstart', function() {
                this.style.transform = 'scale(0.98)';
                this.style.backgroundColor = 'rgba(77, 171, 247, 0.3)';
            });
            option.addEventListener('touchend', function() {
                this.style.transform = 'scale(1)';
            });
        });

        // Mejorar feedback táctil para botones de navegación
        document.querySelectorAll('.quiz-nav button').forEach(button => {
            button.addEventListener('touchstart', function() {
                this.style.transform = 'scale(0.95)';
            });
            button.addEventListener('touchend', function() {
                this.style.transform = 'scale(1)';
            });
        });
    }

    // Mostrar primera pregunta al inicializar
    showQuestion(1);
    updateQuizNav();
}

function showQuestion(questionNum) {
    // Ocultar todas las preguntas
    document.querySelectorAll('.question').forEach(q => {
        q.style.display = 'none';
    });

    // Mostrar pregunta actual
    const currentQuestion = document.getElementById(`question${questionNum}`);
    if (currentQuestion) {
        currentQuestion.style.display = 'block';
    }
}

function updateQuizNav() {
    const prevButton = document.getElementById('prevQuestion');
    const nextButton = document.getElementById('nextQuestion');

    prevButton.disabled = (currentQuestion === 1);
    nextButton.textContent = (currentQuestion === 10) ? 'Ver Resultados' : 'Siguiente';
}

function showResults() {
    document.querySelector('.quiz-nav').style.display = 'none';
    document.querySelector('.results').style.display = 'block';

    // Calcular el puntaje basado en las respuestas seleccionadas
    let score = 0;
    for (let i = 1; i <= 10; i++) {
        const selectedOption = document.querySelector(`#question${i} .option.selected`);
        if (selectedOption && selectedOption.hasAttribute('data-correct')) {
            score++;
        }
    }

    const scoreElement = document.getElementById('score');
    const messageElement = document.getElementById('message');

    scoreElement.textContent = score;

    // Mensaje personalizado según puntuación
    if (score === 10) {
        messageElement.textContent = '¡Excelente! Eres un experto en exploración espacial.';
    } else if (score >= 7) {
        messageElement.textContent = '¡Muy bien! Tienes excelentes conocimientos sobre el espacio.';
    } else if (score >= 5) {
        messageElement.textContent = '¡Buen trabajo! Tienes buenos conocimientos sobre el espacio.';
    } else {
        messageElement.textContent = 'Sigue aprendiendo sobre el espacio. ¡Puedes mejorar!';
    }
}

// ===========================================
// MAPA ESTELAR INTERACTIVO AVANZADO
// ===========================================

function initStarMap() {
    const canvas = document.getElementById('starMapCanvas');
    const ctx = canvas.getContext('2d');
    const tooltip = document.getElementById('star-tooltip');
    const constellationInfo = document.getElementById('constellation-info');
    const constellationName = document.getElementById('constellation-name');
    const constellationDescription = document.getElementById('constellation-description');
    const constellationCoords = document.getElementById('constellation-coords');
    const constellationFacts = document.getElementById('constellation-facts');

    // Obtener el ratio de píxeles del dispositivo para pantallas de alta resolución
    const devicePixelRatio = window.devicePixelRatio || 1;

    // Ajustar tamaño del canvas considerando la densidad de píxeles
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * devicePixelRatio;
    canvas.height = rect.height * devicePixelRatio;

    // Escalar el contexto para que coincida con el tamaño CSS
    ctx.scale(devicePixelRatio, devicePixelRatio);

    // Ajustar el estilo del canvas para que coincida con el tamaño visual
    canvas.style.width = rect.width + 'px';
    canvas.style.height = rect.height + 'px';

    // Variables de estado
    let zoom = 1;
    let panX = 0;
    let panY = 0;
    let isDragging = false;
    let lastMouseX = 0;
    let lastMouseY = 0;
    let nightMode = true;
    let showConstellations = true;
    let showStars = true;
    let selectedSeason = 'all';
    let animationFrame = null;
    let starTwinkle = 0;

    // Datos de estrellas (RA, Dec, Magnitud, Nombre)
    const stars = [
        // Osa Mayor
        { ra: 165.932, dec: 61.751, mag: 1.76, name: 'Dubhe', con: 'UMa' },
        { ra: 178.458, dec: 53.695, mag: 2.37, name: 'Merak', con: 'UMa' },
        { ra: 183.856, dec: 57.033, mag: 1.79, name: 'Phecda', con: 'UMa' },
        { ra: 193.507, dec: 55.960, mag: 2.41, name: 'Megrez', con: 'UMa' },
        { ra: 201.298, dec: 56.382, mag: 1.86, name: 'Alioth', con: 'UMa' },
        { ra: 206.885, dec: 49.313, mag: 2.09, name: 'Mizar', con: 'UMa' },
        { ra: 222.676, dec: 47.042, mag: 2.31, name: 'Alkaid', con: 'UMa' },

        // Osa Menor
        { ra: 37.955, dec: 89.264, mag: 2.02, name: 'Polaris', con: 'UMi' },
        { ra: 44.357, dec: 77.794, mag: 3.05, name: 'Kochab', con: 'UMi' },
        { ra: 37.512, dec: 77.794, mag: 3.00, name: 'Pherkad', con: 'UMi' },

        // Orión
        { ra: 88.793, dec: 7.407, mag: 0.42, name: 'Betelgeuse', con: 'Ori' },
        { ra: 79.172, dec: 6.350, mag: 0.13, name: 'Rigel', con: 'Ori' },
        { ra: 84.053, dec: -8.202, mag: 1.70, name: 'Bellatrix', con: 'Ori' },
        { ra: 83.002, dec: -0.299, mag: 1.64, name: 'Mintaka', con: 'Ori' },
        { ra: 78.634, dec: -8.202, mag: 1.69, name: 'Saiph', con: 'Ori' },

        // Casiopea
        { ra: 10.127, dec: 56.537, mag: 2.24, name: 'Shedir', con: 'Cas' },
        { ra: 3.406, dec: 60.718, mag: 2.47, name: 'Caph', con: 'Cas' },
        { ra: 9.133, dec: 63.670, mag: 2.65, name: 'Ruchbah', con: 'Cas' },
        { ra: 21.454, dec: 60.235, mag: 2.28, name: 'Segin', con: 'Cas' },
        { ra: 17.433, dec: 58.415, mag: 2.14, name: 'Navi', con: 'Cas' },

        // Lyra
        { ra: 279.234, dec: 38.784, mag: 0.03, name: 'Vega', con: 'Lyr' },
        { ra: 282.520, dec: 32.689, mag: 3.52, name: 'Sheliak', con: 'Lyr' },
        { ra: 275.249, dec: 37.605, mag: 4.33, name: 'Sulafat', con: 'Lyr' },

        // Draco
        { ra: 260.054, dec: 65.714, mag: 2.23, name: 'Thuban', con: 'Dra' },
        { ra: 269.454, dec: 55.172, mag: 2.79, name: 'Rastaban', con: 'Dra' },
        { ra: 264.330, dec: 56.537, mag: 3.07, name: 'Eltanin', con: 'Dra' },

        // Cygnus
        { ra: 304.514, dec: 45.280, mag: 0.77, name: 'Deneb', con: 'Cyg' },
        { ra: 293.848, dec: 40.256, mag: 2.21, name: 'Albireo', con: 'Cyg' },
        { ra: 310.358, dec: 45.130, mag: 2.23, name: 'Sadr', con: 'Cyg' },

        // Pegasus
        { ra: 345.943, dec: 15.205, mag: 2.04, name: 'Enif', con: 'Peg' },
        { ra: 330.685, dec: 6.198, mag: 2.37, name: 'Markab', con: 'Peg' },
        { ra: 344.413, dec: 29.621, mag: 2.49, name: 'Scheat', con: 'Peg' },

        // Andrómeda
        { ra: 10.897, dec: 41.269, mag: 2.06, name: 'Alpheratz', con: 'And' },
        { ra: 23.063, dec: 42.278, mag: 2.07, name: 'Mirach', con: 'And' },

        // Perseo
        { ra: 52.301, dec: 47.042, mag: 1.79, name: 'Mirfak', con: 'Per' },
        { ra: 58.533, dec: 40.956, mag: 2.09, name: 'Algol', con: 'Per' },

        // Hércules
        { ra: 247.352, dec: 14.390, mag: 2.78, name: 'Kornephoros', con: 'Her' },
        { ra: 256.417, dec: 5.245, mag: 3.00, name: 'Sarin', con: 'Her' },

        // Aquila
        { ra: 297.696, dec: 8.868, mag: 0.76, name: 'Altair', con: 'Aql' },
        { ra: 288.795, dec: 13.863, mag: 2.99, name: 'Tarazed', con: 'Aql' },

        // Escorpión
        { ra: 247.352, dec: -26.432, mag: 0.96, name: 'Antares', con: 'Sco' },
        { ra: 244.959, dec: -22.621, mag: 2.29, name: 'Shaula', con: 'Sco' },

        // Sagitario
        { ra: 283.816, dec: -29.828, mag: 2.05, name: 'Kaus Australis', con: 'Sgr' },
        { ra: 276.043, dec: -25.421, mag: 2.98, name: 'Nunki', con: 'Sgr' }
    ];

    // Datos de constelaciones con conexiones
    const constellations = {
        'UMa': {
            name: 'Osa Mayor',
            connections: [[0,1],[1,2],[2,3],[3,4],[4,5],[5,6]],
            season: 'spring',
            mythology: 'En la mitología griega, representa a Calisto, una ninfa transformada en osa por Zeus.',
            visibility: 'Visible todo el año en el hemisferio norte',
            mainStars: ['Dubhe', 'Merak', 'Phecda', 'Megrez', 'Alioth', 'Mizar', 'Alkaid']
        },
        'UMi': {
            name: 'Osa Menor',
            connections: [[0,1],[1,2],[2,0]],
            season: 'all',
            mythology: 'Representa a Arcas, hijo de Calisto, también transformado en osa.',
            visibility: 'Circumpolar en el hemisferio norte',
            mainStars: ['Polaris', 'Kochab', 'Pherkad']
        },
        'Ori': {
            name: 'Orión',
            connections: [[0,1],[1,2],[2,3],[3,4],[4,0]],
            season: 'winter',
            mythology: 'El cazador gigante de la mitología griega.',
            visibility: 'Mejor visible en invierno',
            mainStars: ['Betelgeuse', 'Rigel', 'Bellatrix', 'Mintaka', 'Saiph']
        },
        'Cas': {
            name: 'Casiopea',
            connections: [[0,1],[1,2],[2,3],[3,4]],
            season: 'autumn',
            mythology: 'Reina etíope, madre de Andrómeda.',
            visibility: 'Circumpolar en latitudes altas del norte',
            mainStars: ['Shedir', 'Caph', 'Ruchbah', 'Segin', 'Navi']
        },
        'Lyr': {
            name: 'Lyra',
            connections: [[0,1],[1,2],[2,0]],
            season: 'summer',
            mythology: 'La lira del músico Orfeo.',
            visibility: 'Visible en verano',
            mainStars: ['Vega', 'Sheliak', 'Sulafat']
        },
        'Dra': {
            name: 'Draco',
            connections: [[0,1],[1,2]],
            season: 'summer',
            mythology: 'El dragón guardián de las manzanas doradas.',
            visibility: 'Circumpolar en latitudes altas del norte',
            mainStars: ['Thuban', 'Rastaban', 'Eltanin']
        },
        'Cyg': {
            name: 'Cygnus',
            connections: [[0,1],[1,2],[2,0]],
            season: 'summer',
            mythology: 'Zeus transformado en cisne.',
            visibility: 'Visible en verano',
            mainStars: ['Deneb', 'Albireo', 'Sadr']
        },
        'Peg': {
            name: 'Pegasus',
            connections: [[0,1],[1,2],[2,0]],
            season: 'autumn',
            mythology: 'El caballo alado de la mitología griega.',
            visibility: 'Visible en otoño',
            mainStars: ['Enif', 'Markab', 'Scheat']
        },
        'And': {
            name: 'Andrómeda',
            connections: [[0,1]],
            season: 'autumn',
            mythology: 'Princesa etíope encadenada a una roca.',
            visibility: 'Visible en otoño',
            mainStars: ['Alpheratz', 'Mirach']
        },
        'Per': {
            name: 'Perseo',
            connections: [[0,1]],
            season: 'autumn',
            mythology: 'El héroe que rescató a Andrómeda.',
            visibility: 'Visible en otoño',
            mainStars: ['Mirfak', 'Algol']
        },
        'Her': {
            name: 'Hércules',
            connections: [[0,1]],
            season: 'summer',
            mythology: 'El héroe más fuerte de la mitología griega.',
            visibility: 'Visible en verano',
            mainStars: ['Kornephoros', 'Sarin']
        },
        'Aql': {
            name: 'Aquila',
            connections: [[0,1]],
            season: 'summer',
            mythology: 'El águila que servía a Zeus.',
            visibility: 'Visible en verano',
            mainStars: ['Altair', 'Tarazed']
        },
        'Sco': {
            name: 'Escorpión',
            connections: [[0,1]],
            season: 'summer',
            mythology: 'El escorpión que mató a Orión.',
            visibility: 'Visible en verano en el hemisferio sur',
            mainStars: ['Antares', 'Shaula']
        },
        'Sgr': {
            name: 'Sagitario',
            connections: [[0,1]],
            season: 'summer',
            mythology: 'El arquero centauro.',
            visibility: 'Visible en verano',
            mainStars: ['Kaus Australis', 'Nunki']
        }
    };

    // Función para convertir coordenadas astronómicas a coordenadas canvas
    function astroToCanvas(ra, dec) {
        const x = (ra / 360) * canvas.width * zoom + panX;
        const y = ((90 - dec) / 180) * canvas.height * zoom + panY;
        return { x, y };
    }

    // Función para dibujar estrellas
    function drawStars() {
        if (!showStars) return;

        stars.forEach((star, index) => {
            const pos = astroToCanvas(star.ra, star.dec);
            const size = Math.max(0.5, (6 - star.mag) * zoom * 0.8);

            // Efecto de parpadeo
            const twinkle = Math.sin(starTwinkle + index * 0.1) * 0.3 + 0.7;
            const alpha = nightMode ? 0.8 * twinkle : 0.6 * twinkle;

            ctx.save();
            ctx.globalAlpha = alpha;

            // Gradiente radial para estrella
            const gradient = ctx.createRadialGradient(pos.x, pos.y, 0, pos.x, pos.y, size);
            gradient.addColorStop(0, nightMode ? '#ffffff' : '#ffff99');
            gradient.addColorStop(0.7, nightMode ? '#ccccff' : '#ffcc99');
            gradient.addColorStop(1, 'transparent');

            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(pos.x, pos.y, size, 0, Math.PI * 2);
            ctx.fill();

            ctx.restore();
        });
    }

    // Función para dibujar constelaciones
    function drawConstellations() {
        if (!showConstellations) return;

        Object.keys(constellations).forEach(conKey => {
            const con = constellations[conKey];
            if (selectedSeason !== 'all' && con.season !== selectedSeason) return;

            // Optimizar: filtrar estrellas de la constelación una vez y crear mapa por nombre
            const conStars = {};
            stars.filter(s => s.con === conKey).forEach(star => conStars[star.name] = star);

            con.connections.forEach(connection => {
                const star1 = conStars[con.mainStars[connection[0]]];
                const star2 = conStars[con.mainStars[connection[1]]];

                if (star1 && star2) {
                    const pos1 = astroToCanvas(star1.ra, star1.dec);
                    const pos2 = astroToCanvas(star2.ra, star2.dec);

                    ctx.strokeStyle = nightMode ? 'rgba(100, 149, 237, 0.6)' : 'rgba(70, 130, 180, 0.4)';
                    ctx.lineWidth = 1 * zoom;
                    ctx.beginPath();
                    ctx.moveTo(pos1.x, pos1.y);
                    ctx.lineTo(pos2.x, pos2.y);
                    ctx.stroke();
                }
            });
        });
    }

    // Función para dibujar el fondo
    function drawBackground() {
        ctx.fillStyle = nightMode ? '#000011' : '#87CEEB';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Estrellas de fondo adicionales
        if (nightMode) {
            for (let i = 0; i < 200; i++) {
                const x = (Math.sin(i * 0.1) * 1000 + panX * 0.1) % canvas.width;
                const y = (Math.cos(i * 0.15) * 800 + panY * 0.1) % canvas.height;
                const size = Math.random() * 1.5;

                ctx.fillStyle = 'rgba(255, 255, 255, ' + (Math.random() * 0.8 + 0.2) + ')';
                ctx.beginPath();
                ctx.arc(x, y, size, 0, Math.PI * 2);
                ctx.fill();
            }
        }
    }

    // Función principal de renderizado
    function render() {
        drawBackground();
        drawConstellations();
        drawStars();

        starTwinkle += 0.05;
        animationFrame = requestAnimationFrame(render);
    }

    // Función para mostrar tooltip
    function showTooltip(star, x, y) {
        if (!star) {
            tooltip.style.display = 'none';
            return;
        }

        tooltip.innerHTML = `
            <strong>${star.name}</strong><br>
            Magnitud: ${star.mag}<br>
            Constelación: ${constellations[star.con]?.name || star.con}
        `;
        tooltip.style.left = x + 10 + 'px';
        tooltip.style.top = y - 10 + 'px';
        tooltip.style.display = 'block';
    }

    // Función para mostrar información de constelación
    function showConstellationInfo(constellation) {
        if (!constellation) {
            constellationInfo.classList.remove('active');
            return;
        }

        constellationName.textContent = constellation.name;
        constellationDescription.textContent = constellation.mythology;
        constellationCoords.textContent = `Visibilidad: ${constellation.visibility}`;

        constellationFacts.innerHTML = `
            <strong>Estrellas principales:</strong> ${constellation.mainStars.join(', ')}<br>
            <strong>Mejor temporada:</strong> ${constellation.season === 'all' ? 'Todo el año' : constellation.season}
        `;

        constellationInfo.classList.add('active');
    }

    // Función para encontrar estrella bajo el cursor
    function getStarAt(x, y) {
        for (let star of stars) {
            const pos = astroToCanvas(star.ra, star.dec);
            const distance = Math.sqrt((x - pos.x) ** 2 + (y - pos.y) ** 2);
            if (distance < 10) {
                return star;
            }
        }
        return null;
    }

    // Función para encontrar constelación bajo el cursor
    function getConstellationAt(x, y) {
        for (let conKey in constellations) {
            const con = constellations[conKey];
            if (selectedSeason !== 'all' && con.season !== selectedSeason) continue;

            // Optimizar: crear mapa de estrellas de la constelación una vez
            const conStars = {};
            stars.filter(s => s.con === conKey).forEach(star => conStars[star.name] = star);

            for (let connection of con.connections) {
                const star1 = conStars[con.mainStars[connection[0]]];
                const star2 = conStars[con.mainStars[connection[1]]];

                if (star1 && star2) {
                    const pos1 = astroToCanvas(star1.ra, star1.dec);
                    const pos2 = astroToCanvas(star2.ra, star2.dec);

                    // Verificar si el punto está cerca de la línea
                    const distance = pointToLineDistance(x, y, pos1.x, pos1.y, pos2.x, pos2.y);
                    if (distance < 5) {
                        return con;
                    }
                }
            }
        }
        return null;
    }

    // Función auxiliar para distancia punto-línea
    function pointToLineDistance(x, y, x1, y1, x2, y2) {
        const A = x - x1;
        const B = y - y1;
        const C = x2 - x1;
        const D = y2 - y1;

        const dot = A * C + B * D;
        const lenSq = C * C + D * D;
        let param = -1;
        if (lenSq !== 0) param = dot / lenSq;

        let xx, yy;
        if (param < 0) {
            xx = x1;
            yy = y1;
        } else if (param > 1) {
            xx = x2;
            yy = y2;
        } else {
            xx = x1 + param * C;
            yy = y1 + param * D;
        }

        const dx = x - xx;
        const dy = y - yy;
        return Math.sqrt(dx * dx + dy * dy);
    }

    // Event listeners para controles
    document.getElementById('zoom-in').addEventListener('click', () => {
        zoom *= 1.2;
        render();
    });

    document.getElementById('zoom-out').addEventListener('click', () => {
        zoom /= 1.2;
        render();
    });

    document.getElementById('reset-view').addEventListener('click', () => {
        zoom = 1;
        panX = 0;
        panY = 0;
        render();
    });

    document.getElementById('toggle-night-mode').addEventListener('click', () => {
        nightMode = !nightMode;
        document.getElementById('toggle-night-mode').classList.toggle('active');
        render();
    });

    document.getElementById('toggle-constellations').addEventListener('click', () => {
        showConstellations = !showConstellations;
        document.getElementById('toggle-constellations').classList.toggle('active');
        render();
    });

    document.getElementById('toggle-stars').addEventListener('click', () => {
        showStars = !showStars;
        document.getElementById('toggle-stars').classList.toggle('active');
        render();
    });

    document.getElementById('season-selector').addEventListener('change', (e) => {
        selectedSeason = e.target.value;
        render();
    });

    document.getElementById('constellation-search').addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        // Implementar búsqueda aquí
    });

    // Event listeners para canvas
    canvas.addEventListener('mousedown', (e) => {
        isDragging = true;
        lastMouseX = e.clientX;
        lastMouseY = e.clientY;
        canvas.style.cursor = 'grabbing';
    });

    canvas.addEventListener('mousemove', (e) => {
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        if (isDragging) {
            const deltaX = e.clientX - lastMouseX;
            const deltaY = e.clientY - lastMouseY;
            panX += deltaX;
            panY += deltaY;
            lastMouseX = e.clientX;
            lastMouseY = e.clientY;
            render();
        } else {
            const star = getStarAt(x, y);
            showTooltip(star, e.clientX, e.clientY);
        }
    });

    canvas.addEventListener('mouseup', () => {
        isDragging = false;
        canvas.style.cursor = 'grab';
    });

    canvas.addEventListener('mouseleave', () => {
        tooltip.style.display = 'none';
        isDragging = false;
        canvas.style.cursor = 'default';
    });

    canvas.addEventListener('click', (e) => {
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const constellation = getConstellationAt(x, y);
        showConstellationInfo(constellation);
    });

    // Soporte táctil
    canvas.addEventListener('touchstart', (e) => {
        e.preventDefault();
        const touch = e.touches[0];
        lastMouseX = touch.clientX;
        lastMouseY = touch.clientY;
        isDragging = true;
    });

    canvas.addEventListener('touchmove', (e) => {
        e.preventDefault();
        if (isDragging) {
            const touch = e.touches[0];
            const deltaX = touch.clientX - lastMouseX;
            const deltaY = touch.clientY - lastMouseY;
            panX += deltaX;
            panY += deltaY;
            lastMouseX = touch.clientX;
            lastMouseY = touch.clientY;
            render();
        }
    });

    canvas.addEventListener('touchend', (e) => {
        e.preventDefault();
        isDragging = false;
    });

    // Inicializar controles
    document.getElementById('toggle-constellations').classList.add('active');
    document.getElementById('toggle-stars').classList.add('active');

    // Iniciar renderizado
    render();

    // Ocultar indicador de carga
    document.getElementById('loading-indicator').style.display = 'none';
}

// ===========================================
// GALERÍA INTERACTIVA
// ===========================================

function initOrbitCanvas() {
    // Usar la clase OrbitSimulator para inicializar el canvas
    orbitSimulator.initCanvas();
}



// ===========================================
// GLOSARIO CON BÚSQUEDA
// ===========================================

function initGlossary() {
    const searchInput = document.getElementById('glossarySearch');
    const glossaryItems = document.querySelectorAll('.glossary-item');

    searchInput.addEventListener('input', function() {
        const searchTerm = this.value.toLowerCase();

        glossaryItems.forEach(item => {
            const term = item.querySelector('.glossary-term').textContent.toLowerCase();
            const definition = item.querySelector('.glossary-definition').textContent.toLowerCase();

            if (term.includes(searchTerm) || definition.includes(searchTerm)) {
                item.style.display = 'block';
            } else {
                item.style.display = 'none';
            }
        });
    });
}

// ===========================================
// CONTROL DE MÚSICA
// ===========================================

function initMusicControl() {
    const musicControl = document.getElementById('musicControl');
    const backgroundMusic = document.getElementById('backgroundMusic');
    let isPlaying = false;

    musicControl.addEventListener('click', function() {
        if (isPlaying) {
            backgroundMusic.pause();
            this.innerHTML = '🔇';
            Utils.showNotification('Música pausada', 'warning');
        } else {
            backgroundMusic.play().catch(e => {
                console.log('Reproducción automática bloqueada:', e);
                Utils.showNotification('Haz clic de nuevo para reproducir música', 'warning');
            });
            this.innerHTML = '🔊';
            Utils.showNotification('Música activada', 'success');
        }
        isPlaying = !isPlaying;
    });

    // Intentar reproducir automáticamente (puede ser bloqueado por el navegador)
    backgroundMusic.play().then(() => {
        isPlaying = true;
        musicControl.innerHTML = '🔊';
    }).catch(e => {
        console.log('Reproducción automática bloqueada:', e);
        isPlaying = false;
        musicControl.innerHTML = '🔇';
    });
}



// ===========================================
// FUNCIONES ADICIONALES DE UTILIDAD
// ===========================================

// Manejar el redimensionamiento de la ventana
window.addEventListener('resize', function() {
    // Reajustar canvas de órbitas si está visible
    if (document.getElementById('orbita').classList.contains('active')) {
        const canvas = document.getElementById('orbitCanvas');
        if (canvas) {
            const devicePixelRatio = window.devicePixelRatio || 1;
            const rect = canvas.getBoundingClientRect();
            canvas.width = rect.width * devicePixelRatio;
            canvas.height = rect.height * devicePixelRatio;
            const ctx = canvas.getContext('2d');
            ctx.scale(devicePixelRatio, devicePixelRatio);
            canvas.style.width = rect.width + 'px';
            canvas.style.height = rect.height + 'px';
        }
    }
}, { passive: true });
