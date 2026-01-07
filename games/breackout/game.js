'use strict';

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('score');
const livesEl = document.getElementById('lives');
const highScoreEl = document.getElementById('highScore');
const readyEl = document.getElementById('readyScreen');
const gameOverEl = document.getElementById('gameOver');

// VARIABLES
let gameRunning = true, ballLaunched = false, score = 0, lives = 3, highScore = 0;
let gameWidth, gameHeight, dragging = false;
const MARGIN = 25, BRICK_ROWS = 8, BRICK_COLS = 14;
const brickWidth = 45, brickHeight = 20, brickPadding = 6;

// PADDLE
const paddle = { baseWidth: 120, width: 120, height: 20, x: 0, y: 0, targetX: 0, speed: 0.3, powerUps: { wide: false, wideTimer: 0 } };

// ARRAYS
let balls = [{ x: 0, y: 0, radius: 10, vx: 0, vy: 0, speed: 4.8, trail: [] }];
let powerUps = [], bricks = [];
const brickSounds = [], platformSound = null, gameOverSound = null;
let soundReady = false;
const keys = {};

function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    gameWidth = canvas.width - MARGIN * 2;
    gameHeight = canvas.height - MARGIN * 2 - 60;
    paddle.y = canvas.height - 80;
    paddle.x = (gameWidth / 2) + MARGIN - paddle.width / 2;
    paddle.targetX = paddle.x;
}

window.addEventListener('resize', resize);
resize();

// INPUTS
canvas.addEventListener('click', () => { if (!ballLaunched && gameRunning) launchBall(); });

canvas.addEventListener('touchstart', e => {
    e.preventDefault();
    const rect = canvas.getBoundingClientRect();
    const x = e.touches[0].clientX - rect.left;
    dragging = true;
    paddle.targetX = Math.max(MARGIN + 10, Math.min(gameWidth + MARGIN - paddle.width - 10, x - paddle.width/2));
    if (!ballLaunched && gameRunning) launchBall();
});

canvas.addEventListener('touchmove', e => {
    e.preventDefault();
    if (!dragging) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.touches[0].clientX - rect.left;
    paddle.targetX = Math.max(MARGIN + 10, Math.min(gameWidth + MARGIN - paddle.width - 10, x - paddle.width/2));
});

// TECLADO
window.addEventListener('keydown', e => keys[e.key.toLowerCase()] = true);
window.addEventListener('keyup', e => keys[e.key.toLowerCase()] = false);

// HIGH SCORE
function loadHighScore() {
    highScore = parseInt(localStorage.getItem('breakoutHighScore')) || 0;
    highScoreEl.textContent = `Récord: ${highScore.toLocaleString()}`;
}

function saveHighScore() {
    if (score > highScore) {
        highScore = score;
        localStorage.setItem('breakoutHighScore', highScore);
    }
}

// SONIDOS
function initSound() {
    ['brick.mp3', 'brick1.mp3', 'brick2.mp3'].forEach(file => {
        const sound = new Audio(file);
        sound.volume = 0.5;
        brickSounds.push(sound);
    });
    platformSound = new Audio('platform.mp3');
    platformSound.volume = 0.4;
    gameOverSound = new Audio('game-over.mp3');
    gameOverSound.volume = 0.7;
    setTimeout(() => soundReady = true, 500);
}

function playRandomBrick() {
    if (!soundReady || !brickSounds.length) return;
    const sound = brickSounds[Math.floor(Math.random() * brickSounds.length)];
    sound.currentTime = 0;
    sound.play().catch(() => {});
}

function playPlatformSound() {
    if (!soundReady || !platformSound) return;
    platformSound.currentTime = 0;
    platformSound.play().catch(() => {});
}

function playGameOverSound() {
    if (!soundReady || !gameOverSound) return;
    gameOverSound.currentTime = 0;
    gameOverSound.play().catch(() => {});
}

// PADDLE
function updatePaddleWidth() {
    paddle.width = paddle.powerUps.wide ? paddle.baseWidth * 1.5 : paddle.baseWidth;
}

function launchBall() {
    ballLaunched = true;
    readyEl.style.display = 'none';
    balls = [{
        x: paddle.x + paddle.width/2, y: paddle.y - 15, radius: 10,
        vx: (Math.random() - 0.5) * 4, vy: -4.8, speed: 4.8, trail: []
    }];
}

function restartGame() {
    gameRunning = true;
    ballLaunched = false;
    score = 0; lives = 3;
    paddle.powerUps = { wide: false, wideTimer: 0 };
    balls = [{ x: 0, y: 0, radius: 10, vx: 0, vy: 0, speed: 4.8, trail: [] }];
    powerUps = [];
    
    scoreEl.textContent = 'Puntos: 0';
    livesEl.textContent = '❤️❤️❤️';
    gameOverEl.style.display = 'none';
    readyEl.style.display = 'block';
    resize();
    initBricks();
}

// BRICKS
function initBricks() {
    bricks = [];
    const cols = Math.min(BRICK_COLS, Math.floor((gameWidth - 40) / (brickWidth + brickPadding)));
    const startX = MARGIN + (gameWidth - (cols * brickWidth + (cols - 1) * brickPadding)) / 2;
    
    for (let r = 0; r < BRICK_ROWS; r++) {
        bricks[r] = [];
        for (let c = 0; c < cols; c++) {
            const rand = Math.random();
            let hits, colorBase, points, powerUpChance;
            if (rand < 0.08) { hits = 4; colorBase = 0; points = 60; powerUpChance = 0.4; }
            else if (rand < 0.25) { hits = 3; colorBase = 25; points = 40; powerUpChance = 0.25; }
            else if (rand < 0.5) { hits = 2; colorBase = 45; points = 25; powerUpChance = 0.15; }
            else { hits = 1; colorBase = 120; points = 10; powerUpChance = 0.08; }
            
            bricks[r][c] = {
                x: startX + c * (brickWidth + brickPadding),
                y: MARGIN + 40 + r * (brickHeight + 8),
                width: brickWidth, height: brickHeight,
                hits, maxHits: hits, colorBase, points,
                powerUp: Math.random() < powerUpChance ? Math.floor(Math.random() * 2) : -1,
                hasPowerUp: Math.random() < powerUpChance,
                status: 1
            };
        }
    }
}

// JUEGO
function collisionDetection() {
    for (let r = 0; r < BRICK_ROWS; r++) {
        for (let c = 0; c < BRICK_COLS; c++) {
            const b = bricks[r]?.[c];
            if (!b || b.status !== 1 || b.hits <= 0) continue;
            
            for (let ball of balls) {
                if (ball.x + ball.radius > b.x && ball.x - ball.radius < b.x + b.width &&
                    ball.y + ball.radius > b.y && ball.y - ball.radius < b.y + b.height) {
                    
                    b.hits--;
                    score += b.points;
                    scoreEl.textContent = `Puntos: ${score.toLocaleString()}`;
                    saveHighScore();
                    
                    if (b.hits <= 0) {
                        b.status = 0;
                        if (b.hasPowerUp && b.powerUp >= 0) {
                            powerUps.push({
                                x: b.x + b.width/2, y: b.y + b.height,
                                vy: 2, type: b.powerUp, radius: 12, life: 300
                            });
                        }
                    }
                    
                    ball.vy *= -1;
                    playRandomBrick();
                    return;
                }
            }
        }
    }
}

function updatePowerUps() {
    for (let i = powerUps.length - 1; i >= 0; i--) {
        const pu = powerUps[i];
        pu.y += pu.vy;
        pu.life--;
        pu.vy += 0.1;
        
        if (pu.y + pu.radius > paddle.y && pu.y < paddle.y + paddle.height &&
            pu.x > paddle.x && pu.x < paddle.x + paddle.width) {
            if (pu.type === 0) {
                paddle.powerUps.wide = true;
                paddle.powerUps.wideTimer = 480;
                updatePaddleWidth();
            } else {
                balls.push({
                    x: paddle.x + paddle.width / 2, y: paddle.y - 15,
                    radius: 10, vx: (Math.random() - 0.5) * 4,
                    vy: -3, speed: 4.8, trail: []
                });
            }
            powerUps.splice(i, 1);
        } else if (pu.y > canvas.height || pu.life <= 0) {
            powerUps.splice(i, 1);
        }
    }
    
    if (paddle.powerUps.wide && paddle.powerUps.wideTimer > 0) {
        paddle.powerUps.wideTimer--;
        if (paddle.powerUps.wideTimer <= 0) {
            paddle.powerUps.wide = false;
            updatePaddleWidth();
        }
    }
}

function movePaddle() {
    paddle.x += (paddle.targetX - paddle.x) * paddle.speed;
    if (keys['arrowleft'] || keys['a']) paddle.targetX -= 15;
    if (keys['arrowright'] || keys['d']) paddle.targetX += 15;
    paddle.x = Math.max(MARGIN + 10, Math.min(gameWidth + MARGIN - paddle.width - 10, paddle.x));
}

function moveBalls() {
    const leftWall = MARGIN, rightWall = gameWidth + MARGIN, topWall = MARGIN;
    
    for (let i = balls.length - 1; i >= 0; i--) {
        const ball = balls[i];
        const speed = Math.hypot(ball.vx, ball.vy);
        if (speed > 0) {
            const ratio = ball.speed / speed;
            ball.vx *= ratio;
            ball.vy *= ratio;
        }
        
        ball.x += ball.vx;
        ball.y += ball.vy;
        
        if (ball.x - ball.radius < leftWall) { ball.x = leftWall + ball.radius; ball.vx *= -1; }
        if (ball.x + ball.radius > rightWall) { ball.x = rightWall - ball.radius; ball.vx *= -1; }
        if (ball.y - ball.radius < topWall) { ball.y = topWall + ball.radius; ball.vy *= -1; }
        
        if (ball.y + ball.radius > paddle.y && ball.y < paddle.y + paddle.height &&
            ball.x > paddle.x && ball.x < paddle.x + paddle.width) {
            playPlatformSound();
            ball.y = paddle.y - ball.radius;
            ball.vy *= -1;
            const hitPos = (ball.x - (paddle.x + paddle.width / 2)) / (paddle.width / 2);
            ball.vx += hitPos * 2.5;
        }
        
        if (ball.y > canvas.height - 60) {
            balls.splice(i, 1);
            if (balls.length === 0) {
                lives--;
                livesEl.textContent = '❤️'.repeat(lives) + '🖤'.repeat(3 - lives);
                if (lives <= 0) {
                    gameOver();
                } else {
                    setTimeout(() => {
                        balls = [{
                            x: paddle.x + paddle.width/2, y: paddle.y - 15,
                            radius: 10, vx: 0, vy: 0, speed: 4.8, trail: []
                        }];
                        ballLaunched = false;
                    }, 1000);
                }
            }
        }
    }
    
    if (checkWin()) winGame();
}

function checkWin() {
    for (let r = 0; r < BRICK_ROWS; r++) {
        for (let c = 0; c < BRICK_COLS; c++) {
            if (bricks[r]?.[c]?.status === 1) return false;
        }
    }
    return true;
}

function gameOver() {
    gameRunning = false;
    playGameOverSound();
    saveHighScore();
    document.getElementById('finalScore').innerHTML = `Puntos: ${score.toLocaleString()}`;
    gameOverEl.style.display = 'block';
}

function winGame() {
    initBricks();
    balls = [{
        x: paddle.x + paddle.width/2, y: paddle.y - 15,
        radius: 10, vx: (Math.random() - 0.5) * 2, vy: -4, speed: 4.8, trail: []
    }];
    gameRunning = true;
    ballLaunched = true;
}

// DRAW SIMPLE
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // MARCO
    ctx.strokeStyle = '#00f7ff';
    ctx.lineWidth = 6;
    ctx.strokeRect(MARGIN, MARGIN, gameWidth, gameHeight);
    
    // BRICKS
    for (let r = 0; r < BRICK_ROWS; r++) {
        for (let c = 0; c < BRICK_COLS; c++) {
            const b = bricks[r]?.[c];
            if (!b || b.status !== 1) continue;
            
            const damageRatio = b.hits / b.maxHits;
            const hue = (b.colorBase + (1 - damageRatio) * 40) % 360;
            ctx.fillStyle = `hsl(${hue}, 80%, ${50 + (1-damageRatio)*20}%)`;
            ctx.strokeStyle = 'rgba(255,255,255,0.8)';
            ctx.lineWidth = 2;
            
            ctx.fillRect(b.x, b.y, b.width, b.height);
            ctx.strokeRect(b.x, b.y, b.width, b.height);
            
            if (b.maxHits > 1) {
                ctx.fillStyle = 'white';
                ctx.font = 'bold 14px Arial';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(b.hits, b.x + b.width/2, b.y + b.height/2);
            }
        }
    }
    
    // PADDLE
    ctx.fillStyle = paddle.powerUps.wide ? '#00ff88' : '#00f7ff';
    ctx.shadowColor = ctx.fillStyle;
    ctx.shadowBlur = 20;
    ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);
    ctx.shadowBlur = 0;
    
    // BALLS
    balls.forEach(ball => {
        ctx.shadowColor = '#ff6b6b';
        ctx.shadowBlur = 20;
        ctx.fillStyle = '#ff6b6b';
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
    });
}

// LOOP
function update() {
    movePaddle();
    updatePowerUps();
    if (gameRunning) {
        moveBalls();
        collisionDetection();
    }
}

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

// INICIO
window.addEventListener('load', () => {
    loadHighScore();
    initSound();
    resize();
    initBricks();
    readyEl.style.display = 'block';
    gameLoop();
});
