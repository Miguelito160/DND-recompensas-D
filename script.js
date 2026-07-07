const ORO_BASE = {
  "🐺 Lobo": 50,
  "🦅 Grifo": 100,
  "🦁 Quimera": 200,
  "🐉 Hidra": 500,
  "🐲 Dragón": 1000
};

const LEVEL_TO_RANK = [
  { min: 1, max: 4, rank: '🐺 Lobo' },
  { min: 5, max: 8, rank: '🦅 Grifo' },
  { min: 9, max: 12, rank: '🦁 Quimera' },
  { min: 13, max: 16, rank: '🐉 Hidra' },
  { min: 17, max: 20, rank: '🐲 Dragón' }
];

function getRankForLevel(level) {
  const match = LEVEL_TO_RANK.find(interval => level >= interval.min && level <= interval.max);
  return match ? match.rank : LEVEL_TO_RANK[LEVEL_TO_RANK.length - 1].rank;
}

function getLevelForRank(rank) {
  const match = LEVEL_TO_RANK.find(interval => interval.rank === rank);
  return match ? match.min : 1;
}

function syncRankFromLevel() {
  const levelValue = Number(document.getElementById('playerLevel').value);
  document.getElementById('playerRank').value = getRankForLevel(levelValue);
}

function syncLevelFromRank() {
  const rankValue = document.getElementById('playerRank').value;
  document.getElementById('playerLevel').value = getLevelForRank(rankValue);
}

const TIPOS_MISION = {
  "Misión Estándar / One Shot": { xp_mod: 1.0, oro_mod: 1.0, xp_fija: null },
  "Misión Rolística": { xp_mod: 0.0, oro_mod: 1.0, xp_fija: 50 },
  "Misión Rápida / Contrarreloj": { xp_mod: 0.8, oro_mod: 1.2, xp_fija: null },
  "Minicampaña": { xp_mod: 1.3, oro_mod: 3.0, xp_fija: null },
  "Dungeon Crawler": { xp_mod: 1.0, oro_mod: 4.0, xp_fija: null }
};

const LEVEL_XP_THRESHOLDS = {
  1: { Rolística: 25, Rápida: 50, Moderado: 75, Desafiante: 100, Extremo: 125 },
  2: { Rolística: 50, Rápida: 100, Moderado: 150, Desafiante: 200, Extremo: 250 },
  3: { Rolística: 100, Rápida: 200, Moderado: 300, Desafiante: 400, Extremo: 500 },
  4: { Rolística: 175, Rápida: 350, Moderado: 525, Desafiante: 700, Extremo: 875 },
  5: { Rolística: 275, Rápida: 550, Moderado: 825, Desafiante: 1100, Extremo: 1375 },
  6: { Rolística: 400, Rápida: 800, Moderado: 1200, Desafiante: 1600, Extremo: 2000 },
  7: { Rolística: 550, Rápida: 1100, Moderado: 1650, Desafiante: 2200, Extremo: 2750 },
  8: { Rolística: 750, Rápida: 1500, Moderado: 2250, Desafiante: 3000, Extremo: 3750 },
  9: { Rolística: 850, Rápida: 1700, Moderado: 2550, Desafiante: 3400, Extremo: 4250 },
  10: { Rolística: 1100, Rápida: 2200, Moderado: 3300, Desafiante: 4400, Extremo: 5500 },
  11: { Rolística: 1400, Rápida: 2800, Moderado: 4200, Desafiante: 5600, Extremo: 7000 },
  12: { Rolística: 1750, Rápida: 3500, Moderado: 5250, Desafiante: 7000, Extremo: 8750 },
  13: { Rolística: 2200, Rápida: 4400, Moderado: 6600, Desafiante: 8800, Extremo: 11000 },
  14: { Rolística: 2700, Rápida: 5400, Moderado: 8100, Desafiante: 10800, Extremo: 13500 },
  15: { Rolística: 3250, Rápida: 6500, Moderado: 9750, Desafiante: 13000, Extremo: 16250 },
  16: { Rolística: 3850, Rápida: 7700, Moderado: 11550, Desafiante: 15400, Extremo: 19250 },
  17: { Rolística: 4500, Rápida: 9000, Moderado: 13500, Desafiante: 18000, Extremo: 22500 },
  18: { Rolística: 5200, Rápida: 10400, Moderado: 15600, Desafiante: 20800, Extremo: 26000 },
  19: { Rolística: 5950, Rápida: 11900, Moderado: 17850, Desafiante: 23800, Extremo: 29750 },
  20: { Rolística: 6750, Rápida: 13500, Moderado: 20250, Desafiante: 27000, Extremo: 33750 }
};

const state = {
  enemies: [],
  players: [],
  enemyRegistry: []
};

const sessionType = document.getElementById('sessionType');
const enemyList = document.getElementById('enemyList');
const enemyRegistryList = document.getElementById('enemyRegistryList');
const enemyTypeSelect = document.getElementById('enemyTypeSelect');
const enemyXpInput = document.getElementById('enemyXp');
const enemySearch = document.getElementById('enemySearch');
const playerList = document.getElementById('playerList');
const cancelEditPlayer = document.getElementById('cancelEditPlayer');
const reportText = document.getElementById('reportText');

function initOptions() {
  Object.keys(TIPOS_MISION).forEach(tipo => {
    const opt = document.createElement('option');
    opt.value = tipo;
    opt.textContent = tipo;
    sessionType.appendChild(opt);
  });

  const playerLevel = document.getElementById('playerLevel');
  for (let i = 1; i <= 20; i++) {
    const opt = document.createElement('option');
    opt.value = i;
    opt.textContent = i;
    playerLevel.appendChild(opt);
  }

  const difficulties = ['Rolística', 'Rápida', 'Moderado', 'Desafiante', 'Extremo'];
  const difficultySelect = document.getElementById('playerDifficulty');
  difficulties.forEach(value => {
    const opt = document.createElement('option');
    opt.value = value;
    opt.textContent = value;
    difficultySelect.appendChild(opt);
  });

  const rankSelect = document.getElementById('playerRank');
  Object.keys(ORO_BASE).forEach(rank => {
    const opt = document.createElement('option');
    opt.value = rank;
    opt.textContent = rank;
    rankSelect.appendChild(opt);
  });
}

function updateEnemyRegistry() {
  const filter = enemySearch?.value.trim().toLowerCase() || '';
  const filteredEnemies = state.enemyRegistry.filter(enemy => enemy.nombre.toLowerCase().includes(filter));

  enemyRegistryList.innerHTML = '';
  filteredEnemies.forEach((enemy, index) => {
    const li = document.createElement('li');
    li.innerHTML = `<span>${enemy.nombre}</span><span>${enemy.xp_unidad} xp</span>`;
    li.addEventListener('click', () => removeEnemyRegistry(state.enemyRegistry.indexOf(enemy)));
    enemyRegistryList.appendChild(li);
  });
}

function updateEnemyTypeSelect() {
  const filter = enemySearch?.value.trim().toLowerCase() || '';
  enemyTypeSelect.innerHTML = '';
  const placeholder = document.createElement('option');
  placeholder.value = '';
  placeholder.textContent = 'Selecciona un enemigo...';
  placeholder.disabled = true;
  placeholder.selected = true;
  enemyTypeSelect.appendChild(placeholder);

  const filteredEnemies = state.enemyRegistry.filter(enemy => enemy.nombre.toLowerCase().includes(filter));
  filteredEnemies.forEach(enemy => {
    const opt = document.createElement('option');
    opt.value = enemy.nombre;
    opt.textContent = `${enemy.nombre} (${enemy.xp_unidad} xp)`;
    enemyTypeSelect.appendChild(opt);
  });
}

function updateEnemyList() {
  enemyList.innerHTML = '';
  state.enemies.forEach((enemy, index) => {
    const li = document.createElement('li');
    const info = document.createElement('span');
    info.textContent = `${enemy.nombre}`;

    const details = document.createElement('span');
    details.textContent = `${enemy.cantidad} × ${enemy.xp_unidad} xp = ${enemy.xp_total} xp`;

    const actions = document.createElement('div');
    actions.className = 'player-actions';

    const removeBtn = document.createElement('button');
    removeBtn.type = 'button';
    removeBtn.textContent = 'Eliminar';
    removeBtn.addEventListener('click', (event) => {
      event.stopPropagation();
      removeEnemy(index);
    });

    actions.appendChild(removeBtn);

    li.appendChild(info);
    li.appendChild(details);
    li.appendChild(actions);
    enemyList.appendChild(li);
  });
}

function updatePlayerList() {
  playerList.innerHTML = '';
  state.players.forEach((player, index) => {
    const li = document.createElement('li');
    const info = document.createElement('span');
    info.textContent = `${player.nombre_corto} (Nv ${player.nivel}, ${player.dificultad})`;
    const rank = document.createElement('span');
    rank.textContent = player.rango;

    const actions = document.createElement('div');
    actions.className = 'player-actions';

    const editBtn = document.createElement('button');
    editBtn.type = 'button';
    editBtn.textContent = 'Editar';
    editBtn.addEventListener('click', (event) => {
      event.stopPropagation();
      editPlayer(index);
    });

    const removeBtn = document.createElement('button');
    removeBtn.type = 'button';
    removeBtn.textContent = 'Eliminar';
    removeBtn.addEventListener('click', (event) => {
      event.stopPropagation();
      removePlayer(index);
    });

    actions.appendChild(editBtn);
    actions.appendChild(removeBtn);

    li.appendChild(info);
    li.appendChild(rank);
    li.appendChild(actions);
    playerList.appendChild(li);
  });
}

function removeEnemy(index) {
  state.enemies.splice(index, 1);
  updateEnemyList();
}

function removeEnemyRegistry(index) {
  state.enemyRegistry.splice(index, 1);
  updateEnemyRegistry();
  updateEnemyTypeSelect();
  enemyTypeSelect.value = '';
  enemyXpInput.value = 0;
}

function removePlayer(index) {
  state.players.splice(index, 1);
  updatePlayerList();
}

function addEnemyType() {
  const nombre = document.getElementById('registryEnemyName').value.trim();
  const xpUnidad = Number(document.getElementById('registryEnemyXp').value);

  if (!nombre) {
    alert('Agrega el nombre del enemigo a registrar.');
    return;
  }

  if (xpUnidad < 0) {
    alert('XP no puede ser negativa.');
    return;
  }

  if (state.enemyRegistry.some(enemy => enemy.nombre.toLowerCase() === nombre.toLowerCase())) {
    alert('Ese enemigo ya está registrado.');
    return;
  }

  state.enemyRegistry.push({ nombre, xp_unidad: xpUnidad });
  document.getElementById('registryEnemyName').value = '';
  document.getElementById('registryEnemyXp').value = 0;
  updateEnemyRegistry();
  updateEnemyTypeSelect();
  enemyTypeSelect.value = nombre;
  onEnemyTypeChange();
}

function onEnemyTypeChange() {
  const selectedName = enemyTypeSelect.value;
  const enemy = state.enemyRegistry.find(item => item.nombre === selectedName);
  enemyXpInput.value = enemy ? enemy.xp_unidad : 0;
}

function syncRankFromLevel() {
  const levelValue = Number(document.getElementById('playerLevel').value);
  document.getElementById('playerRank').value = getRankForLevel(levelValue);
}

function syncLevelFromRank() {
  const rankValue = document.getElementById('playerRank').value;
  document.getElementById('playerLevel').value = getLevelForRank(rankValue);
}

function addEnemy() {
  const selectedName = enemyTypeSelect.value;
  const enemyRecord = state.enemyRegistry.find(enemy => enemy.nombre === selectedName);
  const cantidad = Number(document.getElementById('enemyCount').value);

  if (!enemyRecord) {
    alert('Selecciona un enemigo registrado para añadir.');
    return;
  }

  if (cantidad < 1) {
    alert('Cantidad mínima 1.');
    return;
  }

  state.enemies.push({
    nombre: enemyRecord.nombre,
    xp_unidad: enemyRecord.xp_unidad,
    cantidad,
    xp_total: enemyRecord.xp_unidad * cantidad
  });

  document.getElementById('enemyCount').value = 1;
  updateEnemyList();
}

let editingPlayerIndex = null;

function resetPlayerForm() {
  document.getElementById('playerName').value = '';
  document.getElementById('playerLevel').value = 1;
  document.getElementById('playerDifficulty').value = 'Rolística';
  document.getElementById('playerRank').value = Object.keys(ORO_BASE)[0];
  document.getElementById('playerBoostFlag').value = 'no';
  document.getElementById('playerBoostType').value = 'Dinero';
  document.getElementById('playerBoostPercent').value = 10;
  document.getElementById('playerBoostReason').value = '';
  document.getElementById('addPlayer').textContent = 'Añadir jugador';
  cancelEditPlayer.hidden = true;
  editingPlayerIndex = null;
}

function editPlayer(index) {
  const player = state.players[index];
  if (!player) return;

  editingPlayerIndex = index;
  document.getElementById('playerName').value = player.nombre_completo;
  document.getElementById('playerLevel').value = player.nivel;
  document.getElementById('playerDifficulty').value = player.dificultad;
  document.getElementById('playerRank').value = player.rango;
  document.getElementById('playerBoostFlag').value = player.boost === 'Sí' ? 'si' : 'no';
  document.getElementById('playerBoostType').value = player.tipo_boost || 'Dinero';
  document.getElementById('playerBoostPercent').value = player.porcentaje || 10;
  document.getElementById('playerBoostReason').value = player.motivo_boost || '';
  document.getElementById('addPlayer').textContent = 'Guardar cambios';
  cancelEditPlayer.hidden = false;
}

function addPlayer() {
  const nombreCompleto = document.getElementById('playerName').value.trim();
  if (!nombreCompleto) {
    alert('Escribe el nombre del jugador.');
    return;
  }

  const nivel = Number(document.getElementById('playerLevel').value);
  const dificultad = document.getElementById('playerDifficulty').value;
  const rango = document.getElementById('playerRank').value;
  const boostFlag = document.getElementById('playerBoostFlag').value === 'si';
  const tipoBoost = document.getElementById('playerBoostType').value;
  const porcentaje = Number(document.getElementById('playerBoostPercent').value);
  const motivo = document.getElementById('playerBoostReason').value.trim();

  const nombreCorto = nombreCompleto.includes('|') ? nombreCompleto.split('|')[0].trim() : nombreCompleto.split(' ')[0];

  const playerData = {
    nombre_completo: nombreCompleto,
    nombre_corto: nombreCorto,
    nivel,
    dificultad,
    rango,
    boost: boostFlag ? 'Sí' : 'No',
    tipo_boost: boostFlag ? tipoBoost : null,
    porcentaje: boostFlag ? porcentaje : 0,
    motivo_boost: boostFlag ? motivo : ''
  };

  if (editingPlayerIndex !== null) {
    state.players[editingPlayerIndex] = playerData;
  } else {
    state.players.push(playerData);
  }

  resetPlayerForm();
  updatePlayerList();
}

function getIdioLabel(value) {
  return value;
}

function generateReport() {
  if (!state.players.length) {
    alert('Debes añadir al menos un jugador.');
    return;
  }

  const tipoMision = sessionType.value;
  const reglasMision = TIPOS_MISION[tipoMision];
  const xpTotalMonstruos = state.enemies.reduce((sum, enemy) => sum + enemy.xp_total, 0);
  const cantJugadores = state.players.length;

  let xpPorNivel = [];

  if (reglasMision.xp_fija !== null) {
    xpPorNivel = Array(cantJugadores).fill(reglasMision.xp_fija);
  } else {
    xpPorNivel = state.players.map(player => {
      const thresholds = LEVEL_XP_THRESHOLDS[player.nivel] || LEVEL_XP_THRESHOLDS[1];
      return thresholds[player.dificultad] || 0;
    });

    const totalBase = xpPorNivel.reduce((sum, xp) => sum + xp, 0);
    if (totalBase > 0) {
      const escala = (xpTotalMonstruos * reglasMision.xp_mod) / totalBase;
      xpPorNivel = xpPorNivel.map(xp => Math.floor(xp * escala));
    }
  }

  let report = `${document.getElementById('sessionName').value}\n`;
  report += `${document.getElementById('sessionDate').value}\n\n`;
  report += '⚔️ Jugadores:\n';
  state.players.forEach(player => {
    report += `- ${player.nombre_completo} (Nv ${player.nivel}, ${player.dificultad}, ${player.rango})\n`;
  });

  report += '\n🧠 Experiencia\n';
  report += `Total XP de monstruos: ${xpTotalMonstruos} xp\n\n`;
  report += '🥊 Enemigos Superados\n';
  state.enemies.forEach(enemy => {
    report += `- x${enemy.cantidad} ${enemy.nombre} | ${enemy.xp_unidad} xp c/u\n`;
  });

  report += '\nRecompensas\n';

  state.players.forEach((player, index) => {
    let xpFinal = xpPorNivel[index] || 0;
    let oroFinal = Math.floor((ORO_BASE[player.rango] || 0) * reglasMision.oro_mod);
    let motivo = '';

    if (player.boost === 'Sí') {
      const bono = player.porcentaje / 100;
      if (['Dinero', 'Ambas'].includes(player.tipo_boost)) {
        oroFinal += Math.floor((ORO_BASE[player.rango] || 0) * bono);
      }
      if (['Experiencia', 'Ambas'].includes(player.tipo_boost)) {
        xpFinal += Math.floor(xpFinal * bono);
      }
      motivo = player.motivo_boost ? ` (${player.motivo_boost})` : ` (${player.porcentaje}% extra)`;
    }

    report += `- ${player.nombre_corto}: ${xpFinal} xp, ${oroFinal} 🪙${motivo}\n`;
  });

  reportText.value = report;
}

function clearAll() {
  if (!confirm('¿Limpiar todos los datos?')) return;
  state.enemies = [];
  state.players = [];
  reportText.value = '';
  updateEnemyList();
  updatePlayerList();
}

function attachEvents() {
  document.getElementById('addEnemy').addEventListener('click', addEnemy);
  document.getElementById('addEnemyType').addEventListener('click', addEnemyType);
  document.getElementById('enemyTypeSelect').addEventListener('change', onEnemyTypeChange);
  document.getElementById('playerLevel').addEventListener('change', syncRankFromLevel);
  document.getElementById('playerRank').addEventListener('change', syncLevelFromRank);
  enemySearch?.addEventListener('input', () => {
    updateEnemyRegistry();
    updateEnemyTypeSelect();
  });
  document.querySelectorAll('.tab-button').forEach(button => {
    button.addEventListener('click', () => switchTab(button.dataset.tab));
  });
  document.getElementById('addPlayer').addEventListener('click', addPlayer);
  cancelEditPlayer.addEventListener('click', (event) => {
    event.preventDefault();
    resetPlayerForm();
  });
  document.getElementById('generateReport').addEventListener('click', generateReport);
  document.getElementById('clearAll').addEventListener('click', clearAll);
}

function switchTab(tab) {
  document.querySelectorAll('.tab-button').forEach(button => {
    button.classList.toggle('active', button.dataset.tab === tab);
  });
  document.querySelectorAll('.tab-panel').forEach(panel => {
    panel.hidden = panel.id !== `enemy${tab === 'mission' ? 'Mission' : 'Registry'}Panel`;
    panel.classList.toggle('active', panel.id === `enemy${tab === 'mission' ? 'Mission' : 'Registry'}Panel`);
  });
}

function init() {
  if (window.ENEMY_REGISTRY && Array.isArray(window.ENEMY_REGISTRY)) {
    state.enemyRegistry = window.ENEMY_REGISTRY.slice();
  }
  initOptions();
  resetPlayerForm();
  attachEvents();
  const today = new Date().toISOString().slice(0, 10);
  document.getElementById('sessionDate').value = today;
  sessionType.value = 'Misión Estándar / One Shot';
  updateEnemyRegistry();
  updateEnemyTypeSelect();
  updateEnemyList();
  updatePlayerList();
}

init();
