// Configuración Firebase
        const firebaseConfig = {
            apiKey: "AIzaSyCqsYZA9wU9Y1YvYGicdZQ_7DDzfEVLXDU",
            authDomain: "number-ac729.firebaseapp.com",
            projectId: "number-ac729",
            storageBucket: "number-ac729.appspot.com",
            messagingSenderId: "36610055964",
            appId: "1:36610055964:web:ec80cc7ea2fb23287ce4d9",
            measurementId: "G-0BTNK7VNM3"
        };
        firebase.initializeApp(firebaseConfig);

        // Referencias DOM
        const modalContainer = document.getElementById("modalContainer");
        const modalTitle = document.getElementById("modalTitle");
        const modalMessage = document.getElementById("modalMessage");
        const modalButtonsContainer = document.getElementById("modalButtons");
        const scoreEl = document.getElementById("scoreEl");
        const highestEl = document.getElementById("highestEl");
        const fpsCounter = document.getElementById("fpsCounter");
        const canvas = document.querySelector("canvas");
        const c = canvas.getContext("2d");

        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        // Variables globales
        let x = canvas.width / 2;
        let y = canvas.height / 2;

        let projectiles = [];
        let enemies = [];
        let particles = [];

        let score = 0;
        let highest = parseInt(localStorage.getItem("highest")) || 0;
        highestEl.innerText = highest;

        const friction = 0.98;
        const vividColors = [
            "#ff0000", "#00ff00", "#0000ff", "#ffff00", "#ff00ff", "#00ffff",
            "#ff8800", "#8800ff", "#00ff88", "#ff0088", "#88ff00", "#0088ff"
        ];
        const shapes = ["circle", "square", "triangle"];

        let lastTime = performance.now();
        let fps = 0;
        let animationId;
        let spanEnemiesInterval;
        let spawnTime = 1000;
        let gameState = "verifying";

        let isUserRegistered = false;
        let userUID = null; // UID según respuesta de API
        let userName = "Invitado";
        let userScore = 0;

        // Clases del juego
        class Ball {
            constructor(x, y, radius, color, shape = "circle") {
                this.x = x; this.y = y; this.radius = radius;
                this.color = color; this.shape = shape;
            }
            draw() {
                c.fillStyle = this.color;
                if (this.shape === "circle") {
                    c.beginPath();
                    c.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
                    c.fill();
                } else if (this.shape === "square") {
                    c.fillRect(this.x - this.radius, this.y - this.radius, this.radius * 2, this.radius * 2);
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

        // Función init para comenzar partida
        function init() {
            player = new Ball(x, y, 10, "white");
            projectiles = [];
            enemies = [];
            particles = [];
            score = 0;
            spawnTime = 1000;
            if (isUserRegistered) {
                highestEl.innerText = userScore;
            } else {
                highestEl.innerText = highest;
            }
            scoreEl.innerText = score;
        }

        // Función para iniciar la partida
        function startGame() {
            console.log("Iniciando partida...");
            gameState = "playing";
            x = canvas.width / 2;
            y = canvas.height / 2;
            init();
            animate();
            clearTimeout(spanEnemiesInterval);
            spanEnemies();
            hideModal();
        }

        // Funciones auxiliares para el juego (updateScore, calcular velocidad, etc.)
        function updateScore(amount = 100) {
            score += amount;
            scoreEl.innerText = score;

            if (isUserRegistered) {
                highestEl.innerText = userScore > score ? userScore : score;
            } else {
                if (score > highest) {
                    highest = score;
                    localStorage.setItem("highest", highest);
                    highestEl.innerText = highest;
                }
            }
            spawnTime *= 0.9995;
        }

        function calculateVelocity(x, y, x1 = canvas.width / 2, y1 = canvas.height / 2) {
            const angle = Math.atan2(y1 - y, x1 - x);
            return { x: Math.cos(angle), y: Math.sin(angle) };
        }

        function updateFPS(timestamp) {
            const now = performance.now();
            fps = Math.round(1000 / (now - lastTime));
            lastTime = now;
            fpsCounter.textContent = "FPS: " + fps;
        }

        function animate(timestamp) {
            if (gameState !== "playing") return;
            animationId = requestAnimationFrame(animate);
            updateFPS(timestamp);

            c.fillStyle = "rgba(0,0,0,0.1)";
            c.fillRect(0, 0, canvas.width, canvas.height);

            if (player) player.draw();

            for (let i = particles.length - 1; i >= 0; i--) {
                if (particles[i].alpha <= 0) particles.splice(i, 1);
                else particles[i].update();
            }

            for (let i = projectiles.length - 1; i >= 0; i--) {
                projectiles[i].update();
                if (projectiles[i].x + projectiles[i].radius < 0 || projectiles[i].x - projectiles[i].radius > canvas.width || projectiles[i].y + projectiles[i].radius < 0 || projectiles[i].y - projectiles[i].radius > canvas.height) {
                    projectiles.splice(i, 1);
                }
            }

            for (let i = enemies.length - 1; i >= 0; i--) {
                enemies[i].update();

                const dist = Math.hypot(player.x - enemies[i].x, player.y - enemies[i].y);
                if (dist - enemies[i].radius - player.radius <= 0) {
                    stopGame();
                    onGameOver();
                    return;
                }

                for (let j = projectiles.length - 1; j >= 0; j--) {
                    const distP = Math.hypot(projectiles[j].x - enemies[i].x, projectiles[j].y - enemies[i].y);
                    if (distP - enemies[i].radius - projectiles[j].radius < 0) {
                        for (let k = 0; k < enemies[i].radius; k++) {
                            particles.push(new Particle(
                                projectiles[j].x,
                                projectiles[j].y,
                                Math.random() * 3,
                                enemies[i].color,
                                { x: (Math.random() - 0.5) * (Math.random() * 9.8 - 0.5), y: (Math.random() - 0.5) * (Math.random() * 9.8 - 0.5) },
                                enemies[i].shape
                            ));
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
            if (gameState !== "playing") return;
            const centerX = canvas.width / 2;
            const centerY = canvas.height / 2;
            let velocity = calculateVelocity(centerX, centerY, x, y);
            velocity.x *= 5.5;
            velocity.y *= 5.5;
            projectiles.push(new Shooter(centerX, centerY, 5, "white", velocity));
        }

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

        function stopGame() {
            clearTimeout(spanEnemiesInterval);
            cancelAnimationFrame(animationId);
        }

        function spanEnemies() {
            spanEnemiesInterval = setTimeout(() => {
                if (gameState !== "playing") return;

                let ex, ey;
                const radius = Math.random() * 16 + 14;

                if (Math.random() < 0.5) {
                    ex = Math.random() < 0.5 ? 0 - radius : canvas.width + radius;
                    ey = Math.random() * canvas.height;
                } else {
                    ex = Math.random() * canvas.width;
                    ey = Math.random() < 0.5 ? 0 - radius : canvas.height + radius;
                }

                const color = vividColors[Math.floor(Math.random() * vividColors.length)];
                const shape = shapes[Math.floor(Math.random() * shapes.length)];
                enemies.push(new Shooter(ex, ey, radius, color, calculateVelocity(ex, ey), shape));
                spanEnemies();
            }, spawnTime);
        }

        // Modal helpers
        function clearModalButtons() {
            modalButtonsContainer.innerHTML = "";
            modalButtonsContainer.style.display = "none";
        }

        function createButton(text, className, onClick) {
            const btn = document.createElement("button");
            btn.textContent = text;
            if (className) btn.classList.add(className);
            btn.onclick = onClick;
            return btn;
        }

        // Mostrar modales incluyendo la tabla de ranking para el "Ver Rating"
        function showModal(type, messageExtra = "") {
            modalContainer.style.display = "flex";
            clearModalButtons();

            switch (type) {
                case "verifying":
                    modalTitle.innerText = "Verificando usuario...";
                    modalMessage.innerText = "Por favor espera.";
                    break;

                case "verifyResult":
                    modalTitle.innerText = "Verificación completada";
                    modalMessage.innerHTML = "Selecciona cómo quieres jugar:";
                    modalButtonsContainer.style.display = "flex";

                    modalButtonsContainer.appendChild(createButton("Jugar como Invitado", null, () => {
                        isUserRegistered = false;
                        userUID = null;
                        userName = "Invitado";
                        userScore = 0;
                        highest = parseInt(localStorage.getItem("highest")) || 0;
                        highestEl.innerText = highest;
                        showModal("welcome");
                    }));

                    modalButtonsContainer.appendChild(createButton("Iniciar Sesión / Registrarse", null, () => {
                        window.location.href = "https://samu330.com/login/index";
                    }));
                    break;

                case "welcome":
                    modalTitle.innerText = `¡Bienvenido ${isUserRegistered ? userName : "Invitado"}!`;
                    modalMessage.innerHTML = (isUserRegistered ? `Puntaje guardado: ${userScore}` : "Puedes jugar sin registrarte o iniciar sesión para guardar tu progreso y aparecer en el ranking.") + "<br><br>";
                    modalButtonsContainer.style.display = "flex";

                    modalButtonsContainer.appendChild(createButton("Comenzar Partida", null, () => {
                        startGame();
                    }));

                    modalButtonsContainer.appendChild(createButton("Ver Rating", "secondary", () => {
                        showRankingModal();
                    }));
                    break;

                case "paused":
                    modalTitle.innerText = "Juego pausado";
                    modalMessage.innerHTML = `Tu puntuación actual: ${score}<br>Vuelve cuando quieras.`;
                    modalButtonsContainer.style.display = "flex";

                    modalButtonsContainer.appendChild(createButton("Reanudar Juego", null, () => {
                        hideModal();
                        gameState = "playing";
                        animate();
                        clearTimeout(spanEnemiesInterval);
                        spanEnemies();
                    }));
                    break;

                case "gameover":
                    modalTitle.innerText = "¡Fin del juego!";
                    modalMessage.innerHTML = `Tu puntuación: <b>${score}</b>${messageExtra}`;
                    modalButtonsContainer.style.display = "flex";

                    modalButtonsContainer.appendChild(createButton("Volver a jugar", null, () => {
                        startGame();
                    }));

                    if (!isUserRegistered) {
                        modalButtonsContainer.appendChild(createButton("Iniciar Sesión / Registrarse", "secondary", () => {
                            window.location.href = "https://samu330.com/login/index";
                        }));
                    }
                    break;

                default:
                    modalContainer.style.display = "none";
            }
        }

        function hideModal() {
            modalContainer.style.display = "none";
        }

        // Funciones para ranking y tabla

        async function fetchRankingData() {
            try {
                const response = await fetch('https://us-central1-number-ac729.cloudfunctions.net/getAllUsersV1');
                if (!response.ok) throw new Error("Error al obtener ranking");
                const data = await response.json();
                return data.users || [];
            } catch (e) {
                console.error("Error fetch ranking:", e);
                return [];
            }
        }

        function buildRankingTable(users) {
            users.sort((a, b) => {
                const scoreA = (a.games && a.games.shooter) || 0;
                const scoreB = (b.games && b.games.shooter) || 0;
                return scoreB - scoreA;
            });

            const table = document.createElement('table');
            table.classList.add('rankingTable');

            const thead = document.createElement('thead');
            const headerRow = document.createElement('tr');
            ['Pos', 'Jugador', 'Puntaje'].forEach(text => {
                const th = document.createElement('th');
                th.innerText = text;
                headerRow.appendChild(th);
            });
            thead.appendChild(headerRow);
            table.appendChild(thead);

            const tbody = document.createElement('tbody');
            users.forEach((user, idx) => {
                const tr = document.createElement('tr');
                if (idx === 0) tr.classList.add('gold');
                else if (idx === 1) tr.classList.add('silver');
                else if (idx === 2) tr.classList.add('bronze');

                // Posición solo número
                const tdPos = document.createElement('td');
                tdPos.classList.add('icon');
                tdPos.textContent = (idx + 1).toString();

                // Nombre con icono dentro para top 3
                const tdUser = document.createElement('td');
                tdUser.style.whiteSpace = "nowrap";
                let iconHTML = "";
                if (idx === 0) {
                    iconHTML = '<i class="fas fa-crown" style="color:#fffff; margin-left:5px;" title="1er lugar"></i>';
                } else if (idx === 1) {
                    iconHTML = '<i class="fas fa-trophy" style="color:#757575; margin-left:5px;" title="2do lugar"></i>';
                } else if (idx === 2) {
                    iconHTML = '<i class="fas fa-medal" style="color:#cd7f32; margin-left:5px;" title="3er lugar"></i>';
                }
                tdUser.innerHTML = `${user.user || user.email || 'Sin nombre'} ${iconHTML}`;

                const tdScore = document.createElement('td');
                tdScore.textContent = (user.games && user.games.shooter) || 0;

                tr.appendChild(tdPos);
                tr.appendChild(tdUser);
                tr.appendChild(tdScore);
                tbody.appendChild(tr);
            });
            table.appendChild(tbody);
            return table;
        }

        async function showRankingModal() {
            modalContainer.style.display = 'flex';
            clearModalButtons();
            modalTitle.innerText = "Ranking de Jugadores..";
            modalMessage.innerText = "Cargando datos...";

            try {
                const users = await fetchRankingData();
                modalMessage.innerText = '';

                if (users.length === 0) {
                    modalMessage.innerText = "No hay datos disponibles.";
                    return;
                }

                const rankingTable = buildRankingTable(users);
                modalMessage.appendChild(rankingTable);

                modalButtonsContainer.style.display = "flex";
                modalButtonsContainer.appendChild(createButton("Cerrar", null, () => {
                    showModal("welcome"); // <-- Cambia aquí
                }));

            } catch (e) {
                modalMessage.innerText = "Error cargando el ranking.";
                console.error("Error mostrando ranking:", e);
            }
        }


        // Actualización de puntuación remota
        async function updateUserScoreIfNeeded(newScore) {
            if (!isUserRegistered || !userUID) return null;
            try {
                const encodedUID = encodeURIComponent(userUID);
                console.log(`UID sin codificar: ${userUID}`);
                console.log(`UID codificado: ${encodedUID}, score: ${newScore}`);
                const response = await fetch(`https://us-central1-number-ac729.cloudfunctions.net/updateScoreV1?uid=${encodedUID}&score=${newScore}`);
                if (!response.ok) throw new Error("Error al actualizar score");
                const data = await response.json();
                return data;
            } catch (e) {
                console.error("Error actualizando score:", e);
                return null;
            }
        }

        // Al perder
        async function onGameOver() {
            if (isUserRegistered) {
                const data = await updateUserScoreIfNeeded(score);
                if (data && data.message === "true") {
                    userScore = score;
                    highestEl.innerText = userScore;
                    showModal("gameover", "<br><strong>¡Felicitaciones! Superaste tu puntuación anterior.</strong>");
                    return;
                }
            }
            showModal("gameover");
        }

        // Verificación usuario mediante Firebase Auth y llamada a API
        async function checkEmailRegistered(email) {
            try {
                const response = await fetch(`https://us-central1-number-ac729.cloudfunctions.net/checkEmailV1?email=${encodeURIComponent(email)}`);
                if (!response.ok) throw new Error("Error API");
                return await response.json();
            } catch (e) {
                console.error("Error en checkEmailRegistered:", e);
                return null;
            }
        }

        firebase.auth().onAuthStateChanged(async user => {
            showModal("verifying");
            if (user) {
                try {
                    const data = await checkEmailRegistered(user.email);
                    if (data && data.IsEmailRegistered) {
                        isUserRegistered = true;
                        userUID = data.UID || null;
                        userName = data.User || user.email || "Usuario";
                        userScore = data.Score || 0;
                        highest = Math.max(userScore, highest);
                        highestEl.innerText = highest;
                        showModal("welcome");
                        console.log("Usuario registrado:", userName, "UID:", userUID, "Score:", userScore);
                    } else {
                        isUserRegistered = false;
                        userUID = null;
                        userName = "Invitado";
                        userScore = 0;
                        Swal.fire({
                            icon: "warning",
                            title: "Usuario no registrado",
                            text: "Tu cuenta no está registrada para progreso global. Puedes jugar sin registro o registrarte.",
                            confirmButtonText: "Aceptar"
                        }).then(() => {
                            showModal("verifyResult");
                        });
                    }
                } catch (e) {
                    console.error("Error en verificación usuario:", e);
                    showModal("verifyResult");
                }
            } else {
                isUserRegistered = false;
                userUID = null;
                userName = "Invitado";
                userScore = 0;
                showModal("verifyResult");
                console.log("No hay usuario autenticado.");
            }
        });

        // Pausa automática al salir de pestaña o cambiar tamaño ventana
        document.addEventListener("visibilitychange", () => {
            if (document.hidden && gameState === "playing") {
                stopGame();
                showModal("paused");
                gameState = "paused";
            }
        });
        window.addEventListener("resize", () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            if (gameState === "playing") {
                stopGame();
                showModal("paused");
                gameState = "paused";
            }
        });
