(() => {
  "use strict";

  const canvas = document.getElementById("game-canvas");
  const ctx = canvas.getContext("2d");
  const canvasWrap = document.getElementById("canvas-wrap");
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
    fullscreenButton: document.getElementById("fullscreen-button"),
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
    touchMelee: document.getElementById("touch-melee"),
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
      reload: 1.05, speed: 650, pellets: 1, spread: .02, pierce: 0, explosive: 0, color: "#dce4ef", model: "pistol", house: "axiom"
    },
    smg: {
      name: "Citation SMG", short: "SMG", damage: 10, delay: .085, mag: 30,
      reload: 1.35, speed: 720, pellets: 1, spread: .1, pierce: 0, explosive: 0, color: "#74dcad", model: "smg", house: "vector"
    },
    shotgun: {
      name: "Scatter Thesis", short: "Shotgun", damage: 12, delay: .58, mag: 7,
      reload: 1.55, speed: 570, pellets: 6, spread: .38, pierce: 0, explosive: 0, color: "#ffcb72", model: "shotgun", house: "forge"
    },
    railgun: {
      name: "Peer Review Railgun", short: "Railgun", damage: 63, delay: .76, mag: 5,
      reload: 1.8, speed: 980, pellets: 1, spread: .008, pierce: 3, explosive: 0, color: "#79c5ff", model: "railgun", house: "helix"
    },
    laser: {
      name: "Laser Pointer", short: "Laser", damage: 8, delay: .055, mag: 42,
      reload: 1.48, speed: 900, pellets: 1, spread: .035, pierce: 1, explosive: 0, color: "#ff6e96", model: "laser", house: "helix"
    },
    launcher: {
      name: "Grant Launcher", short: "Launcher", damage: 38, delay: .82, mag: 4,
      reload: 1.95, speed: 440, pellets: 1, spread: .03, pierce: 0, explosive: 82, color: "#c692ff", model: "launcher", house: "forge"
    },
    burst: {
      name: "Footnote Repeater", short: "Repeater", damage: 16, delay: .145, mag: 21,
      reload: 1.25, speed: 760, pellets: 1, spread: .055, pierce: 0, explosive: 0, color: "#95e3ec", model: "carbine", house: "axiom"
    },
    revolver: {
      name: "Tenure Revolver", short: "Revolver", damage: 48, delay: .48, mag: 6,
      reload: 1.6, speed: 820, pellets: 1, spread: .018, pierce: 1, explosive: 0, color: "#f0b668", model: "revolver", house: "forge"
    },
    crossbow: {
      name: "Method Crossbow", short: "Crossbow", damage: 76, delay: .92, mag: 4,
      reload: 1.75, speed: 720, pellets: 1, spread: 0, pierce: 4, explosive: 0, color: "#b3e27c", model: "crossbow", house: "relic"
    },
    needler: {
      name: "Data Needler", short: "Needler", damage: 6.5, delay: .042, mag: 55,
      reload: 1.55, speed: 840, pellets: 1, spread: .075, pierce: 0, explosive: 0, color: "#73f1d4", model: "needler", house: "vector"
    },
    prism: {
      name: "Prism Abstract", short: "Prism", damage: 18, delay: .34, mag: 15,
      reload: 1.4, speed: 690, pellets: 3, spread: .23, pierce: 0, explosive: 0, color: "#e49bff", model: "prism", house: "relic"
    },
    tesla: {
      name: "Citation Tesla", short: "Tesla", damage: 27, delay: .44, mag: 11,
      reload: 1.5, speed: 760, pellets: 1, spread: .025, pierce: 0, explosive: 0, chain: 3, color: "#76dcff", model: "tesla", house: "helix"
    },
    orb: {
      name: "Hypothesis Orb", short: "Orb", damage: 31, delay: .52, mag: 9,
      reload: 1.55, speed: 430, pellets: 1, spread: .03, pierce: 1, explosive: 0, homing: 4.2, color: "#a892ff", model: "orb", house: "relic"
    },
    flame: {
      name: "Burnout Projector", short: "Projector", damage: 7, delay: .075, mag: 48,
      reload: 1.65, speed: 350, pellets: 3, spread: .32, pierce: 0, explosive: 0, life: .48, grow: true, color: "#ff8a54", model: "flame", house: "forge"
    },
    ricochet: {
      name: "Recursive Proof", short: "Ricochet", damage: 24, delay: .3, mag: 16,
      reload: 1.35, speed: 720, pellets: 1, spread: .025, pierce: 0, explosive: 0, bounces: 3, color: "#ffe36b", model: "ricochet", house: "vector"
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
    editor: { name: "Copy Editor", color: "#ef7f5a", hp: 64, speed: 122, damage: 16, radius: 18, score: 90 },
    sniper: { name: "Citation Sniper", color: "#63c2d2", hp: 58, speed: 55, damage: 19, radius: 17, score: 115, ranged: true, preferredRange: 380, projectileSpeed: 385 },
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
        skillCooldown: 0, fireCooldown: 0, meleeCooldown: 0, meleeTime: 0,
        recoil: 0, muzzleFlash: 0, barrelHeat: 0, reloading: 0
      },
      inventory: [createWeapon("pistol", "common"), null],
      activeSlot: 0,
      enemies: [],
      bullets: [],
      enemyBullets: [],
      particles: [],
      effects: [],
      pickups: [],
      interactables: [],
      obstacles: [],
      decorations: [],
      roomTheme: "archive",
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
      explosive: base.explosive + (qualityId === "legendary" && baseId !== "launcher" ? 32 : 0),
      model: base.model, house: base.house || "axiom", chain: base.chain || 0, homing: base.homing || 0,
      bounces: base.bounces || 0, life: base.life || 1.7, grow: Boolean(base.grow)
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
    s.effects = [];
    s.player.x = 105;
    s.player.y = H / 2;
    s.player.reloading = 0;
    const roomData = buildRoomLayout(s.room);
    s.obstacles = roomData.obstacles;
    s.decorations = roomData.decorations;
    s.roomTheme = roomData.theme;
    s.pendingSpawns = s.room === 5 ? Math.min(3 + s.floor, 8) : 3 + s.floor + s.room * 2;
    s.spawnTimer = .25;
    if (s.room === 5) spawnEnemy("boss", W - 190, H / 2);
    showBanner(`Floor ${s.floor} / ${roomNames[s.room - 1]}`);
    updateHud();
  }

  function buildRoomLayout(room) {
    const shelf = (x, y, w, h) => ({ x, y, w, h, kind: "shelf" });
    const desk = (x, y, w, h) => ({ x, y, w, h, kind: "desk" });
    const server = (x, y, w, h) => ({ x, y, w, h, kind: "server" });
    const vat = (x, y, w, h) => ({ x, y, w, h, kind: "vat" });
    const pillar = (x, y, w = 66, h = 66) => ({ x, y, w, h, kind: "pillar" });
    const layouts = [
      [shelf(335, 145, 72, 165), shelf(335, 390, 72, 145), server(690, 250, 88, 170)],
      [desk(270, 225, 165, 72), server(630, 125, 84, 140), server(630, 415, 84, 140), pillar(835, 300)],
      [shelf(255, 125, 74, 175), shelf(490, 380, 74, 175), shelf(725, 125, 74, 175), desk(765, 405, 145, 62)],
      [vat(300, 250, 105, 105), vat(690, 250, 105, 105), desk(475, 115, 150, 68), desk(475, 490, 150, 68)],
      [pillar(245, 155), pillar(245, 455), pillar(775, 155), pillar(775, 455), desk(460, 275, 180, 70)],
      [shelf(285, 120, 68, 150), shelf(285, 410, 68, 150), shelf(590, 265, 68, 150), server(810, 150, 78, 130), server(810, 420, 78, 130)],
      [desk(230, 300, 170, 62), desk(465, 155, 170, 62), desk(465, 465, 170, 62), desk(700, 300, 170, 62)],
      [server(265, 170, 78, 145), server(265, 390, 78, 145), vat(520, 285, 90, 90), server(780, 170, 78, 145), server(780, 390, 78, 145)],
      [shelf(255, 160, 165, 64), shelf(255, 455, 165, 64), shelf(675, 160, 165, 64), shelf(675, 455, 165, 64), pillar(515, 305)],
      [vat(270, 170, 92, 92), vat(270, 420, 92, 92), vat(740, 170, 92, 92), vat(740, 420, 92, 92), server(505, 270, 90, 140)]
    ];
    const bossLayouts = [
      [pillar(255, 155), pillar(255, 455), pillar(785, 155), pillar(785, 455)],
      [server(275, 190, 76, 130), server(275, 410, 76, 130), server(750, 190, 76, 130), server(750, 410, 76, 130)],
      [vat(290, 190, 88, 88), vat(290, 420, 88, 88), vat(730, 190, 88, 88), vat(730, 420, 88, 88)]
    ];
    const themes = ["archive", "laboratory", "server", "observatory"];
    const source = room === 5 ? bossLayouts : layouts;
    const index = Math.floor(Math.random() * source.length);
    const obstacles = source[index].map(o => ({ ...o }));
    const decorations = [];
    for (let i = 0; i < 16; i++) {
      decorations.push({
        x: random(80, W - 80), y: random(85, H - 70),
        size: random(4, 11), kind: i % 4, alpha: random(.06, .18)
      });
    }
    return { obstacles, decorations, theme: themes[(state.floor + room + index) % themes.length] };
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
    updateEffects(dt);
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
    p.meleeCooldown = Math.max(0, p.meleeCooldown - dt);
    p.meleeTime = Math.max(0, p.meleeTime - dt);
    p.recoil = Math.max(0, p.recoil - dt * 42);
    p.muzzleFlash = Math.max(0, p.muzzleFlash - dt);
    p.barrelHeat = Math.max(0, p.barrelHeat - dt * .85);

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

    if (pointer.down || keys.Space) fireWeapon();

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
    if (state.floor >= 3 && r < .1) return "shield";
    if (state.floor >= 3 && r < .2) return "sniper";
    if (state.floor >= 2 && r < .33) return "replicator";
    if (state.floor >= 2 && r < .45) return "editor";
    if (r < .61) return "reviewer";
    if (r < .78) return "deadline";
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
      preferredRange: type.preferredRange, projectileSpeed: type.projectileSpeed,
      attackCooldown: .4 + Math.random(), shootCooldown: .7 + Math.random(),
      summonCooldown: 6, frozen: 0, flash: 0, miniature,
      path: [], pathTimer: 0, stuckTimer: 0, lastX: x, lastY: y,
      steerSign: Math.random() < .5 ? -1 : 1
    });
    const enemy = state.enemies[state.enemies.length - 1];
    if (circleHitsObstacle(enemy)) {
      const open = findNearestOpenPoint(enemy.x, enemy.y, enemy.radius);
      enemy.x = open.x;
      enemy.y = open.y;
    }
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
      const desired = e.ranged ? (e.preferredRange || 260) : e.radius + p.radius + 7;
      moveEnemySmart(e, p, desired, dt);

      if (dist < e.radius + p.radius + 4 && e.attackCooldown <= 0) {
        damagePlayer(e.damage);
        e.attackCooldown = e.boss ? .7 : 1;
        const knock = 18;
        moveCircle(p, (p.x - e.x) / Math.max(dist, 1) * knock, (p.y - e.y) / Math.max(dist, 1) * knock);
      }

      if (e.ranged && e.shootCooldown <= 0 && dist < 560 && hasClearPath(e, p, Math.max(5, e.radius * .25))) {
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
    const speed = e.projectileSpeed || (e.boss ? 285 : 245);
    for (let i = 0; i < count; i++) {
      const spread = e.boss ? (i - 2) * .16 : 0;
      state.enemyBullets.push({
        x: e.x, y: e.y, vx: Math.cos(angle + spread) * speed,
        vy: Math.sin(angle + spread) * speed,
        radius: e.boss ? 7 : 5, damage: e.damage * .75, life: 4, color: e.color
      });
    }
  }

  function fireWeapon() {
    const p = state.player;
    const weapon = activeWeapon();
    if (!weapon || p.fireCooldown > 0) return;
    if (weapon.ammo <= 0) {
      meleeAttack();
      if (weapon.reserve > 0) startReload();
      return;
    }
    if (p.reloading > 0) return;
    weapon.ammo--;
    p.fireCooldown = weapon.delay;
    p.recoil = Math.min(10, 3 + weapon.damage * .055 + weapon.pellets * .42);
    p.muzzleFlash = weapon.model === "flame" ? .1 : .065;
    p.barrelHeat = Math.min(1, p.barrelHeat + .08 + 1 / weapon.mag);
    const quality = qualities[weapon.qualityId];
    for (let i = 0; i < weapon.pellets; i++) {
      const offset = weapon.pellets === 1 ? random(-weapon.spread, weapon.spread) : (i / (weapon.pellets - 1) - .5) * weapon.spread + random(-.025, .025);
      const angle = p.angle + offset;
      state.bullets.push({
        x: p.x + Math.cos(angle) * 25, y: p.y + Math.sin(angle) * 25,
        vx: Math.cos(angle) * weapon.speed, vy: Math.sin(angle) * weapon.speed,
        radius: weapon.baseId === "launcher" ? 7 : weapon.baseId === "railgun" ? 4 : 3.5,
        damage: weapon.damage * state.damageMult, life: weapon.life, pierce: weapon.pierce,
        explosive: weapon.explosive, chain: weapon.chain, homing: weapon.homing,
        bounces: weapon.bounces, grow: weapon.grow, model: weapon.model,
        qualityId: weapon.qualityId, color: quality.color, hit: new Set()
      });
    }
    addMuzzleEffect(p, weapon, quality.color);
    if (!["laser", "orb", "prism", "flame", "tesla"].includes(weapon.model)) {
      const side = p.angle - Math.PI / 2;
      state.effects.push({
        type: "casing", x: p.x + Math.cos(p.angle) * 8, y: p.y + Math.sin(p.angle) * 8,
        vx: Math.cos(side) * random(55, 95) - Math.cos(p.angle) * 20,
        vy: Math.sin(side) * random(55, 95) - Math.sin(p.angle) * 20,
        rotation: p.angle, spin: random(-12, 12), life: .55, maxLife: .55, color: "#e8c878"
      });
    }
    state.shake = Math.min(5, state.shake + (weapon.pellets > 1 || weapon.explosive ? 2.2 : .5));
    addParticle(p.x + Math.cos(p.angle) * 25, p.y + Math.sin(p.angle) * 25, quality.color, 4, 50);
    if (weapon.ammo <= 0) setTimeout(() => { if (state && state.player.reloading <= 0) startReload(); }, 120);
  }

  function updateBullets(dt) {
    for (let i = state.bullets.length - 1; i >= 0; i--) {
      const b = state.bullets[i];
      if (b.homing > 0) steerHomingBullet(b, dt);
      const oldX = b.x;
      const oldY = b.y;
      b.x += b.vx * dt;
      b.y += b.vy * dt;
      b.life -= dt;
      if (b.grow) b.radius = Math.min(11, b.radius + dt * 11);
      let remove = b.life <= 0 || b.x < 35 || b.x > W - 35 || b.y < 35 || b.y > H - 35;
      if (!remove && circleHitsObstacle(b)) {
        if (b.bounces > 0) {
          const hitX = circleHitsObstacle({ x: b.x, y: oldY, radius: b.radius });
          const hitY = circleHitsObstacle({ x: oldX, y: b.y, radius: b.radius });
          if (hitX || !hitY) b.vx *= -1;
          if (hitY || !hitX) b.vy *= -1;
          b.x = oldX;
          b.y = oldY;
          b.bounces--;
          addParticle(b.x, b.y, b.color, 5, 55);
          addImpactEffect(b.x, b.y, b.color, "ricochet");
        } else {
          addImpactEffect(b.x, b.y, b.color, b.model);
          remove = true;
        }
      }
      for (let j = state.enemies.length - 1; j >= 0 && !remove; j--) {
        const e = state.enemies[j];
        if (b.hit.has(e) || distance(b, e) > b.radius + e.radius) continue;
        b.hit.add(e);
        hitEnemy(e, b.damage);
        addImpactEffect(b.x, b.y, b.color, b.model, true);
        if (b.chain > 0) chainLightning(e, b);
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

  function meleeAttack() {
    if (!state || state.player.meleeCooldown > 0 || state.paused || state.choosingTalent) return;
    const p = state.player;
    p.meleeCooldown = .43;
    p.meleeTime = .18;
    p.reloading = Math.max(0, p.reloading);
    const range = 76;
    const halfArc = 1.02;
    let hits = 0;
    state.enemies.slice().forEach(enemy => {
      const dist = distance(p, enemy);
      const angle = Math.atan2(enemy.y - p.y, enemy.x - p.x);
      if (dist <= range + enemy.radius && Math.abs(angleDifference(angle, p.angle)) <= halfArc) {
        hitEnemy(enemy, 38 * state.damageMult);
        moveCircle(enemy, Math.cos(p.angle) * 24, Math.sin(p.angle) * 24);
        hits++;
      }
    });
    for (let i = state.enemyBullets.length - 1; i >= 0; i--) {
      const bullet = state.enemyBullets[i];
      const angle = Math.atan2(bullet.y - p.y, bullet.x - p.x);
      if (distance(p, bullet) < range + 16 && Math.abs(angleDifference(angle, p.angle)) <= halfArc) {
        addParticle(bullet.x, bullet.y, "#ffe0a1", 5, 70);
        state.enemyBullets.splice(i, 1);
      }
    }
    addParticle(p.x + Math.cos(p.angle) * 45, p.y + Math.sin(p.angle) * 45, hits ? "#fff1b8" : "#d8ddea", 9, 85);
    state.shake = hits ? 5 : 2;
  }

  function steerHomingBullet(bullet, dt) {
    let target = null;
    let best = 240;
    state.enemies.forEach(enemy => {
      if (bullet.hit.has(enemy)) return;
      const d = distance(bullet, enemy);
      if (d < best) {
        best = d;
        target = enemy;
      }
    });
    if (!target) return;
    const speed = Math.hypot(bullet.vx, bullet.vy);
    const current = Math.atan2(bullet.vy, bullet.vx);
    const desired = Math.atan2(target.y - bullet.y, target.x - bullet.x);
    const angle = current + clamp(angleDifference(desired, current), -bullet.homing * dt, bullet.homing * dt);
    bullet.vx = Math.cos(angle) * speed;
    bullet.vy = Math.sin(angle) * speed;
  }

  function chainLightning(origin, bullet) {
    let current = origin;
    let damage = bullet.damage * .58;
    for (let jump = 0; jump < bullet.chain; jump++) {
      let next = null;
      let best = 145;
      state.enemies.forEach(enemy => {
        if (enemy === current || bullet.hit.has(enemy)) return;
        const d = distance(current, enemy);
        if (d < best) {
          best = d;
          next = enemy;
        }
      });
      if (!next) break;
      bullet.hit.add(next);
      drawLightningParticles(current, next, bullet.color);
      hitEnemy(next, damage);
      damage *= .72;
      current = next;
    }
  }

  function drawLightningParticles(from, to, color) {
    const steps = Math.max(3, Math.floor(distance(from, to) / 18));
    for (let i = 1; i < steps; i++) {
      const t = i / steps;
      state.particles.push({
        x: from.x + (to.x - from.x) * t + random(-5, 5),
        y: from.y + (to.y - from.y) * t + random(-5, 5),
        vx: 0, vy: 0, life: .18, maxLife: .18, size: 3, color
      });
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
    state.effects.push({
      type: "ring", layer: "under", x, y, radius: 8, endRadius: radius,
      lineWidth: 8, life: .38, maxLife: .38, color
    });
    state.effects.push({
      type: "flash", layer: "over", x, y, radius: radius * .42,
      life: .14, maxLife: .14, color: "#fff6cf"
    });
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
    const chestPoint = findNearestOpenPoint(W / 2, H / 2, 38);
    state.interactables.push({ type: "chest", x: chestPoint.x, y: chestPoint.y, radius: 28, opened: false, tier: chestQuality });
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

  function moveEnemySmart(enemy, player, desired, dt) {
    const dist = distance(enemy, player);
    const retreating = enemy.ranged && dist < desired - 55;
    let targetX = player.x;
    let targetY = player.y;
    let vx = 0;
    let vy = 0;

    enemy.pathTimer -= dt;
    if (retreating) {
      vx = (enemy.x - player.x) / Math.max(dist, 1);
      vy = (enemy.y - player.y) / Math.max(dist, 1);
      const orbit = enemy.steerSign * .48;
      const oldX = vx;
      vx -= vy * orbit;
      vy += oldX * orbit;
    } else if (dist > desired + 18) {
      if (hasClearPath(enemy, player, enemy.radius + 4)) {
        enemy.path = [];
        vx = (player.x - enemy.x) / Math.max(dist, 1);
        vy = (player.y - enemy.y) / Math.max(dist, 1);
      } else {
        if (enemy.pathTimer <= 0 || enemy.path.length === 0) {
          enemy.path = findPath(enemy, player, enemy.radius + 4);
          enemy.pathTimer = .38 + Math.random() * .2;
        }
        while (enemy.path.length && Math.hypot(enemy.path[0].x - enemy.x, enemy.path[0].y - enemy.y) < 24) {
          enemy.path.shift();
        }
        const waypoint = enemy.path[0] || player;
        targetX = waypoint.x;
        targetY = waypoint.y;
        const waypointDistance = Math.hypot(targetX - enemy.x, targetY - enemy.y) || 1;
        vx = (targetX - enemy.x) / waypointDistance;
        vy = (targetY - enemy.y) / waypointDistance;
      }
    } else if (enemy.ranged) {
      vx = -(player.y - enemy.y) / Math.max(dist, 1) * enemy.steerSign * .7;
      vy = (player.x - enemy.x) / Math.max(dist, 1) * enemy.steerSign * .7;
    }

    let separateX = 0;
    let separateY = 0;
    state.enemies.forEach(other => {
      if (other === enemy) return;
      const d = distance(enemy, other);
      const range = enemy.radius + other.radius + 16;
      if (d > 0 && d < range) {
        const strength = (range - d) / range;
        separateX += (enemy.x - other.x) / d * strength;
        separateY += (enemy.y - other.y) / d * strength;
      }
    });
    vx += separateX * .62;
    vy += separateY * .62;
    const length = Math.hypot(vx, vy);
    if (length > 0) {
      vx /= length;
      vy /= length;
    }

    const beforeX = enemy.x;
    const beforeY = enemy.y;
    const step = enemy.speed * dt;
    const moved = moveCircle(enemy, vx * step, vy * step);
    if (length > 0 && moved < step * .22) {
      const steered = tryEnemySteering(enemy, vx, vy, step, retreating ? player : { x: targetX, y: targetY }, retreating);
      enemy.stuckTimer = steered ? 0 : enemy.stuckTimer + dt;
    } else {
      enemy.stuckTimer = Math.max(0, enemy.stuckTimer - dt * 2);
    }

    if (enemy.stuckTimer > .45) {
      enemy.path = findPath(enemy, player, enemy.radius + 7);
      enemy.pathTimer = .18;
      enemy.steerSign *= -1;
      enemy.stuckTimer = 0;
      const nudgeAngle = Math.atan2(player.y - enemy.y, player.x - enemy.x) + enemy.steerSign * Math.PI / 2;
      moveCircle(enemy, Math.cos(nudgeAngle) * 7, Math.sin(nudgeAngle) * 7);
    }
    enemy.lastX = beforeX;
    enemy.lastY = beforeY;
  }

  function tryEnemySteering(enemy, vx, vy, step, target, retreating) {
    const base = Math.atan2(vy, vx);
    const angles = [enemy.steerSign * .55, -enemy.steerSign * .55, enemy.steerSign * 1.05, -enemy.steerSign * 1.05, Math.PI];
    const oldDistance = distance(enemy, target);
    for (const offset of angles) {
      const dx = Math.cos(base + offset) * step;
      const dy = Math.sin(base + offset) * step;
      const test = { x: enemy.x + dx, y: enemy.y + dy, radius: enemy.radius };
      if (circleHitsObstacle(test) || !insideArena(test)) continue;
      const newDistance = distance(test, target);
      if ((!retreating && newDistance <= oldDistance + 8) || (retreating && newDistance >= oldDistance - 8)) {
        moveCircle(enemy, dx, dy);
        return true;
      }
    }
    return false;
  }

  function hasClearPath(from, to, radius) {
    const dist = distance(from, to);
    const steps = Math.ceil(dist / 18);
    for (let i = 1; i < steps; i++) {
      const t = i / steps;
      if (circleHitsObstacle({
        x: from.x + (to.x - from.x) * t,
        y: from.y + (to.y - from.y) * t,
        radius
      })) return false;
    }
    return true;
  }

  function findPath(from, to, radius) {
    const cell = 38;
    const minX = 67;
    const minY = 77;
    const cols = Math.floor((W - minX * 2) / cell) + 1;
    const rows = Math.floor((H - minY - 58) / cell) + 1;
    const world = node => ({ x: minX + node.x * cell, y: minY + node.y * cell });
    const valid = node => {
      if (node.x < 0 || node.y < 0 || node.x >= cols || node.y >= rows) return false;
      const point = world(node);
      return insideArena({ ...point, radius }) && !circleHitsObstacle({ ...point, radius });
    };
    const nearestNode = point => {
      const base = {
        x: clamp(Math.round((point.x - minX) / cell), 0, cols - 1),
        y: clamp(Math.round((point.y - minY) / cell), 0, rows - 1)
      };
      if (valid(base)) return base;
      for (let ring = 1; ring <= 5; ring++) {
        for (let y = -ring; y <= ring; y++) {
          for (let x = -ring; x <= ring; x++) {
            if (Math.max(Math.abs(x), Math.abs(y)) !== ring) continue;
            const candidate = { x: base.x + x, y: base.y + y };
            if (valid(candidate)) return candidate;
          }
        }
      }
      return null;
    };

    const start = nearestNode(from);
    const goal = nearestNode(to);
    if (!start || !goal) return [];
    const key = node => `${node.x},${node.y}`;
    const open = [start];
    const openKeys = new Set([key(start)]);
    const closed = new Set();
    const cameFrom = new Map();
    const g = new Map([[key(start), 0]]);
    const heuristic = node => Math.hypot(goal.x - node.x, goal.y - node.y);
    const directions = [
      [1, 0, 1], [-1, 0, 1], [0, 1, 1], [0, -1, 1],
      [1, 1, 1.414], [1, -1, 1.414], [-1, 1, 1.414], [-1, -1, 1.414]
    ];
    let iterations = 0;

    while (open.length && iterations++ < 900) {
      let bestIndex = 0;
      let bestScore = Infinity;
      for (let i = 0; i < open.length; i++) {
        const score = (g.get(key(open[i])) ?? Infinity) + heuristic(open[i]);
        if (score < bestScore) {
          bestScore = score;
          bestIndex = i;
        }
      }
      const current = open.splice(bestIndex, 1)[0];
      const currentKey = key(current);
      openKeys.delete(currentKey);
      if (current.x === goal.x && current.y === goal.y) {
        const path = [];
        let cursor = current;
        while (key(cursor) !== key(start)) {
          path.unshift(world(cursor));
          cursor = cameFrom.get(key(cursor));
          if (!cursor) break;
        }
        return path;
      }
      closed.add(currentKey);
      for (const [dx, dy, cost] of directions) {
        const neighbor = { x: current.x + dx, y: current.y + dy };
        const neighborKey = key(neighbor);
        if (closed.has(neighborKey) || !valid(neighbor)) continue;
        if (dx && dy && (!valid({ x: current.x + dx, y: current.y }) || !valid({ x: current.x, y: current.y + dy }))) continue;
        const tentative = (g.get(currentKey) || 0) + cost;
        if (tentative >= (g.get(neighborKey) ?? Infinity)) continue;
        cameFrom.set(neighborKey, current);
        g.set(neighborKey, tentative);
        if (!openKeys.has(neighborKey)) {
          open.push(neighbor);
          openKeys.add(neighborKey);
        }
      }
    }
    return [];
  }

  function findNearestOpenPoint(x, y, radius) {
    if (!circleHitsObstacle({ x, y, radius }) && insideArena({ x, y, radius })) return { x, y };
    for (let ring = 1; ring <= 16; ring++) {
      for (let i = 0; i < 16; i++) {
        const angle = i / 16 * Math.PI * 2;
        const point = { x: x + Math.cos(angle) * ring * 18, y: y + Math.sin(angle) * ring * 18, radius };
        if (insideArena(point) && !circleHitsObstacle(point)) return point;
      }
    }
    return { x: 110, y: H / 2 };
  }

  function insideArena(circle) {
    return circle.x >= 48 + circle.radius && circle.x <= W - 48 - circle.radius
      && circle.y >= 58 + circle.radius && circle.y <= H - 48 - circle.radius;
  }

  function moveCircle(entity, dx, dy) {
    const startX = entity.x;
    const startY = entity.y;
    entity.x += dx;
    if (circleHitsObstacle(entity)) entity.x -= dx;
    entity.y += dy;
    if (circleHitsObstacle(entity)) entity.y -= dy;
    entity.x = clamp(entity.x, 48 + entity.radius, W - 48 - entity.radius);
    entity.y = clamp(entity.y, 58 + entity.radius, H - 48 - entity.radius);
    return Math.hypot(entity.x - startX, entity.y - startY);
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
    drawEffects("under");
    state.bullets.forEach(drawBullet);
    state.enemyBullets.forEach(drawEnemyBullet);
    state.enemies.forEach(drawEnemy);
    drawPlayer();
    drawEffects("over");
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
    const palettes = {
      archive: ["#24233a", "#111525", "#7e69ad"],
      laboratory: ["#173038", "#0d1c27", "#4ca2a5"],
      server: ["#17243b", "#0a1221", "#527ed0"],
      observatory: ["#30213b", "#151225", "#a46bb1"]
    };
    const palette = palettes[state.roomTheme] || palettes.archive;
    const gradient = ctx.createRadialGradient(W / 2, H / 2, 80, W / 2, H / 2, W * .65);
    gradient.addColorStop(0, palette[0]);
    gradient.addColorStop(1, palette[1]);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, W, H);

    ctx.strokeStyle = "rgba(255,255,255,.045)";
    ctx.lineWidth = 1;
    const tileSize = state.roomTheme === "laboratory" ? 52 : 42;
    for (let x = 48; x < W - 48; x += tileSize) {
      ctx.beginPath(); ctx.moveTo(x, 58); ctx.lineTo(x, H - 48); ctx.stroke();
    }
    for (let y = 58; y < H - 48; y += tileSize) {
      ctx.beginPath(); ctx.moveTo(48, y); ctx.lineTo(W - 48, y); ctx.stroke();
    }
    state.decorations.forEach(decor => {
      ctx.save();
      ctx.globalAlpha = decor.alpha;
      ctx.fillStyle = palette[2];
      if (decor.kind === 0) {
        ctx.beginPath(); ctx.arc(decor.x, decor.y, decor.size, 0, Math.PI * 2); ctx.fill();
      } else if (decor.kind === 1) {
        ctx.fillRect(decor.x - decor.size, decor.y - 1, decor.size * 2, 2);
        ctx.fillRect(decor.x - 1, decor.y - decor.size, 2, decor.size * 2);
      } else if (decor.kind === 2) {
        ctx.strokeStyle = palette[2]; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(decor.x, decor.y, decor.size, 0, Math.PI * 2); ctx.stroke();
      } else {
        ctx.translate(decor.x, decor.y); ctx.rotate(Math.PI / 4);
        ctx.fillRect(-decor.size / 2, -decor.size / 2, decor.size, decor.size);
      }
      ctx.restore();
    });

    ctx.strokeStyle = `${palette[2]}55`;
    ctx.lineWidth = 5;
    roundRect(45, 55, W - 90, H - 100, 20);
    ctx.stroke();

    state.obstacles.forEach(drawObstacle);
  }

  function drawObstacle(o) {
    ctx.save();
    ctx.shadowColor = "rgba(0,0,0,.4)";
    ctx.shadowBlur = 14;
    ctx.shadowOffsetY = 8;
    if (o.kind === "shelf") {
      ctx.fillStyle = "#3b2d3f"; ctx.strokeStyle = "#80637d"; ctx.lineWidth = 3;
      roundRect(o.x, o.y, o.w, o.h, 9); ctx.fill(); ctx.stroke();
      ctx.shadowBlur = 0;
      const horizontal = o.w > o.h;
      if (horizontal) {
        for (let x = o.x + 12; x < o.x + o.w - 10; x += 18) {
          ctx.fillStyle = ["#b85c70", "#527cae", "#b69353", "#6f9f7c"][Math.floor(x / 18) % 4];
          ctx.fillRect(x, o.y + 11, 10, o.h - 22);
        }
      } else {
        for (let y = o.y + 12; y < o.y + o.h - 10; y += 19) {
          ctx.fillStyle = ["#b85c70", "#527cae", "#b69353", "#6f9f7c"][Math.floor(y / 19) % 4];
          ctx.fillRect(o.x + 10, y, o.w - 20, 10);
        }
      }
    } else if (o.kind === "desk") {
      ctx.fillStyle = "#514032"; ctx.strokeStyle = "#9a7956"; ctx.lineWidth = 3;
      roundRect(o.x, o.y, o.w, o.h, 10); ctx.fill(); ctx.stroke();
      ctx.shadowBlur = 0;
      ctx.fillStyle = "#20283b";
      roundRect(o.x + o.w * .34, o.y + 10, o.w * .32, Math.min(28, o.h - 20), 4); ctx.fill();
      ctx.fillStyle = "#70c9dd"; ctx.fillRect(o.x + o.w * .39, o.y + 15, o.w * .22, 3);
      ctx.fillStyle = "#d6c8a4"; ctx.fillRect(o.x + 12, o.y + 14, 32, 20);
    } else if (o.kind === "server") {
      ctx.fillStyle = "#172134"; ctx.strokeStyle = "#4b6f9d"; ctx.lineWidth = 3;
      roundRect(o.x, o.y, o.w, o.h, 8); ctx.fill(); ctx.stroke();
      ctx.shadowBlur = 0;
      for (let y = o.y + 14; y < o.y + o.h - 8; y += 19) {
        ctx.fillStyle = "#26364f"; ctx.fillRect(o.x + 9, y, o.w - 18, 11);
        ctx.fillStyle = y % 2 ? "#70e3bd" : "#6fb8ff"; ctx.beginPath(); ctx.arc(o.x + o.w - 17, y + 5, 2.5, 0, Math.PI * 2); ctx.fill();
      }
    } else if (o.kind === "vat") {
      ctx.fillStyle = "#213c46"; ctx.strokeStyle = "#66b8bc"; ctx.lineWidth = 4;
      roundRect(o.x, o.y, o.w, o.h, Math.min(24, o.w * .25)); ctx.fill(); ctx.stroke();
      ctx.shadowBlur = 0;
      const liquid = ctx.createLinearGradient(o.x, o.y, o.x, o.y + o.h);
      liquid.addColorStop(0, "rgba(94,232,204,.18)"); liquid.addColorStop(1, "rgba(55,133,164,.48)");
      ctx.fillStyle = liquid; roundRect(o.x + 10, o.y + 14, o.w - 20, o.h - 26, 17); ctx.fill();
      ctx.strokeStyle = "rgba(190,255,240,.6)"; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(o.x + o.w * .58, o.y + o.h * .55, 10, 0, Math.PI * 2); ctx.stroke();
    } else {
      ctx.fillStyle = "#35405a"; ctx.strokeStyle = "#7787aa"; ctx.lineWidth = 3;
      roundRect(o.x, o.y, o.w, o.h, 15); ctx.fill(); ctx.stroke();
      ctx.shadowBlur = 0;
      ctx.fillStyle = "rgba(255,255,255,.08)";
      polygon(o.x + o.w / 2, o.y + o.h / 2, Math.min(o.w, o.h) * .28, 6); ctx.fill();
    }
    ctx.restore();
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
        const qualityOrder = ["common", "uncommon", "rare", "epic", "legendary"];
        const rank = qualityOrder.indexOf(item.weapon.qualityId);
        const time = performance.now() * .001;
        ctx.save();
        ctx.translate(item.x, item.y + bob);
        const beam = ctx.createLinearGradient(0, -90, 0, 20);
        beam.addColorStop(0, "transparent");
        beam.addColorStop(.75, `${q.color}${rank >= 3 ? "42" : "25"}`);
        beam.addColorStop(1, "transparent");
        ctx.fillStyle = beam;
        ctx.beginPath(); ctx.moveTo(-23, 19); ctx.lineTo(-8, -86); ctx.lineTo(8, -86); ctx.lineTo(23, 19); ctx.closePath(); ctx.fill();
        ctx.strokeStyle = q.color;
        ctx.globalAlpha = .38 + rank * .08;
        ctx.lineWidth = 2;
        ctx.beginPath(); ctx.ellipse(0, 18, 34 + Math.sin(time * 3) * 3, 10, 0, 0, Math.PI * 2); ctx.stroke();
        ctx.save(); ctx.rotate(time * (rank >= 3 ? 1.8 : 1));
        ctx.setLineDash([8, 10]);
        ctx.beginPath(); ctx.ellipse(0, 0, 43, 23, 0, 0, Math.PI * 2); ctx.stroke();
        ctx.restore();
        ctx.globalAlpha = 1;
        ctx.shadowColor = q.color; ctx.shadowBlur = 30 + rank * 5;
        ctx.fillStyle = "rgba(17,22,37,.9)";
        roundRect(-42, -24, 84, 48, 12); ctx.fill();
        ctx.scale(1.32, 1.32);
        drawWeaponModel(item.weapon, q.color);
        ctx.scale(1 / 1.32, 1 / 1.32);
        ctx.shadowBlur = 0;
        ctx.fillStyle = q.color; ctx.font = "800 9px DM Sans"; ctx.textAlign = "center";
        ctx.fillText(`${q.name.toUpperCase()} // ${item.weapon.short.toUpperCase()}`, 0, -32);
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
    if (p.meleeTime > 0) {
      const progress = 1 - p.meleeTime / .18;
      ctx.strokeStyle = "#fff0b0";
      ctx.lineWidth = 8;
      ctx.globalAlpha = Math.sin(progress * Math.PI);
      ctx.beginPath();
      ctx.arc(0, 0, 54, -1.15 + progress * .7, .95 + progress * .7);
      ctx.stroke();
      ctx.globalAlpha = 1;
    }
    if (weapon) {
      ctx.save();
      ctx.translate(-p.recoil, 0);
      ctx.scale(1.2, 1.2);
      drawWeaponModel(weapon, qualities[weapon.qualityId].color);
      ctx.restore();
      if (p.muzzleFlash > 0) drawPlayerMuzzleFlash(weapon, p.muzzleFlash, p.barrelHeat);
    }
    ctx.restore();
  }

  function drawWeaponModel(weapon, qualityColor) {
    const model = weapon.model || "pistol";
    const qualityOrder = ["common", "uncommon", "rare", "epic", "legendary"];
    const rank = Math.max(0, qualityOrder.indexOf(weapon.qualityId));
    const time = performance.now() * .001;
    ctx.save();
    ctx.translate(9, 0);
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    ctx.strokeStyle = "#0d1220";
    ctx.lineWidth = 2.2;
    ctx.fillStyle = qualityColor;

    if (rank >= 2) {
      ctx.save();
      ctx.globalAlpha = .12 + rank * .045 + Math.sin(time * 4) * .035;
      ctx.shadowColor = qualityColor;
      ctx.shadowBlur = 18 + rank * 5;
      ctx.fillStyle = qualityColor;
      roundRect(-8, -13, 57, 26, 12); ctx.fill();
      ctx.restore();
    }
    if (weapon.house === "helix") {
      ctx.strokeStyle = qualityColor; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(2, -10); ctx.lineTo(12, -15); ctx.lineTo(24, -10); ctx.stroke();
    } else if (weapon.house === "forge") {
      ctx.fillStyle = "#4c3027";
      ctx.beginPath(); ctx.moveTo(-6, -8); ctx.lineTo(4, -12); ctx.lineTo(7, -6); ctx.closePath(); ctx.fill();
    } else if (weapon.house === "vector") {
      ctx.strokeStyle = qualityColor; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(-5, -10); ctx.lineTo(2, -15); ctx.lineTo(7, -10); ctx.stroke();
    } else if (weapon.house === "relic") {
      ctx.fillStyle = qualityColor; ctx.globalAlpha = .45;
      polygon(7, 0, 8, 6); ctx.fill(); ctx.globalAlpha = 1;
    }

    if (model === "pistol" || model === "revolver") {
      roundRect(0, -6, model === "revolver" ? 25 : 29, 11, 4); ctx.fill(); ctx.stroke();
      if (model === "revolver") {
        ctx.fillStyle = "#31394c"; ctx.beginPath(); ctx.arc(12, 0, 6, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      }
      ctx.fillStyle = "#252d40"; ctx.beginPath(); ctx.moveTo(8, 5); ctx.lineTo(18, 5); ctx.lineTo(15, 16); ctx.lineTo(8, 14); ctx.closePath(); ctx.fill(); ctx.stroke();
    } else if (model === "smg" || model === "carbine" || model === "needler") {
      const length = model === "carbine" ? 42 : 35;
      roundRect(-2, -7, length, 13, 4); ctx.fill(); ctx.stroke();
      ctx.fillStyle = "#252d40"; ctx.fillRect(8, 6, 8, model === "needler" ? 16 : 12);
      ctx.fillStyle = qualityColor; ctx.fillRect(length - 2, -3, model === "needler" ? 11 : 7, 5);
      if (model === "carbine") { ctx.fillStyle = "#252d40"; ctx.fillRect(-9, -4, 10, 8); }
      if (model === "needler") {
        ctx.fillStyle = "#d9fff7";
        for (let x = 8; x < length - 2; x += 7) ctx.fillRect(x, -3, 3, 3);
      }
    } else if (model === "shotgun") {
      ctx.fillStyle = qualityColor; roundRect(-1, -7, 43, 6, 3); ctx.fill(); ctx.stroke();
      roundRect(-1, 1, 43, 6, 3); ctx.fill(); ctx.stroke();
      ctx.fillStyle = "#6b4932"; ctx.fillRect(9, -7, 17, 14);
      ctx.fillStyle = "#252d40"; ctx.beginPath(); ctx.moveTo(2, 6); ctx.lineTo(15, 6); ctx.lineTo(10, 17); ctx.closePath(); ctx.fill();
    } else if (model === "railgun") {
      ctx.fillStyle = "#202b42"; roundRect(-4, -9, 50, 18, 5); ctx.fill(); ctx.stroke();
      ctx.fillStyle = qualityColor; roundRect(4, -4, 47, 8, 4); ctx.fill();
      ctx.fillStyle = "#dff8ff"; ctx.fillRect(18, -2, 23, 4);
      ctx.fillStyle = "#252d40"; ctx.fillRect(3, 9, 10, 11);
    } else if (model === "laser" || model === "tesla") {
      ctx.fillStyle = "#252d40"; roundRect(-1, -8, 40, 16, 7); ctx.fill(); ctx.stroke();
      ctx.fillStyle = qualityColor; ctx.beginPath(); ctx.arc(model === "tesla" ? 30 : 14, 0, model === "tesla" ? 8 : 6, 0, Math.PI * 2); ctx.fill();
      if (model === "tesla") {
        ctx.strokeStyle = "#d6fbff"; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(35, -6); ctx.lineTo(43, 0); ctx.lineTo(35, 6); ctx.stroke();
      } else {
        ctx.fillRect(36, -3, 10, 6);
      }
      ctx.fillStyle = "#252d40"; ctx.fillRect(7, 8, 8, 10);
    } else if (model === "launcher" || model === "flame") {
      ctx.fillStyle = "#252d40"; roundRect(-3, -10, 43, 20, 7); ctx.fill(); ctx.stroke();
      ctx.fillStyle = qualityColor; roundRect(5, -6, 31, 12, 5); ctx.fill();
      ctx.fillStyle = model === "flame" ? "#ffcf73" : "#111827";
      ctx.beginPath(); ctx.arc(40, 0, 9, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      ctx.fillStyle = "#252d40"; ctx.fillRect(7, 10, 10, 11);
    } else if (model === "crossbow") {
      ctx.strokeStyle = qualityColor; ctx.lineWidth = 4;
      ctx.beginPath(); ctx.arc(23, 0, 21, -1.15, 1.15); ctx.stroke();
      ctx.strokeStyle = "#e5edf2"; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(31, -19); ctx.lineTo(31, 19); ctx.stroke();
      ctx.fillStyle = "#5d4332"; roundRect(-4, -4, 43, 8, 3); ctx.fill(); ctx.stroke();
      ctx.fillStyle = qualityColor; ctx.beginPath(); ctx.moveTo(47, 0); ctx.lineTo(35, -5); ctx.lineTo(35, 5); ctx.closePath(); ctx.fill();
    } else if (model === "prism") {
      ctx.fillStyle = "#242a42"; roundRect(-1, -9, 34, 18, 6); ctx.fill(); ctx.stroke();
      ctx.fillStyle = qualityColor; polygon(25, 0, 11, 3); ctx.fill(); ctx.stroke();
      ctx.fillStyle = "#f3dcff"; ctx.fillRect(32, -2, 14, 4);
      ctx.fillStyle = "#252d40"; ctx.fillRect(5, 9, 8, 10);
    } else if (model === "orb") {
      ctx.strokeStyle = qualityColor; ctx.lineWidth = 4;
      ctx.beginPath(); ctx.arc(23, 0, 12, 0, Math.PI * 2); ctx.stroke();
      ctx.fillStyle = "#e7e1ff"; ctx.beginPath(); ctx.arc(23, 0, 5, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#3c315e"; roundRect(-3, -5, 20, 10, 4); ctx.fill(); ctx.stroke();
    } else if (model === "ricochet") {
      ctx.fillStyle = qualityColor;
      polygon(22, 0, 18, 6); ctx.fill(); ctx.stroke();
      ctx.fillStyle = "#252d40"; roundRect(-4, -5, 23, 10, 4); ctx.fill(); ctx.stroke();
      ctx.fillStyle = "#fff2a3"; ctx.beginPath(); ctx.arc(29, 0, 4, 0, Math.PI * 2); ctx.fill();
    }
    if (rank >= 1) {
      ctx.fillStyle = "#f7fbff";
      ctx.shadowColor = qualityColor;
      ctx.shadowBlur = 8 + rank * 3;
      ctx.beginPath();
      ctx.arc(model === "launcher" || model === "flame" ? 11 : 17, 0, 2.2 + rank * .35, 0, Math.PI * 2);
      ctx.fill();
    }
    if (rank >= 3) {
      ctx.strokeStyle = qualityColor;
      ctx.lineWidth = 1.5;
      ctx.globalAlpha = .75;
      const pulse = 2 + Math.sin(time * 6) * 1.2;
      ctx.beginPath(); ctx.moveTo(4, -10 - pulse); ctx.lineTo(38, -10 - pulse); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(4, 10 + pulse); ctx.lineTo(32, 10 + pulse); ctx.stroke();
      ctx.globalAlpha = 1;
    }
    if (rank === 4) {
      ctx.fillStyle = qualityColor;
      for (let i = 0; i < 3; i++) {
        const orbit = time * 3 + i * Math.PI * 2 / 3;
        ctx.beginPath();
        ctx.arc(20 + Math.cos(orbit) * 8, Math.sin(orbit) * 11, 1.8, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.restore();
  }

  function drawPlayerMuzzleFlash(weapon, life, heat) {
    const lengthByModel = {
      pistol: 42, revolver: 45, smg: 48, carbine: 55, needler: 57, shotgun: 58,
      railgun: 68, laser: 57, tesla: 58, launcher: 60, flame: 62, crossbow: 61,
      prism: 58, orb: 49, ricochet: 52
    };
    const x = (lengthByModel[weapon.model] || 50) * 1.17 - state.player.recoil;
    const color = qualities[weapon.qualityId].color;
    ctx.save();
    ctx.translate(x, 0);
    ctx.globalAlpha = Math.min(1, life * 18);
    ctx.shadowColor = color;
    ctx.shadowBlur = 22 + heat * 16;
    ctx.fillStyle = weapon.model === "flame" ? "#ffdd75" : "#fff";
    const size = weapon.model === "shotgun" || weapon.model === "launcher" ? 17 : 11;
    ctx.beginPath();
    for (let i = 0; i < 8; i++) {
      const angle = i / 8 * Math.PI * 2;
      const radius = i % 2 ? size * .35 : size * random(.8, 1.25);
      const px = Math.cos(angle) * radius;
      const py = Math.sin(angle) * radius;
      if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = color; ctx.globalAlpha *= .75;
    ctx.beginPath(); ctx.arc(0, 0, size * .42, 0, Math.PI * 2); ctx.fill();
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
    } else if (e.typeId === "editor") {
      polygon(0, 0, e.radius, 3); ctx.fill();
      ctx.strokeStyle = "#ffe0cf"; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(-8, 6); ctx.lineTo(8, -7); ctx.stroke();
    } else if (e.typeId === "sniper") {
      ctx.rotate(Math.PI / 4); ctx.fillRect(-e.radius * .72, -e.radius * .72, e.radius * 1.44, e.radius * 1.44);
      ctx.rotate(-Math.PI / 4);
      ctx.strokeStyle = "#d9fbff"; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(0, 0, e.radius * .55, 0, Math.PI * 2); ctx.stroke();
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
    ctx.translate(b.x, b.y);
    const angle = Math.atan2(b.vy, b.vx);
    ctx.rotate(angle);
    ctx.shadowColor = b.color;
    ctx.shadowBlur = b.model === "orb" ? 24 : 14;
    ctx.fillStyle = b.color;
    const speed = Math.hypot(b.vx, b.vy);
    const trail = Math.min(34, speed * .025);

    if (b.model === "railgun") {
      const gradient = ctx.createLinearGradient(-42, 0, 10, 0);
      gradient.addColorStop(0, "transparent");
      gradient.addColorStop(.65, b.color);
      gradient.addColorStop(1, "#ffffff");
      ctx.fillStyle = gradient;
      roundRect(-42, -3, 55, 6, 3); ctx.fill();
      ctx.fillStyle = "#fff"; roundRect(3, -2, 14, 4, 2); ctx.fill();
    } else if (b.model === "laser") {
      const gradient = ctx.createLinearGradient(-trail, 0, 12, 0);
      gradient.addColorStop(0, "transparent"); gradient.addColorStop(.5, b.color); gradient.addColorStop(1, "#fff");
      ctx.fillStyle = gradient; roundRect(-trail, -2.2, trail + 14, 4.4, 3); ctx.fill();
    } else if (b.model === "crossbow") {
      ctx.strokeStyle = b.color; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(-18, 0); ctx.lineTo(11, 0); ctx.stroke();
      ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.moveTo(15, 0); ctx.lineTo(6, -5); ctx.lineTo(6, 5); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = "#b9e58a"; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(-13, 0); ctx.lineTo(-20, -6); ctx.moveTo(-13, 0); ctx.lineTo(-20, 6); ctx.stroke();
    } else if (b.model === "launcher") {
      ctx.fillStyle = "#1b2032"; ctx.beginPath(); ctx.arc(0, 0, b.radius + 2, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = b.color; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(0, 0, b.radius, 0, Math.PI * 2); ctx.stroke();
      ctx.fillStyle = "#fff0c8"; ctx.beginPath(); ctx.arc(2, 0, 2.5, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = b.color; ctx.globalAlpha = .65; ctx.beginPath(); ctx.moveTo(-5, -4); ctx.lineTo(-19, 0); ctx.lineTo(-5, 4); ctx.closePath(); ctx.fill();
    } else if (b.model === "orb") {
      const pulse = 1 + Math.sin(performance.now() * .018 + b.x) * .2;
      ctx.strokeStyle = b.color; ctx.lineWidth = 2.5;
      ctx.beginPath(); ctx.arc(0, 0, (b.radius + 5) * pulse, 0, Math.PI * 2); ctx.stroke();
      ctx.rotate(performance.now() * .006);
      for (let i = 0; i < 3; i++) {
        ctx.rotate(Math.PI * 2 / 3);
        ctx.fillStyle = b.color; ctx.beginPath(); ctx.arc(b.radius + 7, 0, 2.3, 0, Math.PI * 2); ctx.fill();
      }
      ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.arc(0, 0, b.radius, 0, Math.PI * 2); ctx.fill();
    } else if (b.model === "flame") {
      const gradient = ctx.createRadialGradient(4, 0, 1, 0, 0, b.radius + 7);
      gradient.addColorStop(0, "#fff7ad"); gradient.addColorStop(.4, b.color); gradient.addColorStop(1, "transparent");
      ctx.fillStyle = gradient; ctx.beginPath(); ctx.arc(0, 0, b.radius + 7, 0, Math.PI * 2); ctx.fill();
    } else if (b.model === "ricochet") {
      ctx.rotate(performance.now() * .012);
      ctx.fillStyle = b.color; polygon(0, 0, b.radius + 4, 6); ctx.fill();
      ctx.strokeStyle = "#fff"; ctx.lineWidth = 1.5; polygon(0, 0, b.radius + 1, 6); ctx.stroke();
    } else if (b.model === "tesla") {
      ctx.strokeStyle = b.color; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(-trail, 0); ctx.lineTo(-trail * .7, -4); ctx.lineTo(-trail * .4, 4); ctx.lineTo(0, 0); ctx.stroke();
      ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.arc(4, 0, b.radius, 0, Math.PI * 2); ctx.fill();
    } else if (b.model === "prism") {
      ctx.fillStyle = b.color; polygon(0, 0, b.radius + 3, 3); ctx.fill();
      ctx.strokeStyle = "#fff"; ctx.lineWidth = 1.2; polygon(0, 0, b.radius + 1, 3); ctx.stroke();
      ctx.globalAlpha = .35; ctx.fillStyle = b.color; ctx.beginPath(); ctx.moveTo(-trail, -5); ctx.lineTo(3, 0); ctx.lineTo(-trail, 5); ctx.closePath(); ctx.fill();
    } else if (b.model === "needler") {
      ctx.fillStyle = b.color; ctx.beginPath(); ctx.moveTo(10, 0); ctx.lineTo(-7, -3); ctx.lineTo(-3, 0); ctx.lineTo(-7, 3); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = "#d9fff8"; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(-16, 0); ctx.lineTo(-2, 0); ctx.stroke();
    } else {
      const gradient = ctx.createLinearGradient(-trail, 0, 9, 0);
      gradient.addColorStop(0, "transparent"); gradient.addColorStop(.72, b.color); gradient.addColorStop(1, "#fff");
      ctx.fillStyle = gradient; roundRect(-trail, -b.radius, trail + 11, b.radius * 2, b.radius); ctx.fill();
    }
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

  function addMuzzleEffect(player, weapon, color) {
    const barrel = {
      pistol: 50, revolver: 53, smg: 56, carbine: 63, needler: 65, shotgun: 66,
      railgun: 76, laser: 65, tesla: 66, launcher: 68, flame: 70, crossbow: 69,
      prism: 66, orb: 57, ricochet: 60
    }[weapon.model] || 58;
    const x = player.x + Math.cos(player.angle) * (barrel - player.recoil);
    const y = player.y + Math.sin(player.angle) * (barrel - player.recoil);
    state.effects.push({
      type: "muzzle", layer: "over", x, y, rotation: player.angle,
      size: weapon.pellets > 1 || weapon.explosive ? 21 : 14,
      life: .1, maxLife: .1, color, model: weapon.model
    });
    state.effects.push({
      type: "ring", layer: "under", x, y, radius: 3,
      endRadius: weapon.model === "railgun" ? 32 : 18,
      lineWidth: 3, life: .16, maxLife: .16, color
    });
  }

  function addImpactEffect(x, y, color, model, enemyHit = false) {
    const strong = ["railgun", "launcher", "shotgun", "crossbow"].includes(model);
    state.effects.push({
      type: "ring", layer: "under", x, y, radius: 2,
      endRadius: strong ? 24 : 13, lineWidth: strong ? 4 : 2,
      life: strong ? .24 : .15, maxLife: strong ? .24 : .15, color
    });
    const count = strong ? 8 : 4;
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = random(45, strong ? 145 : 90);
      state.effects.push({
        type: "spark", layer: "over", x, y,
        vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed,
        rotation: angle, length: random(5, strong ? 14 : 9),
        life: random(.13, .3), maxLife: .3, color: enemyHit && i % 3 === 0 ? "#fff" : color
      });
    }
  }

  function updateEffects(dt) {
    for (let i = state.effects.length - 1; i >= 0; i--) {
      const effect = state.effects[i];
      effect.life -= dt;
      if (effect.type === "casing") {
        effect.x += effect.vx * dt;
        effect.y += effect.vy * dt;
        effect.vx *= .96;
        effect.vy = effect.vy * .96 + 150 * dt;
        effect.rotation += effect.spin * dt;
      } else if (effect.type === "spark") {
        effect.x += effect.vx * dt;
        effect.y += effect.vy * dt;
        effect.vx *= .92;
        effect.vy *= .92;
      } else if (effect.type === "ring") {
        const progress = 1 - effect.life / effect.maxLife;
        effect.currentRadius = effect.radius + (effect.endRadius - effect.radius) * progress;
      }
      if (effect.life <= 0) state.effects.splice(i, 1);
    }
  }

  function drawEffects(layer) {
    state.effects.forEach(effect => {
      if ((effect.layer || "over") !== layer) return;
      const alpha = clamp(effect.life / effect.maxLife, 0, 1);
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.translate(effect.x, effect.y);
      if (effect.type === "ring") {
        ctx.strokeStyle = effect.color;
        ctx.shadowColor = effect.color;
        ctx.shadowBlur = 12;
        ctx.lineWidth = effect.lineWidth * alpha;
        ctx.beginPath(); ctx.arc(0, 0, effect.currentRadius || effect.radius, 0, Math.PI * 2); ctx.stroke();
      } else if (effect.type === "flash") {
        const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, effect.radius);
        gradient.addColorStop(0, effect.color); gradient.addColorStop(1, "transparent");
        ctx.fillStyle = gradient; ctx.beginPath(); ctx.arc(0, 0, effect.radius, 0, Math.PI * 2); ctx.fill();
      } else if (effect.type === "muzzle") {
        ctx.rotate(effect.rotation);
        ctx.shadowColor = effect.color; ctx.shadowBlur = 20;
        ctx.fillStyle = effect.model === "flame" ? "#ffcf63" : "#ffffff";
        ctx.beginPath(); ctx.moveTo(effect.size, 0); ctx.lineTo(-4, -effect.size * .45); ctx.lineTo(1, 0); ctx.lineTo(-4, effect.size * .45); ctx.closePath(); ctx.fill();
        ctx.fillStyle = effect.color; ctx.beginPath(); ctx.arc(0, 0, effect.size * .34, 0, Math.PI * 2); ctx.fill();
      } else if (effect.type === "spark") {
        ctx.rotate(effect.rotation);
        ctx.strokeStyle = effect.color; ctx.shadowColor = effect.color; ctx.shadowBlur = 8; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(-effect.length, 0); ctx.lineTo(effect.length * .25, 0); ctx.stroke();
      } else if (effect.type === "casing") {
        ctx.rotate(effect.rotation);
        ctx.fillStyle = effect.color;
        roundRect(-3, -1.5, 6, 3, 1); ctx.fill();
        ctx.fillStyle = "#fff0a8"; ctx.fillRect(1.5, -1.5, 1, 3);
      }
      ctx.restore();
    });
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
        ui.reloadLabel.textContent = "X / right click: melee";
      } else if (weapon.ammo === 0) {
        ui.reloadLabel.textContent = "Fire to melee / auto reload";
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

  async function toggleFullscreen() {
    try {
      if (!document.fullscreenElement && !document.webkitFullscreenElement) {
        const request = canvasWrap.requestFullscreen || canvasWrap.webkitRequestFullscreen;
        if (request) await request.call(canvasWrap);
      } else {
        const exit = document.exitFullscreen || document.webkitExitFullscreen;
        if (exit) await exit.call(document);
      }
    } catch (error) {
      console.warn("Fullscreen is not available in this browser.", error);
    }
  }

  function updateFullscreenButton() {
    const active = document.fullscreenElement === canvasWrap || document.webkitFullscreenElement === canvasWrap;
    ui.fullscreenButton.textContent = active ? "EXIT" : "FULL";
    ui.fullscreenButton.setAttribute("aria-label", active ? "Exit fullscreen" : "Enter fullscreen");
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
  ui.fullscreenButton.addEventListener("click", toggleFullscreen);
  ui.resumeButton.addEventListener("click", () => togglePause(false));
  ui.weaponSlots.forEach((slot, index) => slot.addEventListener("click", () => switchWeapon(index)));

  window.addEventListener("keydown", event => {
    keys[event.code] = true;
    if (["Space", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(event.code)) event.preventDefault();
    if (event.repeat && ["KeyF", "KeyG", "KeyQ", "KeyR", "KeyE", "KeyX", "ShiftLeft", "ShiftRight"].includes(event.code)) return;
    if (event.code === "Escape") togglePause();
    if (event.code === "KeyF") interact();
    if (event.code === "KeyG") toggleFullscreen();
    if (event.code === "KeyQ") cycleWeapon();
    if (event.code === "KeyR") startReload();
    if (event.code === "KeyX") meleeAttack();
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
  document.addEventListener("fullscreenchange", updateFullscreenButton);
  document.addEventListener("webkitfullscreenchange", updateFullscreenButton);

  canvas.addEventListener("pointermove", event => {
    const p = canvasPoint(event);
    pointer.x = p.x; pointer.y = p.y; pointer.inside = true;
  });
  canvas.addEventListener("pointerenter", () => { pointer.inside = true; });
  canvas.addEventListener("pointerleave", () => { pointer.inside = false; pointer.down = false; });
  canvas.addEventListener("pointerdown", event => {
    if (event.button === 2) {
      event.preventDefault();
      meleeAttack();
      return;
    }
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
  ui.touchMelee.addEventListener("pointerdown", event => { event.preventDefault(); meleeAttack(); });
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
  function angleDifference(a, b) { return Math.atan2(Math.sin(a - b), Math.cos(a - b)); }
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
