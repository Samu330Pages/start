document.addEventListener('contextmenu', e => e.preventDefault());
document.addEventListener('selectstart', e => e.preventDefault());

// Canvas
const canvas = document.querySelector('canvas');
canvas.width = innerWidth;
canvas.height = innerHeight;
window.addEventListener('resize', () => {
  canvas.width = innerWidth;
  canvas.height = innerHeight;
  stopGame();
});

// Contexto
const c = canvas.getContext('2d');

// Elementos del DOM
const scoreEl = document.getElementById('scoreEl');
const highestEl = document.getElementById('highestEl');
const fpsCounter = document.getElementById('fpsCounter');
const gameOverEl = document.getElementById('gameOverEl');
const finalScoreEl = document.getElementById('finalScoreEl');
const restartBtn = document.getElementById('restartBtn');
//const resetBtn = document.getElementById('resetBtn');
const homeBtn = document.getElementById('homeBtn');

// Variables y constantes
const friction = 0.98;
let x = canvas.width / 2;
let y = canvas.height / 2;
let projectiles = [];
let enemies = [];
let particles = [];
let score = 0;
let highest = localStorage.getItem('highest') ? parseInt(localStorage.getItem('highest')) : 0;
let animationId;
let spanEnemiesInterval;
let spawnTime = 1000;
highestEl.innerHTML = highest;

const vividColors = [
  '#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff',
  '#ff8800', '#8800ff', '#00ff88', '#ff0088', '#88ff00', '#0088ff'
];
const shapes = ['circle', 'square', 'triangle'];

// Contador de FPS
let lastTime = performance.now();
let fps = 0;

// Clase Bola
class Ball {
  constructor(x, y, radius, color, shape = 'circle') {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
    this.shape = shape;
  }
  draw() {
    c.fillStyle = this.color;
    if (this.shape === 'circle') {
      c.beginPath();
      c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
      c.fill();
    } else if (this.shape === 'square') {
      c.fillRect(this.x - this.radius, this.y - this.radius, this.radius * 2, this.radius * 2);
    } else if (this.shape === 'triangle') {
      c.beginPath();
      c.moveTo(this.x, this.y - this.radius);
      c.lineTo(this.x - this.radius, this.y + this.radius);
      c.lineTo(this.x + this.radius, this.y + this.radius);
      c.closePath();
      c.fill();
    }
  }
}

// Clase Disparador (bola que se mueve)
class Shooter extends Ball {
  constructor(x, y, radius, color, velocity, shape = 'circle') {
    super(x, y, radius, color, shape);
    this.velocity = velocity;
  }
  update() {
    this.draw();
    this.x += this.velocity.x;
    this.y += this.velocity.y;
  }
}

// Clase Partícula (explosión)
class Particle extends Shooter {
  constructor(x, y, radius, color, velocity, shape = 'circle') {
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
  // Si supera el récord, actualiza
  if (score > highest) {
    highest = score;
    localStorage.setItem('highest', highest);
    highestEl.innerHTML = highest;
  }
  // Ajusta la dificultad
  spawnTime *= 0.9995;
}

// Calcular velocidad
function calculateVelocity(x, y, x1 = canvas.width / 2, y1 = canvas.height / 2) {
  const angle = Math.atan2(y1 - y, x1 - x);
  const velocity = {
    x: Math.cos(angle),
    y: Math.sin(angle)
  };
  return velocity;
}

// Actualizar FPS
function updateFPS(timestamp) {
  const now = performance.now();
  fps = Math.round(1000 / (now - lastTime));
  lastTime = now;
  fpsCounter.textContent = 'FPS: ' + fps;
  return fps;
}

// Animación principal
function animate(timestamp) {
  animationId = requestAnimationFrame(animate);
  updateFPS(timestamp);
  c.fillStyle = 'rgba(0,0,0,0.1)';
  c.fillRect(0, 0, canvas.width, canvas.height);
  if (player) player.draw();

  // Actualizar y eliminar partículas
  for (let i = particles.length - 1; i >= 0; i--) {
    if (particles[i].alpha <= 0) {
      particles.splice(i, 1);
    } else {
      particles[i].update();
    }
  }

  // Actualizar y eliminar proyectiles
  for (let i = projectiles.length - 1; i >= 0; i--) {
    projectiles[i].update();
    if (
      projectiles[i].x + projectiles[i].radius < 1 ||
      projectiles[i].x - projectiles[i].radius > canvas.width ||
      projectiles[i].y + projectiles[i].radius < 0 ||
      projectiles[i].y - projectiles[i].radius > canvas.height
    ) {
      projectiles.splice(i, 1);
    }
  }

  for (let i = enemies.length - 1; i >= 0; i--) {
    enemies[i].update();
    const dist = Math.hypot(player.x - enemies[i].x, player.y - enemies[i].y);
    if (dist - enemies[i].radius - player.radius < 1) {
      showGameOver();
      break;
    }
    for (let j = projectiles.length - 1; j >= 0; j--) {
      const dist = Math.hypot(projectiles[j].x - enemies[i].x, projectiles[j].y - enemies[i].y);
      if (dist - enemies[i].radius - projectiles[j].radius < 0) {
        // Crear explosión de partículas
        for (let k = 0; k < enemies[i].radius; k++) {
          particles.push(
            new Particle(
              projectiles[j].x,
              projectiles[j].y,
              Math.random() * 3,
              enemies[i].color,
              {
                x: (Math.random() - 0.5) * (Math.random() * 9.8 - 0.5),
                y: (Math.random() - 0.5) * (Math.random() * 9.8 - 0.5)
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

function shootEnemy(x, y) {
  const canvasX = canvas.width / 2;
  const canvasY = canvas.height / 2;
  let v = calculateVelocity(canvasX, canvasY, x, y);
  v.x *= 5.5;
  v.y *= 5.5;
  projectiles.push(new Shooter(canvasX, canvasY, 5, 'white', v));
}

// Evento de ratón
canvas.addEventListener('click', (e) => {
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  shootEnemy(x, y);
});

// Evento táctil
canvas.addEventListener('touchstart', (e) => {
  e.preventDefault();
  const rect = canvas.getBoundingClientRect();
  const touch = e.touches[0];
  const x = touch.clientX - rect.left;
  const y = touch.clientY - rect.top;
  shootEnemy(x, y);
});

// Inicializar juego
function init() {
  player = new Ball(x, y, 10, 'white');
  projectiles = [];
  enemies = [];
  particles = [];
  score = 0;
  spawnTime = 1000;
  scoreEl.innerHTML = score;
  highestEl.innerHTML = highest;
}

// Detener juego
function stopGame() {
  clearInterval(spanEnemiesInterval);
  cancelAnimationFrame(animationId);
  canvas.removeEventListener('click', shootEnemy);
}

// Mostrar fin de juego
function showGameOver() {
  stopGame();
  finalScoreEl.innerHTML = score;
  gameOverEl.style.display = 'flex';
}

function spanEnemies() {
  spanEnemiesInterval = setTimeout(() => {
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

// Iniciar juego
function startGame() {
  x = canvas.width / 2;
  y = canvas.height / 2;
  init();
  animate();
  clearInterval(spanEnemiesInterval);
  spanEnemies();
  gameOverEl.style.display = 'none';
}

// Reiniciar progreso (borrar récord)
/*function resetProgress() {
  localStorage.removeItem('highest');
  highest = 0;
  highestEl.innerHTML = highest;
  startGame();
}
*/
// Ir a la página principal (puedes cambiar la URL)
function goHome() {
  window.location.href = '/';
}

// Botones
restartBtn.addEventListener('click', startGame);
//resetBtn.addEventListener('click', resetProgress);
homeBtn.addEventListener('click', goHome);

// Iniciar el juego directamente
startGame();
