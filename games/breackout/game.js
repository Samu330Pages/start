'use strict';

const LOW_DEVICE = navigator.hardwareConcurrency <= 2 || screen.width < 768;
let lastTime = 0, frameSkip = 0;

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('score');
const livesEl = document.getElementById('lives');
const highScoreEl = document.getElementById('highScore');
const readyEl = document.getElementById('readyScreen');
const gameOverEl = document.getElementById('gameOver');
const winEl = document.getElementById('win');

let gameRunning = true, ballLaunched = false, score = 0, lives = 3;
let dragging = false, totalInitialBricks = 0, highScore = 0, currentHighScore = 0;
const MARGIN = 25, BRICK_ROWS = 8, BRICK_COLS = 14;
let gameWidth = 0, gameHeight = 0, brickWidth = 45, brickHeight = 20, brickPadding = 6;

const brickSounds = [], platformSound = null, gameOverSound = null;
let soundReady = false;

const paddle = {
    baseWidth: 120, width: 120, height: 20, x: 0, y: 0, targetX: 0, speed: 0.3,
    powerUps: { wide: false, balls: 1, wideTimer: 0 }
};

const balls = [{ x: 0, y: 0, radius: 10, vx: 0, vy: 0, speed: 4.8, trail: [] }];
const powerUps = [], bricks = [];

const keys = {};
canvas.addEventListener('click', e => { if (!ballLaunched && gameRunning) launchBall(); });
canvas.addEventListener('touchstart', handleTouch, { passive: false });
canvas.addEventListener('touchmove', handleTouch, { passive: false });
canvas.addEventListener('touchend', () => dragging = false);
window.addEventListener('keydown', e => keys[e.key.toLowerCase()] = true);
window.addEventListener('keyup', e => keys[e.key.toLowerCase()] = false);

function handleTouch(e) {
    e.preventDefault();
    const rect = canvas.getBoundingClientRect();
    const x = e.touches[0].clientX - rect.left;
    dragging = true;
    paddle.targetX = Math.max(MARGIN + 10, Math.min(gameWidth + MARGIN - paddle.width - 10, x - paddle.width/2));
    if (!ballLaunched && gameRunning) launchBall();
}

function resize() {
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.floor(rect.width * dpr);
    canvas.height = Math.floor(rect.height * dpr);
    ctx.resetTransform();
    ctx.scale(dpr, dpr);
    
    gameWidth = rect.width - MARGIN * 2;
    gameHeight = rect.height - MARGIN * 2 - 60;
    paddle.y = rect.height - 80;
    paddle.x = (gameWidth / 2) + MARGIN - paddle.width / 2;
    paddle.targetX = paddle.x;
    updatePaddleWidth();
    
    if (balls[0]) {
        balls[0].x = paddle.x + paddle.width / 2;
        balls[0].y = paddle.y - balls[0].radius - 5;
    }
}

window.addEventListener('resize', resize);
resize();

function loadHighScore() {
    const saved = localStorage.getItem('breakoutHighScore');
    highScore = saved ? parseInt(saved) : 0;
    currentHighScore = highScore;
    highScoreEl.textContent = `Récord: ${highScore.toLocaleString()}`;
}

function saveHighScore() {
    if (score > highScore) {
        highScore = score;
        localStorage.setItem('breakoutHighScore', highScore);
        const scoreEl = document.getElementById('score');
        scoreEl.style.color = '#ffd700';
        scoreEl.style.textShadow = '0 0 20px #ffd700';
        setTimeout(() => {
            scoreEl.style.color = 'white';
            scoreEl.style.textShadow = '0 0 20px #00f7ff';
        }, 2000);
    }
}

function initSound() {
    ['brick.mp3', 'brick1.mp3', 'brick2.mp3'].forEach(file => {
        const sound = new Audio(file);
        sound.volume = 0.5;
        sound.load();
        brickSounds.push(sound);
    });
    platformSound = new Audio('platform.mp3');
    platformSound.volume = 0.4;
    platformSound.load();
    gameOverSound = new Audio('game-over.mp3');
    gameOverSound.volume = 0.7;
    gameOverSound.load();
    
    setTimeout(() => {
        soundReady = true;
    }, 500);
}

function playRandomBrick() {
    if (!soundReady || brickSounds.length === 0) return;
    const sound = brickSounds[Math.floor(Math.random() * brickSounds.length)];
    sound.currentTime = 0;
    sound.play().catch(() => {});
}

function playPlatform() {
    if (!soundReady || !platformSound) return;
    platformSound.currentTime = 0;
    platformSound.play().catch(() => {});
}

function playGameOver() {
    if (!soundReady || !gameOverSound) return;
    gameOverSound.currentTime = 0;
    gameOverSound.play().catch(() => {});
}

function updatePaddleWidth() {
    paddle.width = paddle.powerUps.wide ? paddle.baseWidth * 1.5 : paddle.baseWidth;
}

function launchBall() {
    ballLaunched = true;
    readyEl.style.display = 'none';
    balls.length = 1;
    balls[0] = {
        x: paddle.x + paddle.width/2, y: paddle.y - 15, radius: 10,
        vx: (Math.random() - 0.5) * 4, vy: -4.8, speed: 4.8, trail: [], id: 0
    };
}

function restartGame() {
    gameRunning = true;
    ballLaunched = false;
    score = 0;
    lives = 3;
    paddle.powerUps = { wide: false, balls: 1, wideTimer: 0 };
    balls.length = 1;
    balls[0] = { x: 0, y: 0, radius: 10, vx: 0, vy: 0, speed: 4.8, trail: [] };
    powerUps.length = 0;
    
    gameOverEl.style.display = 'none';
    winEl.style.display = 'none';
    readyEl.style.display = 'block';
    
    scoreEl.textContent = 'Puntos: 0';
    livesEl.textContent = '❤️❤️❤️';
    loadHighScore();
    resize();
    initBricks();
}

function initBricks() {
    bricks.length = 0;
    const availableWidth = gameWidth - 40;
    const brickTotalWidth = brickWidth + brickPadding;
    const cols = Math.min(BRICK_COLS, Math.floor(availableWidth / brickTotalWidth));
    const totalBricksWidth = cols * brickWidth + (cols - 1) * brickPadding;
    const startX = MARGIN + (gameWidth - totalBricksWidth) / 2;
    
    for (let r = 0; r < BRICK_ROWS; r++) {
        bricks[r] = [];
        for (let c = 0; c < cols; c++) {
            const rand = Math.random();
            let hits, colorBase, points, powerUpChance;
            if (rand < 0.08) { hits = 4; colorBase = 0; points = 60; powerUpChance = 0.4; }
            else if (rand < 0.25) { hits = 3; colorBase = 25; points = 40; powerUpChance = 0.25; }
            else if (rand < 0.5) { hits = 2; colorBase = 45; points = 25; powerUpChance = 0.15; }
            else { hits = 1; colorBase = 120; points = 10; powerUpChance = 0.08; }
            
            const hasPowerUp = Math.random() < powerUpChance;
            const powerUpType = hasPowerUp ? Math.floor(Math.random() * 2) : -1;
            
            bricks[r][c] = {
                x: startX + c * (brickWidth + brickPadding),
                y: MARGIN + 40 + r * (brickHeight + 8),
                width: brickWidth, height: brickHeight, hits, maxHits: hits,
                colorBase, points, powerUp: powerUpType, hasPowerUp,
                status: 1
            };
        }
        for (let c = cols; c < BRICK_COLS; c++) bricks[r][c] = { status: 0 };
    }
}

function collisionDetection() {
    const leftWall = MARGIN, rightWall = gameWidth + MARGIN, topWall = MARGIN;
    
    for (let r = 0; r < BRICK_ROWS; r++) {
        for (let c = 0; c < BRICK_COLS; c++) {
            const b = bricks[r][c];
            if (!b || b.status !== 1 || b.hits <= 0) continue;
            
            for (let i = 0; i < balls.length; i++) {
                const ball = balls[i];
                if (ball.x + ball.radius > b.x && ball.x - ball.radius < b.x + b.width &&
                    ball.y + ball.radius > b.y && ball.y - ball.radius < b.y + b.height) {
                    
                    b.hits = Math.max(0, b.hits - 1);
                    score += b.points;
                    scoreEl.textContent = `Puntos: ${score.toLocaleString()}`;
                    saveHighScore();
                    
                    if (b.hits <= 0) {
                        b.status = 0;
                        if (b.hasPowerUp && b.powerUp >= 0) {
                            powerUps.push({
                                x: b.x + b.width/2, y: b.y + b.height, vy: 2,
                                type: b.powerUp, radius: 12, life: 300
                            });
                        }
                    }
                    
                    ball.vy *= -1;
                    if (Math.random() < 0.5) playRandomBrick(); // OPTIMIZADO
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
                const newBall = {
                    x: paddle.x + paddle.width / 2 + (Math.random() - 0.5) * 40,
                    y: paddle.y - 15, radius: 10,
                    vx: (Math.random() - 0.5) * 4, vy: -3, speed: 4.8,
                    trail: [], id: balls.length
                };
                balls.push(newBall);
            }
            powerUps.splice(i, 1);
            continue;
        }
        
        if (pu.y > canvas.height || pu.life <= 0) powerUps.splice(i, 1);
    }
    
    if (paddle.powerUps.wide && paddle.powerUps.wideTimer-- <= 0) {
        paddle.powerUps.wide = false;
        updatePaddleWidth();
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
        
        ball.trail.push({x: ball.x, y: ball.y});
        if (ball.trail.length > 8) ball.trail.shift();
        
        ball.x += ball.vx;
        ball.y += ball.vy;
        
        // Paredes
        if (ball.x - ball.radius < leftWall) { ball.x = leftWall + ball.radius; ball.vx *= -1; }
        if (ball.x + ball.radius > rightWall) { ball.x = rightWall - ball.radius; ball.vx *= -1; }
        if (ball.y - ball.radius < topWall) { ball.y = topWall + ball.radius; ball.vy *= -1; }
        
        // Paddle
        if (ball.y + ball.radius > paddle.y && ball.y < paddle.y + paddle.height &&
            ball.x > paddle.x && ball.x < paddle.x + paddle.width) {
            playPlatform();
            ball.y = paddle.y - ball.radius;
            ball.vy *= -1;
            const hitPos = (ball.x - (paddle.x + paddle.width / 2)) / (paddle.width / 2);
            ball.vx += hitPos * 2.5;
        }
        
        // Game Over
        if (ball.y > gameHeight + MARGIN + 20) {
            balls.splice(i, 1);
            if (balls.length === 0) {
                lives--;
                livesEl.textContent = '❤️'.repeat(lives) + '💔'.repeat(3 - lives);
                if (lives <= 0) gameOver();
                else resetBall();
            }
        }
    }
    
    if (checkWinCondition()) winGame();
}

function resetBall() {
    ballLaunched = false;
    balls.length = 1;
    balls[0] = {
        x: paddle.x + paddle.width / 2, y: paddle.y - 15,
        radius: 10, vx: 0, vy: 0, speed: 4.8, trail: []
    };
}

function checkWinCondition() {
    for (let r = 0; r < BRICK_ROWS; r++) {
        for (let c = 0; c < BRICK_COLS; c++) {
            if (bricks[r]?.[c]?.status === 1) return false;
        }
    }
    return true;
}

function gameOver() {
    gameRunning = false;
    playGameOver();
    saveHighScore();
    document.getElementById('finalScore').innerHTML = 
        `Puntos: ${score.toLocaleString()}${score === highScore ? '<br><span style="color: gold; font-size: 24px;">🏆 ¡NUEVO RÉCORD!</span>' : ''}`;
    gameOverEl.style.display = 'block';
}

function winGame() {
    document.getElementById('winScore').textContent = `Puntos: ${score.toLocaleString()}`;
    initBricks();
    
    if (balls.length === 0) resetBall();
    else {
        for (let ball of balls) {
            ball.x = paddle.x + paddle.width / 2;
            ball.y = paddle.y - 15;
            ball.vy = -ball.speed * 0.8;
            ball.vx = (Math.random() - 0.5) * 2;
        }
    }
    
    gameRunning = true;
    ballLaunched = true;
    winEl.style.display = 'none';
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Marco
    if (!LOW_DEVICE) {
        ctx.shadowColor = '#00f7ff';
        ctx.shadowBlur = 20;
        ctx.lineWidth = 6;
    } else {
        ctx.lineWidth = 2;
    }
    ctx.strokeStyle = '#00f7ff';
    ctx.strokeRect(MARGIN, MARGIN, gameWidth, gameHeight);
    ctx.shadowBlur = 0;
    
    // Bricks
    for (let r = 0; r < BRICK_ROWS; r++) {
        for (let c = 0; c < BRICK_COLS; c++) {
            const b = bricks[r][c];
            if (!b || b.status !== 1) continue;
            
            const damageRatio = b.hits / b.maxHits;
            const hue = (b.colorBase + (1 - damageRatio) * 40) % 360;
            
            if (!LOW_DEVICE) {
                ctx.shadowColor = `hsl(${hue}, 80%, 50%)`;
                ctx.shadowBlur = damageRatio < 0.5 ? 15 : 8;
            }
            ctx.fillStyle = `hsl(${hue}, 80%, ${50 + (1-damageRatio)*20}%)`;
            ctx.lineWidth = b.maxHits > 2 ? 3 : 1.5;
            ctx.strokeStyle = `rgba(255,255,255,${0.9 - damageRatio * 0.4})`;
            
            ctx.fillRect(b.x, b.y, b.width, b.height);
            ctx.strokeRect(b.x, b.y, b.width, b.height);
            
            if (b.maxHits > 1) {
                ctx.fillStyle = 'white';
                ctx.font = `bold ${Math.max(12, b.width/3.2)}px Arial`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(b.hits, b.x + b.width/2, b.y + b.height/2);
            }
            
            if (b.hasPowerUp) {
                ctx.shadowBlur = 8;
                ctx.shadowColor = b.powerUp === 0 ? '#00ff88' : '#ffaa00';
                ctx.fillStyle = b.powerUp === 0 ? '#00ff88' : '#ffaa00';
                ctx.beginPath();
                ctx.arc(b.x + b.width - 8, b.y + 8, 5, 0, Math.PI*2);
                ctx.fill();
            }
            ctx.shadowBlur = 0;
        }
    }
    
    // Power-ups
    powerUps.forEach(pu => {
        ctx.save();
        ctx.shadowColor = pu.type === 0 ? '#00ff88' : '#ffaa00';
        if (!LOW_DEVICE) ctx.shadowBlur = 15;
        
        if (pu.type === 0) {
            ctx.fillStyle = '#00ff88';
            ctx.fillRect(pu.x - 15, pu.y - 8, 30, 16);
            ctx.fillStyle = 'white';
            ctx.font = 'bold 10px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('W', pu.x, pu.y);
        } else {
            ctx.fillStyle = '#ffaa00';
            ctx.beginPath();
            ctx.arc(pu.x, pu.y, pu.radius, 0, Math.PI*2);
            ctx.fill();
            ctx.fillStyle = 'white';
            ctx.font = 'bold 12px Arial';
            ctx.textBaseline = 'middle';
            ctx.fillText('×', pu.x, pu.y);
        }
        ctx.restore();
    });
    
    // Paddle
    ctx.fillStyle = paddle.powerUps.wide ? '#00ff88' : '#00f7ff';
    if (!LOW_DEVICE) {
        ctx.shadowColor = ctx.fillStyle;
        ctx.shadowBlur = 25;
    }
    ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);
    ctx.shadowBlur = 0;
    
    // Balls
    balls.forEach(ball => {
        ctx.save();
        if (!LOW_DEVICE) {
            for (let i = 0; i < ball.trail.length; i++) {
                const alpha = (i + 1) / ball.trail.length * 0.5;
                ctx.fillStyle = `rgba(255,100,100,${alpha})`;
                ctx.beginPath();
                ctx.arc(ball.trail[i].x, ball.trail[i].y, ball.radius * 0.6, 0, Math.PI * 2);
                ctx.fill();
            }
        }
        
        ctx.translate(ball.x, ball.y);
        if (!ballLaunched) {
            ctx.shadowColor = '#ffff00';
            ctx.shadowBlur = 30;
            ctx.fillStyle = '#ffff66';
            ctx.beginPath();
            ctx.arc(0, 0, ball.radius + Math.sin(Date.now() * 0.01) * 3, 0, Math.PI * 2);
            ctx.fill();
        } else {
            ctx.shadowColor = '#ff6b6b';
            ctx.shadowBlur = 20;
            ctx.fillStyle = '#ff6b6b';
            ctx.beginPath();
            ctx.arc(0, 0, ball.radius, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.restore();
    });
}

function update() {
    movePaddle();
    updatePowerUps();
    if (gameRunning) {
        moveBalls();
        collisionDetection();
    }
}

function gameLoop(currentTime) {
    if (LOW_DEVICE && frameSkip++ % 2) {
        requestAnimationFrame(gameLoop);
        return;
    }
    
    update();
    draw();
    requestAnimationFrame(gameLoop);
    lastTime = currentTime;
}

// INICIALIZACIÓN
loadHighScore();
initSound();
initBricks();
resetBall();
readyEl.style.display = 'block';
gameLoop();
