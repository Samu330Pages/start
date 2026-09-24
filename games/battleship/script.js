/************************************************************************
 * MULTIPLAYER
 ************************************************************************/
let peer = null;
let conn = null;
let isHost = false;
let onlineReady = false;
let enemyReady = false;

function showMultiplayerMenu() {
    changeScreen('screen-multiplayer');
    resetMultiplayerUI();
}

function resetMultiplayerUI() {
    if (peer) {
        peer.destroy();
        peer = null;
    }
    conn = null;
    isHost = false;
    onlineReady = false;
    enemyReady = false;
    
    document.getElementById('mp-lobby-controls').style.display = 'block';
    document.getElementById('mp-waiting-box').style.display = 'none';
    document.getElementById('mp-back-btn').style.display = 'block';
    document.getElementById('room-code-input').value = '';
}

function showCustomModal(text, showCodeBox = false, code = '') {
    document.getElementById('mp-lobby-controls').style.display = 'none';
    document.getElementById('mp-back-btn').style.display = 'none';
    
    const waitingBox = document.getElementById('mp-waiting-box');
    const waitingText = document.getElementById('mp-waiting-text');
    const codeContainer = document.getElementById('code-share-container');
    
    waitingBox.style.display = 'block';
    waitingText.innerText = text;

    if (showCodeBox) {
        codeContainer.style.display = 'block';
        document.getElementById('display-room-code').value = code;
    } else {
        codeContainer.style.display = 'none';
    }
}

function copyRoomCode() {
    const codeInput = document.getElementById('display-room-code');
    codeInput.select();
    navigator.clipboard.writeText(codeInput.value);
    showTacticalNotification("¡Código copiado al portapapeles!");
}

function cancelMultiplayerConnection() {
    resetMultiplayerUI();
    changeScreen('screen-menu');
}

function hostNewGame() {
    peer = new Peer();

    peer.on('open', (id) => {
        isHost = true;
        gameMode = 'multiplayer';
        showCustomModal("Sala creada con éxito. Esperando a que tu amigo se conecte...", true, id);
    });

    peer.on('connection', (connection) => {
        conn = connection;
        initMultiplayerListeners();
        showTacticalNotification("¡Conexión establecida con el oponente!");
        setTimeout(() => {
            startSetup('multiplayer');
        }, 1200);
    });

    peer.on('error', (err) => {
        showCustomModal("Error en la red P2P: " + err.type);
        setTimeout(resetMultiplayerUI, 2000);
    });
}

function joinExistingGame() {
    const codeInput = document.getElementById('room-code-input').value.trim();
    if (!codeInput) {
        showTacticalNotification("Por favor, ingresa un código de sala válido.");
        return;
    }

    peer = new Peer();
    showCustomModal("Estableciendo enlace táctico con la sala...");

    peer.on('open', (id) => {
        isHost = false;
        gameMode = 'multiplayer';
        
        conn = peer.connect(codeInput);

        conn.on('open', () => {
            showTacticalNotification("¡Conectado al anfitrión con éxito!");
            initMultiplayerListeners();
            setTimeout(() => {
                startSetup('multiplayer');
            }, 1200);
        });

        conn.on('error', (err) => {
            showCustomModal("No se pudo conectar. Verifica el código.");
            setTimeout(resetMultiplayerUI, 2500);
        });
    });
}

function initMultiplayerListeners() {
    conn.on('data', (data) => {
        if (data.type === 'ENEMY_READY') {
            enemyReady = true;
            if (onlineReady) {
                launchOnlineBattle();
            } else {
                setBattleMessage("Tu flota está lista. Esperando que el enemigo termine de desplegarse...");
            }
        } else if (data.type === 'FIRE') {
            handleOnlineEnemyFire(data.index);
        } else if (data.type === 'RESULT') {
            handleOnlineFireResult(data.index, data.result, data.sunk, data.shipName, data.shipData, data.gameOver);
        }
    });

    conn.on('close', () => {
        alert("El oponente se ha desconectado de la partida.");
        restartToMainMenu();
    });
}

function showTacticalNotification(text) {
    let notif = document.getElementById('tactical-toast');
    if (!notif) {
        notif = document.createElement('div');
        notif.id = 'tactical-toast';
        notif.style.cssText = `
            position: fixed; bottom: 20px; left: 50%; transform: translateX(-50%);
            background: rgba(12, 21, 36, 0.95); border: 1px solid var(--accent-green);
            color: var(--accent-green); padding: 10px 20px; border-radius: 6px;
            font-family: var(--font-tactical); font-size: 0.95rem; z-index: 10000;
            box-shadow: 0 0 15px rgba(57, 255, 20, 0.3); text-align: center;
        `;
        document.body.appendChild(notif);
    }
    notif.innerText = text;
    notif.style.display = 'block';
    setTimeout(() => {
        notif.style.display = 'none';
    }, 3000);
}

/************************************************************************
*CONFIGURACIÓN DEL JUEGO
************************************************************************/
const BOARD_SIZE = 10;

const SHIPS_TEMPLATE = [
    { name: 'Portaaviones', size: 5, key: 'carrier' },
    { name: 'Acorazado', size: 4, key: 'battleship' },
    { name: 'Crucero', size: 3, key: 'cruiser' },
    { name: 'Submarino', size: 3, key: 'submarine' },
    { name: 'Destructor', size: 2, key: 'destroyer' }
];

let gameMode = 'bot';
let currentTurn = 'player';
let selectedShipIndex = 0;
let isHorizontal = true;
let battleActive = false;
let roundCount = 0;
let playerShotsFired = 0;
let playerShotsHit = 0;

let playerBoard = Array(BOARD_SIZE * BOARD_SIZE).fill(0);
let enemyBoard = Array(BOARD_SIZE * BOARD_SIZE).fill(0);

let playerShipsDeployed = [];
let enemyShipsDeployed = [];

let botMemory = {
    state: 'SEARCH',      // 'SEARCH', 'TARGET', 'LINE'
    huntStack: [],
    originIndex: null,
    lineDirection: null,
    currentLineIndex: null
};

let botFiredShots = new Set();

/************************************************************************
 *INTERFAZ Y PANTALLAS
 ************************************************************************/
window.addEventListener('keydown', (e) => {
    if (e.key === 'r' || e.key === 'R') {
        rotateShip();
    }
});

function changeScreen(screenId) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(screenId).classList.add('active');
}

function restartToMainMenu() {
    resetGameState();
    changeScreen('screen-menu');
}

function resetGameState() {
    playerBoard.fill(0);
    enemyBoard.fill(0);
    playerShipsDeployed = [];
    enemyShipsDeployed = [];
    selectedShipIndex = 0;
    isHorizontal = true;
    battleActive = false;
    roundCount = 0;
    playerShotsFired = 0;
    playerShotsHit = 0;
    currentTurn = 'player';
    botFiredShots.clear();
    botMemory = { state: 'SEARCH', huntStack: [], originIndex: null, lineDirection: null, currentLineIndex: null };

    document.getElementById('start-battle-btn').disabled = true;
}

/************************************************************************
 * PREPARACIÓN
 ************************************************************************/
function startSetup(mode) {
    gameMode = mode;
    resetGameState();
    changeScreen('screen-setup');

    const container = document.getElementById('player-setup-board-wrapper');
    container.innerHTML = `
                <div class="board-title my-fleet">
                    <i class="fa-solid fa-map"></i> Ubicación de Flota
                </div>
            `;

    const grid = document.createElement('div');
    grid.className = 'grid-container';
    grid.id = 'grid-setup';
    container.appendChild(grid);

    renderEmptyGridWithCoordinates(grid, 'setup');
    renderShipSelector();
    updateSetupInstruction();
}

function renderEmptyGridWithCoordinates(gridElement, context) {
    gridElement.innerHTML = '';

    const corner = document.createElement('div');
    corner.className = 'grid-label water-label-cell';
    gridElement.appendChild(corner);

    for (let c = 0; c < BOARD_SIZE; c++) {
        const label = document.createElement('div');
        label.className = 'grid-label';
        label.innerText = String.fromCharCode(65 + c);
        gridElement.appendChild(label);
    }

    for (let r = 0; r < BOARD_SIZE; r++) {
        const label = document.createElement('div');
        label.className = 'grid-label';
        label.innerText = r + 1;
        gridElement.appendChild(label);

        for (let c = 0; c < BOARD_SIZE; c++) {
            const idx = r * BOARD_SIZE + c;
            const cell = document.createElement('div');
            cell.className = 'cell';
            cell.dataset.index = idx;

            if (context === 'setup') {
                cell.addEventListener('mouseenter', () => handleSetupHover(idx, true));
                cell.addEventListener('mouseleave', () => handleSetupHover(idx, false));
                cell.addEventListener('click', () => handleSetupPlace(idx));
            }

            gridElement.appendChild(cell);
        }
    }
}

function renderShipSelector() {
    const container = document.getElementById('ship-selector-container');
    container.innerHTML = '';

    SHIPS_TEMPLATE.forEach((ship, index) => {
        const isPlaced = playerShipsDeployed.some(s => s.name === ship.name);

        const div = document.createElement('div');
        div.className = `ship-item ${index === selectedShipIndex ? 'active' : ''} ${isPlaced ? 'placed' : ''}`;

        div.onclick = () => selectShip(index);

        let blocksHTML = '';
        for (let b = 0; b < ship.size; b++) {
            blocksHTML += `<div class="ship-block-dot"></div>`;
        }

        div.innerHTML = `
                    <div class="ship-info">
                        <span class="ship-name">${ship.name}</span>
                        <span class="ship-size">${ship.size} celdas ${isPlaced ? '(Puesto)' : ''}</span>
                    </div>
                    <div class="ship-blocks">
                        ${blocksHTML}
                    </div>
                `;
        container.appendChild(div);
    });
}

function selectShip(index) {
    selectedShipIndex = index;

    const shipTemplate = SHIPS_TEMPLATE[index];
    const deployedIndex = playerShipsDeployed.findIndex(s => s.name === shipTemplate.name);

    if (deployedIndex !== -1) {
        const oldCoords = playerShipsDeployed[deployedIndex].coords;
        oldCoords.forEach(coord => {
            playerBoard[coord] = 0;
        });
        playerShipsDeployed.splice(deployedIndex, 1);
        refreshSetupGridVisuals();
        document.getElementById('start-battle-btn').disabled = true;
    }

    document.querySelectorAll('.ship-item').forEach((item, idx) => {
        item.classList.toggle('active', idx === index);
    });
    renderShipSelector();
    updateSetupInstruction();
}

function rotateShip() {
    isHorizontal = !isHorizontal;
    updateSetupInstruction();
}

function updateSetupInstruction() {
    const helpText = document.getElementById('setup-help-text');
    if (selectedShipIndex >= SHIPS_TEMPLATE.length) {
        helpText.innerHTML = `<span style="color: var(--accent-green);">¡Despliegue de flota completo! Presione "Iniciar Invasión"</span>`;
        return;
    }
    const ship = SHIPS_TEMPLATE[selectedShipIndex];
    const orientation = isHorizontal ? 'Horizontal' : 'Vertical';
    helpText.innerHTML = `Colocando: <strong class="text-neon">${ship.name}</strong> (${ship.size} celdas) | Orientación: <strong>${orientation}</strong>. <br>Pulsa 'R' o haz clic para re-ubicar barcos del tablero.`;
}

function getShipCoordinates(startIdx, size, horizontal) {
    const coords = [];
    const r = Math.floor(startIdx / BOARD_SIZE);
    const c = startIdx % BOARD_SIZE;

    if (horizontal) {
        if (c + size > BOARD_SIZE) return null;
        for (let i = 0; i < size; i++) coords.push(r * BOARD_SIZE + (c + i));
    } else {
        if (r + size > BOARD_SIZE) return null;
        for (let i = 0; i < size; i++) coords.push((r + i) * BOARD_SIZE + c);
    }
    return coords;
}

function handleSetupHover(idx, isEnter) {
    if (selectedShipIndex >= SHIPS_TEMPLATE.length) return;
    const size = SHIPS_TEMPLATE[selectedShipIndex].size;
    const coords = getShipCoordinates(idx, size, isHorizontal);

    const isValid = coords !== null && coords.every(coord => playerBoard[coord] === 0);

    if (isEnter && coords) {
        coords.forEach(coord => {
            const cell = document.querySelector(`#grid-setup .cell[data-index="${coord}"]`);
            if (cell) cell.classList.add(isValid ? 'valid-place' : 'invalid-place');
        });
    } else if (!isEnter) {
        document.querySelectorAll('#grid-setup .cell').forEach(cell => {
            cell.classList.remove('valid-place', 'invalid-place');
        });
    }
}

function handleSetupPlace(idx) {
    if (playerBoard[idx] !== 0 && selectedShipIndex >= SHIPS_TEMPLATE.length) {
        const clickedCellState = playerShipsDeployed.find(s => s.coords.includes(idx));
        if (clickedCellState) {
            const foundIdx = SHIPS_TEMPLATE.findIndex(s => s.name === clickedCellState.name);
            selectShip(foundIdx);
            return;
        }
    }

    if (selectedShipIndex >= SHIPS_TEMPLATE.length) return;
    const shipTemplate = SHIPS_TEMPLATE[selectedShipIndex];
    const coords = getShipCoordinates(idx, shipTemplate.size, isHorizontal);

    if (!coords) return;
    const overlapping = coords.some(coord => playerBoard[coord] !== 0);
    if (overlapping) return;

    coords.forEach(coord => {
        playerBoard[coord] = 1;
    });

    playerShipsDeployed.push({
        name: shipTemplate.name,
        key: shipTemplate.key,
        coords: coords,
        isHorizontal: isHorizontal,
        size: shipTemplate.size,
        hits: 0,
        sunk: false
    });

    refreshSetupGridVisuals();
    moveToNextUnplacedShip();
    renderShipSelector();
}

function refreshSetupGridVisuals() {
    document.querySelectorAll('#grid-setup .cell').forEach(cell => {
        const index = parseInt(cell.dataset.index);
        if (isNaN(index)) return;
        
        cell.className = 'cell';
        cell.style.removeProperty('--ship-size');
        cell.style.removeProperty('--ship-part');

        if (playerBoard[index] === 1) {
            const ship = playerShipsDeployed.find(s => s.coords.includes(index));
            if (ship) {
                const partIndex = ship.coords.indexOf(index);
                cell.classList.add('ship-part', 'ship-fragment', `ship-${ship.key}`);
                cell.classList.add(ship.isHorizontal ? 'ship-horizontal' : 'ship-vertical');
                cell.style.setProperty('--ship-size', ship.size);
                cell.style.setProperty('--ship-part', partIndex);
            } else {
                cell.classList.add('ship-part');
            }
        }
    });
}

function moveToNextUnplacedShip() {
    let nextIdx = -1;
    for (let i = 0; i < SHIPS_TEMPLATE.length; i++) {
        const placed = playerShipsDeployed.some(s => s.name === SHIPS_TEMPLATE[i].name);
        if (!placed) {
            nextIdx = i;
            break;
        }
    }

    if (nextIdx !== -1) {
        selectedShipIndex = nextIdx;
    } else {
        selectedShipIndex = SHIPS_TEMPLATE.length;
        document.getElementById('start-battle-btn').disabled = false;
    }
    updateSetupInstruction();
}

function autoPlaceShips() {
    playerBoard.fill(0);
    playerShipsDeployed = [];

    SHIPS_TEMPLATE.forEach(ship => {
        let placed = false;
        while (!placed) {
            const randIdx = Math.floor(Math.random() * 100);
            const randHorizontal = Math.random() < 0.5;
            const coords = getShipCoordinates(randIdx, ship.size, randHorizontal);

            if (coords && coords.every(c => playerBoard[c] === 0)) {
                coords.forEach(c => playerBoard[c] = 1);
                playerShipsDeployed.push({
                    name: ship.name,
                    key: ship.key,
                    coords: coords,
                    isHorizontal: randHorizontal,
                    size: ship.size,
                    hits: 0,
                    sunk: false
                });
                placed = true;
            }
        }
    });

    refreshSetupGridVisuals();
    selectedShipIndex = SHIPS_TEMPLATE.length;
    renderShipSelector();
    updateSetupInstruction();
    document.getElementById('start-battle-btn').disabled = false;
}

/************************************************************************
 * LÓGICA DE LA BOT
 ************************************************************************/
function autoPlaceEnemyShips() {
    enemyBoard.fill(0);
    enemyShipsDeployed = [];

    SHIPS_TEMPLATE.forEach(ship => {
        let placed = false;
        while (!placed) {
            const randIdx = Math.floor(Math.random() * 100);
            const randHorizontal = Math.random() < 0.5;
            const coords = getShipCoordinates(randIdx, ship.size, randHorizontal);

            if (coords && coords.every(c => enemyBoard[c] === 0)) {
                coords.forEach(c => enemyBoard[c] = 1);
                enemyShipsDeployed.push({
                    name: ship.name,
                    key: ship.key,
                    coords: coords,
                    isHorizontal: randHorizontal,
                    size: ship.size,
                    hits: 0,
                    sunk: false
                });
                placed = true;
            }
        }
    });
}

/************************************************************************
 * INICIO DE BATALLA Y SISTEMA DE TURNOS
 ************************************************************************/
function launchBattle() {
    battleActive = true;

    if (gameMode === 'multiplayer') {
        onlineReady = true;
        conn.send({ type: 'ENEMY_READY' });

        changeScreen('screen-battle');
        setupBattleBoards();

        if (enemyReady) {
            launchOnlineBattle();
        } else {
            setBattleMessage("FLOTA DESPLEGADA. ESPERANDO QUE EL RIVAL TERMINE SU POSICIONAMIENTO...");
        }
        return;
    }

    // Modo Bot
    autoPlaceEnemyShips();
    changeScreen('screen-battle');
    setupBattleBoards();

    currentTurn = 'player';
    updateTurnVisualizer();
    setBattleMessage("SISTEMAS OPERATIVOS. PANTALLA COMBINADA ACTIVA. DEFIENDA Y ATAQUE.");
}

function setupBattleBoards() {
    const radarGrid = document.getElementById('grid-radar');
    const fleetGrid = document.getElementById('grid-fleet');

    renderEmptyGridWithCoordinates(radarGrid, 'radar');
    renderEmptyGridWithCoordinates(fleetGrid, 'fleet');

    playerShipsDeployed.forEach(ship => {
        ship.coords.forEach((coord, partIndex) => {
            const cell = document.querySelector(`#grid-fleet .cell[data-index="${coord}"]`);
            if (cell) {
                cell.classList.add('ship-part', 'ship-fragment', `ship-${ship.key}`);
                cell.classList.add(ship.isHorizontal ? 'ship-horizontal' : 'ship-vertical');
                cell.style.setProperty('--ship-size', ship.size);
                cell.style.setProperty('--ship-part', partIndex);
            }
        });
    });

    document.querySelectorAll('#grid-radar .cell').forEach(cell => {
        const idx = parseInt(cell.dataset.index);
        if (!isNaN(idx)) {
            cell.addEventListener('click', () => playerFireAt(idx));
        }
    });
}

function launchOnlineBattle() {
    currentTurn = isHost ? 'player' : 'enemy';
    updateTurnVisualizer();
    setBattleMessage(isHost ? "¡INICIA EL COMBATE! TU TURNO DE ATACAR." : "¡COMBATE INICIADO! ESPERANDO ATAQUE ENEMIGO...");
}

function updateTurnVisualizer() {
    const indicator = document.getElementById('turn-indicator-box');
    if (gameMode === 'multiplayer') {
        if (currentTurn === 'player') {
            indicator.className = 'turn-indicator turn-player';
            indicator.innerText = 'TURNO: TU ATAQUE';
        } else {
            indicator.className = 'turn-indicator turn-enemy';
            indicator.innerText = 'TURNO: ESPERANDO AL RIVAL';
        }
        return;
    }
    // Modo Bot
    if (currentTurn === 'player') {
        indicator.className = 'turn-indicator turn-player';
        indicator.innerText = 'TURNO: MI ALMIRANTE';
    } else {
        indicator.className = 'turn-indicator turn-enemy';
        indicator.innerText = 'TURNO: BOT ENEMIGO';
    }
}

function setBattleMessage(text, isError = false) {
    const msg = document.getElementById('battle-status-msg');
    msg.innerText = text;
    msg.style.color = isError ? 'var(--accent-red)' : 'var(--accent-green)';
    msg.style.textShadow = isError ? '0 0 10px rgba(255, 60, 60, 0.4)' : '0 0 10px rgba(57, 255, 20, 0.4)';
}

/************************************************************************
 * FASE DE COMBATE
 ************************************************************************/
function playerFireAt(idx) {
    if (!battleActive || currentTurn !== 'player') return;

    if (gameMode === 'multiplayer') {
        const cellElement = document.querySelector(`#grid-radar .cell[data-index="${idx}"]`);
        if (cellElement.classList.contains('hit') || cellElement.classList.contains('miss')) {
            setBattleMessage("COORDENADAS YA SELECCIONADAS.", true);
            return;
        }
        playerShotsFired++;
        conn.send({ type: 'FIRE', index: idx });
        return;
    }

    // --- Lógica del Bot ---
    const cellState = enemyBoard[idx];
    if (cellState === 2 || cellState === 3) {
        setBattleMessage("COORDENADAS YA SELECCIONADAS. SELECCIONE UN BLANCO DIFERENTE.", true);
        return;
    }

    playerShotsFired++;
    const cellElement = document.querySelector(`#grid-radar .cell[data-index="${idx}"]`);

    if (cellState === 1) {
        enemyBoard[idx] = 3;
        playerShotsHit++;
        cellElement.className = 'cell hit';

        const targetShip = enemyShipsDeployed.find(s => s.coords.includes(idx));
        targetShip.hits++;

        if (targetShip.hits === targetShip.coords.length) {
            targetShip.sunk = true;
            setBattleMessage(`¡IMPACTO DIRECTO! ¡EL ${targetShip.name.toUpperCase()} ENEMIGO HA SIDO HUNDIDO!`);
            markSunkShipOnGrid(targetShip, '#grid-radar');

            if (enemyShipsDeployed.every(s => s.sunk)) {
                endGame(true);
                return;
            }
        } else {
            setBattleMessage(`¡BLANCO CONFIRMADO! REPETIRÁS TURNO POR ACERTAR.`);
        }
        updateTurnVisualizer();
    } else {
        enemyBoard[idx] = 2;
        cellElement.className = 'cell miss';
        setBattleMessage(`AGUA EN LA COORDENADA ${getCoordinateLabel(idx)}.`);

        currentTurn = 'enemy';
        updateTurnVisualizer();
        setTimeout(botAITurn, 1000);
    }
}

function handleOnlineEnemyFire(idx) {
    const cellElement = document.querySelector(`#grid-fleet .cell[data-index="${idx}"]`);
    const cellState = playerBoard[idx];
    let result = 'miss';
    let sunk = false;
    let shipName = '';
    let shipCoords = [];
    let shipData = null;

    if (cellState === 1) {
        playerBoard[idx] = 3;
        cellElement.className = 'cell hit';
        const ship = playerShipsDeployed.find(s => s.coords.includes(idx));
        ship.hits++;
        result = 'hit';

        if (ship.hits === ship.coords.length) {
            ship.sunk = true;
            sunk = true;
            shipName = ship.name;
            shipCoords = ship.coords;
            shipData = { name: ship.name, key: ship.key, isHorizontal: ship.isHorizontal, size: ship.size, coords: ship.coords };
            
            markSunkShipOnGrid(ship, '#grid-fleet');
            setBattleMessage(`¡ALERTA ROJA! EL ENEMIGO HUNDIÓ NUESTRO ${ship.name.toUpperCase()}!`, true);

            if (playerShipsDeployed.every(s => s.sunk)) {
                conn.send({ type: 'RESULT', index: idx, result: 'hit', sunk: true, shipName: shipName, shipData: shipData, gameOver: true });
                endGame(false);
                return;
            }
        } else {
            setBattleMessage(`¡IMPACTO HOSTIL EN NUESTRA FLOTA (${getCoordinateLabel(idx)})! EL RIVAL REPITE TURNO.`, true);
        }
    } else {
        playerBoard[idx] = 2;
        cellElement.className = 'cell miss';
        setBattleMessage(`EL DISPARO ENEMIGO CAYÓ EN EL AGUA (${getCoordinateLabel(idx)}). TURNO NUESTRO.`);
    }

    const nextTurnForEnemy = (result === 'hit');
    
    conn.send({ 
        type: 'RESULT', 
        index: idx, 
        result: result, 
        sunk: sunk, 
        shipName: shipName, 
        shipData: shipData,
        gameOver: false 
    });

    if (!nextTurnForEnemy) {
        currentTurn = 'player';
        setBattleMessage("¡TURNO DE REPRESALIA! SELECCIONA UN BLANCO EN EL RADAR.");
    } else {
        currentTurn = 'enemy';
        setBattleMessage("EL RIVAL ACERTÓ Y VUELVE A DISPARAR...");
    }
    updateTurnVisualizer();
}

function handleOnlineFireResult(idx, result, sunk, shipName, shipData, gameOver) {
    const cellElement = document.querySelector(`#grid-radar .cell[data-index="${idx}"]`);
    playerShotsFired++;

    if (result === 'hit') {
        playerShotsHit++;
        cellElement.className = 'cell hit';

        if (gameOver) {
            endGame(true);
            return;
        }

        if (sunk && shipData) {
            setBattleMessage(`¡OBJETIVO ELIMINADO! ¡HUNDISTE EL ${shipName.toUpperCase()} RIVAL! SIGUES TIRANDO.`);
            
            shipData.coords.forEach((coord, partIndex) => {
                const targetCell = document.querySelector(`#grid-radar .cell[data-index="${coord}"]`);
                if (targetCell) {
                    targetCell.className = 'cell sunk ship-fragment';
                    targetCell.classList.add(`ship-${shipData.key}`);
                    targetCell.classList.add(shipData.isHorizontal ? 'ship-horizontal' : 'ship-vertical');
                    targetCell.style.setProperty('--ship-size', shipData.size);
                    targetCell.style.setProperty('--ship-part', partIndex);
                }
            });
        } else {
            setBattleMessage(`¡IMPACTO CONFIRMADO EN ${getCoordinateLabel(idx)}! Acertaste, vuelve a disparar.`);
        }

        currentTurn = 'player';
        updateTurnVisualizer();

    } else {
        // Falló
        cellElement.className = 'cell miss';
        setBattleMessage(`AGUA EN ${getCoordinateLabel(idx)}. TURNO DEL OPONENTE.`);

        currentTurn = 'enemy';
        updateTurnVisualizer();
    }
}

function markSunkShipOnGrid(ship, gridId) {
    ship.coords.forEach((coord, partIndex) => {
        const cell = document.querySelector(`${gridId} .cell[data-index="${coord}"]`);
        if (cell) {
            if (ship.key) {
                cell.className = 'cell sunk ship-fragment';
                cell.classList.add(`ship-${ship.key}`);
                cell.classList.add(ship.isHorizontal ? 'ship-horizontal' : 'ship-vertical');
                cell.style.setProperty('--ship-size', ship.size);
                cell.style.setProperty('--ship-part', partIndex);
            } else {
                cell.className = 'cell sunk';
            }
        }
    });
}

function getCoordinateLabel(idx) {
    const r = Math.floor(idx / BOARD_SIZE);
    const c = idx % BOARD_SIZE;
    return `${String.fromCharCode(65 + c)}${r + 1}`;
}

/************************************************************************
 * BOT XD
 ************************************************************************/
function botAITurn() {
    if (!battleActive) return;

    let targetIdx = null;

    if (botMemory.state === 'SEARCH') {
        targetIdx = getRandomChessboardShot();
    } else if (botMemory.state === 'TARGET') {
        targetIdx = botMemory.huntStack.pop();
        if (targetIdx === undefined || botFiredShots.has(targetIdx)) {
            botMemory.state = 'SEARCH';
            botAITurn();
            return;
        }
    } else if (botMemory.state === 'LINE') {
        targetIdx = botMemory.currentLineIndex;
        if (targetIdx === null || botFiredShots.has(targetIdx) || isOutOfBounds(targetIdx)) {
            reverseBotDirection();
            targetIdx = botMemory.currentLineIndex;
        }
    }

    if (targetIdx === null || botFiredShots.has(targetIdx) || isOutOfBounds(targetIdx)) {
        targetIdx = getAbsoluteRandomShot();
    }

    botFiredShots.add(targetIdx);

    const cellElement = document.querySelector(`#grid-fleet .cell[data-index="${targetIdx}"]`);
    const cellState = playerBoard[targetIdx];

    if (cellState === 1) { // IMPACTO CONSEGUIDO
        playerBoard[targetIdx] = 3;
        cellElement.className = 'cell hit';

        const ship = playerShipsDeployed.find(s => s.coords.includes(targetIdx));
        ship.hits++;

        if (ship.hits === ship.coords.length) { // BARCO HUNDIDO COMPLETO
            ship.sunk = true;
            setBattleMessage(`ALERTA ROJA: ¡EL ENEMIGO HA HUNDIDO NUESTRO ${ship.name.toUpperCase()}!`, true);
            markSunkShipOnGrid(ship, '#grid-fleet');

            botMemory.state = 'SEARCH';
            botMemory.huntStack = [];
            botMemory.lineDirection = null;

            if (playerShipsDeployed.every(s => s.sunk)) {
                endGame(false);
                return;
            }
        } else {
            setBattleMessage(`ALERTA: IMPACTO DIRECTO HOSTIL EN ${getCoordinateLabel(targetIdx)}.`, true);

            if (botMemory.state === 'SEARCH') {
                botMemory.state = 'TARGET';
                botMemory.originIndex = targetIdx;
                generateCrossTargets(targetIdx);
            } else if (botMemory.state === 'TARGET') {
                botMemory.state = 'LINE';
                botMemory.lineDirection = getDirectionVector(botMemory.originIndex, targetIdx);
                botMemory.currentLineIndex = targetIdx + botMemory.lineDirection;
            } else if (botMemory.state === 'LINE') {
                botMemory.currentLineIndex += botMemory.lineDirection;
            }
        }
        setTimeout(botAITurn, 1000);
    } else { // AGUA
        playerBoard[targetIdx] = 2;
        cellElement.className = 'cell miss';
        setBattleMessage(`INFORME: DISPARO ENEMIGO CAYÓ EN EL MAR (${getCoordinateLabel(targetIdx)}).`);

        if (botMemory.state === 'LINE') {
            reverseBotDirection();
        }

        currentTurn = 'player';
        roundCount++;
        updateTurnVisualizer();
    }
}

function getRandomChessboardShot() {
    let preferred = [];
    for (let i = 0; i < 100; i++) {
        if (!botFiredShots.has(i)) {
            let r = Math.floor(i / BOARD_SIZE);
            let c = i % BOARD_SIZE;
            if ((r + c) % 2 === 0) preferred.push(i);
        }
    }
    if (preferred.length > 0) {
        return preferred[Math.floor(Math.random() * preferred.length)];
    }
    return getAbsoluteRandomShot();
}

function getAbsoluteRandomShot() {
    let valids = [];
    for (let i = 0; i < 100; i++) {
        if (!botFiredShots.has(i)) valids.push(i);
    }
    return valids[Math.floor(Math.random() * valids.length)];
}

function generateCrossTargets(idx) {
    botMemory.huntStack = [];
    const r = Math.floor(idx / BOARD_SIZE);
    const c = idx % BOARD_SIZE;

    const directions = [
        { r: -1, c: 0 }, { r: 1, c: 0 },
        { r: 0, c: -1 }, { r: 0, c: 1 }
    ];

    directions.sort(() => Math.random() - 0.5);

    directions.forEach(d => {
        const nr = r + d.r;
        const nc = c + d.c;
        if (nr >= 0 && nr < BOARD_SIZE && nc >= 0 && nc < BOARD_SIZE) {
            const target = nr * BOARD_SIZE + nc;
            if (!botFiredShots.has(target)) {
                botMemory.huntStack.push(target);
            }
        }
    });
}

function getDirectionVector(origin, current) {
    const rO = Math.floor(origin / BOARD_SIZE);
    const cO = origin % BOARD_SIZE;
    const rC = Math.floor(current / BOARD_SIZE);
    const cC = current % BOARD_SIZE;

    if (rO === rC) return (cC > cO) ? 1 : -1;
    return (rC > rO) ? 10 : -10;
}

function reverseBotDirection() {
    if (botMemory.lineDirection !== null) {
        botMemory.lineDirection = -botMemory.lineDirection;
        botMemory.currentLineIndex = botMemory.originIndex + botMemory.lineDirection;

        if (botFiredShots.has(botMemory.currentLineIndex) || isOutOfBounds(botMemory.currentLineIndex)) {
            botMemory.state = 'TARGET';
        }
    }
}

function isOutOfBounds(idx) {
    return idx < 0 || idx >= 100;
}

/************************************************************************
 * GANADOR / FIN DE JUEGO
 ************************************************************************/
function endGame(isPlayerWin) {
    battleActive = false;

    const box = document.getElementById('gameover-box');
    const title = document.getElementById('gameover-title');

    if (isPlayerWin) {
        box.className = 'gameover-container win';
        title.className = 'victory-title';
        title.innerHTML = '<i class="fa-solid fa-trophy"></i> ¡VICTORIA ABSOLUTA!';
    } else {
        box.className = 'gameover-container';
        title.className = 'defeat-title';
        title.innerHTML = '<i class="fa-solid fa-skull-crossbones"></i> COMPAÑÍA DERROTADA';
    }

    const accuracy = playerShotsFired > 0 ? Math.round((playerShotsHit / playerShotsFired) * 100) : 0;

    let modeText = 'SIMULADOR IA BOT';
    if (gameMode === 'multiplayer') modeText = 'MULTIJUGADOR ONLINE P2P';
    else if (gameMode === 'local') modeText = 'LOCAL JUGADOR VS JUGADOR';

    document.getElementById('stat-mode').innerText = modeText;
    document.getElementById('stat-rounds').innerText = roundCount;
    document.getElementById('stat-accuracy').innerText = `${accuracy}%`;

    setTimeout(() => {
        changeScreen('screen-gameover');
    }, 1000);
}