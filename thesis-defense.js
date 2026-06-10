const canvas = document.querySelector("#game-canvas");
const ctx = canvas.getContext("2d");
const stage = document.querySelector("#game-stage");

const ui = {
    start: document.querySelector("#start-screen"),
    pause: document.querySelector("#pause-screen"),
    gameOver: document.querySelector("#game-over-screen"),
    hud: document.querySelector("#hud"),
    startButton: document.querySelector("#start-button"),
    pauseButton: document.querySelector("#pause-button"),
    resumeButton: document.querySelector("#resume-button"),
    restartButton: document.querySelector("#restart-button"),
    changeCharacter: document.querySelector("#change-character"),
    fullscreenButton: document.querySelector("#fullscreen-button"),
    soundButton: document.querySelector("#sound-toggle"),
    stateLabel: document.querySelector("#game-state-label"),
    wave: document.querySelector("#wave-value"),
    score: document.querySelector("#score-value"),
    combo: document.querySelector("#combo-value"),
    health: document.querySelector("#health-value"),
    healthFill: document.querySelector("#health-fill"),
    waveBanner: document.querySelector("#wave-banner"),
    finalScore: document.querySelector("#final-score"),
    finalWave: document.querySelector("#final-wave"),
    bestScore: document.querySelector("#best-score"),
    resultTitle: document.querySelector("#result-title"),
    resultNote: document.querySelector("#result-note")
};

const characterStats = {
    analyst: { color: "#9b87ff", speed: 245, fireDelay: 240, damage: 24, bulletSpeed: 610, perk: "Reliable Methods" },
    hacker: { color: "#39c9bd", speed: 300, fireDelay: 145, damage: 15, bulletSpeed: 680, perk: "Rapid Prototype" },
    writer: { color: "#f0a653", speed: 195, fireDelay: 390, damage: 42, bulletSpeed: 560, perk: "Strong Argument" }
};

const enemyTypes = {
    bug: { color: "#ef5d6a", radius: 15, speed: 62, hp: 36, damage: 9, points: 100, label: "B" },
    deadline: { color: "#8c6ae8", radius: 13, speed: 108, hp: 27, damage: 12, points: 150, label: "D" },
    reviewer: { color: "#e38a48", radius: 23, speed: 39, hp: 120, damage: 25, points: 420, label: "R2" }
};

const waveNames = [
    "Literature Review",
    "Methods Chapter",
    "Data Collection",
    "Results & Revision",
    "Committee Meeting",
    "Final Submission"
];

let game = {};
let animationFrame = 0;
let lastTime = 0;
let selectedCharacter = "analyst";
let audioEnabled = true;
let audioContext = null;
const keys = {};
const pointer = { x: canvas.width * 0.7, y: canvas.height * 0.5, down: false };

document.querySelectorAll(".character-card").forEach((card) => {
    card.addEventListener("click", () => {
        selectedCharacter = card.dataset.character;
        document.querySelectorAll(".character-card").forEach((item) => item.classList.toggle("selected", item === card));
    });
});

ui.startButton.addEventListener("click", startGame);
ui.restartButton.addEventListener("click", startGame);
ui.changeCharacter.addEventListener("click", showCharacterSelect);
ui.pauseButton.addEventListener("click", togglePause);
ui.resumeButton.addEventListener("click", togglePause);
ui.fullscreenButton.addEventListener("click", toggleFullscreen);
ui.soundButton.addEventListener("click", () => {
    audioEnabled = !audioEnabled;
    ui.soundButton.textContent = `Sound: ${audioEnabled ? "On" : "Off"}`;
});

window.addEventListener("keydown", (event) => {
    keys[event.key.toLowerCase()] = true;
    if ([" ", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(event.key)) event.preventDefault();
    if (event.key.toLowerCase() === "p" || event.key === "Escape") togglePause();
});
window.addEventListener("keyup", (event) => {
    keys[event.key.toLowerCase()] = false;
});
canvas.addEventListener("pointermove", updatePointer);
canvas.addEventListener("pointerdown", (event) => {
    updatePointer(event);
    pointer.down = true;
    canvas.setPointerCapture?.(event.pointerId);
});
canvas.addEventListener("pointerup", () => { pointer.down = false; });
canvas.addEventListener("pointerleave", () => { pointer.down = false; });

document.querySelectorAll("[data-key]").forEach((button) => {
    const key = button.dataset.key.toLowerCase();
    const on = (event) => { event.preventDefault(); keys[key] = true; };
    const off = (event) => { event.preventDefault(); keys[key] = false; };
    button.addEventListener("pointerdown", on);
    button.addEventListener("pointerup", off);
    button.addEventListener("pointercancel", off);
    button.addEventListener("pointerleave", off);
});
const touchFire = document.querySelector("#touch-fire");
touchFire.addEventListener("pointerdown", (event) => { event.preventDefault(); pointer.down = true; });
["pointerup", "pointercancel", "pointerleave"].forEach((name) => {
    touchFire.addEventListener(name, () => { pointer.down = false; });
});

function startGame() {
    unlockAudio();
    game = {
        running: true,
        paused: false,
        over: false,
        score: 0,
        wave: 1,
        coreHealth: 100,
        combo: 1,
        comboTimer: 0,
        elapsed: 0,
        spawnTimer: 0,
        spawned: 0,
        waveTarget: 10,
        betweenWaves: false,
        nextWaveTimer: 0,
        screenShake: 0,
        flash: 0,
        player: {
            x: canvas.width / 2,
            y: canvas.height / 2 + 95,
            radius: 13,
            angle: -Math.PI / 2,
            lastShot: -9999,
            boostTimer: 0,
            ...characterStats[selectedCharacter]
        },
        bullets: [],
        enemies: [],
        particles: [],
        powerups: [],
        stars: createStars()
    };
    ui.start.classList.add("hidden");
    ui.gameOver.classList.add("hidden");
    ui.pause.classList.add("hidden");
    ui.hud.classList.remove("hidden");
    ui.pauseButton.disabled = false;
    ui.pauseButton.textContent = "Pause";
    ui.stateLabel.textContent = `${capitalize(selectedCharacter)} active`;
    updateHud();
    showWaveBanner();
    cancelAnimationFrame(animationFrame);
    lastTime = performance.now();
    animationFrame = requestAnimationFrame(loop);
}

function loop(time) {
    const dt = Math.min((time - lastTime) / 1000, 0.033);
    lastTime = time;
    if (game.running && !game.paused && !game.over) update(dt, time);
    draw();
    if (game.running) animationFrame = requestAnimationFrame(loop);
}

function update(dt, now) {
    game.elapsed += dt;
    updatePlayer(dt, now);
    updateBullets(dt);
    updateEnemies(dt);
    updateParticles(dt);
    updatePowerups(dt);
    updateWave(dt);
    game.screenShake = Math.max(0, game.screenShake - dt * 25);
    game.flash = Math.max(0, game.flash - dt * 4);
    game.comboTimer -= dt;
    if (game.comboTimer <= 0 && game.combo > 1) {
        game.combo = 1;
        updateHud();
    }
}

function updatePlayer(dt, now) {
    const player = game.player;
    let dx = 0;
    let dy = 0;
    if (keys.w || keys.arrowup) dy -= 1;
    if (keys.s || keys.arrowdown) dy += 1;
    if (keys.a || keys.arrowleft) dx -= 1;
    if (keys.d || keys.arrowright) dx += 1;
    if (dx || dy) {
        const length = Math.hypot(dx, dy);
        player.x += dx / length * player.speed * dt;
        player.y += dy / length * player.speed * dt;
    }
    player.x = clamp(player.x, player.radius + 6, canvas.width - player.radius - 6);
    player.y = clamp(player.y, player.radius + 6, canvas.height - player.radius - 6);

    if (pointer.down && matchMedia("(pointer: coarse)").matches) {
        const target = nearestEnemy(player.x, player.y);
        if (target) {
            pointer.x = target.x;
            pointer.y = target.y;
        }
    }
    player.angle = Math.atan2(pointer.y - player.y, pointer.x - player.x);
    const wantsFire = pointer.down || keys[" "];
    const delay = player.boostTimer > 0 ? player.fireDelay * 0.55 : player.fireDelay;
    player.boostTimer -= dt;
    if (wantsFire && now - player.lastShot >= delay) shoot(now);
}

function shoot(now) {
    const player = game.player;
    player.lastShot = now;
    const spread = selectedCharacter === "writer" ? 0.015 : 0.03;
    const angle = player.angle + (Math.random() - 0.5) * spread;
    game.bullets.push({
        x: player.x + Math.cos(angle) * 19,
        y: player.y + Math.sin(angle) * 19,
        vx: Math.cos(angle) * player.bulletSpeed,
        vy: Math.sin(angle) * player.bulletSpeed,
        radius: selectedCharacter === "writer" ? 5 : 3.5,
        damage: player.damage,
        life: 1.3,
        color: player.color
    });
    createMuzzle(player.x + Math.cos(angle) * 20, player.y + Math.sin(angle) * 20, player.color);
    playTone(460, 0.035, "square", 0.025);
}

function updateBullets(dt) {
    game.bullets.forEach((bullet) => {
        bullet.x += bullet.vx * dt;
        bullet.y += bullet.vy * dt;
        bullet.life -= dt;
    });

    for (let i = game.bullets.length - 1; i >= 0; i--) {
        const bullet = game.bullets[i];
        let hit = false;
        for (let j = game.enemies.length - 1; j >= 0; j--) {
            const enemy = game.enemies[j];
            if (distance(bullet, enemy) < bullet.radius + enemy.radius) {
                enemy.hp -= bullet.damage;
                hit = true;
                createImpact(bullet.x, bullet.y, bullet.color);
                if (enemy.hp <= 0) destroyEnemy(j);
                break;
            }
        }
        if (hit || bullet.life <= 0 || bullet.x < -20 || bullet.x > canvas.width + 20 || bullet.y < -20 || bullet.y > canvas.height + 20) {
            game.bullets.splice(i, 1);
        }
    }
}

function updateEnemies(dt) {
    const core = { x: canvas.width / 2, y: canvas.height / 2 };
    for (let i = game.enemies.length - 1; i >= 0; i--) {
        const enemy = game.enemies[i];
        const angle = Math.atan2(core.y - enemy.y, core.x - enemy.x);
        enemy.x += Math.cos(angle) * enemy.speed * dt;
        enemy.y += Math.sin(angle) * enemy.speed * dt;
        enemy.angle = angle;
        enemy.pulse += dt * 3;
        if (distance(enemy, core) < enemy.radius + 39) {
            damageCore(enemy.damage);
            createExplosion(enemy.x, enemy.y, enemy.color, 14);
            game.enemies.splice(i, 1);
        }
    }
}

function updateWave(dt) {
    if (game.betweenWaves) {
        game.nextWaveTimer -= dt;
        if (game.nextWaveTimer <= 0) beginNextWave();
        return;
    }
    game.spawnTimer -= dt;
    if (game.spawned < game.waveTarget && game.spawnTimer <= 0) {
        spawnEnemy();
        game.spawned += 1;
        game.spawnTimer = Math.max(0.28, 1.05 - game.wave * 0.065) + Math.random() * 0.45;
    }
    if (game.spawned >= game.waveTarget && game.enemies.length === 0) {
        game.betweenWaves = true;
        game.nextWaveTimer = 2.4;
        game.score += 500 * game.wave;
        if (game.wave % 2 === 0) spawnPowerup("coffee");
        else spawnPowerup("citation");
        updateHud();
    }
}

function beginNextWave() {
    game.wave += 1;
    game.waveTarget = 8 + game.wave * 3;
    game.spawned = 0;
    game.spawnTimer = 0.4;
    game.betweenWaves = false;
    showWaveBanner();
    updateHud();
}

function spawnEnemy() {
    const roll = Math.random();
    let type = "bug";
    if (game.wave >= 3 && roll > 0.84) type = "reviewer";
    else if (game.wave >= 2 && roll > 0.58) type = "deadline";
    const base = enemyTypes[type];
    const side = Math.floor(Math.random() * 4);
    const padding = 35;
    let x;
    let y;
    if (side === 0) { x = Math.random() * canvas.width; y = -padding; }
    else if (side === 1) { x = canvas.width + padding; y = Math.random() * canvas.height; }
    else if (side === 2) { x = Math.random() * canvas.width; y = canvas.height + padding; }
    else { x = -padding; y = Math.random() * canvas.height; }
    const scale = 1 + (game.wave - 1) * 0.09;
    game.enemies.push({
        ...base,
        type,
        x,
        y,
        hp: base.hp * scale,
        maxHp: base.hp * scale,
        speed: base.speed * (1 + (game.wave - 1) * 0.025),
        pulse: Math.random() * Math.PI * 2,
        angle: 0
    });
}

function destroyEnemy(index) {
    const enemy = game.enemies[index];
    game.score += Math.round(enemy.points * game.combo);
    game.combo = Math.min(8, game.combo + 0.25);
    game.comboTimer = 2.2;
    createExplosion(enemy.x, enemy.y, enemy.color, enemy.type === "reviewer" ? 22 : 11);
    if (Math.random() < 0.055) spawnPowerup(Math.random() < 0.5 ? "coffee" : "citation", enemy.x, enemy.y);
    game.enemies.splice(index, 1);
    playTone(enemy.type === "reviewer" ? 105 : 150, 0.08, "sawtooth", 0.035);
    updateHud();
}

function damageCore(amount) {
    game.coreHealth = Math.max(0, game.coreHealth - amount);
    game.screenShake = 8;
    game.flash = 0.7;
    game.combo = 1;
    playTone(70, 0.18, "sawtooth", 0.06);
    updateHud();
    if (game.coreHealth <= 0) endGame();
}

function spawnPowerup(type, x = canvas.width / 2 + (Math.random() - 0.5) * 180, y = canvas.height / 2 + (Math.random() - 0.5) * 140) {
    game.powerups.push({ type, x, y, radius: 13, life: 9, pulse: 0 });
}

function updatePowerups(dt) {
    for (let i = game.powerups.length - 1; i >= 0; i--) {
        const item = game.powerups[i];
        item.life -= dt;
        item.pulse += dt * 4;
        if (distance(item, game.player) < item.radius + game.player.radius) {
            if (item.type === "coffee") game.coreHealth = Math.min(100, game.coreHealth + 18);
            else game.player.boostTimer = 8;
            createExplosion(item.x, item.y, "#65dccd", 13);
            playTone(620, 0.13, "sine", 0.05);
            game.powerups.splice(i, 1);
            updateHud();
        } else if (item.life <= 0) game.powerups.splice(i, 1);
    }
}

function endGame() {
    game.over = true;
    game.running = false;
    ui.hud.classList.add("hidden");
    ui.gameOver.classList.remove("hidden");
    ui.pauseButton.disabled = true;
    const score = Math.round(game.score);
    const best = Math.max(score, Number(localStorage.getItem("thesisDefenseBest") || 0));
    localStorage.setItem("thesisDefenseBest", String(best));
    ui.finalScore.textContent = score.toLocaleString();
    ui.finalWave.textContent = game.wave;
    ui.bestScore.textContent = best.toLocaleString();
    ui.resultTitle.textContent = game.wave >= 6 ? "Defense passed with distinction." : game.wave >= 3 ? "Major revisions required." : "The committee was unconvinced.";
    ui.resultNote.textContent = game.wave >= 6 ? "An unusually peaceful committee meeting. Enjoy it." : "The thesis fell, but the research question remains.";
    ui.stateLabel.textContent = "Defense concluded";
    draw();
}

function togglePause() {
    if (!game.running || game.over) return;
    game.paused = !game.paused;
    ui.pause.classList.toggle("hidden", !game.paused);
    ui.pauseButton.textContent = game.paused ? "Resume" : "Pause";
    ui.stateLabel.textContent = game.paused ? "Paused" : `${capitalize(selectedCharacter)} active`;
    if (!game.paused) {
        lastTime = performance.now();
    }
}

function showCharacterSelect() {
    game.running = false;
    ui.gameOver.classList.add("hidden");
    ui.start.classList.remove("hidden");
    ui.stateLabel.textContent = "Awaiting candidate";
}

function draw() {
    ctx.save();
    if (game.screenShake) ctx.translate((Math.random() - 0.5) * game.screenShake, (Math.random() - 0.5) * game.screenShake);
    drawBackground();
    if (game.player) {
        drawCore();
        drawPowerups();
        drawBullets();
        drawEnemies();
        drawPlayer();
        drawParticles();
    } else drawPreview();
    if (game.flash) {
        ctx.fillStyle = `rgba(239,93,106,${game.flash * 0.18})`;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    ctx.restore();
}

function drawBackground() {
    const gradient = ctx.createRadialGradient(canvas.width / 2, canvas.height / 2, 20, canvas.width / 2, canvas.height / 2, 560);
    gradient.addColorStop(0, "#202342");
    gradient.addColorStop(1, "#0c0e1d");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = "rgba(132,137,176,.08)";
    ctx.lineWidth = 1;
    for (let x = 0; x < canvas.width; x += 48) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke();
    }
    for (let y = 0; y < canvas.height; y += 48) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke();
    }
    const stars = game.stars || createStars();
    stars.forEach((star) => {
        ctx.fillStyle = `rgba(185,190,225,${star.alpha})`;
        ctx.fillRect(star.x, star.y, star.size, star.size);
    });
}

function drawCore() {
    const x = canvas.width / 2;
    const y = canvas.height / 2;
    const pulse = 1 + Math.sin(game.elapsed * 3) * 0.05;
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(pulse, pulse);
    ctx.shadowColor = "#65dccd";
    ctx.shadowBlur = 28;
    ctx.fillStyle = "rgba(101,220,205,.15)";
    ctx.beginPath(); ctx.arc(0, 0, 51, 0, Math.PI * 2); ctx.fill();
    ctx.shadowBlur = 12;
    ctx.fillStyle = "#65dccd";
    roundRect(ctx, -36, -29, 72, 58, 9);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.fillStyle = "#142236";
    roundRect(ctx, -29, -21, 58, 42, 5);
    ctx.fill();
    ctx.fillStyle = "#bff9f1";
    ctx.font = "700 8px Space Grotesk";
    ctx.textAlign = "center";
    ctx.fillText("THESIS", 0, -3);
    ctx.fillStyle = "#65dccd";
    ctx.font = "600 6px DM Sans";
    ctx.fillText("v1.0 FINAL", 0, 8);
    ctx.restore();
}

function drawPlayer() {
    const p = game.player;
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.angle);
    ctx.shadowColor = p.color;
    ctx.shadowBlur = 18;
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.moveTo(19, 0);
    ctx.lineTo(-11, -11);
    ctx.lineTo(-7, 0);
    ctx.lineTo(-11, 11);
    ctx.closePath();
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.fillStyle = "#f5f3ff";
    ctx.beginPath(); ctx.arc(-1, 0, 5, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
    if (p.boostTimer > 0) {
        ctx.strokeStyle = `rgba(255,209,102,${0.45 + Math.sin(game.elapsed * 8) * .2})`;
        ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(p.x, p.y, 21, 0, Math.PI * 2); ctx.stroke();
    }
}

function drawEnemies() {
    game.enemies.forEach((enemy) => {
        ctx.save();
        ctx.translate(enemy.x, enemy.y);
        ctx.rotate(enemy.type === "deadline" ? enemy.pulse : enemy.angle);
        ctx.shadowColor = enemy.color;
        ctx.shadowBlur = enemy.type === "reviewer" ? 16 : 9;
        ctx.fillStyle = enemy.color;
        if (enemy.type === "deadline") {
            ctx.beginPath();
            for (let i = 0; i < 8; i++) {
                const angle = i * Math.PI / 4;
                const radius = i % 2 ? enemy.radius * 0.72 : enemy.radius;
                const x = Math.cos(angle) * radius;
                const y = Math.sin(angle) * radius;
                if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
            }
            ctx.closePath(); ctx.fill();
        } else {
            ctx.beginPath(); ctx.arc(0, 0, enemy.radius, 0, Math.PI * 2); ctx.fill();
        }
        ctx.shadowBlur = 0;
        ctx.fillStyle = "#fff";
        ctx.font = `700 ${enemy.type === "reviewer" ? 9 : 8}px Space Grotesk`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(enemy.label, 0, 0);
        ctx.restore();
        if (enemy.hp < enemy.maxHp) {
            const width = enemy.radius * 2;
            ctx.fillStyle = "rgba(0,0,0,.45)";
            ctx.fillRect(enemy.x - width / 2, enemy.y - enemy.radius - 8, width, 3);
            ctx.fillStyle = "#70e2d7";
            ctx.fillRect(enemy.x - width / 2, enemy.y - enemy.radius - 8, width * enemy.hp / enemy.maxHp, 3);
        }
    });
}

function drawBullets() {
    game.bullets.forEach((bullet) => {
        ctx.shadowColor = bullet.color;
        ctx.shadowBlur = 11;
        ctx.fillStyle = bullet.color;
        ctx.beginPath(); ctx.arc(bullet.x, bullet.y, bullet.radius, 0, Math.PI * 2); ctx.fill();
        ctx.shadowBlur = 0;
    });
}

function drawPowerups() {
    game.powerups.forEach((item) => {
        const scale = 1 + Math.sin(item.pulse) * 0.1;
        ctx.save();
        ctx.translate(item.x, item.y);
        ctx.scale(scale, scale);
        ctx.shadowColor = item.type === "coffee" ? "#65dccd" : "#ffd166";
        ctx.shadowBlur = 16;
        ctx.fillStyle = item.type === "coffee" ? "#65dccd" : "#ffd166";
        ctx.beginPath(); ctx.arc(0, 0, item.radius, 0, Math.PI * 2); ctx.fill();
        ctx.shadowBlur = 0;
        ctx.fillStyle = "#172035";
        ctx.font = "800 9px Space Grotesk";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(item.type === "coffee" ? "+" : "C", 0, 0);
        ctx.restore();
    });
}

function createStars() {
    return Array.from({ length: 80 }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 1.5 + 0.4,
        alpha: Math.random() * 0.28 + 0.05
    }));
}

function createMuzzle(x, y, color) {
    for (let i = 0; i < 4; i++) game.particles.push(particle(x, y, color, 80, 0.18, 2));
}

function createImpact(x, y, color) {
    for (let i = 0; i < 5; i++) game.particles.push(particle(x, y, color, 100, 0.25, 2));
}

function createExplosion(x, y, color, count) {
    for (let i = 0; i < count; i++) game.particles.push(particle(x, y, color, 170, 0.55, Math.random() * 3 + 1));
}

function particle(x, y, color, speed, life, radius) {
    const angle = Math.random() * Math.PI * 2;
    const velocity = Math.random() * speed;
    return { x, y, vx: Math.cos(angle) * velocity, vy: Math.sin(angle) * velocity, color, life, maxLife: life, radius };
}

function updateParticles(dt) {
    for (let i = game.particles.length - 1; i >= 0; i--) {
        const p = game.particles[i];
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.vx *= 0.97;
        p.vy *= 0.97;
        p.life -= dt;
        if (p.life <= 0) game.particles.splice(i, 1);
    }
}

function drawParticles() {
    game.particles.forEach((p) => {
        ctx.globalAlpha = p.life / p.maxLife;
        ctx.fillStyle = p.color;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2); ctx.fill();
    });
    ctx.globalAlpha = 1;
}

function drawPreview() {
    const x = canvas.width / 2;
    const y = canvas.height / 2;
    ctx.strokeStyle = "rgba(101,220,205,.18)";
    ctx.lineWidth = 2;
    for (let r = 60; r <= 180; r += 40) {
        ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.stroke();
    }
}

function updateHud() {
    ui.wave.textContent = game.wave;
    ui.score.textContent = String(Math.round(game.score)).padStart(5, "0");
    ui.combo.textContent = `x${game.combo.toFixed(game.combo % 1 ? 2 : 0)}`;
    ui.health.textContent = `${Math.ceil(game.coreHealth)}%`;
    ui.healthFill.style.width = `${game.coreHealth}%`;
    ui.healthFill.style.background = game.coreHealth > 55 ? "linear-gradient(90deg,#38c7bd,#7ae3b4)" : game.coreHealth > 25 ? "#ffd166" : "#ef5d6a";
}

function showWaveBanner() {
    ui.waveBanner.innerHTML = `WAVE ${game.wave}<span>${waveNames[Math.min(game.wave - 1, waveNames.length - 1)]}</span>`;
    ui.waveBanner.classList.add("show");
    setTimeout(() => ui.waveBanner.classList.remove("show"), 1500);
}

function updatePointer(event) {
    const rect = canvas.getBoundingClientRect();
    pointer.x = (event.clientX - rect.left) / rect.width * canvas.width;
    pointer.y = (event.clientY - rect.top) / rect.height * canvas.height;
}

function nearestEnemy(x, y) {
    return game.enemies?.reduce((best, enemy) => {
        const d = Math.hypot(enemy.x - x, enemy.y - y);
        return !best || d < best.distance ? { ...enemy, distance: d } : best;
    }, null);
}

function toggleFullscreen() {
    if (!document.fullscreenElement) stage.requestFullscreen?.();
    else document.exitFullscreen?.();
}

function unlockAudio() {
    if (!audioContext) audioContext = new (window.AudioContext || window.webkitAudioContext)();
    if (audioContext.state === "suspended") audioContext.resume();
}

function playTone(frequency, duration, type, volume) {
    if (!audioEnabled || !audioContext) return;
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
    oscillator.type = type;
    oscillator.frequency.value = frequency;
    gain.gain.setValueAtTime(volume, audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duration);
    oscillator.connect(gain);
    gain.connect(audioContext.destination);
    oscillator.start();
    oscillator.stop(audioContext.currentTime + duration);
}

function roundRect(context, x, y, width, height, radius) {
    context.beginPath();
    context.roundRect(x, y, width, height, radius);
}

function distance(a, b) {
    return Math.hypot(a.x - b.x, a.y - b.y);
}

function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

function capitalize(value) {
    return value.charAt(0).toUpperCase() + value.slice(1);
}

game.stars = createStars();
draw();
