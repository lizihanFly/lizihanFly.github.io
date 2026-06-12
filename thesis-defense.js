(() => {
  "use strict";

  const canvas = document.getElementById("game-canvas");
  const ctx = canvas.getContext("2d");
  const W = canvas.width;
  const H = canvas.height;

  const ui = {
    startScreen: document.getElementById("start-screen"),
    startButton: document.getElementById("start-button"),
    characterCards: [...document.querySelectorAll(".character-card")],
    gameHud: document.getElementById("game-hud"),
    floor: document.getElementById("floor-value"),
    room: document.getElementById("room-value"),
    score: document.getElementById("score-value"),
    coins: document.getElementById("coin-value"),
    health: document.getElementById("health-value"),
    healthFill: document.getElementById("health-fill"),
    roomBanner: document.getElementById("room-banner"),
    prompt: document.getElementById("interaction-prompt"),
    weaponSlots: [document.getElementById("weapon-slot-0"), document.getElementById("weapon-slot-1")],
    weaponQualities: [document.getElementById("weapon-quality-0"), document.getElementById("weapon-quality-1")],
    weaponNames: [document.getElementById("weapon-name-0"), document.getElementById("weapon-name-1")],
    ammo: document.getElementById("ammo-value"),
    reloadLabel: document.getElementById("reload-label"),
    skillName: document.getElementById("skill-name"),
    skillFill: document.getElementById("skill-fill"),
    skillCooldown: document.getElementById("skill-cooldown"),
    dashFill: document.getElementById("dash-fill"),
    dashCooldown: document.getElementById("dash-cooldown"),
    upgradeScreen: document.getElementById("upgrade-screen"),
    upgradeGrid: document.getElementById("upgrade-grid"),
    pauseScreen: document.getElementById("pause-screen"),
    pauseButton: document.getElementById("pause-button"),
    resumeButton: document.getElementById("resume-button"),
    gameOverScreen: document.getElementById("game-over-screen"),
    finalScore: document.getElementById("final-score"),
    finalWave: document.getElementById("final-wave"),
    bestScore: document.getElementById("best-score"),
    gameOverMessage: document.getElementById("game-over-message"),
    restartButton: document.getElementById("restart-button"),
    touchControls: document.getElementById("touch-controls"),
    touchInteract: document.getElementById("touch-interact"),
    touchSwap: document.getElementById("touch-swap"),
    touchReload: document.getElementById("touch-reload"),
    touchDash: document.getElementById("touch-dash"),
    touchAbility: document.getElementById("touch-ability"),
    touchFire: document.getElementById("touch-fire")
  };

  const qualities = {
    common: { name: "Common", color: "#aab2c0", mult: 1, mag: 1, label: "C" },
    uncommon: { name: "Uncommon", color: "#42d483", mult: 1.16, mag: 1.08, label: "U" },
    rare: { name: "Rare", color: "#4ea7ff", mult: 1.34, mag: 1.14, label: "R" },
    epic: { name: "Epic", color: "#b278ff", mult: 1.58, mag: 1.22, label: "E" },
    legendary: { name: "Legendary", color: "#ff9d3b", mult: 1.92, mag: 1.32, label: "L" }
  };

  const weaponBases = {
    pistol: {
      name: "Research Pistol", short: "Pistol", damage: 22, delay: .27, mag: 12,
      reload: 1.05, speed: 650, pellets: 1, spread: .02, pierce: 0, explosive: 0, color: "#dce4ef"
    },
    smg: {
      name: "Citation SMG", short: "SMG", damage: 10, delay: .085, mag: 30,
      reload: 1.35, speed: 720, pellets: 1, spread: .1, pierce: 0, explosive: 0, color: "#74dcad"
    },
    shotgun: {
      name: "Scatter Thesis", short: "Shotgun", damage: 12, delay: .58, mag: 7,
      reload: 1.55, speed: 570, pellets: 6, spread: .38, pierce: 0, explosive: 0, color: "#ffcb72"
    },
    railgun: {
      name: "Peer Review Railgun", short: "Railgun", damage: 63, delay: .76, mag: 5,
      reload: 1.8, speed: 980, pellets: 1, spread: .008, pierce: 3, explosive: 0, color: "#79c5ff"
    },
    laser: {
      name: "Laser Pointer", short: "Laser", damage: 8, delay: .055, mag: 42,
      reload: 1.48, speed: 900, pellets: 1, spread: .035, pierce: 1, explosive: 0, color: "#ff6e96"
    },
    launcher: {
      name: "Grant Launcher", short: "Launcher", damage: 38, delay: .82, mag: 4,
      reload: 1.95, speed: 440, pellets: 1, spread: .03, pierce: 0, explosive: 82, color: "#c692ff"
    },
    burst: {
      name: "Footnote Repeater", short: "Repeater", damage: 16, delay: .145, mag: 21,
      reload: 1.25, speed: 760, pellets: 1, spread: .055, pierce: 0, explosive: 0, color: "#95e3ec"
    }
  };

  const characters = {
    analyst: {
      name: "Analyst", color: "#5e8dd8", speed: 245, maxHealth: 100, damage: 1.18,
      skill: "Data Freeze", skillCooldown: 13
    },
    hacker: {
      name: "Hacker", color: "#45b980", speed: 280, maxHealth: 95, damage: 1,
      skill: "EMP Pulse", skillCooldown: 10
    },
    writer: {
      name: "Writer", color: "#9a69d3", speed: 230, maxHealth: 125, damage: 1.08,
      skill: "Citation Storm", skillCooldown: 12
    }
  };

  const enemyTypes = {
    bug: { name: "Bug", color: "#ef6678", hp: 42, speed: 95, damage: 12, radius: 17, score: 45 },
    deadline: { name: "Deadline", color: "#ffb34f", hp: 31, speed: 154, damage: 10, radius: 14, score: 55 },
    reviewer: { name: "Reviewer", color: "#9876e8", hp: 72, speed: 68, damage: 13, radius: 20, score: 85, ranged: true },
    replicator: { name: "Replication Error", color: "#54d19a", hp: 55, speed: 83, damage: 10, radius: 18, score: 75, split: true },
    shield: { name: "Major Revision", color: "#57a9dc", hp: 105, speed: 58, damage: 17, radius: 23, score: 100, armor: .28 },
    boss: { name: "Final Committee", color: "#e756a5", hp: 670, speed: 52, damage: 22, radius: 43, score: 900, ranged: true, boss: true }
  };

  const talents = [
    { id: "damage", icon: "DMG", name: "Stronger Argument", text: "+16% weapon damage.", apply: s => s.damageMult *= 1.16 },
    { id: "health", icon: "HP", name: "Extended Abstract", text: "+25 maximum integrity and heal 30.", apply: s => { s.maxHealth += 25; s.health = Math.min(s.maxHealth, s.health + 30); } },
    { id: "speed", icon: "SPD", name: "Fast Literature Scan", text: "+12% movement speed.", apply: s => s.speedMult *= 1.12 },
    { id: "reload", icon: "RLD", name: "Clean Methodology", text: "Reload weapons 20% faster.", apply: s => s.reloadMult *= .8 },
    { id: "skill", icon: "SKL", name: "Focused Research", text: "Active skill cooldown -22%.", apply: s => s.skillMult *= .78 },
    { id: "armor", icon: "DEF", name: "Reviewer Response", text: "Take 12% less damage.", apply: s => s.armor = Math.min(.48, s.armor + .12) },
    { id: "loot", icon: "LCK", name: "Better Evidence", text: "Improve future weapon quality.", apply: s => s.luck += .12 },
    { id: "ammo", icon: "AMO", name: "Efficient Citations", text: "+35% reserve ammo and refill both weapons.", apply: s => {
      s.ammoMult *= 1.35;
      s.inventory.filter(Boolean).forEach(w => { w.reserve = Math.round(w.reserve * 1.35 + w.mag); });
    } }
  ];

  const roomNames = ["Literature Maze", "Method Lab", "Data Archive", "Revision Hall", "Committee Chamber"];
  const keys = Object.create(null);
  const touchKeys = { up: false, down: false, left: false, right: false };
  const pointer = { x: W * .75, y: H * .5, down: false, inside: false };
  let selectedCharacter = "analyst";
  let lastTime = 0;
  let animationId = 0;
  let state = null;

  function makeState() {
    const c = characters[selectedCharacter];
    return {
      running: true,
      paused: false,
      choosingTalent: false,
      gameOver: false,
      floor: 1,
      room: 1,
      clearedRooms: 0,
      roomState: "combat",
      score: 0,
      coins: 0,
      health: c.maxHealth,
      maxHealth: c.maxHealth,
      damageMult: c.damage,
      speedMult: 1,
      reloadMult: 1,
      skillMult: 1,
      ammoMult: 1,
      armor: 0,
      luck: 0,
      player: {
        x: 120, y: H / 2, radius: 17, angle: 0, color: c.color, speed: c.speed,
        invulnerable: 0, dashCooldown: 0, dashTime: 0, dashX: 0, dashY: 0,
        skillCooldown: 0, fireCooldown: 0, reloading: 0
      },
      inventory: [createWeapon("pistol", "common"), null],
      activeSlot: 0,
      enemies: [],
      bullets: [],
      enemyBullets: [],
      particles: [],
      pickups: [],
      interactables: [],
      obstacles: [],
      pendingSpawns: 0,
      spawnTimer: 0,
      shake: 0,
      bannerTimer: 0,
      message: "",
      messageTimer: 0
    };
  }

  function createWeapon(baseId, qualityId) {
    const base = weaponBases[baseId];
    const quality = qualities[qualityId];
    const mag = Math.max(1, Math.round(base.mag * quality.mag));
    return {
      baseId, qualityId, name: base.name, short: base.short, color: base.color,
      damage: Math.round(base.damage * quality.mult * 10) / 10,
      delay: base.delay / (qualityId === "legendary" ? 1.12 : 1),
      mag, ammo: mag, reserve: mag * 6, reload: base.reload,
      speed: base.speed, pellets: base.pellets, spread: base.spread,
      pierce: base.pierce + (qualityId === "legendary" && base.pierce === 0 ? 1 : 0),
      explosive: base.explosive + (qualityId === "legendary" && baseId !== "launcher" ? 32 : 0)
    };
  }

  function startGame() {
    state = makeState();
    ui.startScreen.hidden = true;
    ui.gameOverScreen.hidden = true;
    ui.pauseScreen.hidden = true;
    ui.upgradeScreen.hidden = true;
    ui.gameHud.hidden = false;
    ui.touchControls.hidden = !isTouchDevice();
    ui.skillName.textContent = characters[selectedCharacter].skill;
    startRoom();
    lastTime = performance.now();
    cancelAnimationFrame(animationId);
    animationId = requestAnimationFrame(loop);
  }

  function startRoom() {
    const s = state;
    s.roomState = "combat";
    s.enemies = [];
    s.bullets = [];
    s.enemyBullets = [];
    s.pickups = [];
    s.interactables = [];
    s.particles = [];
    s.player.x = 105;
    s.player.y = H / 2;
    s.player.reloading = 0;
    s.obstacles = buildRoomLayout(s.room);
    s.pendingSpawns = s.room === 5 ? Math.min(3 + s.floor, 8) : 3 + s.floor + s.room * 2;
    s.spawnTimer = .25;
    if (s.room === 5) spawnEnemy("boss", W - 190, H / 2);
    showBanner(`Floor ${s.floor} / ${roomNames[s.room - 1]}`);
    updateHud();
  }

  function buildRoomLayout(room) {
    const layouts = [
      [{ x: 390, y: 175, w: 70, h: 125 }, { x: 390, y: 380, w: 70, h: 125 }, { x: 700, y: 270, w: 80, h: 140 }],
      [{ x: 305, y: 250, w: 140, h: 70 }, { x: 650, y: 160, w: 80, h: 120 }, { x: 650, y: 400, w: 80, h: 120 }],
      [{ x: 300, y: 140, w: 78, h: 155 }, { x: 520, y: 385, w: 78, h: 155 }, { x: 755, y: 140, w: 78, h: 155 }],
      [{ x: 335, y: 285, w: 100, h: 100 }, { x: 665, y: 285, w: 100, h: 100 }, { x: 500, y: 120, w: 100, h: 75 }],
      [{ x: 285, y: 175, w: 65, h: 115 }, { x: 285, y: 390, w: 65, h: 115 }, { x: 750, y: 175, w: 65, h: 115 }, { x: 750, y: 390, w: 65, h: 115 }]
    ];
    return layouts[(room - 1) % layouts.length].map(o => ({ ...o }));
  }

  function loop(now) {
    if (!state || !state.running) return;
    const dt = Math.min((now - lastTime) / 1000, .034);
    lastTime = now;
    if (!state.paused && !state.choosingTalent && !state.gameOver) update(dt);
    draw();
    animationId = requestAnimationFrame(loop);
  }

  function update(dt) {
    updatePlayer(dt);
    updateSpawning(dt);
    updateEnemies(dt);
    updateBullets(dt);
    updateEnemyBullets(dt);
    updatePickups(dt);
    updateParticles(dt);
    updateInteraction();

    if (state.roomState === "combat" && state.pendingSpawns <= 0 && state.enemies.length === 0) {
      clearRoom();
    }

    state.shake = Math.max(0, state.shake - dt * 22);
    state.bannerTimer = Math.max(0, state.bannerTimer - dt);
    state.messageTimer = Math.max(0, state.messageTimer - dt);
    ui.roomBanner.hidden = state.bannerTimer <= 0;
    updateHud();
  }

  function updatePlayer(dt) {
    const p = state.player;
    p.invulnerable = Math.max(0, p.invulnerable - dt);
    p.dashCooldown = Math.max(0, p.dashCooldown - dt);
    p.skillCooldown = Math.max(0, p.skillCooldown - dt);
    p.fireCooldown = Math.max(0, p.fireCooldown - dt);

    let dx = (keys.KeyD || keys.ArrowRight || touchKeys.right ? 1 : 0) - (keys.KeyA || keys.ArrowLeft || touchKeys.left ? 1 : 0);
    let dy = (keys.KeyS || keys.ArrowDown || touchKeys.down ? 1 : 0) - (keys.KeyW || keys.ArrowUp || touchKeys.up ? 1 : 0);
    const length = Math.hypot(dx, dy) || 1;
    dx /= length;
    dy /= length;

    if (p.dashTime > 0) {
      p.dashTime -= dt;
      moveCircle(p, p.dashX * 660 * dt, p.dashY * 660 * dt);
      addParticle(p.x, p.y, p.color, 2, 22);
    } else {
      moveCircle(p, dx * p.speed * state.speedMult * dt, dy * p.speed * state.speedMult * dt);
    }

    const autoTarget = !pointer.inside ? nearestEnemy(p.x, p.y) : null;
    const aimX = autoTarget ? autoTarget.x : pointer.x;
    const aimY = autoTarget ? autoTarget.y : pointer.y;
    p.angle = Math.atan2(aimY - p.y, aimX - p.x);

    if ((pointer.down || keys.Space) && !p.reloading) fireWeapon();

    if (p.reloading > 0) {
      p.reloading -= dt;
      if (p.reloading <= 0) finishReload();
    }
  }

  function updateSpawning(dt) {
    if (state.roomState !== "combat" || state.pendingSpawns <= 0) return;
    state.spawnTimer -= dt;
    if (state.spawnTimer > 0) return;
    const cap = 4 + Math.min(state.floor, 3);
    if (state.enemies.length >= cap) {
      state.spawnTimer = .25;
      return;
    }
    spawnEnemy(chooseEnemyType());
    state.pendingSpawns--;
    state.spawnTimer = Math.max(.28, .7 - state.floor * .025);
  }

  function chooseEnemyType() {
    const r = Math.random();
    if (state.floor >= 3 && r < .13) return "shield";
    if (state.floor >= 2 && r < .28) return "replicator";
    if (r < .47) return "reviewer";
    if (r < .68) return "deadline";
    return "bug";
  }

  function spawnEnemy(typeId, forcedX, forcedY, miniature = false) {
    const type = enemyTypes[typeId];
    let x = forcedX;
    let y = forcedY;
    if (x === undefined) {
      const edge = Math.random();
      if (edge < .5) {
        x = W - 85;
        y = 85 + Math.random() * (H - 170);
      } else {
        x = 180 + Math.random() * (W - 280);
        y = edge < .75 ? 75 : H - 75;
      }
    }
    const floorScale = 1 + (state.floor - 1) * .19 + (state.room - 1) * .035;
    const sizeScale = miniature ? .65 : 1;
    const hp = type.hp * floorScale * (miniature ? .42 : 1);
    state.enemies.push({
      typeId, x, y, radius: type.radius * sizeScale, color: type.color,
      hp, maxHp: hp, speed: type.speed * (1 + (state.floor - 1) * .045),
      damage: type.damage * (1 + (state.floor - 1) * .12),
      score: Math.round(type.score * floorScale), armor: type.armor || 0,
      ranged: type.ranged, boss: type.boss, split: type.split && !miniature,
      attackCooldown: .4 + Math.random(), shootCooldown: .7 + Math.random(),
      summonCooldown: 6, frozen: 0, flash: 0, miniature
    });
  }

  function updateEnemies(dt) {
    const p = state.player;
    state.enemies.forEach(e => {
      e.flash = Math.max(0, e.flash - dt);
      e.frozen = Math.max(0, e.frozen - dt);
      e.attackCooldown -= dt;
      e.shootCooldown -= dt;
      e.summonCooldown -= dt;
      if (e.frozen > 0) return;

      const dist = distance(e, p);
      let desired = e.ranged ? 260 : e.radius + p.radius + 7;
      let vx = 0;
      let vy = 0;
      if (dist > desired + 18) {
        vx = (p.x - e.x) / Math.max(dist, 1);
        vy = (p.y - e.y) / Math.max(dist, 1);
      } else if (e.ranged && dist < desired - 55) {
        vx = (e.x - p.x) / Math.max(dist, 1);
        vy = (e.y - p.y) / Math.max(dist, 1);
      }
      const strafe = e.ranged ? Math.sin(performance.now() * .0015 + e.x) * .32 : 0;
      moveCircle(e, (vx - vy * strafe) * e.speed * dt, (vy + vx * strafe) * e.speed * dt);

      if (dist < e.radius + p.radius + 4 && e.attackCooldown <= 0) {
        damagePlayer(e.damage);
        e.attackCooldown = e.boss ? .7 : 1;
        const knock = 18;
        moveCircle(p, (p.x - e.x) / Math.max(dist, 1) * knock, (p.y - e.y) / Math.max(dist, 1) * knock);
      }

      if (e.ranged && e.shootCooldown <= 0 && dist < 520) {
        shootEnemy(e);
        e.shootCooldown = e.boss ? .82 : 1.65 + Math.random() * .45;
      }
      if (e.boss && e.summonCooldown <= 0 && state.enemies.length < 8) {
        spawnEnemy(Math.random() < .5 ? "deadline" : "bug", e.x + random(-70, 70), e.y + random(-70, 70), true);
        spawnEnemy("bug", e.x + random(-70, 70), e.y + random(-70, 70), true);
        e.summonCooldown = 5.5;
        showMessage("The committee requested more reviewers.");
      }
    });
  }

  function shootEnemy(e) {
    const angle = Math.atan2(state.player.y - e.y, state.player.x - e.x);
    const count = e.boss ? 5 : 1;
    for (let i = 0; i < count; i++) {
      const spread = e.boss ? (i - 2) * .16 : 0;
      state.enemyBullets.push({
        x: e.x, y: e.y, vx: Math.cos(angle + spread) * (e.boss ? 285 : 245),
        vy: Math.sin(angle + spread) * (e.boss ? 285 : 245),
        radius: e.boss ? 7 : 5, damage: e.damage * .75, life: 4, color: e.color
      });
    }
  }

  function fireWeapon() {
    const p = state.player;
    const weapon = activeWeapon();
    if (!weapon || p.fireCooldown > 0 || p.reloading > 0) return;
    if (weapon.ammo <= 0) {
      startReload();
      return;
    }
    weapon.ammo--;
    p.fireCooldown = weapon.delay;
    const quality = qualities[weapon.qualityId];
    for (let i = 0; i < weapon.pellets; i++) {
      const offset = weapon.pellets === 1 ? random(-weapon.spread, weapon.spread) : (i / (weapon.pellets - 1) - .5) * weapon.spread + random(-.025, .025);
      const angle = p.angle + offset;
      state.bullets.push({
        x: p.x + Math.cos(angle) * 25, y: p.y + Math.sin(angle) * 25,
        vx: Math.cos(angle) * weapon.speed, vy: Math.sin(angle) * weapon.speed,
        radius: weapon.baseId === "launcher" ? 7 : weapon.baseId === "railgun" ? 4 : 3.5,
        damage: weapon.damage * state.damageMult, life: 1.7, pierce: weapon.pierce,
        explosive: weapon.explosive, color: quality.color, hit: new Set()
      });
    }
    state.shake = Math.min(5, state.shake + (weapon.pellets > 1 || weapon.explosive ? 2.2 : .5));
    addParticle(p.x + Math.cos(p.angle) * 25, p.y + Math.sin(p.angle) * 25, quality.color, 4, 50);
    if (weapon.ammo <= 0) setTimeout(() => { if (state && state.player.reloading <= 0) startReload(); }, 120);
  }

  function updateBullets(dt) {
    for (let i = state.bullets.length - 1; i >= 0; i--) {
      const b = state.bullets[i];
      b.x += b.vx * dt;
      b.y += b.vy * dt;
      b.life -= dt;
      let remove = b.life <= 0 || b.x < 35 || b.x > W - 35 || b.y < 35 || b.y > H - 35 || circleHitsObstacle(b);
      for (let j = state.enemies.length - 1; j >= 0 && !remove; j--) {
        const e = state.enemies[j];
        if (b.hit.has(e) || distance(b, e) > b.radius + e.radius) continue;
        b.hit.add(e);
        hitEnemy(e, b.damage);
        if (b.explosive) {
          explode(b.x, b.y, b.explosive, b.damage * .72, b.color, e);
          remove = true;
        } else if (b.pierce > 0) {
          b.pierce--;
          b.damage *= .84;
        } else {
          remove = true;
        }
      }
      if (remove) state.bullets.splice(i, 1);
    }
  }

  function updateEnemyBullets(dt) {
    for (let i = state.enemyBullets.length - 1; i >= 0; i--) {
      const b = state.enemyBullets[i];
      b.x += b.vx * dt;
      b.y += b.vy * dt;
      b.life -= dt;
      if (distance(b, state.player) < b.radius + state.player.radius) {
        damagePlayer(b.damage);
        state.enemyBullets.splice(i, 1);
      } else if (b.life <= 0 || b.x < 30 || b.x > W - 30 || b.y < 30 || b.y > H - 30 || circleHitsObstacle(b)) {
        state.enemyBullets.splice(i, 1);
      }
    }
  }

  function hitEnemy(enemy, damage) {
    const effective = damage * (1 - enemy.armor);
    enemy.hp -= effective;
    enemy.flash = .09;
    addParticle(enemy.x, enemy.y, enemy.color, 3, 45);
    if (enemy.hp > 0) return;
    const index = state.enemies.indexOf(enemy);
    if (index < 0) return;
    state.enemies.splice(index, 1);
    state.score += enemy.score;
    state.coins += enemy.boss ? 20 : 1 + (Math.random() < .18 ? 1 : 0);
    addParticle(enemy.x, enemy.y, enemy.color, enemy.boss ? 30 : 10, enemy.boss ? 150 : 95);
    if (enemy.split) {
      spawnEnemy("bug", enemy.x - 16, enemy.y, true);
      spawnEnemy("bug", enemy.x + 16, enemy.y, true);
    }
    if (!enemy.boss) maybeDrop(enemy.x, enemy.y);
    state.shake = enemy.boss ? 12 : 3;
  }

  function explode(x, y, radius, damage, color, ignored) {
    addParticle(x, y, color, 18, radius * 1.8);
    state.enemies.slice().forEach(e => {
      if (e !== ignored && distance({ x, y }, e) < radius + e.radius) {
        const falloff = 1 - Math.min(.55, distance({ x, y }, e) / (radius * 2));
        hitEnemy(e, damage * falloff);
      }
    });
    state.shake = 8;
  }

  function maybeDrop(x, y) {
    const r = Math.random();
    if (r < .08) state.pickups.push({ type: "health", x, y, radius: 10, amount: 18, pulse: 0 });
    else if (r < .22) state.pickups.push({ type: "ammo", x, y, radius: 10, amount: .32, pulse: 0 });
    else if (r < .36) state.pickups.push({ type: "coin", x, y, radius: 8, amount: 3, pulse: 0 });
  }

  function updatePickups(dt) {
    for (let i = state.pickups.length - 1; i >= 0; i--) {
      const item = state.pickups[i];
      item.pulse += dt;
      if (item.type === "weapon") continue;
      if (distance(item, state.player) > item.radius + state.player.radius + 5) continue;
      if (item.type === "health") {
        if (state.health >= state.maxHealth) continue;
        state.health = Math.min(state.maxHealth, state.health + item.amount);
        showMessage(`Integrity +${item.amount}`);
      } else if (item.type === "ammo") {
        state.inventory.filter(Boolean).forEach(w => { w.reserve += Math.ceil(w.mag * item.amount); });
        showMessage("Citation ammo restored");
      } else {
        state.coins += item.amount;
        state.score += item.amount * 8;
      }
      addParticle(item.x, item.y, pickupColor(item.type), 8, 75);
      state.pickups.splice(i, 1);
    }
  }

  function clearRoom() {
    state.roomState = "cleared";
    state.clearedRooms++;
    state.score += 120 * state.floor * state.room;
    state.enemyBullets = [];
    const chestQuality = state.room === 5 ? "boss" : "normal";
    state.interactables.push({ type: "chest", x: W / 2, y: H / 2, radius: 28, opened: false, tier: chestQuality });
    state.interactables.push({ type: "portal", x: W - 78, y: H / 2, radius: 30 });
    showBanner(state.room === 5 ? "Committee Defeated" : "Room Cleared");
    showMessage("Open the evidence chest, then use the portal.");
  }

  function updateInteraction() {
    const target = nearestInteractable();
    if (!target) {
      ui.prompt.hidden = true;
      return;
    }
    ui.prompt.hidden = false;
    if (target.type === "chest") ui.prompt.textContent = "F  Open evidence chest";
    if (target.type === "portal") ui.prompt.textContent = state.room === 5 ? "F  Complete floor" : "F  Enter next room";
    if (target.type === "weapon") {
      const q = qualities[target.weapon.qualityId];
      ui.prompt.textContent = `F  Pick up ${q.name} ${target.weapon.name}`;
    }
  }

  function interact() {
    if (!state || state.paused || state.choosingTalent || state.gameOver) return;
    const target = nearestInteractable();
    if (!target) return;
    if (target.type === "chest") openChest(target);
    else if (target.type === "weapon") collectWeapon(target);
    else if (target.type === "portal") {
      if (state.room < 5) {
        state.room++;
        startRoom();
      } else {
        openTalentChoice();
      }
    }
  }

  function nearestInteractable() {
    if (!state) return null;
    const candidates = [
      ...state.interactables.filter(i => !i.opened),
      ...state.pickups.filter(i => i.type === "weapon")
    ];
    let nearest = null;
    let best = 74;
    candidates.forEach(item => {
      const d = distance(item, state.player);
      if (d < best) {
        best = d;
        nearest = item;
      }
    });
    return nearest;
  }

  function openChest(chest) {
    chest.opened = true;
    const qualityId = rollQuality(chest.tier === "boss");
    const ids = Object.keys(weaponBases);
    let baseId = ids[Math.floor(Math.random() * ids.length)];
    const current = activeWeapon();
    if (ids.length > 1 && current && baseId === current.baseId) baseId = ids[(ids.indexOf(baseId) + 1 + Math.floor(Math.random() * (ids.length - 1))) % ids.length];
    const weapon = createWeapon(baseId, qualityId);
    weapon.reserve = Math.round(weapon.reserve * state.ammoMult);
    state.pickups.push({ type: "weapon", x: chest.x, y: chest.y + 48, radius: 18, weapon, pulse: 0 });
    state.pickups.push({ type: "ammo", x: chest.x - 42, y: chest.y + 22, radius: 10, amount: .42, pulse: 0 });
    if (Math.random() < .5 || chest.tier === "boss") state.pickups.push({ type: "health", x: chest.x + 42, y: chest.y + 22, radius: 10, amount: 22, pulse: 0 });
    showMessage(`${qualities[qualityId].name} evidence discovered.`);
    addParticle(chest.x, chest.y, qualities[qualityId].color, 24, 125);
  }

  function collectWeapon(item) {
    const empty = state.inventory.findIndex(w => !w);
    if (empty >= 0) {
      state.inventory[empty] = item.weapon;
      state.activeSlot = empty;
      showMessage(`${item.weapon.name} added to slot ${empty + 1}.`);
    } else {
      const old = state.inventory[state.activeSlot];
      state.inventory[state.activeSlot] = item.weapon;
      item.weapon = old;
      item.x += 48;
      showMessage(`Replaced ${old.name}. Press F again to swap back.`);
      state.player.reloading = 0;
      updateHud();
      return;
    }
    state.pickups.splice(state.pickups.indexOf(item), 1);
    state.player.reloading = 0;
    updateHud();
  }

  function rollQuality(bossChest = false) {
    const boost = Math.min(.34, (state.floor - 1) * .035 + state.luck + (bossChest ? .18 : 0));
    const r = Math.random();
    if (r < .02 + boost * .18) return "legendary";
    if (r < .09 + boost * .46) return "epic";
    if (r < .27 + boost * .72) return "rare";
    if (r < .61 + boost) return "uncommon";
    return "common";
  }

  function switchWeapon(slot) {
    if (!state || !state.inventory[slot] || slot === state.activeSlot) return;
    state.activeSlot = slot;
    state.player.reloading = 0;
    state.player.fireCooldown = Math.min(state.player.fireCooldown, .12);
    showMessage(state.inventory[slot].name);
    updateHud();
  }

  function cycleWeapon() {
    if (!state) return;
    const other = state.activeSlot === 0 ? 1 : 0;
    if (state.inventory[other]) switchWeapon(other);
  }

  function activeWeapon() {
    return state ? state.inventory[state.activeSlot] : null;
  }

  function startReload() {
    if (!state) return;
    const w = activeWeapon();
    if (!w || state.player.reloading > 0 || w.ammo >= w.mag || w.reserve <= 0) return;
    state.player.reloading = w.reload * state.reloadMult;
  }

  function finishReload() {
    const w = activeWeapon();
    if (!w) return;
    const amount = Math.min(w.mag - w.ammo, w.reserve);
    w.ammo += amount;
    w.reserve -= amount;
    state.player.reloading = 0;
  }

  function useDash() {
    if (!state || state.player.dashCooldown > 0 || state.paused || state.choosingTalent) return;
    let dx = (keys.KeyD || keys.ArrowRight || touchKeys.right ? 1 : 0) - (keys.KeyA || keys.ArrowLeft || touchKeys.left ? 1 : 0);
    let dy = (keys.KeyS || keys.ArrowDown || touchKeys.down ? 1 : 0) - (keys.KeyW || keys.ArrowUp || touchKeys.up ? 1 : 0);
    if (!dx && !dy) {
      dx = Math.cos(state.player.angle);
      dy = Math.sin(state.player.angle);
    }
    const len = Math.hypot(dx, dy) || 1;
    state.player.dashX = dx / len;
    state.player.dashY = dy / len;
    state.player.dashTime = .18;
    state.player.dashCooldown = 2.15;
    state.player.invulnerable = .28;
  }

  function useSkill() {
    if (!state || state.player.skillCooldown > 0 || state.paused || state.choosingTalent) return;
    const p = state.player;
    const c = characters[selectedCharacter];
    p.skillCooldown = c.skillCooldown * state.skillMult;
    if (selectedCharacter === "analyst") {
      state.enemies.forEach(e => {
        if (distance(e, p) < 430) e.frozen = e.boss ? 2 : 4.2;
      });
      showMessage("Data Freeze: nearby threats suspended.");
      addParticle(p.x, p.y, "#78c8ff", 32, 190);
    } else if (selectedCharacter === "hacker") {
      state.enemies.slice().forEach(e => {
        if (distance(e, p) < 260) hitEnemy(e, 48 * state.damageMult);
      });
      state.enemyBullets = state.enemyBullets.filter(b => distance(b, p) > 285);
      showMessage("EMP Pulse: threats disrupted.");
      addParticle(p.x, p.y, "#4fe1a3", 36, 220);
    } else {
      for (let i = 0; i < 18; i++) {
        const a = i / 18 * Math.PI * 2;
        state.bullets.push({
          x: p.x, y: p.y, vx: Math.cos(a) * 520, vy: Math.sin(a) * 520,
          radius: 4, damage: 27 * state.damageMult, life: 1.2, pierce: 1,
          explosive: 0, color: "#cb98ff", hit: new Set()
        });
      }
      showMessage("Citation Storm: arguments everywhere.");
    }
  }

  function openTalentChoice() {
    state.choosingTalent = true;
    ui.upgradeGrid.innerHTML = "";
    const options = shuffled(talents).slice(0, 3);
    options.forEach(talent => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "upgrade-card";
      button.innerHTML = `<span class="upgrade-icon">${talent.icon}</span><strong>${talent.name}</strong><p>${talent.text}</p>`;
      button.addEventListener("click", () => {
        talent.apply(state);
        state.floor++;
        state.room = 1;
        state.choosingTalent = false;
        ui.upgradeScreen.hidden = true;
        startRoom();
      }, { once: true });
      ui.upgradeGrid.appendChild(button);
    });
    ui.upgradeScreen.hidden = false;
  }

  function damagePlayer(amount) {
    const p = state.player;
    if (p.invulnerable > 0) return;
    const actual = Math.max(1, Math.round(amount * (1 - state.armor)));
    state.health -= actual;
    p.invulnerable = .62;
    state.shake = 9;
    addParticle(p.x, p.y, "#ff657c", 12, 100);
    if (state.health <= 0) endGame();
  }

  function endGame() {
    state.health = 0;
    state.gameOver = true;
    const best = Math.max(Number(localStorage.getItem("thesisDungeonBest") || 0), Math.round(state.score));
    localStorage.setItem("thesisDungeonBest", String(best));
    ui.finalScore.textContent = Math.round(state.score).toLocaleString();
    ui.finalWave.textContent = String(state.clearedRooms);
    ui.bestScore.textContent = best.toLocaleString();
    ui.gameOverMessage.textContent = state.floor >= 3
      ? "A strong run. The committee recommends a focused revision."
      : "Rebuild the loadout, compare weapon qualities, and try a new researcher.";
    ui.gameOverScreen.hidden = false;
    ui.touchControls.hidden = true;
  }

  function moveCircle(entity, dx, dy) {
    entity.x += dx;
    if (circleHitsObstacle(entity)) entity.x -= dx;
    entity.y += dy;
    if (circleHitsObstacle(entity)) entity.y -= dy;
    entity.x = clamp(entity.x, 48 + entity.radius, W - 48 - entity.radius);
    entity.y = clamp(entity.y, 58 + entity.radius, H - 48 - entity.radius);
  }

  function circleHitsObstacle(circle) {
    return state.obstacles.some(o => {
      const x = clamp(circle.x, o.x, o.x + o.w);
      const y = clamp(circle.y, o.y, o.y + o.h);
      return Math.hypot(circle.x - x, circle.y - y) < circle.radius;
    });
  }

  function draw() {
    if (!state) {
      drawBackdrop();
      return;
    }
    ctx.save();
    if (state.shake > 0) ctx.translate(random(-state.shake, state.shake), random(-state.shake, state.shake));
    drawRoom();
    drawInteractables();
    drawPickups();
    drawParticles();
    state.bullets.forEach(drawBullet);
    state.enemyBullets.forEach(drawEnemyBullet);
    state.enemies.forEach(drawEnemy);
    drawPlayer();
    drawBossBar();
    if (state.messageTimer > 0) drawMessage();
    ctx.restore();
  }

  function drawBackdrop() {
    const gradient = ctx.createLinearGradient(0, 0, W, H);
    gradient.addColorStop(0, "#131a2d");
    gradient.addColorStop(1, "#1c1830");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = "rgba(255,255,255,.025)";
    for (let x = 0; x < W; x += 42) for (let y = 0; y < H; y += 42) ctx.fillRect(x, y, 2, 2);
  }

  function drawRoom() {
    const hue = 224 + (state.floor % 4) * 8;
    const gradient = ctx.createRadialGradient(W / 2, H / 2, 80, W / 2, H / 2, W * .65);
    gradient.addColorStop(0, `hsl(${hue} 30% 20%)`);
    gradient.addColorStop(1, `hsl(${hue} 35% 10%)`);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, W, H);

    ctx.strokeStyle = "rgba(255,255,255,.035)";
    ctx.lineWidth = 1;
    for (let x = 48; x < W - 48; x += 42) {
      ctx.beginPath(); ctx.moveTo(x, 58); ctx.lineTo(x, H - 48); ctx.stroke();
    }
    for (let y = 58; y < H - 48; y += 42) {
      ctx.beginPath(); ctx.moveTo(48, y); ctx.lineTo(W - 48, y); ctx.stroke();
    }
    ctx.strokeStyle = "rgba(183,168,255,.2)";
    ctx.lineWidth = 5;
    roundRect(45, 55, W - 90, H - 100, 20);
    ctx.stroke();

    state.obstacles.forEach(o => {
      ctx.fillStyle = "#222b43";
      ctx.strokeStyle = "rgba(153,175,221,.25)";
      ctx.lineWidth = 3;
      roundRect(o.x, o.y, o.w, o.h, 12);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = "rgba(255,255,255,.045)";
      roundRect(o.x + 9, o.y + 9, o.w - 18, 13, 5);
      ctx.fill();
      ctx.fillStyle = "rgba(122,144,194,.16)";
      for (let y = o.y + 34; y < o.y + o.h - 8; y += 20) ctx.fillRect(o.x + 10, y, o.w - 20, 4);
    });
  }

  function drawInteractables() {
    state.interactables.forEach(item => {
      if (item.type === "chest") {
        if (item.opened) {
          ctx.fillStyle = "#423d4f";
          roundRect(item.x - 27, item.y - 10, 54, 25, 7); ctx.fill();
          return;
        }
        const glow = item.tier === "boss" ? "#ff9d3b" : "#b278ff";
        ctx.save();
        ctx.shadowColor = glow; ctx.shadowBlur = 22;
        ctx.fillStyle = "#493d63";
        roundRect(item.x - 30, item.y - 20, 60, 42, 8); ctx.fill();
        ctx.fillStyle = glow; ctx.fillRect(item.x - 4, item.y - 20, 8, 42);
        ctx.strokeStyle = "#e9dcff"; ctx.lineWidth = 2;
        roundRect(item.x - 30, item.y - 20, 60, 42, 8); ctx.stroke();
        ctx.restore();
      } else {
        const pulse = 1 + Math.sin(performance.now() * .005) * .08;
        ctx.save();
        ctx.translate(item.x, item.y);
        ctx.scale(pulse, pulse);
        ctx.strokeStyle = "#77d8ff"; ctx.lineWidth = 5;
        ctx.shadowColor = "#77d8ff"; ctx.shadowBlur = 22;
        ctx.beginPath(); ctx.ellipse(0, 0, 22, 38, 0, 0, Math.PI * 2); ctx.stroke();
        ctx.strokeStyle = "rgba(157,120,255,.65)"; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.ellipse(0, 0, 33, 48, 0, 0, Math.PI * 2); ctx.stroke();
        ctx.restore();
      }
    });
  }

  function drawPickups() {
    state.pickups.forEach(item => {
      const bob = Math.sin(item.pulse * 4) * 4;
      if (item.type === "weapon") {
        const q = qualities[item.weapon.qualityId];
        ctx.save();
        ctx.translate(item.x, item.y + bob);
        ctx.shadowColor = q.color; ctx.shadowBlur = 25;
        ctx.fillStyle = "rgba(17,22,37,.86)";
        roundRect(-34, -17, 68, 34, 10); ctx.fill();
        ctx.fillStyle = q.color;
        roundRect(-24, -5, 40, 10, 4); ctx.fill();
        ctx.fillRect(9, 4, 9, 10);
        ctx.fillStyle = "#fff"; ctx.font = "800 9px DM Sans"; ctx.textAlign = "center";
        ctx.fillText(q.label, 25, -7);
        ctx.restore();
      } else {
        ctx.save();
        ctx.translate(item.x, item.y + bob);
        const color = pickupColor(item.type);
        ctx.shadowColor = color; ctx.shadowBlur = 15; ctx.fillStyle = color;
        if (item.type === "health") {
          ctx.fillRect(-4, -10, 8, 20); ctx.fillRect(-10, -4, 20, 8);
        } else if (item.type === "ammo") {
          roundRect(-7, -11, 14, 22, 4); ctx.fill();
        } else {
          ctx.beginPath(); ctx.arc(0, 0, 8, 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = "#664b12"; ctx.font = "800 9px sans-serif"; ctx.textAlign = "center"; ctx.fillText("$", 0, 3);
        }
        ctx.restore();
      }
    });
  }

  function drawPlayer() {
    const p = state.player;
    const weapon = activeWeapon();
    ctx.save();
    ctx.translate(p.x, p.y);
    if (p.invulnerable > 0 && Math.floor(p.invulnerable * 18) % 2 === 0) ctx.globalAlpha = .38;
    ctx.shadowColor = p.color; ctx.shadowBlur = 18;
    ctx.fillStyle = p.color;
    ctx.beginPath(); ctx.arc(0, 0, p.radius, 0, Math.PI * 2); ctx.fill();
    ctx.shadowBlur = 0;
    ctx.fillStyle = "#182036";
    ctx.beginPath(); ctx.arc(0, 0, p.radius * .52, 0, Math.PI * 2); ctx.fill();
    ctx.rotate(p.angle);
    ctx.fillStyle = weapon ? qualities[weapon.qualityId].color : "#fff";
    roundRect(10, -5, 29, 10, 4); ctx.fill();
    ctx.fillStyle = "#222a3d"; ctx.fillRect(18, 4, 8, 9);
    ctx.restore();
  }

  function drawEnemy(e) {
    ctx.save();
    ctx.translate(e.x, e.y);
    ctx.shadowColor = e.color;
    ctx.shadowBlur = e.boss ? 24 : 12;
    ctx.fillStyle = e.flash > 0 ? "#fff" : e.frozen > 0 ? "#7bd7ff" : e.color;
    if (e.typeId === "deadline") {
      ctx.rotate(Math.PI / 4); ctx.fillRect(-e.radius * .75, -e.radius * .75, e.radius * 1.5, e.radius * 1.5);
    } else if (e.typeId === "reviewer") {
      polygon(0, 0, e.radius, 6); ctx.fill();
    } else if (e.typeId === "shield") {
      polygon(0, 0, e.radius, 8); ctx.fill();
      ctx.strokeStyle = "#b9e7ff"; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(0, 0, e.radius + 5, -.9, .9); ctx.stroke();
    } else if (e.typeId === "replicator") {
      ctx.beginPath(); ctx.arc(-6, 0, e.radius * .72, 0, Math.PI * 2); ctx.arc(7, 0, e.radius * .72, 0, Math.PI * 2); ctx.fill();
    } else {
      ctx.beginPath(); ctx.arc(0, 0, e.radius, 0, Math.PI * 2); ctx.fill();
    }
    ctx.shadowBlur = 0;
    ctx.fillStyle = "#20243a";
    ctx.beginPath(); ctx.arc(-e.radius * .28, -2, 2.5, 0, Math.PI * 2); ctx.arc(e.radius * .28, -2, 2.5, 0, Math.PI * 2); ctx.fill();
    ctx.restore();

    if (!e.boss && e.hp < e.maxHp) {
      ctx.fillStyle = "rgba(0,0,0,.45)"; ctx.fillRect(e.x - e.radius, e.y - e.radius - 11, e.radius * 2, 4);
      ctx.fillStyle = e.color; ctx.fillRect(e.x - e.radius, e.y - e.radius - 11, e.radius * 2 * Math.max(0, e.hp / e.maxHp), 4);
    }
  }

  function drawBullet(b) {
    ctx.save();
    ctx.shadowColor = b.color; ctx.shadowBlur = 12; ctx.fillStyle = b.color;
    ctx.beginPath(); ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }

  function drawEnemyBullet(b) {
    ctx.save();
    ctx.shadowColor = b.color; ctx.shadowBlur = 14; ctx.fillStyle = b.color;
    ctx.beginPath(); ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = "#fff"; ctx.globalAlpha = .4; ctx.stroke();
    ctx.restore();
  }

  function drawBossBar() {
    const boss = state.enemies.find(e => e.boss);
    if (!boss) return;
    const width = 420;
    const x = W / 2 - width / 2;
    ctx.fillStyle = "rgba(7,10,20,.78)";
    roundRect(x - 12, 88, width + 24, 42, 13); ctx.fill();
    ctx.fillStyle = "#e9e6f3"; ctx.font = "800 11px DM Sans"; ctx.textAlign = "center";
    ctx.fillText("FINAL COMMITTEE", W / 2, 104);
    ctx.fillStyle = "rgba(255,255,255,.12)"; roundRect(x, 112, width, 7, 4); ctx.fill();
    ctx.fillStyle = boss.color; roundRect(x, 112, width * Math.max(0, boss.hp / boss.maxHp), 7, 4); ctx.fill();
  }

  function addParticle(x, y, color, count, speed) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const velocity = random(speed * .25, speed);
      state.particles.push({
        x, y, vx: Math.cos(angle) * velocity, vy: Math.sin(angle) * velocity,
        life: random(.25, .7), maxLife: .7, size: random(2, 5), color
      });
    }
  }

  function updateParticles(dt) {
    for (let i = state.particles.length - 1; i >= 0; i--) {
      const p = state.particles[i];
      p.x += p.vx * dt; p.y += p.vy * dt; p.vx *= .96; p.vy *= .96; p.life -= dt;
      if (p.life <= 0) state.particles.splice(i, 1);
    }
  }

  function drawParticles() {
    state.particles.forEach(p => {
      ctx.globalAlpha = Math.max(0, p.life / p.maxLife);
      ctx.fillStyle = p.color;
      ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
    });
    ctx.globalAlpha = 1;
  }

  function showBanner(text) {
    state.bannerTimer = 2.1;
    ui.roomBanner.textContent = text;
    ui.roomBanner.hidden = false;
  }

  function showMessage(text) {
    state.message = text;
    state.messageTimer = 2.3;
  }

  function drawMessage() {
    const alpha = Math.min(1, state.messageTimer * 2);
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.font = "700 14px DM Sans";
    const width = ctx.measureText(state.message).width + 34;
    ctx.fillStyle = "rgba(8,12,23,.76)";
    roundRect(W / 2 - width / 2, H - 126, width, 34, 17); ctx.fill();
    ctx.fillStyle = "#fff"; ctx.textAlign = "center"; ctx.fillText(state.message, W / 2, H - 104);
    ctx.restore();
  }

  function updateHud() {
    if (!state) return;
    ui.floor.textContent = state.floor;
    ui.room.textContent = `${state.room}/5`;
    ui.score.textContent = Math.round(state.score).toLocaleString();
    ui.coins.textContent = state.coins;
    ui.health.textContent = `${Math.ceil(state.health)} / ${state.maxHealth}`;
    ui.healthFill.style.width = `${Math.max(0, state.health / state.maxHealth * 100)}%`;

    state.inventory.forEach((weapon, index) => {
      const slot = ui.weaponSlots[index];
      slot.classList.toggle("active", index === state.activeSlot);
      slot.classList.toggle("empty", !weapon);
      if (weapon) {
        const q = qualities[weapon.qualityId];
        slot.style.setProperty("--slot-color", q.color);
        ui.weaponQualities[index].textContent = q.name;
        ui.weaponNames[index].textContent = weapon.name;
      } else {
        slot.style.setProperty("--slot-color", "#aab2c0");
        ui.weaponQualities[index].textContent = "Empty";
        ui.weaponNames[index].textContent = "Find a weapon";
      }
    });

    const weapon = activeWeapon();
    if (weapon) {
      ui.ammo.textContent = `${weapon.ammo} / ${weapon.reserve}`;
      if (state.player.reloading > 0) {
        ui.reloadLabel.textContent = `Reloading ${state.player.reloading.toFixed(1)}s`;
      } else if (weapon.ammo === 0 && weapon.reserve === 0) {
        ui.reloadLabel.textContent = "No ammo";
      } else {
        ui.reloadLabel.textContent = "R to reload";
      }
    }

    const skillMax = characters[selectedCharacter].skillCooldown * state.skillMult;
    const skillRatio = 1 - state.player.skillCooldown / skillMax;
    ui.skillFill.style.width = `${clamp(skillRatio, 0, 1) * 100}%`;
    ui.skillCooldown.textContent = state.player.skillCooldown > 0 ? state.player.skillCooldown.toFixed(1) : "READY";
    const dashRatio = 1 - state.player.dashCooldown / 2.15;
    ui.dashFill.style.width = `${clamp(dashRatio, 0, 1) * 100}%`;
    ui.dashCooldown.textContent = state.player.dashCooldown > 0 ? state.player.dashCooldown.toFixed(1) : "READY";
  }

  function togglePause(force) {
    if (!state || state.gameOver || state.choosingTalent) return;
    state.paused = force === undefined ? !state.paused : force;
    ui.pauseScreen.hidden = !state.paused;
    if (state.paused) pointer.down = false;
  }

  function canvasPoint(event) {
    const rect = canvas.getBoundingClientRect();
    return { x: (event.clientX - rect.left) * W / rect.width, y: (event.clientY - rect.top) * H / rect.height };
  }

  ui.characterCards.forEach(card => {
    card.addEventListener("click", () => {
      selectedCharacter = card.dataset.character;
      ui.characterCards.forEach(c => c.classList.toggle("selected", c === card));
    });
  });
  ui.startButton.addEventListener("click", startGame);
  ui.restartButton.addEventListener("click", startGame);
  ui.pauseButton.addEventListener("click", () => togglePause());
  ui.resumeButton.addEventListener("click", () => togglePause(false));
  ui.weaponSlots.forEach((slot, index) => slot.addEventListener("click", () => switchWeapon(index)));

  window.addEventListener("keydown", event => {
    keys[event.code] = true;
    if (["Space", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(event.code)) event.preventDefault();
    if (event.repeat && ["KeyF", "KeyQ", "KeyR", "KeyE", "ShiftLeft", "ShiftRight"].includes(event.code)) return;
    if (event.code === "Escape") togglePause();
    if (event.code === "KeyF") interact();
    if (event.code === "KeyQ") cycleWeapon();
    if (event.code === "KeyR") startReload();
    if (event.code === "KeyE") useSkill();
    if (event.code === "ShiftLeft" || event.code === "ShiftRight") useDash();
    if (event.code === "Digit1") switchWeapon(0);
    if (event.code === "Digit2") switchWeapon(1);
  });
  window.addEventListener("keyup", event => { keys[event.code] = false; });
  window.addEventListener("blur", () => {
    pointer.down = false;
    Object.keys(keys).forEach(k => { keys[k] = false; });
  });

  canvas.addEventListener("pointermove", event => {
    const p = canvasPoint(event);
    pointer.x = p.x; pointer.y = p.y; pointer.inside = true;
  });
  canvas.addEventListener("pointerenter", () => { pointer.inside = true; });
  canvas.addEventListener("pointerleave", () => { pointer.inside = false; pointer.down = false; });
  canvas.addEventListener("pointerdown", event => {
    if (event.button !== 0) return;
    const p = canvasPoint(event);
    pointer.x = p.x; pointer.y = p.y; pointer.down = true; pointer.inside = true;
  });
  window.addEventListener("pointerup", () => { pointer.down = false; });
  canvas.addEventListener("contextmenu", event => event.preventDefault());

  document.querySelectorAll(".touch-dpad button").forEach(button => {
    const key = button.dataset.key;
    const on = event => { event.preventDefault(); touchKeys[key] = true; };
    const off = event => { event.preventDefault(); touchKeys[key] = false; };
    button.addEventListener("pointerdown", on);
    button.addEventListener("pointerup", off);
    button.addEventListener("pointercancel", off);
    button.addEventListener("pointerleave", off);
  });
  bindTouchHold(ui.touchFire, value => { pointer.down = value; pointer.inside = false; });
  ui.touchInteract.addEventListener("pointerdown", event => { event.preventDefault(); interact(); });
  ui.touchSwap.addEventListener("pointerdown", event => { event.preventDefault(); cycleWeapon(); });
  ui.touchReload.addEventListener("pointerdown", event => { event.preventDefault(); startReload(); });
  ui.touchDash.addEventListener("pointerdown", event => { event.preventDefault(); useDash(); });
  ui.touchAbility.addEventListener("pointerdown", event => { event.preventDefault(); useSkill(); });

  function bindTouchHold(element, callback) {
    element.addEventListener("pointerdown", event => { event.preventDefault(); callback(true); });
    ["pointerup", "pointercancel", "pointerleave"].forEach(name => {
      element.addEventListener(name, event => { event.preventDefault(); callback(false); });
    });
  }

  function nearestEnemy(x, y) {
    let nearest = null;
    let best = Infinity;
    if (!state) return null;
    state.enemies.forEach(e => {
      const d = Math.hypot(e.x - x, e.y - y);
      if (d < best) { best = d; nearest = e; }
    });
    return nearest;
  }

  function pickupColor(type) {
    return type === "health" ? "#ff6d82" : type === "ammo" ? "#70c9ff" : "#ffd465";
  }
  function distance(a, b) { return Math.hypot(a.x - b.x, a.y - b.y); }
  function clamp(value, min, max) { return Math.max(min, Math.min(max, value)); }
  function random(min, max) { return min + Math.random() * (max - min); }
  function shuffled(array) { return [...array].sort(() => Math.random() - .5); }
  function isTouchDevice() { return matchMedia("(pointer: coarse)").matches || "ontouchstart" in window; }
  function roundRect(x, y, width, height, radius) {
    ctx.beginPath();
    ctx.roundRect(x, y, width, height, radius);
  }
  function polygon(x, y, radius, sides) {
    ctx.beginPath();
    for (let i = 0; i < sides; i++) {
      const angle = i / sides * Math.PI * 2 - Math.PI / 2;
      const px = x + Math.cos(angle) * radius;
      const py = y + Math.sin(angle) * radius;
      if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    ctx.closePath();
  }

  drawBackdrop();
})();
