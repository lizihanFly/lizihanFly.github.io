const canvas = document.querySelector("#game-canvas");
const ctx = canvas.getContext("2d");
const stage = document.querySelector("#game-stage");

const ui = {
    start: document.querySelector("#start-screen"),
    pause: document.querySelector("#pause-screen"),
    upgrade: document.querySelector("#upgrade-screen"),
    upgradeGrid: document.querySelector("#upgrade-grid"),
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
    build: document.querySelector("#build-value"),
    health: document.querySelector("#health-value"),
    healthFill: document.querySelector("#health-fill"),
    skillName: document.querySelector("#skill-name"),
    skillFill: document.querySelector("#skill-fill"),
    skillCooldown: document.querySelector("#skill-cooldown"),
    dashFill: document.querySelector("#dash-fill"),
    dashCooldown: document.querySelector("#dash-cooldown"),
    waveBanner: document.querySelector("#wave-banner"),
    finalScore: document.querySelector("#final-score"),
    finalWave: document.querySelector("#final-wave"),
    bestScore: document.querySelector("#best-score"),
    resultTitle: document.querySelector("#result-title"),
    resultNote: document.querySelector("#result-note")
};

const characterStats = {
    analyst: {
        color: "#9b87ff",
        speed: 245,
        fireDelay: 240,
        damage: 24,
        bulletSpeed: 610,
        skillName: "Method Freeze",
        skillCooldown: 14
    },
    hacker: {
        color: "#39c9bd",
        speed: 300,
        fireDelay: 145,
        damage: 15,
        bulletSpeed: 680,
        skillName: "Hotfix Pulse",
        skillCooldown: 10
    },
    writer: {
        color: "#f0a653",
        speed: 195,
        fireDelay: 390,
        damage: 42,
        bulletSpeed: 560,
        skillName: "Citation Storm",
        skillCooldown: 13
    }
};

const enemyTypes = {
    bug: { color: "#ef5d6a", radius: 15, speed: 62, hp: 36, damage: 9, points: 100, label: "B" },
    deadline: { color: "#8c6ae8", radius: 13, speed: 108, hp: 27, damage: 12, points: 150, label: "D" },
    replicator: { color: "#e767ae", radius: 17, speed: 52, hp: 58, damage: 10, points: 220, label: "R" },
    shield: { color: "#6ed6ee", radius: 18, speed: 49, hp: 62, shield: 55, damage: 15, points: 260, label: "S" },
    reviewer: { color: "#e38a48", radius: 23, speed: 39, hp: 120, damage: 25, points: 420, label: "R2" },
    boss: { color: "#d84f73", radius: 39, speed: 31, hp: 850, damage: 38, points: 2500, label: "CHAIR" }
};

const waveNames = [
    "Literature Review",
    "Methods Chapter",
    "Data Collection",
    "Results & Revision",
    "Committee Meeting",
    "Final Submission"
];

const upgradePool = [
    {
        id: "damage",
        icon: "+",
        name: "Stronger Evidence",
        description: "All citations deal 22% more damage.",
        tag: "OFFENSE",
        apply: () => { game.player.damage *= 1.22; }
    },
    {
        id: "fireRate",
        icon: ">>",
        name: "Rapid Drafting",
        description: "Fire 16% faster. Stacks with coffee.",
        tag: "OFFENSE",
        apply: () => { game.player.fireDelay *= 0.84; }
    },
    {
        id: "multiShot",
        icon: "3",
        name: "Multiple Sources",
        description: "Fire one additional citation with a small spread.",
        tag: "PROJECTILE",
        available: () => game.player.multiShot < 5,
        apply: () => { game.player.multiShot += 1; }
    },
    {
        id: "pierce",
        icon: "|",
        name: "Peer-Reviewed",
        description: "Citations pierce through one additional enemy.",
        tag: "PROJECTILE",
        available: () => game.player.pierce < 4,
        apply: () => { game.player.pierce += 1; }
    },
    {
        id: "critical",
        icon: "!",
        name: "Decisive Result",
        description: "Gain 12% critical-hit chance for double damage.",
        tag: "OFFENSE",
        available: () => game.player.critChance < 0.48,
        apply: () => { game.player.critChance += 0.12; }
    },
    {
        id: "speed",
        icon: ">",
        name: "Efficient Workflow",
        description: "Move 14% faster and shorten dash cooldown.",
        tag: "MOBILITY",
        apply: () => {
            game.player.speed *= 1.14;
            game.player.dashCooldownMax *= 0.9;
        }
    },
    {
        id: "skill",
        icon: "E",
        name: "Focused Research",
        description: "Reduce active-skill cooldown by 18%.",
        tag: "ABILITY",
        available: () => game.player.skillCooldownMax > 5,
        apply: () => { game.player.skillCooldownMax *= 0.82; }
    },
    {
        id: "armor",
        icon: "%",
        name: "Ethics Approval",
        description: "Thesis takes 12% less damage from every source.",
        tag: "DEFENSE",
        available: () => game.damageReduction < 0.48,
        apply: () => { game.damageReduction += 0.12; }
    },
    {
        id: "shield",
        icon: "S",
        name: "Grant Funding",
        description: "Add a 30-point shield that refreshes each wave.",
        tag: "DEFENSE",
        apply: () => {
            game.maxShield += 30;
            game.coreShield = game.maxShield;
        }
    },
    {
        id: "repair",
        icon: "+",
        name: "Major Revision",
        description: "Repair 30 integrity now and 5 after each wave.",
        tag: "RECOVERY",
        apply: () => {
            game.coreHealth = Math.min(100, game.coreHealth + 30);
            game.waveRepair += 5;
        }
    },
    {
        id: "drone",
        icon: "AI",
        name: "Research Assistant",
        description: "Deploy an orbiting assistant that auto-fires.",
        tag: "AUTOMATION",
        available: () => game.drones < 3,
        apply: () => { game.drones += 1; }
    },
    {
        id: "velocity",
        icon: "^",
        name: "Clear Argument",
        description: "Projectiles travel 20% faster and grow slightly.",
        tag: "PROJECTILE",
        apply: () => {
            game.player.bulletSpeed *= 1.2;
            game.player.bulletRadius += 0.7;
        }
    }
];

let game = {};
let animationFrame = 0;
let lastTime = 0;
let selectedCharacter = "analyst";
let audioEnabled = true;
let audioContext = null;
let enemyId = 0;
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
    const key = event.key.toLowerCase();
    keys[key] = true;
    if ([" ", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(event.key)) event.preventDefault();

    if (game.upgrading && ["1", "2", "3"].includes(event.key)) {
        chooseUpgrade(Number(event.key) - 1);
        return;
    }
    if (event.repeat) return;
    if (key === "p" || event.key === "Escape") togglePause();
    if (key === "e") activateSkill();
    if (event.key === "Shift") dash();
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
document.querySelector("#touch-ability").addEventListener("click", activateSkill);
document.querySelector("#touch-dash").addEventListener("click", dash);

function startGame() {
    unlockAudio();
    const base = characterStats[selectedCharacter];
    game = {
        running: true,
        paused: false,
        upgrading: false,
        over: false,
        score: 0,
        wave: 1,
        coreHealth: 100,
        coreShield: 0,
        maxShield: 0,
        damageReduction: 0,
        waveRepair: 0,
        combo: 1,
        comboTimer: 0,
        elapsed: 0,
        spawnTimer: 0,
        spawned: 0,
        waveTarget: 10,
        betweenWaves: false,
        nextWaveTimer: 0,
        bossSpawned: false,
        screenShake: 0,
        flash: 0,
        fieldEffect: null,
        upgradeCount: 0,
        currentUpgrades: [],
        drones: 0,
        droneTimer: 0,
        player: {
            ...base,
            x: canvas.width / 2,
            y: canvas.height / 2 + 95,
            radius: 13,
            angle: -Math.PI / 2,
            lastShot: -9999,
            boostTimer: 0,
            stormTimer: 0,
            skillCooldown: 0,
            skillCooldownMax: base.skillCooldown,
            dashCooldown: 0,
            dashCooldownMax: 2.7,
            invulnerable: 0,
            multiShot: 1,
            pierce: 0,
            critChance: 0,
            bulletRadius: selectedCharacter === "writer" ? 5 : 3.5
        },
        bullets: [],
        enemyProjectiles: [],
        enemies: [],
        particles: [],
        powerups: [],
        stars: createStars()
    };
    ui.start.classList.add("hidden");
    ui.gameOver.classList.add("hidden");
    ui.pause.classList.add("hidden");
    ui.upgrade.classList.add("hidden");
    ui.hud.classList.remove("hidden");
    ui.pauseButton.disabled = false;
    ui.pauseButton.textContent = "Pause";
    ui.stateLabel.textContent = `${capitalize(selectedCharacter)} active`;
    ui.skillName.textContent = base.skillName;
    updateHud();
    showWaveBanner();
    cancelAnimationFrame(animationFrame);
    lastTime = performance.now();
    animationFrame = requestAnimationFrame(loop);
}

function loop(time) {
    const dt = Math.min((time - lastTime) / 1000, 0.033);
    lastTime = time;
    if (game.running && !game.paused && !game.upgrading && !game.over) update(dt, time);
    draw();
    if (game.running) animationFrame = requestAnimationFrame(loop);
}

function update(dt, now) {
    game.elapsed += dt;
    updatePlayer(dt, now);
    updateDrones(dt);
    updateBullets(dt);
    updateEnemies(dt);
    updateEnemyProjectiles(dt);
    updateParticles(dt);
    updatePowerups(dt);
    updateWave(dt);
    game.screenShake = Math.max(0, game.screenShake - dt * 25);
    game.flash = Math.max(0, game.flash - dt * 4);
    game.comboTimer -= dt;
    if (game.fieldEffect) {
        game.fieldEffect.life -= dt;
        if (game.fieldEffect.life <= 0) game.fieldEffect = null;
    }
    if (game.comboTimer <= 0 && game.combo > 1) {
        game.combo = 1;
        updateHud();
    }
    updateAbilityHud();
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
        player.moveX = dx / length;
        player.moveY = dy / length;
    }
    player.x = clamp(player.x, player.radius + 6, canvas.width - player.radius - 6);
    player.y = clamp(player.y, player.radius + 6, canvas.height - player.radius - 6);
    player.skillCooldown = Math.max(0, player.skillCooldown - dt);
    player.dashCooldown = Math.max(0, player.dashCooldown - dt);
    player.invulnerable = Math.max(0, player.invulnerable - dt);
    player.boostTimer = Math.max(0, player.boostTimer - dt);
    player.stormTimer = Math.max(0, player.stormTimer - dt);

    if (pointer.down && matchMedia("(pointer: coarse)").matches) {
        const target = nearestEnemy(player.x, player.y);
        if (target) {
            pointer.x = target.x;
            pointer.y = target.y;
        }
    }
    player.angle = Math.atan2(pointer.y - player.y, pointer.x - player.x);
    const wantsFire = pointer.down || keys[" "];
    let delay = player.fireDelay;
    if (player.boostTimer > 0) delay *= 0.55;
    if (player.stormTimer > 0) delay *= 0.48;
    if (wantsFire && now - player.lastShot >= delay) shoot(now);
}

function shoot(now, options = {}) {
    const player = game.player;
    player.lastShot = options.drone ? player.lastShot : now;
    let count = options.count || player.multiShot;
    if (player.stormTimer > 0 && !options.drone) count = Math.max(count + 2, 4);
    const totalSpread = count === 1 ? 0 : Math.min(0.44, 0.11 * (count - 1));
    for (let i = 0; i < count; i++) {
        const offset = count === 1 ? 0 : -totalSpread / 2 + totalSpread * i / (count - 1);
        const baseAngle = options.angle ?? player.angle;
        const angle = baseAngle + offset + (Math.random() - 0.5) * 0.018;
        const critical = Math.random() < player.critChance;
        game.bullets.push({
            x: options.x ?? player.x + Math.cos(angle) * 19,
            y: options.y ?? player.y + Math.sin(angle) * 19,
            vx: Math.cos(angle) * player.bulletSpeed,
            vy: Math.sin(angle) * player.bulletSpeed,
            radius: options.drone ? 3 : player.bulletRadius,
            damage: player.damage * (options.drone ? 0.55 : 1) * (critical ? 2 : 1),
            life: 1.45,
            color: critical ? "#fff3a6" : player.color,
            pierce: options.drone ? 0 : player.pierce,
            hits: new Set()
        });
    }
    const muzzleX = options.x ?? player.x + Math.cos(player.angle) * 20;
    const muzzleY = options.y ?? player.y + Math.sin(player.angle) * 20;
    createMuzzle(muzzleX, muzzleY, player.color);
    playTone(options.drone ? 560 : 460, 0.035, "square", options.drone ? 0.012 : 0.025);
}

function updateBullets(dt) {
    game.bullets.forEach((bullet) => {
        bullet.x += bullet.vx * dt;
        bullet.y += bullet.vy * dt;
        bullet.life -= dt;
    });

    for (let i = game.bullets.length - 1; i >= 0; i--) {
        const bullet = game.bullets[i];
        let removeBullet = false;
        for (let j = game.enemies.length - 1; j >= 0; j--) {
            const enemy = game.enemies[j];
            if (bullet.hits.has(enemy.id)) continue;
            if (distance(bullet, enemy) < bullet.radius + enemy.radius) {
                bullet.hits.add(enemy.id);
                damageEnemy(j, bullet.damage);
                createImpact(bullet.x, bullet.y, bullet.color);
                if (bullet.pierce > 0) bullet.pierce -= 1;
                else removeBullet = true;
                break;
            }
        }
        if (removeBullet || bullet.life <= 0 || bullet.x < -30 || bullet.x > canvas.width + 30 || bullet.y < -30 || bullet.y > canvas.height + 30) {
            game.bullets.splice(i, 1);
        }
    }
}

function damageEnemy(index, amount) {
    const enemy = game.enemies[index];
    if (!enemy) return;
    if (enemy.shield > 0) {
        const absorbed = Math.min(enemy.shield, amount);
        enemy.shield -= absorbed;
        amount -= absorbed;
    }
    enemy.hp -= amount;
    enemy.hitFlash = 0.12;
    if (enemy.hp <= 0) destroyEnemy(index);
}

function updateEnemies(dt) {
    const core = { x: canvas.width / 2, y: canvas.height / 2 };
    for (let i = game.enemies.length - 1; i >= 0; i--) {
        const enemy = game.enemies[i];
        enemy.hitFlash = Math.max(0, (enemy.hitFlash || 0) - dt);
        enemy.slowTimer = Math.max(0, (enemy.slowTimer || 0) - dt);
        enemy.pulse += dt * 3;
        const angle = Math.atan2(core.y - enemy.y, core.x - enemy.x);
        const range = distance(enemy, core);
        const slow = enemy.slowTimer > 0 ? 0.32 : 1;

        if (enemy.type === "boss") {
            if (range > 235) {
                enemy.x += Math.cos(angle) * enemy.speed * slow * dt;
                enemy.y += Math.sin(angle) * enemy.speed * slow * dt;
            }
            enemy.shootTimer -= dt;
            enemy.summonTimer -= dt;
            if (enemy.shootTimer <= 0) {
                fireBossVolley(enemy, angle);
                enemy.shootTimer = Math.max(1.25, 2.25 - game.wave * 0.04);
            }
            if (enemy.summonTimer <= 0) {
                spawnSpecific("deadline", enemy.x + 25, enemy.y + 18, 0.82);
                spawnSpecific("bug", enemy.x - 25, enemy.y - 18, 0.82);
                enemy.summonTimer = 5.2;
            }
        } else {
            const wobble = enemy.type === "reviewer" ? Math.sin(enemy.pulse * 1.7) * 0.22 : 0;
            enemy.x += Math.cos(angle + wobble) * enemy.speed * slow * dt;
            enemy.y += Math.sin(angle + wobble) * enemy.speed * slow * dt;
        }
        enemy.angle = angle;

        if (range < enemy.radius + 39 && enemy.type !== "boss") {
            damageCore(enemy.damage);
            createExplosion(enemy.x, enemy.y, enemy.color, 14);
            game.enemies.splice(i, 1);
        }
    }
}

function fireBossVolley(enemy, angleToCore) {
    for (let i = -1; i <= 1; i++) {
        const angle = angleToCore + i * 0.2;
        game.enemyProjectiles.push({
            x: enemy.x,
            y: enemy.y,
            vx: Math.cos(angle) * 155,
            vy: Math.sin(angle) * 155,
            radius: 7,
            damage: 8,
            life: 5,
            color: "#ff7592"
        });
    }
    createExplosion(enemy.x, enemy.y, "#ff7592", 7);
    playTone(92, 0.12, "sawtooth", 0.035);
}

function updateEnemyProjectiles(dt) {
    const core = { x: canvas.width / 2, y: canvas.height / 2, radius: 39 };
    for (let i = game.enemyProjectiles.length - 1; i >= 0; i--) {
        const shot = game.enemyProjectiles[i];
        shot.x += shot.vx * dt;
        shot.y += shot.vy * dt;
        shot.life -= dt;

        if (distance(shot, game.player) < shot.radius + game.player.radius && game.player.invulnerable <= 0) {
            game.player.invulnerable = 0.7;
            game.combo = 1;
            game.screenShake = 4;
            createExplosion(shot.x, shot.y, shot.color, 8);
            game.enemyProjectiles.splice(i, 1);
            updateHud();
            continue;
        }
        if (distance(shot, core) < shot.radius + core.radius) {
            damageCore(shot.damage);
            createExplosion(shot.x, shot.y, shot.color, 8);
            game.enemyProjectiles.splice(i, 1);
        } else if (shot.life <= 0) {
            game.enemyProjectiles.splice(i, 1);
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
        game.spawnTimer = Math.max(0.24, 1.02 - game.wave * 0.06) + Math.random() * 0.42;
    }
    if (game.spawned >= game.waveTarget && game.enemies.length === 0) {
        completeWave();
    }
}

function completeWave() {
    game.score += 500 * game.wave;
    game.coreHealth = Math.min(100, game.coreHealth + game.waveRepair);
    game.enemyProjectiles.length = 0;
    game.betweenWaves = true;
    game.nextWaveTimer = Infinity;
    updateHud();
    openUpgradeScreen();
}

function openUpgradeScreen() {
    game.upgrading = true;
    pointer.down = false;
    game.currentUpgrades = getUpgradeChoices();
    ui.upgradeGrid.innerHTML = "";
    game.currentUpgrades.forEach((upgrade, index) => {
        const card = document.createElement("button");
        card.type = "button";
        card.className = "upgrade-card";
        card.innerHTML = `
            <span class="upgrade-number">0${index + 1}</span>
            <span class="upgrade-icon">${upgrade.icon}</span>
            <h3>${upgrade.name}</h3>
            <p>${upgrade.description}</p>
            <small>${upgrade.tag}</small>
        `;
        card.addEventListener("click", () => chooseUpgrade(index));
        ui.upgradeGrid.append(card);
    });
    ui.upgrade.classList.remove("hidden");
    ui.stateLabel.textContent = "Selecting breakthrough";
}

function getUpgradeChoices() {
    const available = upgradePool.filter((upgrade) => !upgrade.available || upgrade.available());
    const shuffled = [...available].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 3);
}

function chooseUpgrade(index) {
    if (!game.upgrading || !game.currentUpgrades[index]) return;
    game.currentUpgrades[index].apply();
    game.upgradeCount += 1;
    game.upgrading = false;
    game.currentUpgrades = [];
    game.betweenWaves = true;
    game.nextWaveTimer = 0.75;
    ui.upgrade.classList.add("hidden");
    ui.stateLabel.textContent = `${capitalize(selectedCharacter)} active`;
    playTone(720, 0.16, "sine", 0.05);
    updateHud();
    lastTime = performance.now();
}

function beginNextWave() {
    game.wave += 1;
    game.waveTarget = 8 + game.wave * 3 + (game.wave % 5 === 0 ? 1 : 0);
    game.spawned = 0;
    game.spawnTimer = 0.35;
    game.bossSpawned = false;
    game.betweenWaves = false;
    game.coreShield = game.maxShield;
    showWaveBanner();
    updateHud();
}

function spawnEnemy() {
    let type = pickEnemyType();
    if (game.wave % 5 === 0 && !game.bossSpawned) {
        type = "boss";
        game.bossSpawned = true;
    }
    spawnSpecific(type);
}

function pickEnemyType() {
    const roll = Math.random();
    if (game.wave >= 5 && roll > 0.89) return "reviewer";
    if (game.wave >= 4 && roll > 0.74) return "shield";
    if (game.wave >= 3 && roll > 0.58) return "replicator";
    if (game.wave >= 2 && roll > 0.34) return "deadline";
    return "bug";
}

function spawnSpecific(type, x, y, scaleOverride) {
    const base = enemyTypes[type];
    const position = x == null || y == null ? randomEdgePosition(type === "boss" ? 55 : 35) : { x, y };
    const scale = scaleOverride || 1 + (game.wave - 1) * (type === "boss" ? 0.13 : 0.085);
    const enemy = {
        ...base,
        id: ++enemyId,
        type,
        x: position.x,
        y: position.y,
        hp: base.hp * scale,
        maxHp: base.hp * scale,
        shield: (base.shield || 0) * scale,
        maxEnemyShield: (base.shield || 0) * scale,
        speed: base.speed * (1 + (game.wave - 1) * 0.022),
        pulse: Math.random() * Math.PI * 2,
        angle: 0,
        slowTimer: 0,
        hitFlash: 0,
        shootTimer: 1.4,
        summonTimer: 4.3
    };
    game.enemies.push(enemy);
    return enemy;
}

function randomEdgePosition(padding) {
    const side = Math.floor(Math.random() * 4);
    if (side === 0) return { x: Math.random() * canvas.width, y: -padding };
    if (side === 1) return { x: canvas.width + padding, y: Math.random() * canvas.height };
    if (side === 2) return { x: Math.random() * canvas.width, y: canvas.height + padding };
    return { x: -padding, y: Math.random() * canvas.height };
}

function destroyEnemy(index) {
    const enemy = game.enemies[index];
    if (!enemy) return;
    game.score += Math.round(enemy.points * game.combo);
    game.combo = Math.min(8, game.combo + (enemy.type === "boss" ? 1 : 0.25));
    game.comboTimer = 2.2;
    createExplosion(enemy.x, enemy.y, enemy.color, enemy.type === "boss" ? 44 : enemy.type === "reviewer" ? 22 : 11);
    game.enemies.splice(index, 1);

    if (enemy.type === "replicator") {
        spawnSpecific("bug", enemy.x - 12, enemy.y, 0.72);
        spawnSpecific("bug", enemy.x + 12, enemy.y, 0.72);
    }
    if (enemy.type === "boss") {
        game.coreHealth = Math.min(100, game.coreHealth + 25);
        spawnPowerup("citation", enemy.x, enemy.y);
        game.screenShake = 14;
    } else if (Math.random() < 0.05) {
        spawnPowerup(Math.random() < 0.5 ? "coffee" : "citation", enemy.x, enemy.y);
    }
    playTone(enemy.type === "boss" ? 72 : enemy.type === "reviewer" ? 105 : 150, enemy.type === "boss" ? 0.22 : 0.08, "sawtooth", 0.04);
    updateHud();
}

function damageCore(amount) {
    let remaining = amount * (1 - game.damageReduction);
    if (game.coreShield > 0) {
        const absorbed = Math.min(game.coreShield, remaining);
        game.coreShield -= absorbed;
        remaining -= absorbed;
    }
    game.coreHealth = Math.max(0, game.coreHealth - remaining);
    game.screenShake = 8;
    game.flash = 0.7;
    game.combo = 1;
    playTone(70, 0.18, "sawtooth", 0.06);
    updateHud();
    if (game.coreHealth <= 0) endGame();
}

function activateSkill() {
    if (!game.running || game.paused || game.upgrading || game.over || game.player.skillCooldown > 0) return;
    const player = game.player;
    player.skillCooldown = player.skillCooldownMax;

    if (selectedCharacter === "analyst") {
        game.enemies.forEach((enemy) => { enemy.slowTimer = Math.max(enemy.slowTimer, 4.5); });
        game.fieldEffect = { type: "freeze", life: 4.5, maxLife: 4.5 };
        createExplosion(player.x, player.y, "#9b87ff", 30);
        playTone(310, 0.28, "sine", 0.05);
    } else if (selectedCharacter === "hacker") {
        game.fieldEffect = { type: "pulse", life: 0.65, maxLife: 0.65 };
        for (let i = game.enemies.length - 1; i >= 0; i--) {
            const enemy = game.enemies[i];
            const range = distance(player, enemy);
            if (range <= 235) {
                const falloff = 1 - range / 470;
                damageEnemy(i, player.damage * 4.2 * falloff);
            }
        }
        createExplosion(player.x, player.y, "#39c9bd", 36);
        playTone(180, 0.22, "square", 0.055);
    } else {
        player.stormTimer = 6.5;
        player.boostTimer = Math.max(player.boostTimer, 6.5);
        game.fieldEffect = { type: "storm", life: 6.5, maxLife: 6.5 };
        createExplosion(player.x, player.y, "#f0a653", 22);
        playTone(620, 0.24, "triangle", 0.05);
    }
    updateAbilityHud();
}

function dash() {
    if (!game.running || game.paused || game.upgrading || game.over || game.player.dashCooldown > 0) return;
    const player = game.player;
    let dx = player.moveX || 0;
    let dy = player.moveY || 0;
    if (!dx && !dy) {
        dx = Math.cos(player.angle);
        dy = Math.sin(player.angle);
    }
    const startX = player.x;
    const startY = player.y;
    player.x = clamp(player.x + dx * 125, player.radius + 6, canvas.width - player.radius - 6);
    player.y = clamp(player.y + dy * 125, player.radius + 6, canvas.height - player.radius - 6);
    player.dashCooldown = player.dashCooldownMax;
    player.invulnerable = 0.42;
    for (let i = 0; i < 14; i++) {
        const t = i / 13;
        game.particles.push({
            x: startX + (player.x - startX) * t,
            y: startY + (player.y - startY) * t,
            vx: (Math.random() - 0.5) * 25,
            vy: (Math.random() - 0.5) * 25,
            color: player.color,
            life: 0.35,
            maxLife: 0.35,
            radius: 2.5
        });
    }
    playTone(240, 0.08, "sine", 0.035);
    updateAbilityHud();
}

function updateDrones(dt) {
    if (!game.drones) return;
    game.droneTimer -= dt;
    if (game.droneTimer > 0) return;
    const target = nearestEnemy(game.player.x, game.player.y);
    if (!target) return;
    for (let i = 0; i < game.drones; i++) {
        const position = dronePosition(i);
        shoot(performance.now(), {
            drone: true,
            x: position.x,
            y: position.y,
            angle: Math.atan2(target.y - position.y, target.x - position.x),
            count: 1
        });
    }
    game.droneTimer = Math.max(0.38, 0.82 - game.drones * 0.08);
}

function dronePosition(index) {
    const angle = game.elapsed * 1.7 + index * Math.PI * 2 / Math.max(1, game.drones);
    return {
        x: game.player.x + Math.cos(angle) * 38,
        y: game.player.y + Math.sin(angle) * 38
    };
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
        } else if (item.life <= 0) {
            game.powerups.splice(i, 1);
        }
    }
}

function endGame() {
    game.over = true;
    game.running = false;
    ui.hud.classList.add("hidden");
    ui.upgrade.classList.add("hidden");
    ui.gameOver.classList.remove("hidden");
    ui.pauseButton.disabled = true;
    const score = Math.round(game.score);
    const best = Math.max(score, Number(localStorage.getItem("thesisDefenseBest") || 0));
    localStorage.setItem("thesisDefenseBest", String(best));
    ui.finalScore.textContent = score.toLocaleString();
    ui.finalWave.textContent = game.wave;
    ui.bestScore.textContent = best.toLocaleString();
    ui.resultTitle.textContent = game.wave >= 10 ? "Defense passed with distinction." : game.wave >= 5 ? "Conditional pass granted." : game.wave >= 3 ? "Major revisions required." : "The committee was unconvinced.";
    ui.resultNote.textContent = `Build completed with ${game.upgradeCount} upgrades and ${game.drones} research assistant${game.drones === 1 ? "" : "s"}.`;
    ui.stateLabel.textContent = "Defense concluded";
    draw();
}

function togglePause() {
    if (!game.running || game.over || game.upgrading) return;
    game.paused = !game.paused;
    ui.pause.classList.toggle("hidden", !game.paused);
    ui.pauseButton.textContent = game.paused ? "Resume" : "Pause";
    ui.stateLabel.textContent = game.paused ? "Paused" : `${capitalize(selectedCharacter)} active`;
    if (!game.paused) lastTime = performance.now();
}

function showCharacterSelect() {
    game.running = false;
    ui.gameOver.classList.add("hidden");
    ui.upgrade.classList.add("hidden");
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
        drawEnemyProjectiles();
        drawEnemies();
        drawDrones();
        drawPlayer();
        drawFieldEffect();
        drawParticles();
        drawBossBar();
    } else {
        drawPreview();
    }
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
    if (game.coreShield > 0) {
        ctx.strokeStyle = "rgba(110,214,238,.7)";
        ctx.lineWidth = 5;
        ctx.shadowColor = "#6ed6ee";
        ctx.shadowBlur = 16;
        ctx.beginPath(); ctx.arc(0, 0, 51, 0, Math.PI * 2); ctx.stroke();
    }
    ctx.shadowColor = "#65dccd";
    ctx.shadowBlur = 28;
    ctx.fillStyle = "rgba(101,220,205,.15)";
    ctx.beginPath(); ctx.arc(0, 0, 46, 0, Math.PI * 2); ctx.fill();
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
    ctx.fillText(game.coreShield > 0 ? `SHIELD ${Math.ceil(game.coreShield)}` : "v2.0 FINAL", 0, 8);
    ctx.restore();
}

function drawPlayer() {
    const player = game.player;
    ctx.save();
    ctx.globalAlpha = player.invulnerable > 0 && Math.sin(game.elapsed * 30) > 0 ? 0.35 : 1;
    ctx.translate(player.x, player.y);
    ctx.rotate(player.angle);
    ctx.shadowColor = player.color;
    ctx.shadowBlur = 18;
    ctx.fillStyle = player.color;
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
    if (player.boostTimer > 0 || player.stormTimer > 0) {
        ctx.strokeStyle = `rgba(255,209,102,${0.45 + Math.sin(game.elapsed * 8) * 0.2})`;
        ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(player.x, player.y, 21, 0, Math.PI * 2); ctx.stroke();
    }
}

function drawEnemies() {
    game.enemies.forEach((enemy) => {
        ctx.save();
        ctx.translate(enemy.x, enemy.y);
        ctx.rotate(enemy.type === "deadline" ? enemy.pulse : enemy.angle);
        ctx.shadowColor = enemy.color;
        ctx.shadowBlur = enemy.type === "boss" ? 24 : enemy.type === "reviewer" ? 16 : 9;
        ctx.fillStyle = enemy.hitFlash > 0 ? "#ffffff" : enemy.color;
        if (enemy.type === "deadline" || enemy.type === "replicator") {
            ctx.beginPath();
            const points = enemy.type === "replicator" ? 6 : 8;
            for (let i = 0; i < points; i++) {
                const angle = i * Math.PI * 2 / points;
                const radius = i % 2 ? enemy.radius * 0.7 : enemy.radius;
                const px = Math.cos(angle) * radius;
                const py = Math.sin(angle) * radius;
                if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
            }
            ctx.closePath(); ctx.fill();
        } else if (enemy.type === "boss") {
            ctx.beginPath();
            for (let i = 0; i < 12; i++) {
                const angle = i * Math.PI / 6;
                const radius = i % 2 ? enemy.radius * 0.78 : enemy.radius;
                const px = Math.cos(angle) * radius;
                const py = Math.sin(angle) * radius;
                if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
            }
            ctx.closePath(); ctx.fill();
        } else {
            ctx.beginPath(); ctx.arc(0, 0, enemy.radius, 0, Math.PI * 2); ctx.fill();
        }
        if (enemy.type === "shield" && enemy.shield > 0) {
            ctx.strokeStyle = "rgba(220,249,255,.9)";
            ctx.lineWidth = 4;
            ctx.beginPath(); ctx.arc(0, 0, enemy.radius + 5, 0, Math.PI * 2); ctx.stroke();
        }
        ctx.shadowBlur = 0;
        ctx.fillStyle = enemy.type === "shield" ? "#172035" : "#fff";
        ctx.font = `700 ${enemy.type === "boss" ? 8 : enemy.type === "reviewer" ? 9 : 8}px Space Grotesk`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(enemy.label, 0, 0);
        ctx.restore();

        if (enemy.hp < enemy.maxHp && enemy.type !== "boss") {
            const width = enemy.radius * 2;
            ctx.fillStyle = "rgba(0,0,0,.45)";
            ctx.fillRect(enemy.x - width / 2, enemy.y - enemy.radius - 9, width, 3);
            ctx.fillStyle = "#70e2d7";
            ctx.fillRect(enemy.x - width / 2, enemy.y - enemy.radius - 9, width * Math.max(0, enemy.hp) / enemy.maxHp, 3);
        }
    });
}

function drawBossBar() {
    const boss = game.enemies.find((enemy) => enemy.type === "boss");
    if (!boss) return;
    const width = 330;
    const x = canvas.width / 2 - width / 2;
    const y = 63;
    ctx.fillStyle = "rgba(12,14,29,.88)";
    roundRect(ctx, x - 8, y - 15, width + 16, 32, 8);
    ctx.fill();
    ctx.fillStyle = "#8d91a7";
    ctx.font = "700 7px Space Grotesk";
    ctx.textAlign = "center";
    ctx.fillText("COMMITTEE CHAIR", canvas.width / 2, y - 5);
    ctx.fillStyle = "#34364d";
    ctx.fillRect(x, y, width, 6);
    ctx.fillStyle = "#d84f73";
    ctx.fillRect(x, y, width * Math.max(0, boss.hp) / boss.maxHp, 6);
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

function drawEnemyProjectiles() {
    game.enemyProjectiles.forEach((shot) => {
        ctx.shadowColor = shot.color;
        ctx.shadowBlur = 14;
        ctx.fillStyle = shot.color;
        ctx.beginPath(); ctx.arc(shot.x, shot.y, shot.radius, 0, Math.PI * 2); ctx.fill();
        ctx.shadowBlur = 0;
    });
}

function drawDrones() {
    for (let i = 0; i < game.drones; i++) {
        const position = dronePosition(i);
        ctx.shadowColor = "#70e2d7";
        ctx.shadowBlur = 12;
        ctx.fillStyle = "#70e2d7";
        ctx.beginPath(); ctx.arc(position.x, position.y, 6, 0, Math.PI * 2); ctx.fill();
        ctx.shadowBlur = 0;
        ctx.fillStyle = "#172035";
        ctx.font = "800 5px Space Grotesk";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("AI", position.x, position.y);
    }
}

function drawFieldEffect() {
    if (!game.fieldEffect) return;
    const effect = game.fieldEffect;
    const progress = 1 - effect.life / effect.maxLife;
    if (effect.type === "freeze") {
        ctx.strokeStyle = `rgba(155,135,255,${0.25 + Math.sin(game.elapsed * 5) * 0.08})`;
        ctx.lineWidth = 3;
        ctx.beginPath(); ctx.arc(canvas.width / 2, canvas.height / 2, 250, 0, Math.PI * 2); ctx.stroke();
    } else if (effect.type === "pulse") {
        ctx.strokeStyle = `rgba(57,201,189,${1 - progress})`;
        ctx.lineWidth = 7 * (1 - progress);
        ctx.beginPath(); ctx.arc(game.player.x, game.player.y, 235 * progress, 0, Math.PI * 2); ctx.stroke();
    } else {
        ctx.strokeStyle = `rgba(240,166,83,${0.3 + Math.sin(game.elapsed * 12) * 0.12})`;
        ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(game.player.x, game.player.y, 29, game.elapsed * 4, game.elapsed * 4 + Math.PI * 1.4); ctx.stroke();
    }
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
        const item = game.particles[i];
        item.x += item.vx * dt;
        item.y += item.vy * dt;
        item.vx *= 0.97;
        item.vy *= 0.97;
        item.life -= dt;
        if (item.life <= 0) game.particles.splice(i, 1);
    }
}

function drawParticles() {
    game.particles.forEach((item) => {
        ctx.globalAlpha = item.life / item.maxLife;
        ctx.fillStyle = item.color;
        ctx.beginPath(); ctx.arc(item.x, item.y, item.radius, 0, Math.PI * 2); ctx.fill();
    });
    ctx.globalAlpha = 1;
}

function drawPreview() {
    const x = canvas.width / 2;
    const y = canvas.height / 2;
    ctx.strokeStyle = "rgba(101,220,205,.18)";
    ctx.lineWidth = 2;
    for (let radius = 60; radius <= 180; radius += 40) {
        ctx.beginPath(); ctx.arc(x, y, radius, 0, Math.PI * 2); ctx.stroke();
    }
}

function updateHud() {
    ui.wave.textContent = game.wave;
    ui.score.textContent = String(Math.round(game.score)).padStart(5, "0");
    ui.combo.textContent = `x${game.combo.toFixed(game.combo % 1 ? 2 : 0)}`;
    ui.build.textContent = game.upgradeCount;
    ui.health.textContent = game.coreShield > 0 ? `${Math.ceil(game.coreHealth)}% +${Math.ceil(game.coreShield)}` : `${Math.ceil(game.coreHealth)}%`;
    ui.healthFill.style.width = `${game.coreHealth}%`;
    ui.healthFill.style.background = game.coreHealth > 55 ? "linear-gradient(90deg,#38c7bd,#7ae3b4)" : game.coreHealth > 25 ? "#ffd166" : "#ef5d6a";
    updateAbilityHud();
}

function updateAbilityHud() {
    if (!game.player) return;
    const player = game.player;
    const skillRatio = 1 - player.skillCooldown / player.skillCooldownMax;
    const dashRatio = 1 - player.dashCooldown / player.dashCooldownMax;
    ui.skillFill.style.width = `${clamp(skillRatio, 0, 1) * 100}%`;
    ui.dashFill.style.width = `${clamp(dashRatio, 0, 1) * 100}%`;
    ui.skillCooldown.textContent = player.skillCooldown <= 0 ? "READY" : `${player.skillCooldown.toFixed(1)}s`;
    ui.dashCooldown.textContent = player.dashCooldown <= 0 ? "READY" : `${player.dashCooldown.toFixed(1)}s`;
}

function showWaveBanner() {
    let name = waveNames[Math.min(game.wave - 1, waveNames.length - 1)];
    if (game.wave % 5 === 0) name = "BOSS: Committee Chair";
    else if (game.wave % 4 === 0) name = "Paywall Protocol";
    else if (game.wave % 3 === 0) name = "Replication Crisis";
    ui.waveBanner.innerHTML = `WAVE ${game.wave}<span>${name}</span>`;
    ui.waveBanner.classList.add("show");
    setTimeout(() => ui.waveBanner.classList.remove("show"), 1700);
}

function updatePointer(event) {
    const rect = canvas.getBoundingClientRect();
    pointer.x = (event.clientX - rect.left) / rect.width * canvas.width;
    pointer.y = (event.clientY - rect.top) / rect.height * canvas.height;
}

function nearestEnemy(x, y) {
    return game.enemies?.reduce((best, enemy) => {
        const currentDistance = Math.hypot(enemy.x - x, enemy.y - y);
        return !best || currentDistance < best.distance ? { ...enemy, distance: currentDistance } : best;
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
