/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState, useCallback, lazy, Suspense } from 'react';
import { Volume2, VolumeX, Pause, Play, RotateCcw, Shield, Sparkles, Trophy, ArrowRight, FlaskConical, Gem } from 'lucide-react';
import { DEV_MODE } from './dev';

// Тестовая Phaser-сцена грузится лениво: в обычной игре (и в production-бандле) её код не попадает.
const GameTest = lazy(() => import('./GameTest'));

// --- Sound Synthesizer (Zero External Dependencies) ---
class SoundFX {
  private ctx: AudioContext | null = null;
  public muted: boolean = false;

  private init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  playShoot() {
    if (this.muted) return;
    try {
      this.init();
      if (!this.ctx) return;
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(420, t);
      osc.frequency.exponentialRampToValueAtTime(980, t + 0.06);
      osc.frequency.exponentialRampToValueAtTime(260, t + 0.16);

      gain.gain.setValueAtTime(0.18, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.16);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.16);
    } catch {}
  }

  playJump() {
    if (this.muted) return;
    try {
      this.init();
      if (!this.ctx) return;
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(190, t);
      osc.frequency.exponentialRampToValueAtTime(460, t + 0.13);

      gain.gain.setValueAtTime(0.15, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.14);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.14);
    } catch {}
  }

  playHit() {
    if (this.muted) return;
    try {
      this.init();
      if (!this.ctx) return;
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(320, t);
      osc.frequency.exponentialRampToValueAtTime(90, t + 0.1);

      gain.gain.setValueAtTime(0.2, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.12);
    } catch {}
  }

  playDroneDestroy() {
    if (this.muted) return;
    try {
      this.init();
      if (!this.ctx) return;
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(180, t);
      osc.frequency.exponentialRampToValueAtTime(45, t + 0.28);

      gain.gain.setValueAtTime(0.25, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.28);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.28);
    } catch {}
  }

  playHurt() {
    if (this.muted) return;
    try {
      this.init();
      if (!this.ctx) return;
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(160, t);
      osc.frequency.setValueAtTime(95, t + 0.08);

      gain.gain.setValueAtTime(0.24, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.22);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.22);
    } catch {}
  }

  playVictory() {
    if (this.muted) return;
    try {
      this.init();
      if (!this.ctx) return;
      const notes = [440, 554, 659, 880, 1108];
      notes.forEach((freq, i) => {
        const t = this.ctx!.currentTime + i * 0.1;
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, t);
        gain.gain.setValueAtTime(0.18, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
        osc.connect(gain);
        gain.connect(this.ctx!.destination);
        osc.start(t);
        osc.stop(t + 0.25);
      });
    } catch {}
  }

  playCrystal() {
    if (this.muted) return;
    try {
      this.init();
      if (!this.ctx) return;
      const t = this.ctx.currentTime;
      [659, 880, 1318].forEach((freq, idx) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, t + idx * 0.04);
        gain.gain.setValueAtTime(0.18, t + idx * 0.04);
        gain.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.04 + 0.22);
        osc.connect(gain);
        gain.connect(this.ctx!.destination);
        osc.start(t + idx * 0.04);
        osc.stop(t + idx * 0.04 + 0.22);
      });
    } catch {}
  }

  playSpawn() {
    if (this.muted) return;
    try {
      this.init();
      if (!this.ctx) return;
      // Ascending gentle sacred chord / bell chime: C5, E5, G5, C6 (523, 659, 784, 1046 Hz)
      const notes = [523.25, 659.25, 783.99, 1046.5];
      notes.forEach((freq, idx) => {
        const t = this.ctx!.currentTime + idx * 0.07;
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, t);
        osc.frequency.exponentialRampToValueAtTime(freq * 1.02, t + 0.3);

        gain.gain.setValueAtTime(0.16, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.38);

        osc.connect(gain);
        gain.connect(this.ctx!.destination);
        osc.start(t);
        osc.stop(t + 0.38);
      });
    } catch {}
  }
}

const sfx = new SoundFX();

// --- Types ---
interface Platform {
  x: number;
  y: number;
  w: number;
  h: number;
  isGround?: boolean;
}

interface Projectile {
  x: number;
  y: number;
  vx: number;
  vy: number;
  w: number;
  h: number;
  lifetime: number;
  isEnemy?: boolean;
}

interface ImpactBurst {
  x: number;
  y: number;
  frame: number;
  maxFrames: number;
  timer: number;
}

interface NatureParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  alpha: number;
  size: number;
  color: string;
}

interface Drone {
  id: number;
  x: number;
  y: number;
  baseY: number;
  w: number;
  h: number;
  vx: number;
  minX: number;
  maxX: number;
  hp: number;
  maxHp: number;
  animFrame: number;
  animTimer: number;
  shootTimer: number;
  hurtTimer: number;
  isBoss?: boolean;
}

interface Boss {
  x: number;
  y: number;
  baseY: number;
  w: number;
  h: number;
  hp: number;
  maxHp: number;
  vx: number;
  minX: number;
  maxX: number;
  shootTimer: number;
  smokeTimer: number;
  hurtTimer: number;
  active: boolean;
  isDead: boolean;
}

interface Crystal {
  id: number;
  x: number;
  y: number;
  collected: boolean;
  bobPhase: number;
}

interface Assets {
  bg: HTMLImageElement;
  bgAutumn?: HTMLImageElement;
  bossAutumn?: HTMLImageElement;
  bossHpFrame?: HTMLImageElement;
  bossHpFill?: HTMLImageElement;
  playerIdleRun: HTMLImageElement;
  playerJumpAttack: HTMLImageElement;
  vfx: HTMLImageElement;
  enemy: HTMLImageElement;
  tileset: HTMLImageElement;
  statue?: HTMLImageElement;
  ores?: HTMLImageElement;
}

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // UI State
  const [loading, setLoading] = useState(true);
  const [loadProgress, setLoadProgress] = useState(0);
  const [gameState, setGameState] = useState<'title' | 'playing' | 'paused' | 'gameover' | 'victory'>('title');
  const [currentLevel, setCurrentLevel] = useState<1 | 2>(1);
  const [score, setScore] = useState(0);
  const [health, setHealth] = useState(5);
  const [dronesPurified, setDronesPurified] = useState(0);
  const [totalDrones, setTotalDrones] = useState(0);
  const [crystalsCollected, setCrystalsCollected] = useState(0);
  const [totalCrystals, setTotalCrystals] = useState(5);
  const [muted, setMuted] = useState(false);
  const [wave, setWave] = useState(1);
  const [testMode, setTestMode] = useState(false);

  // References for Game Loop
  const assetsRef = useRef<Assets | null>(null);
  const keysRef = useRef<{ [key: string]: boolean }>({});
  const touchInputsRef = useRef({ left: false, right: false, jump: false, shoot: false });
  const gameLoopRef = useRef<number | null>(null);

  // Mutable Game Entities
  const gameRef = useRef({
    worldWidth: 3200,
    worldHeight: 540,
    cameraX: 0,
    shake: 0,
    score: 0,
    currentLevel: 1 as 1 | 2,
    dronesPurified: 0,
    totalDrones: 0,
    crystalsCollected: 0,
    totalCrystals: 5,
    wave: 1,
    checkpointX: 100,
    prevJumpPressed: false,
    levelToast: null as { title: string; subtitle: string; timer: number } | null,
    boss: null as Boss | null,
    player: {
      x: 120,
      y: 470,
      vx: 0,
      vy: 0,
      w: 36, // Hitbox
      h: 56,
      onGround: false,
      facingLeft: false,
      isAttacking: false,
      attackTimer: 0,
      attackCooldown: 0,
      animFrame: 0,
      animTimer: 0,
      health: 5,
      maxHealth: 5,
      hurtTimer: 0,
      spawnTimer: 0.7,
      coyoteTime: 0,
      jumpBuffer: 0,
      jumpsLeft: 2,
    },
    platforms: [] as Platform[],
    crystals: [] as Crystal[],
    projectiles: [] as Projectile[],
    bursts: [] as ImpactBurst[],
    particles: [] as NatureParticle[],
    drones: [] as Drone[],
    ambientSpores: [] as { x: number; y: number; speed: number; size: number; phase: number }[],
  });

  // Toggle Mute
  const toggleMute = () => {
    sfx.muted = !sfx.muted;
    setMuted(sfx.muted);
  };

  // --- Initial Asset Preloader using Promise.all ---
  useEffect(() => {
    const assetSources = {
      bg: 'bg_table_mountain.png',
      bgAutumn: 'assets/bg_autumn.png',
      bossAutumn: 'assets/enemy_boss_autumn.png',
      bossHpFrame: 'assets/GandalfHardcore Hp bar/Hp bar.png',
      bossHpFill: 'assets/GandalfHardcore Hp bar/red bar.png',
      playerIdleRun: 'elahim_idle_run.png',
      playerJumpAttack: 'elahim_jump_attack.png',
      vfx: 'elahim_vfx_projectiles.png',
      enemy: 'enemy_smog_drone.png',
      tileset: 'assets/GandalfHardcore FREE Platformer Assets/Floor Tiles1.png',
      statue: 'assets/GandalfHardcore FREE Platformer Assets/Angel Statue.png',
      ores: 'assets/GandalfHardcore FREE Platformer Assets/Ores.png',
    };

    let loadedCount = 0;
    const totalAssets = Object.keys(assetSources).length;

    const loadSingleImage = (url: string): Promise<HTMLImageElement> => {
      return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
          loadedCount++;
          setLoadProgress(Math.round((loadedCount / totalAssets) * 100));
          resolve(img);
        };
        img.onerror = () => {
          // Fallback check
          const fallback = new Image();
          fallback.onload = () => {
            loadedCount++;
            setLoadProgress(Math.round((loadedCount / totalAssets) * 100));
            resolve(fallback);
          };
          fallback.onerror = () => {
            console.warn(`Optional asset failed: ${url}`);
            loadedCount++;
            setLoadProgress(Math.round((loadedCount / totalAssets) * 100));
            resolve(img);
          };
          fallback.src = `/public/${url}`;
        };
        img.src = url;
      });
    };

    Promise.all([
      loadSingleImage(assetSources.bg),
      loadSingleImage(assetSources.bgAutumn),
      loadSingleImage(assetSources.bossAutumn),
      loadSingleImage(assetSources.bossHpFrame),
      loadSingleImage(assetSources.bossHpFill),
      loadSingleImage(assetSources.playerIdleRun),
      loadSingleImage(assetSources.playerJumpAttack),
      loadSingleImage(assetSources.vfx),
      loadSingleImage(assetSources.enemy),
      loadSingleImage(assetSources.tileset),
      loadSingleImage(assetSources.statue),
      loadSingleImage(assetSources.ores),
    ])
      .then(([bg, bgAutumn, bossAutumn, bossHpFrame, bossHpFill, playerIdleRun, playerJumpAttack, vfx, enemy, tileset, statue, ores]) => {
        assetsRef.current = {
          bg,
          bgAutumn,
          bossAutumn,
          bossHpFrame,
          bossHpFill,
          playerIdleRun,
          playerJumpAttack,
          vfx,
          enemy,
          tileset,
          statue,
          ores,
        };
        setTimeout(() => {
          setLoading(false);
        }, 300);
      })
      .catch((err) => {
        console.error('Failed to preload one or more game sprite assets:', err);
        setLoading(false);
      });
  }, []);

  // --- Initialize Level & Entities ---
  const initLevel = useCallback((targetWave: number = 1, targetLevel: 1 | 2 = 1) => {
    const g = gameRef.current;
    g.wave = targetWave;
    g.currentLevel = targetLevel;
    setCurrentLevel(targetLevel);
    setWave(targetWave);

    if (targetLevel === 1) {
      // Level 1: Table Mountain Forest
      g.platforms = [
        { x: 0, y: 470, w: g.worldWidth, h: 70, isGround: true },
        { x: 260, y: 380, w: 224, h: 32 },
        { x: 560, y: 290, w: 256, h: 32 },
        { x: 880, y: 210, w: 224, h: 32 },
        { x: 1180, y: 350, w: 256, h: 32 },
        { x: 1520, y: 250, w: 320, h: 32 }, // Sanctuary checkpoint
        { x: 1880, y: 360, w: 224, h: 32 },
        { x: 2200, y: 270, w: 256, h: 32 },
        { x: 2560, y: 190, w: 320, h: 32 },
        { x: 2940, y: 350, w: 224, h: 32 }, // Portal Platform
      ];

      const baseDrones: Drone[] = [
        { id: 1, x: 340, y: 330, baseY: 330, w: 48, h: 48, vx: 70, minX: 270, maxX: 460, hp: 2, maxHp: 2, animFrame: 0, animTimer: 0, shootTimer: 2.5, hurtTimer: 0 },
        { id: 2, x: 650, y: 240, baseY: 240, w: 48, h: 48, vx: 80, minX: 570, maxX: 780, hp: 2, maxHp: 2, animFrame: 1, animTimer: 0, shootTimer: 3.5, hurtTimer: 0 },
        { id: 3, x: 960, y: 160, baseY: 160, w: 48, h: 48, vx: 75, minX: 890, maxX: 1080, hp: 2, maxHp: 2, animFrame: 2, animTimer: 0, shootTimer: 2.8, hurtTimer: 0 },
        { id: 4, x: 1040, y: 420, baseY: 420, w: 48, h: 48, vx: 85, minX: 920, maxX: 1220, hp: 2, maxHp: 2, animFrame: 0, animTimer: 0, shootTimer: 4.0, hurtTimer: 0 },
        { id: 5, x: 1280, y: 300, baseY: 300, w: 48, h: 48, vx: 90, minX: 1190, maxX: 1420, hp: 2, maxHp: 2, animFrame: 3, animTimer: 0, shootTimer: 3.2, hurtTimer: 0 },
        { id: 6, x: 1620, y: 200, baseY: 200, w: 48, h: 48, vx: 80, minX: 1530, maxX: 1780, hp: 2, maxHp: 2, animFrame: 4, animTimer: 0, shootTimer: 2.9, hurtTimer: 0 },
        { id: 7, x: 1980, y: 310, baseY: 310, w: 48, h: 48, vx: 90, minX: 1890, maxX: 2090, hp: 2, maxHp: 2, animFrame: 1, animTimer: 0, shootTimer: 3.7, hurtTimer: 0 },
        { id: 8, x: 2320, y: 220, baseY: 220, w: 48, h: 48, vx: 95, minX: 2210, maxX: 2450, hp: 2, maxHp: 2, animFrame: 5, animTimer: 0, shootTimer: 2.6, hurtTimer: 0 },
        { id: 9, x: 2700, y: 140, baseY: 140, w: 56, h: 56, vx: 110, minX: 2570, maxX: 2860, hp: 4, maxHp: 4, animFrame: 0, animTimer: 0, shootTimer: 2.0, hurtTimer: 0, isBoss: true },
      ];

      if (targetWave > 1) {
        baseDrones.push(
          { id: 10, x: 1450, y: 420, baseY: 420, w: 48, h: 48, vx: 100, minX: 1350, maxX: 1600, hp: 3, maxHp: 3, animFrame: 2, animTimer: 0, shootTimer: 2.4, hurtTimer: 0 },
          { id: 11, x: 2050, y: 420, baseY: 420, w: 48, h: 48, vx: 105, minX: 1950, maxX: 2200, hp: 3, maxHp: 3, animFrame: 3, animTimer: 0, shootTimer: 2.2, hurtTimer: 0 },
        );
      }

      g.drones = baseDrones;
      g.boss = null;

      // Spawn 5 Sacred Nature Crystals across Level 1
      g.crystals = [
        { id: 1, x: 680, y: 250, collected: false, bobPhase: 0 },
        { id: 2, x: 990, y: 170, collected: false, bobPhase: 1 },
        { id: 3, x: 1670, y: 210, collected: false, bobPhase: 2 },
        { id: 4, x: 2320, y: 230, collected: false, bobPhase: 3 },
        { id: 5, x: 2710, y: 150, collected: false, bobPhase: 4 },
      ];
    } else {
      // Level 2: Autumn Thicket & Boss Arena
      g.platforms = [
        { x: 0, y: 470, w: g.worldWidth, h: 70, isGround: true },
        // Stepped mountain paths
        { x: 240, y: 370, w: 224, h: 32 },
        { x: 540, y: 270, w: 256, h: 32 },
        { x: 860, y: 190, w: 224, h: 32 },
        { x: 1180, y: 320, w: 256, h: 32 },
        { x: 1480, y: 240, w: 320, h: 32 }, // Autumn checkpoint
        { x: 1860, y: 350, w: 224, h: 32 }, // Boss Arena entrance
        // Boss Arena aerial battle ledges
        { x: 2160, y: 250, w: 192, h: 32 },
        { x: 2420, y: 360, w: 256, h: 32 },
        { x: 2700, y: 240, w: 224, h: 32 },
        // Final Sanctuary Platform
        { x: 2940, y: 350, w: 224, h: 32 },
      ];

      g.drones = [
        { id: 1, x: 380, y: 320, baseY: 320, w: 48, h: 48, vx: 75, minX: 250, maxX: 450, hp: 3, maxHp: 3, animFrame: 0, animTimer: 0, shootTimer: 2.8, hurtTimer: 0 },
        { id: 2, x: 970, y: 140, baseY: 140, w: 48, h: 48, vx: 80, minX: 880, maxX: 1070, hp: 3, maxHp: 3, animFrame: 1, animTimer: 0, shootTimer: 3.0, hurtTimer: 0 },
        { id: 3, x: 1560, y: 190, baseY: 190, w: 48, h: 48, vx: 85, minX: 1490, maxX: 1780, hp: 3, maxHp: 3, animFrame: 2, animTimer: 0, shootTimer: 2.5, hurtTimer: 0 },
      ];

      // Final Boss: Smog Behemoth
      g.boss = {
        x: 2500,
        y: 230,
        baseY: 230,
        w: 160,
        h: 90,
        hp: 20,
        maxHp: 20,
        vx: 55,
        minX: 2200,
        maxX: 2750,
        shootTimer: 2.2,
        smokeTimer: 1.2,
        hurtTimer: 0,
        active: true,
        isDead: false,
      };

      // 5 Sacred Nature Crystals distributed across Level 2
      g.crystals = [
        { id: 1, x: 350, y: 320, collected: false, bobPhase: 0 },
        { id: 2, x: 660, y: 220, collected: false, bobPhase: 1 },
        { id: 3, x: 970, y: 140, collected: false, bobPhase: 2 },
        { id: 4, x: 1640, y: 190, collected: false, bobPhase: 3 },
        { id: 5, x: 2250, y: 200, collected: false, bobPhase: 4 },
      ];
    }

    // Reset Player position and stats
    g.player.x = g.checkpointX;
    g.player.y = g.checkpointX > 100 ? 240 : 470;
    g.player.vx = 0;
    g.player.vy = 0;
    g.player.health = 5;
    g.player.onGround = true;
    g.player.jumpsLeft = 2;
    g.prevJumpPressed = false;
    g.player.facingLeft = false;
    g.player.isAttacking = false;
    g.player.attackTimer = 0;
    g.player.attackCooldown = 0;
    g.player.hurtTimer = 0;
    g.player.spawnTimer = 0.7;
    g.cameraX = Math.max(0, g.player.x - 960 * 0.42);
    g.shake = 0;

    // Reset Projectiles & VFX
    g.projectiles = [];
    g.bursts = [];
    g.particles = [];

    // Trigger Cinematic Spawn Sound & Particles
    sfx.playSpawn();
    for (let i = 0; i < 16; i++) {
      const angle = (i / 16) * Math.PI * 2 + (Math.random() - 0.5) * 0.15;
      const spd = 60 + Math.random() * 85;
      g.particles.push({
        x: g.player.x,
        y: g.player.y - 28,
        vx: Math.cos(angle) * spd,
        vy: Math.sin(angle) * spd,
        alpha: 1.0,
        size: 2.5 + Math.random() * 2.5,
        color: Math.random() > 0.4 ? '#fef08a' : '#eab308',
      });
    }

    // Create Ambient Atmospheric Spores
    g.ambientSpores = Array.from({ length: 45 }, () => ({
      x: Math.random() * g.worldWidth,
      y: Math.random() * 450,
      speed: 0.3 + Math.random() * 0.7,
      size: 1.5 + Math.random() * 2.5,
      phase: Math.random() * Math.PI * 2,
    }));

    g.totalDrones = g.drones.length;
    g.dronesPurified = 0;
    g.crystalsCollected = 0;
    g.totalCrystals = g.crystals.length;

    setCrystalsCollected(0);
    setTotalCrystals(g.crystals.length);
    setTotalDrones(g.totalDrones);
    setDronesPurified(0);
    setHealth(5);
  }, []);

  const startGame = () => {
    // Reset checkpoint and start from Level 1
    if (gameState !== 'gameover') {
      gameRef.current.checkpointX = 100;
    }
    initLevel(1, 1);
    gameRef.current.score = 0;
    setScore(0);
    setGameState('playing');
  };

  const nextWave = () => {
    const nextW = wave + 1;
    initLevel(nextW, 1);
    setGameState('playing');
  };

  // Keyboard Event Listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysRef.current[e.code] = true;

      if (e.code === 'KeyM') {
        toggleMute();
      }

      if (e.code === 'Escape' || e.code === 'KeyP') {
        setGameState((prev) => (prev === 'playing' ? 'paused' : prev === 'paused' ? 'playing' : prev));
      }

      if ((e.code === 'Space' || e.code === 'Enter') && (gameState === 'title' || gameState === 'gameover')) {
        startGame();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysRef.current[e.code] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [gameState]);

  // Main Canvas Game Loop
  useEffect(() => {
    if (loading || !assetsRef.current) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let lastTime = performance.now();

    const loop = (currentTime: number) => {
      const dt = Math.min((currentTime - lastTime) / 1000, 0.05); // Clamp dt to prevent physics tunneling
      lastTime = currentTime;

      const assets = assetsRef.current;
      const g = gameRef.current;
      const keys = keysRef.current;
      const touch = touchInputsRef.current;

      const viewW = canvas.width;
      const viewH = canvas.height;

      // Update simulation if in 'playing' state
      if (gameState === 'playing' && assets) {
        // --- 1. Player Input & Horizontal Physics ---
        if (g.player.spawnTimer > 0) {
          g.player.spawnTimer = Math.max(0, g.player.spawnTimer - dt);
        }

        const isSpawning = g.player.spawnTimer > 0;
        const moveLeft = !isSpawning && (keys['KeyA'] || keys['ArrowLeft'] || touch.left);
        const moveRight = !isSpawning && (keys['KeyD'] || keys['ArrowRight'] || touch.right);
        const jumpPressed = !isSpawning && (keys['KeyW'] || keys['ArrowUp'] || keys['Space'] || touch.jump);
        const shootPressed = !isSpawning && (keys['KeyJ'] || keys['KeyZ'] || touch.shoot);

        const accel = 1400;
        const maxSpeed = 240;
        const friction = 0.82;

        if (isSpawning) {
          g.player.vx = 0;
        } else if (moveLeft && !moveRight) {
          g.player.vx = Math.max(g.player.vx - accel * dt, -maxSpeed);
          g.player.facingLeft = true;
        } else if (moveRight && !moveLeft) {
          g.player.vx = Math.min(g.player.vx + accel * dt, maxSpeed);
          g.player.facingLeft = false;
        } else {
          g.player.vx *= Math.pow(friction, dt * 60);
          if (Math.abs(g.player.vx) < 5) g.player.vx = 0;
        }

        // --- 2. Jumping Physics with Coyote Time, Jump Buffering & Double Jump ---
        const jumpJustPressed = jumpPressed && !g.prevJumpPressed;
        g.prevJumpPressed = !!jumpPressed;

        if (jumpJustPressed) {
          g.player.jumpBuffer = 0.14; // Buffer jump for 140ms
        } else {
          g.player.jumpBuffer = Math.max(0, g.player.jumpBuffer - dt);
        }

        if (g.player.onGround) {
          g.player.jumpsLeft = 2;
          g.player.coyoteTime = 0.12;
        } else {
          g.player.coyoteTime = Math.max(0, g.player.coyoteTime - dt);
          if (g.player.coyoteTime <= 0 && g.player.jumpsLeft === 2) {
            g.player.jumpsLeft = 1;
          }
        }

        if (g.player.jumpBuffer > 0) {
          if (g.player.onGround || g.player.coyoteTime > 0) {
            // First jump (from ground or during Coyote Time)
            g.player.vy = -490; // High responsive jump impulse
            g.player.onGround = false;
            g.player.coyoteTime = 0;
            g.player.jumpBuffer = 0;
            g.player.jumpsLeft--;
            sfx.playJump();

            // Spawn little jump dust particles
            for (let i = 0; i < 4; i++) {
              g.particles.push({
                x: g.player.x + (Math.random() - 0.5) * 16,
                y: g.player.y,
                vx: (Math.random() - 0.5) * 60,
                vy: -Math.random() * 40,
                alpha: 0.8,
                size: 2 + Math.random() * 2,
                color: '#a3e635',
              });
            }
          } else if (g.player.jumpsLeft === 1) {
            // Double jump in mid-air
            g.player.vy = -430; // Slightly gentler impulse for double jump
            g.player.jumpsLeft--;
            g.player.jumpBuffer = 0;
            sfx.playJump();

            // Green particle burst underneath player for double jump
            for (let i = 0; i < 8; i++) {
              const angle = Math.random() * Math.PI * 2;
              const spd = 35 + Math.random() * 65;
              g.particles.push({
                x: g.player.x + (Math.random() - 0.5) * 14,
                y: g.player.y - 6,
                vx: Math.cos(angle) * spd,
                vy: Math.sin(angle) * spd * 0.6 + 20,
                alpha: 0.95,
                size: 2.5 + Math.random() * 2.5,
                color: Math.random() > 0.35 ? '#84cc16' : '#4ade80',
              });
            }
          }
        }

        // Gravity
        const gravity = 1050;
        g.player.vy += gravity * dt;

        // Apply movement
        const prevY = g.player.y;
        g.player.x += g.player.vx * dt;
        g.player.y += g.player.vy * dt;

        // Clamp player inside world horizontal bounds
        g.player.x = Math.max(20, Math.min(g.worldWidth - 20, g.player.x));

        // --- 3. Platform Collisions (Solid One-Way & Ground) ---
        g.player.onGround = false;
        for (const plat of g.platforms) {
          const feetX = g.player.x;
          const feetY = g.player.y;
          // Check horizontal overlap with platform
          if (feetX >= plat.x - 10 && feetX <= plat.x + plat.w + 10) {
            // Landing on top of platform
            if (prevY <= plat.y && feetY >= plat.y && g.player.vy >= 0) {
              g.player.y = plat.y;
              g.player.vy = 0;
              g.player.onGround = true;
              g.player.jumpsLeft = 2;
              break;
            }
          }
        }

        // Ground floor fallback check
        if (g.player.y >= 470) {
          g.player.y = 470;
          g.player.vy = 0;
          g.player.onGround = true;
          g.player.jumpsLeft = 2;
        }

        // --- 4. Attack / Shooting Logic ---
        if (g.player.attackCooldown > 0) {
          g.player.attackCooldown -= dt;
        }

        if (shootPressed && g.player.attackCooldown <= 0 && !g.player.isAttacking) {
          g.player.isAttacking = true;
          g.player.attackTimer = 0.28; // Attack duration
          g.player.attackCooldown = 0.38; // Cooldown between attacks

          sfx.playShoot();

          // Spawn sacred leaf projectile
          const shootDir = g.player.facingLeft ? -1 : 1;
          const spawnX = g.player.x + shootDir * 24;
          const spawnY = g.player.y - 32;

          g.projectiles.push({
            x: spawnX,
            y: spawnY,
            vx: shootDir * 460, // 460 px/s forward velocity
            vy: (Math.random() - 0.5) * 15,
            w: 22,
            h: 14,
            lifetime: 2.2,
          });

          // Cast sparks
          for (let i = 0; i < 5; i++) {
            g.particles.push({
              x: spawnX,
              y: spawnY,
              vx: shootDir * (80 + Math.random() * 80) + (Math.random() - 0.5) * 40,
              vy: (Math.random() - 0.5) * 60,
              alpha: 0.9,
              size: 2 + Math.random() * 3,
              color: '#84cc16',
            });
          }
        }

        if (g.player.isAttacking) {
          g.player.attackTimer -= dt;
          if (g.player.attackTimer <= 0) {
            g.player.isAttacking = false;
          }
        }

        // Player Hurt Timer
        if (g.player.hurtTimer > 0) {
          g.player.hurtTimer -= dt;
        }

        // --- 5. Player Animation Updates ---
        g.player.animTimer += dt;
        if (g.player.animTimer >= 0.1) {
          g.player.animTimer = 0;
          g.player.animFrame = (g.player.animFrame + 1) % 6;
        }

        // --- 6. Projectiles Simulation ---
        for (let i = g.projectiles.length - 1; i >= 0; i--) {
          const p = g.projectiles[i];
          p.x += p.vx * dt;
          p.y += p.vy * dt;
          p.lifetime -= dt;

          // Trail particles
          if (Math.random() < 0.4) {
            g.particles.push({
              x: p.x,
              y: p.y,
              vx: -p.vx * 0.1 + (Math.random() - 0.5) * 20,
              vy: (Math.random() - 0.5) * 20,
              alpha: 0.7,
              size: 2,
              color: p.isEnemy ? '#c084fc' : '#eab308',
            });
          }

          let hitSomething = false;

          if (!p.isEnemy) {
            // Check collision with Boss on Level 2
            if (g.boss && g.boss.active && !g.boss.isDead) {
              const b = g.boss;
              if (
                p.x + p.w / 2 >= b.x - b.w / 2 &&
                p.x - p.w / 2 <= b.x + b.w / 2 &&
                p.y + p.h / 2 >= b.y - b.h / 2 &&
                p.y - p.h / 2 <= b.y + b.h / 2
              ) {
                hitSomething = true;
                b.hp--;
                b.hurtTimer = 0.2;
                sfx.playHit();
                g.shake = 5;

                g.bursts.push({
                  x: p.x,
                  y: p.y,
                  frame: 0,
                  maxFrames: 5,
                  timer: 0,
                });

                if (b.hp <= 0) {
                  b.isDead = true;
                  b.active = false;
                  sfx.playDroneDestroy();
                  g.shake = 10;
                  g.score += 1500;
                  setScore(g.score);

                  // Explosive burst
                  for (let k = 0; k < 45; k++) {
                    const angle = Math.random() * Math.PI * 2;
                    const spd = 50 + Math.random() * 160;
                    g.particles.push({
                      x: b.x + (Math.random() - 0.5) * 40,
                      y: b.y + (Math.random() - 0.5) * 30,
                      vx: Math.cos(angle) * spd,
                      vy: Math.sin(angle) * spd,
                      alpha: 1.0,
                      size: 3 + Math.random() * 5,
                      color: Math.random() > 0.4 ? '#c084fc' : Math.random() > 0.5 ? '#4ade80' : '#facc15',
                    });
                  }
                }
              }
            }

            // Check collision with drones (if not hit boss)
            if (!hitSomething) {
              for (let d = 0; d < g.drones.length; d++) {
                const drone = g.drones[d];
                const dw = drone.w;
                const dh = drone.h;
                // AABB collision
                if (
                  p.x + p.w / 2 >= drone.x - dw / 2 &&
                  p.x - p.w / 2 <= drone.x + dw / 2 &&
                  p.y + p.h / 2 >= drone.y - dh / 2 &&
                  p.y - p.h / 2 <= drone.y + dh / 2
                ) {
                  hitSomething = true;
                  drone.hp--;
                  drone.hurtTimer = 0.18;
                  sfx.playHit();
                  g.shake = 3;

                  // Spawn Impact Burst from row 1 of elahim_vfx_projectiles.png
                  g.bursts.push({
                    x: p.x,
                    y: p.y,
                    frame: 0,
                    maxFrames: 5,
                    timer: 0,
                  });

                  if (drone.hp <= 0) {
                    // Purified Drone!
                    sfx.playDroneDestroy();
                    g.shake = 6;
                    g.score += drone.isBoss ? 500 : 150;
                    g.dronesPurified++;

                    setScore(g.score);
                    setDronesPurified(g.dronesPurified);

                    // Burst particles
                    for (let k = 0; k < 18; k++) {
                      const angle = Math.random() * Math.PI * 2;
                      const spd = 40 + Math.random() * 120;
                      g.particles.push({
                        x: drone.x,
                        y: drone.y,
                        vx: Math.cos(angle) * spd,
                        vy: Math.sin(angle) * spd,
                        alpha: 1,
                        size: 2 + Math.random() * 4,
                        color: Math.random() > 0.4 ? '#4ade80' : '#c084fc',
                      });
                    }

                    // Remove drone
                    g.drones.splice(d, 1);
                  }
                  break;
                }
              }
            }
          } else {
            // Enemy smog orb collision with player
            if (
              g.player.hurtTimer <= 0 &&
              g.player.spawnTimer <= 0 &&
              p.x >= g.player.x - 18 &&
              p.x <= g.player.x + 18 &&
              p.y >= g.player.y - 52 &&
              p.y <= g.player.y
            ) {
              hitSomething = true;
              g.player.health--;
              g.player.hurtTimer = 1.2; // 1.2s invulnerability
              g.shake = 7;
              sfx.playHurt();
              setHealth(g.player.health);

              if (g.player.health <= 0) {
                setGameState('gameover');
              }
            }
          }

          // Out of bounds or lifetime expiry
          if (hitSomething || p.lifetime <= 0 || p.x < 0 || p.x > g.worldWidth) {
            g.projectiles.splice(i, 1);
          }
        }

        // --- 7. Drones Simulation ---
        for (const drone of g.drones) {
          // Patrol movement
          drone.x += drone.vx * dt;
          if (drone.x > drone.maxX) {
            drone.x = drone.maxX;
            drone.vx = -Math.abs(drone.vx);
          } else if (drone.x < drone.minX) {
            drone.x = drone.minX;
            drone.vx = Math.abs(drone.vx);
          }

          // Sinusoidal levitation
          drone.y = drone.baseY + Math.sin(currentTime * 0.003 + drone.id) * 10;

          // Animation frame
          drone.animTimer += dt;
          if (drone.animTimer >= 0.12) {
            drone.animTimer = 0;
            drone.animFrame = (drone.animFrame + 1) % 6;
          }

          if (drone.hurtTimer > 0) {
            drone.hurtTimer -= dt;
          }

          // Drone shooting smog orbs
          drone.shootTimer -= dt;
          const distToPlayer = Math.hypot(g.player.x - drone.x, g.player.y - drone.y);
          if (drone.shootTimer <= 0 && distToPlayer < 450) {
            drone.shootTimer = drone.isBoss ? 2.2 : 3.8 + Math.random() * 1.5;
            const angle = Math.atan2(g.player.y - 30 - drone.y, g.player.x - drone.x);
            g.projectiles.push({
              x: drone.x,
              y: drone.y + 12,
              vx: Math.cos(angle) * 180,
              vy: Math.sin(angle) * 180,
              w: 14,
              h: 14,
              lifetime: 3.5,
              isEnemy: true,
            });
          }

          // Direct body collision with player
          if (
            g.player.hurtTimer <= 0 &&
            g.player.spawnTimer <= 0 &&
            Math.abs(g.player.x - drone.x) < 24 &&
            Math.abs(g.player.y - 28 - drone.y) < 28
          ) {
            g.player.health--;
            g.player.hurtTimer = 1.2;
            g.shake = 8;
            sfx.playHurt();
            setHealth(g.player.health);

            // Knockback
            g.player.vx = drone.x < g.player.x ? 180 : -180;
            g.player.vy = -160;

            if (g.player.health <= 0) {
              setGameState('gameover');
            }
          }
        }

        // --- 7.5 Final Boss Simulation (Level 2: Smog Behemoth) ---
        if (g.boss && g.boss.active && !g.boss.isDead) {
          const b = g.boss;
          // Arena patrol
          b.x += b.vx * dt;
          if (b.x > b.maxX) {
            b.x = b.maxX;
            b.vx = -Math.abs(b.vx);
          } else if (b.x < b.minX) {
            b.x = b.minX;
            b.vx = Math.abs(b.vx);
          }

          // Sinusoidal levitation
          b.y = b.baseY + Math.sin(currentTime * 0.003) * 12;

          if (b.hurtTimer > 0) {
            b.hurtTimer -= dt;
          }

          // Purple smoke exhaust every 1.5s
          b.smokeTimer -= dt;
          if (b.smokeTimer <= 0) {
            b.smokeTimer = 1.5;
            for (let s = 0; s < 3; s++) {
              g.particles.push({
                x: b.x + (Math.random() - 0.5) * (b.w * 0.6),
                y: b.y - b.h * 0.2,
                vx: (Math.random() - 0.5) * 35,
                vy: -35 - Math.random() * 30,
                alpha: 0.85,
                size: 3.5 + Math.random() * 4,
                color: Math.random() > 0.4 ? '#a855f7' : '#7c3aed',
              });
            }
          }

          // 3-way fan attack towards player every 2.5s
          b.shootTimer -= dt;
          const distToPlayer = Math.hypot(g.player.x - b.x, g.player.y - b.y);
          if (b.shootTimer <= 0 && distToPlayer < 750) {
            b.shootTimer = 2.5;
            const baseAngle = Math.atan2(g.player.y - 25 - b.y, g.player.x - b.x);
            const spreadAngles = [baseAngle - 0.28, baseAngle, baseAngle + 0.28];
            const speed = 210;

            spreadAngles.forEach((angle) => {
              g.projectiles.push({
                x: b.x,
                y: b.y + 10,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                w: 16,
                h: 16,
                lifetime: 4.0,
                isEnemy: true,
              });
            });
          }

          // Boss direct body collision with player
          if (
            g.player.hurtTimer <= 0 &&
            g.player.spawnTimer <= 0 &&
            Math.abs(g.player.x - b.x) < b.w * 0.42 &&
            Math.abs(g.player.y - 28 - b.y) < b.h * 0.45
          ) {
            g.player.health--;
            g.player.hurtTimer = 1.3;
            g.shake = 9;
            sfx.playHurt();
            setHealth(g.player.health);
            g.player.vx = b.x < g.player.x ? 240 : -240;
            g.player.vy = -200;
            if (g.player.health <= 0) {
              setGameState('gameover');
            }
          }
        }

        // --- 8. Impact Bursts Animation ---
        for (let i = g.bursts.length - 1; i >= 0; i--) {
          const b = g.bursts[i];
          b.timer += dt;
          if (b.timer >= 0.06) {
            b.timer = 0;
            b.frame++;
            if (b.frame >= b.maxFrames) {
              g.bursts.splice(i, 1);
            }
          }
        }

        // --- 9. Particles Simulation ---
        for (let i = g.particles.length - 1; i >= 0; i--) {
          const pt = g.particles[i];
          pt.x += pt.vx * dt;
          pt.y += pt.vy * dt;
          pt.alpha -= dt * 1.6;
          if (pt.alpha <= 0) {
            g.particles.splice(i, 1);
          }
        }

        // --- 10. Sacred Nature Crystals Collection ---
        for (const crystal of g.crystals) {
          if (!crystal.collected) {
            const dist = Math.hypot(g.player.x - crystal.x, (g.player.y - 28) - crystal.y);
            if (dist < 34) {
              crystal.collected = true;
              g.crystalsCollected++;
              g.score += 250;
              sfx.playCrystal();
              setCrystalsCollected(g.crystalsCollected);
              setScore(g.score);

              // Sparkle particle burst
              for (let k = 0; k < 18; k++) {
                const angle = Math.random() * Math.PI * 2;
                const spd = 40 + Math.random() * 90;
                g.particles.push({
                  x: crystal.x,
                  y: crystal.y,
                  vx: Math.cos(angle) * spd,
                  vy: Math.sin(angle) * spd,
                  alpha: 1,
                  size: 2.5 + Math.random() * 3.5,
                  color: Math.random() > 0.3 ? '#34d399' : '#facc15',
                });
              }
            }
          }
        }

        // --- 11. Portal / Sanctuary Relic Collision & Level Transition ---
        const shrineX = 3020;
        const shrinePlatformY = 350;
        const allCrystalsGathered = g.crystalsCollected >= g.totalCrystals;
        const bossDefeated = !g.boss || g.boss.isDead;
        const portalActive = g.currentLevel === 1 ? allCrystalsGathered : (allCrystalsGathered && bossDefeated);

        // Radiant portal emission when active
        if (portalActive && Math.random() < 0.35) {
          g.particles.push({
            x: shrineX + (Math.random() - 0.5) * 36,
            y: shrinePlatformY - 20 - Math.random() * 45,
            vx: (Math.random() - 0.5) * 25,
            vy: -40 - Math.random() * 45,
            alpha: 1,
            size: 2.5 + Math.random() * 3,
            color: g.currentLevel === 2 ? '#facc15' : '#4ade80',
          });
        }

        // Player enters portal
        if (
          portalActive &&
          Math.abs(g.player.x - shrineX) < 45 &&
          Math.abs(g.player.y - shrinePlatformY) < 60
        ) {
          if (g.currentLevel === 1) {
            // Transition from Level 1 to Level 2!
            sfx.playVictory();
            g.checkpointX = 100;
            initLevel(g.wave, 2);
            g.levelToast = {
              title: 'УРОВЕНЬ 2: ОСЕННИЕ ЗАРОСЛИ',
              subtitle: 'Соберите 5 кристаллов природы и одолейте Smog Behemoth!',
              timer: 4.5,
            };
          } else {
            // Level 2 Completed! Full game victory!
            sfx.playVictory();
            setGameState('victory');
          }
        }

        // --- Checkpoint: Mid-level Sanctuary Platform (x > 1480) ---
        if (g.player.x > 1480 && g.checkpointX < 1480) {
          g.checkpointX = 1480;
          sfx.playVictory();

          // Golden sacred particles burst around player
          for (let i = 0; i < 24; i++) {
            const angle = Math.random() * Math.PI * 2;
            const spd = 40 + Math.random() * 95;
            g.particles.push({
              x: g.player.x,
              y: g.player.y - 28,
              vx: Math.cos(angle) * spd,
              vy: Math.sin(angle) * spd,
              alpha: 1.0,
              size: 3 + Math.random() * 3,
              color: Math.random() > 0.3 ? '#facc15' : '#fef08a',
            });
          }
        }

        // --- 10. Smooth Camera Follow ---
        const targetCamX = g.player.x - viewW * 0.42;
        g.cameraX += (targetCamX - g.cameraX) * 0.1;
        g.cameraX = Math.max(0, Math.min(g.worldWidth - viewW, g.cameraX));

        if (g.shake > 0) {
          g.shake = Math.max(0, g.shake - dt * 25);
        }
      }

      // ==========================================
      // --- RENDERING PIPELINE (100% ASSETS) ---
      // ==========================================
      ctx.imageSmoothingEnabled = false;
      ctx.clearRect(0, 0, viewW, viewH);

      const shakeX = Math.round((Math.random() - 0.5) * g.shake);
      const shakeY = Math.round((Math.random() - 0.5) * g.shake);

      ctx.save();
      ctx.translate(shakeX, shakeY);

      if (assets) {
        // --- 1. Parallax Mountain & Forest Background ---
        const activeBg = (g.currentLevel === 2 && assets.bgAutumn && assets.bgAutumn.complete && assets.bgAutumn.naturalWidth > 0)
          ? assets.bgAutumn
          : assets.bg;

        const parallaxFactor = 0.24;
        const bgW = activeBg.width || 960;
        const bgH = activeBg.height || 540;
        const scaleH = viewH / bgH;
        const drawBgW = bgW * scaleH;
        const bgOffset = (g.cameraX * parallaxFactor) % drawBgW;

        for (let bx = -bgOffset; bx < viewW; bx += drawBgW) {
          ctx.drawImage(activeBg, 0, 0, bgW, bgH, bx, 0, drawBgW, viewH);
        }

        // Ambient atmospheric glow: Twilight indigo on Level 1, Amber glow on Level 2
        const gradient = ctx.createLinearGradient(0, viewH - 130, 0, viewH);
        if (g.currentLevel === 2) {
          gradient.addColorStop(0, 'rgba(40, 16, 5, 0)');
          gradient.addColorStop(1, 'rgba(50, 15, 5, 0.52)');
        } else {
          gradient.addColorStop(0, 'rgba(15, 7, 26, 0)');
          gradient.addColorStop(1, 'rgba(15, 7, 26, 0.45)');
        }
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, viewW, viewH);

        // --- 2. Floating Atmospheric Firefly Spores in Forest Canopy ---
        ctx.save();
        for (const sp of g.ambientSpores) {
          const screenX = sp.x - g.cameraX * 0.5;
          const bobY = sp.y + Math.sin(currentTime * 0.002 * sp.speed + sp.phase) * 8;
          if (screenX >= -20 && screenX <= viewW + 20) {
            const sporeColor = g.currentLevel === 2
              ? `rgba(251, 146, 60, ${0.45 + Math.sin(currentTime * 0.003 + sp.phase) * 0.3})`
              : `rgba(250, 204, 21, ${0.4 + Math.sin(currentTime * 0.003 + sp.phase) * 0.3})`;
            ctx.fillStyle = sporeColor;
            ctx.beginPath();
            ctx.arc(screenX, bobY, sp.size, 0, Math.PI * 2);
            ctx.fill();
          }
        }
        ctx.restore();

        // --- 3. Platforms Sliced from Floor Tiles1.png (16x16 px scaled 2x to 32px) ---
        ctx.save();
        ctx.translate(-Math.round(g.cameraX), 0);

        const tileSize = 32;

        // Render Platforms
        for (const plat of g.platforms) {
          if (plat.x + plat.w < g.cameraX - 50 || plat.x > g.cameraX + viewW + 50) continue;

          if (plat.isGround) {
            // 1. Dark solid earth fill below platform
            ctx.fillStyle = '#1c130c';
            ctx.fillRect(
              Math.floor(plat.x),
              Math.floor(plat.y + tileSize),
              Math.ceil(plat.w) + 1,
              viewH - Math.floor(plat.y + tileSize)
            );

            // 2. Seamless top grass layer (middle tile: sx=16, sy=0, sw=16, sh=16 in 32px steps)
            const startX = Math.floor(Math.max(plat.x, g.cameraX - tileSize) / tileSize) * tileSize;
            const endX = Math.min(plat.x + plat.w, g.cameraX + viewW + tileSize);

            for (let px = startX; px < endX; px += tileSize) {
              const drawW = Math.min(tileSize, plat.x + plat.w - px);
              if (drawW <= 0) continue;
              const srcW = drawW === tileSize ? 16 : Math.round((drawW / tileSize) * 16);
              ctx.drawImage(
                assets.tileset,
                16,
                0,
                srcW,
                16,
                px,
                plat.y,
                drawW,
                tileSize
              );
            }
          } else {
            // Suspended floating platforms (Left cap, Middle repeating, Right cap)
            // Left cap: sx = 0, sy = 0, sw = 16, sh = 16
            ctx.drawImage(
              assets.tileset,
              0,
              0,
              16,
              16,
              plat.x,
              plat.y,
              tileSize,
              tileSize
            );

            // Repeating middle: sx = 16, sy = 0, sw = 16, sh = 16 in steps of 32px
            for (let px = plat.x + tileSize; px < plat.x + plat.w - tileSize; px += tileSize) {
              const segW = Math.min(tileSize, plat.x + plat.w - tileSize - px);
              if (segW <= 0) continue;
              const srcW = segW === tileSize ? 16 : Math.round((segW / tileSize) * 16);
              ctx.drawImage(
                assets.tileset,
                16,
                0,
                srcW,
                16,
                px,
                plat.y,
                segW,
                tileSize
              );
            }

            // Right cap: sx = 32, sy = 0, sw = 16, sh = 16
            ctx.drawImage(
              assets.tileset,
              32,
              0,
              16,
              16,
              plat.x + plat.w - tileSize,
              plat.y,
              tileSize,
              tileSize
            );
          }
        }

        // --- 3.5 Sacred Nature Crystals ---
        for (const crystal of g.crystals) {
          if (crystal.collected) continue;
          if (crystal.x < g.cameraX - 50 || crystal.x > g.cameraX + viewW + 50) continue;

          const bob = Math.sin(currentTime * 0.004 + crystal.id * 1.3) * 5;
          const cy = crystal.y + bob;

          // Base ore deposit from Ores.png (bottom-right quadrant contains crystal cluster)
          if (assets.ores) {
            const oW = assets.ores.width / 2;
            const oH = assets.ores.height / 2;
            ctx.drawImage(assets.ores, oW, oH, oW, oH, crystal.x - 16, crystal.y + 4, 32, 28);
          }

          // Hovering Pulsing Emerald Gem
          ctx.save();
          ctx.translate(crystal.x, cy);

          // Outer halo pulse
          const glowPulse = Math.sin(currentTime * 0.006 + crystal.id) * 3;
          ctx.fillStyle = 'rgba(52, 211, 153, 0.4)';
          ctx.beginPath();
          ctx.arc(0, 0, 14 + glowPulse, 0, Math.PI * 2);
          ctx.fill();

          // Emerald Gem Facets (sharp octahedron / diamond crystal)
          // Left facet
          ctx.fillStyle = '#059669';
          ctx.beginPath();
          ctx.moveTo(0, -14);
          ctx.lineTo(-8, -2);
          ctx.lineTo(0, 12);
          ctx.closePath();
          ctx.fill();

          // Right facet
          ctx.fillStyle = '#34d399';
          ctx.beginPath();
          ctx.moveTo(0, -14);
          ctx.lineTo(8, -2);
          ctx.lineTo(0, 12);
          ctx.closePath();
          ctx.fill();

          // Center facet
          ctx.fillStyle = '#6ee7b7';
          ctx.beginPath();
          ctx.moveTo(0, -14);
          ctx.lineTo(3, -2);
          ctx.lineTo(0, 12);
          ctx.lineTo(-3, -2);
          ctx.closePath();
          ctx.fill();

          // Glint sparkle
          const glint = Math.sin(currentTime * 0.008 + crystal.id * 2);
          if (glint > 0.4) {
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(-2, -8, 3, 3);
          }

          ctx.restore();
        }

        // Draw Ancient Table Mountain Shrine / Sanctuary Relic at level end
        const shrineX = 3020;
        const shrineY = 270;
        const allCrystalsCollected = g.crystalsCollected >= g.totalCrystals;
        const bossDefeated = !g.boss || g.boss.isDead;
        const portalActive = g.currentLevel === 1 ? allCrystalsCollected : (allCrystalsCollected && bossDefeated);

        if (assets.statue) {
          ctx.drawImage(assets.statue, shrineX - 32, shrineY - 10, 64, 80);
        }

        // Sanctuary Sacred Core Light / Portal
        ctx.save();
        if (portalActive) {
          // ACTIVE PORTAL: bright emerald/gold pulsing core with expansive sacred rings
          const pulse = Math.sin(currentTime * 0.007) * 8;
          ctx.fillStyle = g.currentLevel === 2 ? 'rgba(250, 204, 21, 0.55)' : 'rgba(74, 222, 128, 0.55)';
          ctx.beginPath();
          ctx.arc(shrineX, shrineY + 25, 32 + pulse, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = g.currentLevel === 2 ? 'rgba(254, 240, 138, 0.75)' : 'rgba(167, 243, 208, 0.75)';
          ctx.beginPath();
          ctx.arc(shrineX, shrineY + 25, 18 + pulse * 0.5, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(shrineX, shrineY + 25, 8, 0, Math.PI * 2);
          ctx.fill();

          // Portal Gate text
          ctx.font = 'bold 12px sans-serif';
          ctx.fillStyle = g.currentLevel === 2 ? '#facc15' : '#4ade80';
          ctx.textAlign = 'center';
          const titleText = g.currentLevel === 1 ? 'ПОРТАЛ НА УРОВЕНЬ 2' : 'СВЯТИЛИЩЕ ОСВОБОЖДЕНО!';
          ctx.fillText(titleText, shrineX, shrineY - 26);
          ctx.font = '10px sans-serif';
          ctx.fillStyle = '#ffffff';
          const subText = g.currentLevel === 1 ? 'Войдите для перехода в Осенние заросли!' : 'Войдите в портал для триумфа!';
          ctx.fillText(subText, shrineX, shrineY - 12);
        } else {
          // INACTIVE / DIM PORTAL
          const pulse = Math.sin(currentTime * 0.003) * 2;
          ctx.fillStyle = 'rgba(110, 231, 183, 0.15)';
          ctx.beginPath();
          ctx.arc(shrineX, shrineY + 25, 16 + pulse, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = '#065f46';
          ctx.beginPath();
          ctx.arc(shrineX, shrineY + 25, 6, 0, Math.PI * 2);
          ctx.fill();

          // Hint when Elahim approaches the inactive shrine
          const distToPlayer = Math.abs(g.player.x - shrineX);
          if (distToPlayer < 190) {
            const hintY = shrineY - 30 + Math.sin(currentTime * 0.005) * 3;
            let text = 'Соберите все кристаллы природы!';
            if (g.currentLevel === 2 && !bossDefeated) {
              text = 'Сразите Smog Behemoth для открытия портала!';
            }
            ctx.font = 'bold 11px sans-serif';
            ctx.textAlign = 'center';
            const metrics = ctx.measureText(text);
            const boxW = metrics.width + 18;
            const boxH = 22;

            ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
            ctx.beginPath();
            ctx.roundRect(shrineX - boxW / 2, hintY - 15, boxW, boxH, 6);
            ctx.fill();
            ctx.strokeStyle = '#f59e0b';
            ctx.lineWidth = 1.5;
            ctx.stroke();

            ctx.fillStyle = '#fbbf24';
            ctx.fillText(text, shrineX, hintY);
          }
        }
        ctx.restore();

        // Mid-level Sanctuary Checkpoint Shrine
        const cpX = g.currentLevel === 2 ? 1480 : 1550;
        const cpY = g.currentLevel === 2 ? 240 : 250;
        if (cpX > g.cameraX - 40 && cpX < g.cameraX + viewW + 40) {
          ctx.save();
          const isActivated = g.checkpointX >= cpX - 50;
          const cpPulse = Math.sin(currentTime * 0.006) * 4;
          // Ancient stone ruin pedestal
          ctx.fillStyle = '#2d1e16';
          ctx.fillRect(cpX - 12, cpY - 20, 24, 20);
          ctx.fillStyle = '#453328';
          ctx.fillRect(cpX - 14, cpY - 24, 28, 4);
          // Glowing Relic Checkpoint Orb
          ctx.fillStyle = isActivated ? 'rgba(250, 204, 21, 0.45)' : 'rgba(52, 211, 153, 0.3)';
          ctx.beginPath();
          ctx.arc(cpX, cpY - 32, 10 + cpPulse, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = isActivated ? '#facc15' : '#34d399';
          ctx.beginPath();
          ctx.arc(cpX, cpY - 32, 5, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }

        // --- 4. Cyber-Smog Drones (Sliced from enemy_smog_drone.png) ---
        const droneSheetW = assets.enemy.width;
        const droneSheetH = assets.enemy.height;
        const droneFrameW = droneSheetW / 6;
        const droneFrameH = droneSheetH / 2;

        for (const drone of g.drones) {
          if (drone.x + drone.w < g.cameraX - 40 || drone.x > g.cameraX + viewW + 40) continue;

          ctx.save();
          ctx.translate(Math.round(drone.x), Math.round(drone.y));

          // Facing direction
          if (drone.vx < 0) {
            ctx.scale(-1, 1);
          }

          // Damage flash
          if (drone.hurtTimer > 0) {
            ctx.filter = 'brightness(2.2) contrast(1.5)';
          }

          const sX = drone.animFrame * droneFrameW;
          const sY = drone.hurtTimer > 0 ? droneFrameH : 0;
          const dw = drone.w;
          const dh = drone.h;

          ctx.drawImage(assets.enemy, sX, sY, droneFrameW, droneFrameH, -dw / 2, -dh / 2, dw, dh);

          ctx.restore();

          // Health bar for Boss Drone
          if (drone.isBoss) {
            ctx.save();
            const barW = 54;
            const barH = 5;
            ctx.fillStyle = 'rgba(0,0,0,0.6)';
            ctx.fillRect(drone.x - barW / 2, drone.y - drone.h / 2 - 12, barW, barH);
            ctx.fillStyle = '#c084fc';
            ctx.fillRect(drone.x - barW / 2, drone.y - drone.h / 2 - 12, barW * (drone.hp / drone.maxHp), barH);
            ctx.restore();
          }
        }

        // --- 4.5 Smog Behemoth Final Boss (Level 2) ---
        if (g.boss && g.boss.active && !g.boss.isDead) {
          const b = g.boss;
          if (b.x + b.w > g.cameraX - 60 && b.x - b.w < g.cameraX + viewW + 60) {
            ctx.save();
            ctx.translate(Math.round(b.x), Math.round(b.y));

            if (b.vx < 0) {
              ctx.scale(-1, 1);
            }

            if (b.hurtTimer > 0) {
              ctx.filter = 'brightness(2.4) contrast(1.4)';
            }

            // Sinister Smog aura behind boss
            const auraPulse = Math.sin(currentTime * 0.005) * 6;
            ctx.fillStyle = 'rgba(168, 85, 247, 0.28)';
            ctx.beginPath();
            ctx.ellipse(0, 0, b.w * 0.52 + auraPulse, b.h * 0.52 + auraPulse, 0, 0, Math.PI * 2);
            ctx.fill();

            if (assets.bossAutumn && assets.bossAutumn.complete && assets.bossAutumn.naturalWidth > 0) {
              ctx.drawImage(assets.bossAutumn, -b.w / 2, -b.h / 2, b.w, b.h);
            } else {
              // High-tier mechanical boss drone fallback
              const sX = 0;
              const sY = droneFrameH;
              ctx.drawImage(assets.enemy, sX, sY, droneFrameW, droneFrameH, -b.w / 2, -b.h / 2, b.w, b.h);
            }

            ctx.restore();
          }
        }

        // --- 5. Projectiles (Sliced from elahim_vfx_projectiles.png) ---
        const vfxW = assets.vfx.width;
        const vfxH = assets.vfx.height;
        const leafFrameH = vfxH / 4;

        for (const p of g.projectiles) {
          if (p.x < g.cameraX - 30 || p.x > g.cameraX + viewW + 30) continue;

          ctx.save();
          ctx.translate(Math.round(p.x), Math.round(p.y));

          if (!p.isEnemy) {
            // Player's Golden Sacred Leaf Projectile
            // Row 0 of elahim_vfx_projectiles.png contains the flying leaf
            // Clean crop of the flying leaf: sX ≈ 120, sY ≈ 8, sW ≈ 85, sH ≈ 75
            if (p.vx < 0) {
              ctx.scale(-1, 1);
            }
            // Screen scale: ~22px x 14px as requested
            ctx.drawImage(assets.vfx, 122, 8, 85, 75, -p.w / 2, -p.h / 2, p.w, p.h);
          } else {
            // Cyber-Smog Orb
            ctx.fillStyle = '#a855f7';
            ctx.beginPath();
            ctx.arc(0, 0, 6, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#f3e8ff';
            ctx.beginPath();
            ctx.arc(0, 0, 3, 0, Math.PI * 2);
            ctx.fill();
          }
          ctx.restore();
        }

        // --- 6. Impact Bursts (Sliced from elahim_vfx_projectiles.png Row 1) ---
        // Row 1 contains 5 burst frames: sY ≈ 96, sH ≈ 80
        const burstFrames = [
          { sX: 135, sW: 60 },
          { sX: 225, sW: 80 },
          { sX: 330, sW: 95 },
          { sX: 440, sW: 100 },
          { sX: 555, sW: 100 },
        ];

        for (const b of g.bursts) {
          const bf = burstFrames[Math.min(b.frame, burstFrames.length - 1)];
          ctx.drawImage(assets.vfx, bf.sX, 96, bf.sW, 80, b.x - 20, b.y - 20, 40, 40);
        }

        // --- 7. Nature Particles & Sparks ---
        for (const pt of g.particles) {
          ctx.fillStyle = pt.color;
          ctx.globalAlpha = Math.max(0, pt.alpha);
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, pt.size, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.globalAlpha = 1.0;

        // --- 7.9 Cinematic Golden Spawn Sphere & Energy Ring ---
        if (g.player.spawnTimer > 0) {
          const spawnProgress = Math.min(1, Math.max(0, 1 - (g.player.spawnTimer / 0.7)));
          const spawnCenterX = Math.round(g.player.x);
          const spawnCenterY = Math.round(g.player.y - 28);

          ctx.save();
          ctx.shadowColor = '#fbbf24';
          ctx.shadowBlur = 20;

          // 1. Expanding Golden Energy Ring
          const ringRadius = 12 + spawnProgress * 42;
          const ringAlpha = Math.sin(spawnProgress * Math.PI) * 0.95;
          ctx.strokeStyle = '#fef08a';
          ctx.lineWidth = Math.max(1, 3.5 * (1 - spawnProgress * 0.7));
          ctx.globalAlpha = Math.max(0, ringAlpha);
          ctx.beginPath();
          ctx.arc(spawnCenterX, spawnCenterY, ringRadius, 0, Math.PI * 2);
          ctx.stroke();

          // 2. Secondary inner shimmering ring
          const ringRadius2 = 8 + spawnProgress * 26;
          ctx.strokeStyle = '#eab308';
          ctx.lineWidth = 2;
          ctx.globalAlpha = Math.max(0, ringAlpha * 0.85);
          ctx.beginPath();
          ctx.arc(spawnCenterX, spawnCenterY, ringRadius2, 0, Math.PI * 2);
          ctx.stroke();

          // 3. Glowing Golden Sphere with gradient from #fef08a to #eab308
          const sphereRadius = 28 * Math.sin(spawnProgress * Math.PI);
          if (sphereRadius > 1) {
            const sphereGrad = ctx.createRadialGradient(
              spawnCenterX,
              spawnCenterY,
              0,
              spawnCenterX,
              spawnCenterY,
              sphereRadius
            );
            sphereGrad.addColorStop(0, '#fef08a');
            sphereGrad.addColorStop(0.5, 'rgba(250, 204, 21, 0.85)');
            sphereGrad.addColorStop(1, 'rgba(234, 179, 8, 0.15)');
            ctx.fillStyle = sphereGrad;
            ctx.globalAlpha = Math.sin(spawnProgress * Math.PI);
            ctx.beginPath();
            ctx.arc(spawnCenterX, spawnCenterY, sphereRadius, 0, Math.PI * 2);
            ctx.fill();
          }

          ctx.restore();
        }

        // --- 8. Elahim Character Sprite (Sliced from elahim_idle_run.png & elahim_jump_attack.png) ---
        // Grid: 6 columns, 2 rows.
        // frameWidth = img.width / 6, frameHeight = img.height / 2
        // Scaled to exactly 64px in height!
        const playerSheetW = assets.playerIdleRun.width;
        const playerSheetH = assets.playerIdleRun.height;
        const frameW = playerSheetW / 6;
        const frameH = playerSheetH / 2;

        const aspect = frameW / frameH;
        const dh = 64; // Exactly 64px height as specified!
        const dw = Math.round(64 * aspect); // Proportional width

        ctx.save();
        ctx.translate(Math.round(g.player.x), Math.round(g.player.y));

        // Facing direction flip
        if (g.player.facingLeft) {
          ctx.scale(-1, 1);
        }

        // Spawn scaling from 0.2 to 1.0 and opacity from 0.0 to 1.0
        if (g.player.spawnTimer > 0) {
          const spawnProgress = Math.min(1, Math.max(0, 1 - (g.player.spawnTimer / 0.7)));
          const spawnScale = 0.2 + 0.8 * spawnProgress;
          const spawnAlpha = spawnProgress;
          // Scale smoothly from center of Elahim's body
          ctx.translate(0, -dh / 2);
          ctx.scale(spawnScale, spawnScale);
          ctx.translate(0, dh / 2);
          ctx.globalAlpha = spawnAlpha;
        } else if (g.player.hurtTimer > 0) {
          // Invulnerability flashing
          const flash = Math.floor(currentTime * 0.02) % 2 === 0;
          if (flash) {
            ctx.globalAlpha = 0.45;
          }
        }

        let currentImg: HTMLImageElement;
        let sX = 0;
        let sY = 0;

        if (g.player.isAttacking) {
          // Attack Pose from elahim_jump_attack.png Row 1 (attack thrust!)
          currentImg = assets.playerJumpAttack;
          const attackFrame = Math.min(5, Math.floor(((0.28 - g.player.attackTimer) / 0.28) * 6));
          sX = attackFrame * frameW;
          sY = frameH; // Row 1: Attack pose
        } else if (!g.player.onGround) {
          // Jump Pose from elahim_jump_attack.png Row 0
          currentImg = assets.playerJumpAttack;
          // Frames 1-3 for rising and falling
          const jumpPoseIndex = g.player.vy < -100 ? 1 : g.player.vy > 100 ? 3 : 2;
          sX = jumpPoseIndex * frameW;
          sY = 0; // Row 0: Jump pose
        } else if (Math.abs(g.player.vx) > 15) {
          // Run from elahim_idle_run.png Row 1
          currentImg = assets.playerIdleRun;
          sX = g.player.animFrame * frameW;
          sY = frameH; // Row 1: Run pose
        } else {
          // Idle from elahim_idle_run.png Row 0
          currentImg = assets.playerIdleRun;
          sX = g.player.animFrame * frameW;
          sY = 0; // Row 0: Idle pose
        }

        // Draw character anchored at feet (-dw/2, -dh)
        ctx.drawImage(currentImg, sX, sY, frameW, frameH, -dw / 2, -dh, dw, dh);

        ctx.restore();
        ctx.restore(); // Restore camera translation

        // --- 9. Screen-Fixed Boss HP Bar (Level 2) ---
        if (g.currentLevel === 2 && g.boss && !g.boss.isDead && (g.player.x > 1850 || g.boss.hp < g.boss.maxHp)) {
          const bossBarW = 280;
          const bossBarH = 24;
          const barX = (viewW - bossBarW) / 2;
          const barY = 22;
          const hpRatio = Math.max(0, g.boss.hp / g.boss.maxHp);

          ctx.save();
          // Backing panel
          ctx.fillStyle = 'rgba(10, 6, 18, 0.88)';
          ctx.strokeStyle = 'rgba(168, 85, 247, 0.7)';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.roundRect(barX - 12, barY - 18, bossBarW + 24, bossBarH + 26, 8);
          ctx.fill();
          ctx.stroke();

          // Title with sinister glow
          ctx.font = 'bold 11px sans-serif';
          ctx.fillStyle = '#f3e8ff';
          ctx.textAlign = 'center';
          ctx.fillText('SMOG BEHEMOTH — LORD OF ACIDIC SKIES', viewW / 2, barY - 4);

          // Track
          ctx.fillStyle = '#2e1065';
          ctx.fillRect(barX, barY + 2, bossBarW, bossBarH - 4);

          // Fill using assets.bossHpFill or gradient
          const fillWidth = bossBarW * hpRatio;
          if (fillWidth > 0) {
            if (assets.bossHpFill && assets.bossHpFill.complete && assets.bossHpFill.naturalWidth > 0) {
              ctx.drawImage(assets.bossHpFill, barX, barY + 2, fillWidth, bossBarH - 4);
            } else {
              const fillGrad = ctx.createLinearGradient(barX, 0, barX + bossBarW, 0);
              fillGrad.addColorStop(0, '#dc2626');
              fillGrad.addColorStop(1, '#ef4444');
              ctx.fillStyle = fillGrad;
              ctx.fillRect(barX, barY + 2, fillWidth, bossBarH - 4);
            }
          }

          // Ornate Frame using assets.bossHpFrame
          if (assets.bossHpFrame && assets.bossHpFrame.complete && assets.bossHpFrame.naturalWidth > 0) {
            ctx.drawImage(assets.bossHpFrame, barX - 4, barY - 2, bossBarW + 8, bossBarH + 4);
          }

          // HP Numbers
          ctx.font = 'bold 10px sans-serif';
          ctx.fillStyle = '#ffffff';
          ctx.textAlign = 'center';
          ctx.fillText(`${g.boss.hp} / ${g.boss.maxHp} HP`, viewW / 2, barY + bossBarH - 8);

          ctx.restore();
        }

        // --- 10. Level Announcement Toast Banner ---
        if (g.levelToast && g.levelToast.timer > 0) {
          g.levelToast.timer -= dt;
          const alpha = Math.min(1, g.levelToast.timer > 0.6 ? 1 : g.levelToast.timer * 1.6);
          ctx.save();
          ctx.globalAlpha = alpha;
          const toastW = 480;
          const toastH = 48;
          const toastX = (viewW - toastW) / 2;
          const toastY = 58;

          ctx.fillStyle = 'rgba(10, 6, 18, 0.94)';
          ctx.strokeStyle = '#f59e0b';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.roundRect(toastX, toastY, toastW, toastH, 8);
          ctx.fill();
          ctx.stroke();

          ctx.font = 'bold 13px sans-serif';
          ctx.fillStyle = '#fde047';
          ctx.textAlign = 'center';
          ctx.fillText(g.levelToast.title, viewW / 2, toastY + 20);

          ctx.font = '11px sans-serif';
          ctx.fillStyle = '#e2e8f0';
          ctx.fillText(g.levelToast.subtitle, viewW / 2, toastY + 37);
          ctx.restore();
        }
      }

      ctx.restore(); // Restore shake translation

      // Continue Game Loop
      gameLoopRef.current = requestAnimationFrame(loop);
    };

    gameLoopRef.current = requestAnimationFrame(loop);

    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, [loading, gameState, wave]);

  // Touch handlers
  const handleTouchStart = (action: 'left' | 'right' | 'jump' | 'shoot') => {
    touchInputsRef.current[action] = true;
  };
  const handleTouchEnd = (action: 'left' | 'right' | 'jump' | 'shoot') => {
    touchInputsRef.current[action] = false;
  };

  if (testMode) {
    return (
      <Suspense fallback={<div className="w-screen h-screen bg-[#0a0612] flex items-center justify-center text-emerald-300 text-sm">Loading test scene…</div>}>
        <GameTest onBack={() => setTestMode(false)} />
      </Suspense>
    );
  }

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#0a0612] flex items-center justify-center font-sans select-none">
      {/* Canvas Viewport Container */}
      <div className="relative w-full h-full max-w-[1280px] max-h-[720px] aspect-[16/9] flex items-center justify-center bg-black shadow-2xl overflow-hidden">
        <canvas
          ref={canvasRef}
          width={960}
          height={540}
          className="w-full h-full object-contain pixelated cursor-crosshair"
          onClick={() => {
            if (gameState === 'playing' && gameRef.current.player.spawnTimer <= 0) {
              // Left Click triggers attack!
              keysRef.current['KeyJ'] = true;
              setTimeout(() => {
                keysRef.current['KeyJ'] = false;
              }, 100);
            }
          }}
        />

        {/* --- Loading Screen with Preloader --- */}
        {loading && (
          <div className="absolute inset-0 z-50 bg-[#0d0716] flex flex-col items-center justify-center text-white px-6">
            <div className="relative mb-6">
              <div className="w-20 h-20 rounded-full border-4 border-emerald-500/30 border-t-emerald-400 animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center text-emerald-400 font-bold text-xl">
                {loadProgress}%
              </div>
            </div>
            <h2 className="text-2xl font-bold tracking-wider text-emerald-300 uppercase mb-2">
              Cape Town: The Chosen
            </h2>
            <p className="text-sm text-emerald-200/70 mb-5">
              Loading Table Mountain Relics & Sprite Sheets...
            </p>
            <div className="w-64 h-2.5 bg-black/60 rounded-full overflow-hidden border border-emerald-900/60 p-0.5">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-lime-400 rounded-full transition-all duration-300"
                style={{ width: `${loadProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* --- Top HUD Overlay (Playing State) --- */}
        {gameState === 'playing' && (
          <div className="absolute top-0 inset-x-0 p-4 flex items-center justify-between pointer-events-none z-30">
            {/* Player Sacred Leaf Hearts */}
            <div className="flex items-center gap-2 bg-black/55 backdrop-blur-sm border border-emerald-500/30 rounded-xl px-3.5 py-2 pointer-events-auto shadow-lg">
              <div className="flex items-center gap-1.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div
                    key={i}
                    className={`w-5 h-5 rounded-full flex items-center justify-center transition-all ${
                      i < health
                        ? 'bg-emerald-500 text-black shadow-[0_0_10px_#10b981]'
                        : 'bg-zinc-800 border border-zinc-700 opacity-40'
                    }`}
                  >
                    <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-current">
                      <path d="M12 2C8 6 4 11 4 16a8 8 0 0 0 16 0c0-5-4-10-8-14z" />
                    </svg>
                  </div>
                ))}
              </div>
              <span className="text-xs font-semibold text-emerald-300 ml-2 tracking-wide">
                ELAHIM
              </span>
            </div>

            {/* Score & Crystals & Drones Cleansed cluster */}
            <div className="flex items-center gap-3.5 bg-black/60 backdrop-blur-sm border border-emerald-500/30 rounded-xl px-4 py-2 pointer-events-auto shadow-lg">
              <div className="text-right">
                <div className="text-[10px] tracking-widest text-emerald-300/90 uppercase font-semibold">
                  Уровень
                </div>
                <div className="text-lg font-bold text-white tabular-nums">
                  <span className="text-emerald-400">{currentLevel}</span>
                  <span className="text-zinc-500"> / </span>
                  <span>2</span>
                </div>
              </div>

              <div className="h-7 w-[1px] bg-white/10" />

              <div className="text-right">
                <div className="text-[10px] tracking-widest text-emerald-300/90 uppercase font-semibold flex items-center justify-end gap-1">
                  <Gem className="w-3 h-3 text-emerald-400" /> Кристаллы
                </div>
                <div className="text-lg font-bold text-white tabular-nums">
                  <span className="text-emerald-400">{crystalsCollected}</span>
                  <span className="text-zinc-500"> / </span>
                  <span>{totalCrystals}</span>
                </div>
              </div>

              <div className="h-7 w-[1px] bg-white/10" />

              <div className="text-right">
                <div className="text-[10px] tracking-widest text-purple-300/80 uppercase font-semibold">
                  Drones
                </div>
                <div className="text-lg font-bold text-white tabular-nums">
                  <span className="text-purple-400">{dronesPurified}</span>
                  <span className="text-zinc-500"> / </span>
                  <span>{totalDrones}</span>
                </div>
              </div>

              <div className="h-7 w-[1px] bg-white/10" />

              <div className="text-right">
                <div className="text-[10px] tracking-widest text-amber-300/80 uppercase font-semibold">
                  Score
                </div>
                <div className="text-lg font-bold text-amber-400 tabular-nums">
                  {score.toLocaleString()}
                </div>
              </div>

              <div className="h-7 w-[1px] bg-white/10" />

              {/* Action Buttons */}
              <div className="flex items-center gap-1">
                <button
                  onClick={toggleMute}
                  title="Toggle Audio"
                  className="p-1.5 rounded-lg bg-white/5 hover:bg-white/15 text-zinc-300 hover:text-white transition"
                >
                  {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => setGameState('paused')}
                  title="Pause Game (Esc)"
                  className="p-1.5 rounded-lg bg-white/5 hover:bg-white/15 text-zinc-300 hover:text-white transition"
                >
                  <Pause className="w-4 h-4" />
                </button>
                {DEV_MODE && (
                  <button
                    onClick={() => setTestMode(true)}
                    title="Test in Phaser 3"
                    className="p-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/40 text-emerald-300 hover:text-emerald-100 transition border border-emerald-500/30"
                  >
                    <FlaskConical className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* --- Title Screen --- */}
        {gameState === 'title' && !loading && (
          <div className="absolute inset-0 z-40 bg-gradient-to-t from-black via-black/80 to-transparent flex flex-col items-center justify-between p-8 text-center text-white">
            <div className="mt-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-medium tracking-widest uppercase mb-4">
                <Sparkles className="w-3.5 h-3.5" /> Table Mountain Ancient Forest
              </div>
              <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-emerald-300 via-amber-200 to-lime-300 drop-shadow-[0_4px_16px_rgba(16,185,129,0.4)] uppercase">
                Cape Town: The Chosen
              </h1>
              <p className="max-w-md mx-auto text-sm text-zinc-300 mt-3 leading-relaxed">
                Cyber-smog drones have invaded the sacred mountain canopy. Take control of Elahim,
                gather all 5 Sacred Crystals of Nature, cleanse the airspace, and reach the Sanctuary Portal!
              </p>
            </div>

            {/* Start CTA */}
            <div className="flex flex-col items-center gap-4">
              <button
                onClick={startGame}
                className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-lime-500 hover:from-emerald-400 hover:to-lime-400 text-zinc-950 font-bold text-base tracking-wide shadow-[0_0_24px_rgba(16,185,129,0.5)] active:scale-95 transition-all flex items-center gap-2"
              >
                <span>START PURIFICATION</span>
                <ArrowRight className="w-5 h-5" />
              </button>

              <div className="text-xs text-zinc-400 tracking-wide flex items-center gap-3">
                <span>Press <kbd className="px-2 py-0.5 rounded bg-zinc-800 border border-zinc-700 text-zinc-200">Space</kbd> or <kbd className="px-2 py-0.5 rounded bg-zinc-800 border border-zinc-700 text-zinc-200">Enter</kbd> to begin</span>
                {DEV_MODE && (
                  <>
                    <span className="text-zinc-600">|</span>
                    <button
                      onClick={() => setTestMode(true)}
                      className="text-xs text-emerald-400 hover:text-emerald-300 underline font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      <FlaskConical className="w-3.5 h-3.5" />
                      <span>Launch Phaser 3 Tile Seam Test</span>
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Controls Bar */}
            <div className="w-full max-w-xl bg-black/60 border border-white/10 rounded-xl p-3 flex items-center justify-around text-xs text-zinc-300">
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-emerald-400">A / D / ← →</span>
                <span className="text-zinc-500">·</span>
                <span>Run</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-emerald-400">W / Space / ↑</span>
                <span className="text-zinc-500">·</span>
                <span>Jump</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-emerald-400">J / Z / Click</span>
                <span className="text-zinc-500">·</span>
                <span>Shoot Leaf</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-emerald-400">Esc / P</span>
                <span className="text-zinc-500">·</span>
                <span>Pause</span>
              </div>
            </div>
          </div>
        )}

        {/* --- Pause Modal --- */}
        {gameState === 'paused' && (
          <div className="absolute inset-0 z-40 bg-black/75 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-white text-center">
            <h2 className="text-3xl font-extrabold tracking-wider text-emerald-300 uppercase mb-2">
              Game Paused
            </h2>
            <p className="text-xs text-zinc-400 mb-6">Rest at the Table Mountain sanctuary</p>

            <div className="flex flex-col gap-3 w-48">
              <button
                onClick={() => setGameState('playing')}
                className="py-2.5 px-4 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-sm tracking-wide transition flex items-center justify-center gap-2"
              >
                <Play className="w-4 h-4 fill-current" /> Resume
              </button>
              <button
                onClick={() => {
                  initLevel(wave, currentLevel);
                  setGameState('playing');
                }}
                className="py-2.5 px-4 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white font-medium text-sm transition flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-4 h-4" /> Restart Level {currentLevel}
              </button>
              <button
                onClick={toggleMute}
                className="py-2.5 px-4 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white font-medium text-sm transition flex items-center justify-center gap-2"
              >
                {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                {muted ? 'Unmute Sound' : 'Mute Sound'}
              </button>
            </div>
          </div>
        )}

        {/* --- Victory Screen --- */}
        {gameState === 'victory' && (
          <div className="absolute inset-0 z-40 bg-gradient-to-t from-black via-black/85 to-emerald-950/40 flex flex-col items-center justify-center p-8 text-center text-white">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500 flex items-center justify-center text-emerald-400 mb-4 shadow-[0_0_24px_#10b981]">
              <Trophy className="w-8 h-8" />
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-emerald-300 tracking-wide uppercase mb-2">
              Sanctuary Restored!
            </h2>
            <p className="text-sm text-zinc-300 max-w-md mb-6 leading-relaxed">
              Table Mountain is saved! Elahim gathered all Sacred Nature Crystals, vanquished the Smog Behemoth, and restored the sacred skies!
            </p>

            <div className="bg-black/60 border border-emerald-500/30 rounded-xl p-4 w-80 mb-6 flex justify-around text-center">
              <div>
                <div className="text-[10px] text-zinc-400 uppercase tracking-wider">Final Score</div>
                <div className="text-xl font-bold text-amber-400">{score.toLocaleString()}</div>
              </div>
              <div className="w-[1px] bg-white/10" />
              <div>
                <div className="text-[10px] text-zinc-400 uppercase tracking-wider">Кристаллы</div>
                <div className="text-xl font-bold text-emerald-400">{crystalsCollected} / {totalCrystals}</div>
              </div>
              <div className="w-[1px] bg-white/10" />
              <div>
                <div className="text-[10px] text-zinc-400 uppercase tracking-wider">Уровни</div>
                <div className="text-xl font-bold text-emerald-400">2 / 2</div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={nextWave}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-lime-500 hover:from-emerald-400 hover:to-lime-400 text-zinc-950 font-bold text-sm tracking-wide shadow-lg transition"
              >
                PLAY AGAIN (WAVE {wave + 1})
              </button>
              <button
                onClick={startGame}
                className="px-5 py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-medium text-sm transition"
              >
                START NEW GAME
              </button>
            </div>
          </div>
        )}

        {/* --- Game Over Screen --- */}
        {gameState === 'gameover' && (
          <div className="absolute inset-0 z-40 bg-gradient-to-t from-black via-black/90 to-red-950/40 flex flex-col items-center justify-center p-8 text-center text-white">
            <div className="w-16 h-16 rounded-full bg-red-500/20 border border-red-500 flex items-center justify-center text-red-400 mb-4 shadow-[0_0_24px_rgba(239,68,68,0.5)]">
              <Shield className="w-8 h-8" />
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-red-400 tracking-wide uppercase mb-2">
              Elahim Was Overcome
            </h2>
            <p className="text-sm text-zinc-300 max-w-sm mb-6">
              The cyber-smog clouds engulfed the ancient forest. Rise again and banish the invasion!
            </p>

            <div className="bg-black/60 border border-red-500/30 rounded-xl p-4 w-64 mb-6 text-center">
              <div className="text-[10px] text-zinc-400 uppercase tracking-wider">Drones Purified</div>
              <div className="text-xl font-bold text-white">
                {dronesPurified} <span className="text-sm text-zinc-500">/ {totalDrones}</span>
              </div>
            </div>

            <button
              onClick={startGame}
              className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-red-500 to-amber-500 hover:from-red-400 hover:to-amber-400 text-zinc-950 font-bold text-sm tracking-wide shadow-lg transition flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              <span>TRY AGAIN (SPACE)</span>
            </button>
          </div>
        )}

        {/* --- Touch / Mobile Control Overlay (Active during play) --- */}
        {gameState === 'playing' && (
          <div className="absolute inset-x-0 bottom-4 px-6 flex justify-between items-end pointer-events-none md:hidden z-30">
            {/* Directional Pad */}
            <div className="flex gap-2 pointer-events-auto">
              <button
                onTouchStart={() => handleTouchStart('left')}
                onTouchEnd={() => handleTouchEnd('left')}
                onMouseDown={() => handleTouchStart('left')}
                onMouseUp={() => handleTouchEnd('left')}
                className="w-14 h-14 rounded-full bg-black/60 active:bg-emerald-500/60 border border-white/20 text-white flex items-center justify-center text-2xl select-none"
              >
                ◀
              </button>
              <button
                onTouchStart={() => handleTouchStart('right')}
                onTouchEnd={() => handleTouchEnd('right')}
                onMouseDown={() => handleTouchStart('right')}
                onMouseUp={() => handleTouchEnd('right')}
                className="w-14 h-14 rounded-full bg-black/60 active:bg-emerald-500/60 border border-white/20 text-white flex items-center justify-center text-2xl select-none"
              >
                ▶
              </button>
            </div>

            {/* Action Buttons (Jump & Shoot) */}
            <div className="flex gap-3 pointer-events-auto">
              <button
                onTouchStart={() => handleTouchStart('jump')}
                onTouchEnd={() => handleTouchEnd('jump')}
                onMouseDown={() => handleTouchStart('jump')}
                onMouseUp={() => handleTouchEnd('jump')}
                className="w-14 h-14 rounded-full bg-emerald-600/70 active:bg-emerald-400 border border-emerald-400/50 text-white font-bold text-xs uppercase flex items-center justify-center select-none shadow-lg"
              >
                JUMP
              </button>
              <button
                onTouchStart={() => handleTouchStart('shoot')}
                onTouchEnd={() => handleTouchEnd('shoot')}
                onMouseDown={() => handleTouchStart('shoot')}
                onMouseUp={() => handleTouchEnd('shoot')}
                className="w-14 h-14 rounded-full bg-amber-600/70 active:bg-amber-400 border border-amber-400/50 text-white font-bold text-xs uppercase flex items-center justify-center select-none shadow-lg"
              >
                FIRE
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
