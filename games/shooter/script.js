document.addEventListener("contextmenu", (e) => e.preventDefault());
document.addEventListener("selectstart", (e) => e.preventDefault());

// Canvas y contexto
const canvas = document.querySelector("canvas");
canvas.width = innerWidth;
canvas.height = innerHeight;
const c = canvas.getContext("2d");

// Elementos DOM modal y UI
const scoreEl = document.getElementById("scoreEl");
const highestEl = document.getElementById("highestEl");
const fpsCounter = document.getElementById("fpsCounter");
const gameOverEl = document.getElementById("gameOverEl");
const modalTitle = document.getElementById("modalTitle");
const modalMessage = document.getElementById("modalMessage");
const finalScoreEl = document.getElementById("finalScoreEl");
const startBtn = document.getElementById("startBtn");
const restartBtn = document.getElementById("restartBtn");
const resumeBtn = document.getElementById("resumeBtn");
const homeBtn = document.getElementById("homeBtn");

// Variables y constantes
const friction = 0.98;
let x = canvas.width / 2;
let y = canvas.height / 2;
let projectiles = [];
let enemies = [];
let particles = [];
let score = 0;
let highest = localStorage.getItem("highest")
  ? parseInt(localStorage.getItem("highest"))
  : 0;
let animationId;
let spanEnemiesInterval;
let spawnTime = 1000;

highestEl.innerHTML = highest;

const vividColors = [
  "#ff0000",
  "#00ff00",
  "#0000ff",
  "#ffff00",
  "#ff00ff",
  "#00ffff",
  "#ff8800",
  "#8800ff",
  "#00ff88",
  "#ff0088",
  "#88ff00",
  "#0088ff",
];
const shapes = ["circle", "square", "triangle"];

let lastTime = performance.now();
let fps = 0;

// Estado del juego: 'start', 'playing', 'paused', 'gameover'
let gameState = "start";

// Player
let player;

// Clases
class Ball {
  constructor(x, y, radius, color, shape = "circle") {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
    this.shape = shape;
  }
  draw() {
    c.fillStyle = this.color;
    if (this.shape === "circle") {
      c.beginPath();
      c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
      c.fill();
    } else if (this.shape === "square") {
      c.fillRect(
        this.x - this.radius,
        this.y - this.radius,
        this.radius * 2,
        this.radius * 2
      );
    } else if (this.shape === "triangle") {
      c.beginPath();
      c.moveTo(this.x, this.y - this.radius);
      c.lineTo(this.x - this.radius, this.y + this.radius);
      c.lineTo(this.x + this.radius, this.y + this.radius);
      c.closePath();
      c.fill();
    }
  }
}

class Shooter extends Ball {
  constructor(x, y, radius, color, velocity, shape = "circle") {
    super(x, y, radius, color, shape);
    this.velocity = velocity;
  }
  update() {
    this.draw();
    this.x += this.velocity.x;
    this.y += this.velocity.y;
  }
}

class Particle extends Shooter {
  constructor(x, y, radius, color, velocity, shape = "circle") {
    super(x, y, radius, color, velocity, shape);
    this.alpha = 1;
  }
  draw() {
    c.save();
    c.globalAlpha = this.alpha;
    super.draw();
    c.restore();
  }
  update() {
    this.draw();
    this.velocity.x *= friction;
    this.velocity.y *= friction;
    this.x += this.velocity.x * 2;
    this.y += this.velocity.y * 2;
    this.alpha -= 0.01;
  }
}

// Actualizar puntuación
function updateScore(amount = 100) {
  score += amount;
  scoreEl.innerHTML = score;
  if (score > highest) {
    highest = score;
    localStorage.setItem("highest", highest);
    highestEl.innerHTML = highest;
  }
  spawnTime *= 0.9995;
}

// Calcular velocidad en dirección centro
function calculateVelocity(x, y, x1 = canvas.width / 2, y1 = canvas.height / 2) {
  const angle = Math.atan2(y1 - y, x1 - x);
  return {
    x: Math.cos(angle),
    y: Math.sin(angle),
  };
}

// Actualizar FPS
function updateFPS(timestamp) {
  const now = performance.now();
  fps = Math.round(1000 / (now - lastTime));
  lastTime = now;
  fpsCounter.textContent = "FPS: " + fps;
  return fps;
}

// Animación principal
function animate(timestamp) {
  if (gameState !== "playing") return; // Pausa animación si no está jugando
  animationId = requestAnimationFrame(animate);
  updateFPS(timestamp);
  c.fillStyle = "rgba(0,0,0,0.1)";
  c.fillRect(0, 0, canvas.width, canvas.height);

  if (player) player.draw();

  // Partículas
  for (let i = particles.length - 1; i >= 0; i--) {
    if (particles[i].alpha <= 0) {
      particles.splice(i, 1);
    } else {
      particles[i].update();
    }
  }

  // Proyectiles
  for (let i = projectiles.length - 1; i >= 0; i--) {
    projectiles[i].update();

    if (
      projectiles[i].x + projectiles[i].radius < 0 ||
      projectiles[i].x - projectiles[i].radius > canvas.width ||
      projectiles[i].y + projectiles[i].radius < 0 ||
      projectiles[i].y - projectiles[i].radius > canvas.height
    ) {
      projectiles.splice(i, 1);
    }
  }

  // Enemigos y colisiones
  for (let i = enemies.length - 1; i >= 0; i--) {
    enemies[i].update();

    // Colision jugador - enemigo
    const distPlayerEnemy = Math.hypot(
      player.x - enemies[i].x,
      player.y - enemies[i].y
    );
    if (distPlayerEnemy - enemies[i].radius - player.radius < 1) {
      showGameOver();
      break;
    }

    // Colisiones proyectil - enemigo
    for (let j = projectiles.length - 1; j >= 0; j--) {
      const distProjEnemy = Math.hypot(
        projectiles[j].x - enemies[i].x,
        projectiles[j].y - enemies[i].y
      );
      if (distProjEnemy - enemies[i].radius - projectiles[j].radius < 0) {
        // Crear partículas explosión
        for (let k = 0; k < enemies[i].radius; k++) {
          particles.push(
            new Particle(
              projectiles[j].x,
              projectiles[j].y,
              Math.random() * 3,
              enemies[i].color,
              {
                x: (Math.random() - 0.5) * (Math.random() * 9.8 - 0.5),
                y: (Math.random() - 0.5) * (Math.random() * 9.8 - 0.5),
              },
              enemies[i].shape
            )
          );
        }
        if (enemies[i].radius - 10 > 10) {
          updateScore(100);
          enemies[i].radius -= 8;
          projectiles.splice(j, 1);
        } else {
          updateScore(250);
          enemies.splice(i, 1);
          projectiles.splice(j, 1);
        }
        break;
      }
    }
  }
}

// Función para disparar en dirección clic/touch al canvas
function shootEnemy(x, y) {
  if (gameState !== "playing") return;
  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;
  let velocity = calculateVelocity(centerX, centerY, x, y);
  velocity.x *= 5.5;
  velocity.y *= 5.5;
  projectiles.push(new Shooter(centerX, centerY, 5, "white", velocity));
}

// Eventos de disparo mouse y touch
function handleShootEvent(e) {
  if (gameState !== "playing") return;
  const rect = canvas.getBoundingClientRect();
  let x, y;
  if (e.type === "click") {
    x = e.clientX - rect.left;
    y = e.clientY - rect.top;
  } else if (e.type === "touchstart") {
    e.preventDefault();
    const touch = e.touches[0];
    x = touch.clientX - rect.left;
    y = touch.clientY - rect.top;
  }
  shootEnemy(x, y);
}

canvas.addEventListener("click", handleShootEvent);
canvas.addEventListener("touchstart", handleShootEvent);

// Inicialización del juego
function init() {
  player = new Ball(x, y, 10, "white");
  projectiles = [];
  enemies = [];
  particles = [];
  score = 0;
  spawnTime = 1000;
  scoreEl.innerHTML = score;
  highestEl.innerHTML = highest;
}

// Detener el juego (animación + enemigos)
function stopGame() {
  clearTimeout(spanEnemiesInterval);
  cancelAnimationFrame(animationId);
}

// Mostrar modal y configurar según estado
function showModal(type) {
  gameOverEl.style.display = "flex";

  if (type === "start") {
    gameState = "start";
    modalTitle.textContent = "Bienvenido a Shooter 🎱";
    modalMessage.innerHTML = "¿Listo para jugar?";
    startBtn.style.display = "inline-block";
    restartBtn.style.display = "none";
    resumeBtn.style.display = "none";
  } else if (type === "gameover") {
    gameState = "gameover";
    modalTitle.textContent = "¡Fin del juego!";
    modalMessage.innerHTML = `Tu puntuación: <span id="finalScoreEl">${score}</span>`;
    startBtn.style.display = "none";
    restartBtn.style.display = "inline-block";
    resumeBtn.style.display = "none";
  } else if (type === "paused") {
    gameState = "paused";
    modalTitle.textContent = "Juego pausado";
    modalMessage.innerHTML = `Tu puntuación actual: <span>${score}</span><br>Vuelve cuando quieras.`;
    startBtn.style.display = "none";
    restartBtn.style.display = "none";
    resumeBtn.style.display = "inline-block";
  }
}

// Ocultar modal
function hideModal() {
  gameOverEl.style.display = "none";
}

// Mostrar fin del juego
function showGameOver() {
  stopGame();
  showModal("gameover");
}

// Generar enemigos continuamente con timeout recursivo
function spanEnemies() {
  spanEnemiesInterval = setTimeout(() => {
    if (gameState !== "playing") return;

    let x, y;
    const radius = Math.random() * 16 + 14;
    if (Math.random() < 0.5) {
      x = Math.random() < 0.5 ? 0 - radius : canvas.width + radius;
      y = Math.random() * canvas.height;
    } else {
      x = Math.random() * canvas.width;
      y = Math.random() < 0.5 ? 0 - radius : canvas.height + radius;
    }
    const color = vividColors[Math.floor(Math.random() * vividColors.length)];
    const shape = shapes[Math.floor(Math.random() * shapes.length)];
    enemies.push(new Shooter(x, y, radius, color, calculateVelocity(x, y), shape));
    spanEnemies();
  }, spawnTime);
}

// Iniciar juego (nuevo o reanudar)
function startGame() {
  gameState = "playing";
  x = canvas.width / 2;
  y = canvas.height / 2;
  init();
  animate();
  clearTimeout(spanEnemiesInterval);
  spanEnemies();
  hideModal();
}

// Manejo de botones modal
startBtn.addEventListener("click", () => {
  startGame();
});

restartBtn.addEventListener("click", () => {
  startGame();
});

resumeBtn.addEventListener("click", () => {
  hideModal();
  gameState = "playing";
  animate();
  clearTimeout(spanEnemiesInterval);
  spanEnemies();
});

homeBtn.addEventListener("click", () => {
  window.location.href = "/";
});

// Pausar juego al cambiar pestaña o minimizar ventana
document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    if (gameState === "playing") {
      stopGame();
      showModal("paused");
    }
  }
});

// Ajustar canvas al redimensionar ventana y pausar
window.addEventListener("resize", () => {
  canvas.width = innerWidth;
  canvas.height = innerHeight;
  stopGame();
  showModal("paused");
});

// Mostrar modal inicial para empezar el juego al cargar
showModal("start");
