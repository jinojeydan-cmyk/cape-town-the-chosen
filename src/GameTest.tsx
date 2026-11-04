import React, { useEffect, useRef, useState } from 'react';
import Phaser from 'phaser';

interface GameTestProps {
  onBack?: () => void;
}

export default function GameTest({ onBack }: GameTestProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const gameRef = useRef<Phaser.Game | null>(null);
  const [activeMargin, setActiveMargin] = useState(1);
  const [activeSpacing, setActiveSpacing] = useState(2);

  useEffect(() => {
    if (!containerRef.current) return;

    class TestScene extends Phaser.Scene {
      private player!: Phaser.Physics.Arcade.Sprite;
      private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
      private keys!: { [key: string]: Phaser.Input.Keyboard.Key };
      private map!: Phaser.Tilemaps.Tilemap;
      private groundLayer!: Phaser.Tilemaps.TilemapLayer | null;

      constructor() {
        super('TestScene');
      }

      preload() {
        // 1. Load tileset via this.load.image instead of spritesheet to avoid Phaser 3.80+ spacing bug
        this.load.image('bg', 'bg_table_mountain.png');
        this.load.image('tiles', 'tileset_relic_forest.png');

        // Player spritesheet
        this.load.spritesheet('elahim_run', 'elahim_idle_run.png', {
          frameWidth: Math.floor(669 / 6),
          frameHeight: Math.floor(373 / 2),
        });
      }

      create() {
        // 3. Round pixels on Main Camera to avoid subpixel WebGL bleeding
        this.cameras.main.setBackgroundColor('#0a0612');
        this.cameras.main.roundPixels = true;

        // Background Parallax
        const bg = this.add.image(0, 0, 'bg').setOrigin(0, 0).setScrollFactor(0.25);
        bg.setDisplaySize(2400, 540);

        // 2. Tilemap Creation with explicit margin and spacing
        const tileWidth = 44;
        const tileHeight = 44;
        const mapWidthInTiles = 55;
        const mapHeightInTiles = 14;

        this.map = this.make.tilemap({
          tileWidth: tileWidth,
          tileHeight: tileHeight,
          width: mapWidthInTiles,
          height: mapHeightInTiles,
        });

        // Add tileset with explicit margin=1, spacing=2 as instructed
        const tileset = this.map.addTilesetImage(
          'tiles',
          'tiles',
          tileWidth,
          tileHeight,
          activeMargin,
          activeSpacing
        );

        if (tileset) {
          this.groundLayer = this.map.createBlankLayer('GroundLayer', tileset);
        }

        if (this.groundLayer) {
          // Number of columns in raw sheet (669px width with 44px + 2px spacing) ≈ 14 columns
          const colsInSheet = Math.floor((669 - 2 * activeMargin + activeSpacing) / (tileWidth + activeSpacing));
          const grassTileIndex = 2; // Column 2 in row 0
          const deepEarthIndex = Math.min(tileset ? tileset.total - 1 : 100, 7 * colsInSheet + 2); // Row 7 rock
          const leftCapIndex = 1 * colsInSheet + 3; // Row 1 col 3
          const rightCapIndex = 1 * colsInSheet + 4; // Row 1 col 4

          const groundRow = 11; // ~484px Y coordinate

          // 2.1 Build continuous floor (2000+ pixels)
          for (let col = 0; col < mapWidthInTiles; col++) {
            this.groundLayer.putTileAt(grassTileIndex, col, groundRow);
            this.groundLayer.putTileAt(deepEarthIndex, col, groundRow + 1);
          }

          // 2.2 Suspended Floating Platform 1 (x: 264 to 484)
          this.groundLayer.putTileAt(leftCapIndex, 6, 8);
          this.groundLayer.putTileAt(grassTileIndex, 7, 8);
          this.groundLayer.putTileAt(grassTileIndex, 8, 8);
          this.groundLayer.putTileAt(grassTileIndex, 9, 8);
          this.groundLayer.putTileAt(rightCapIndex, 10, 8);

          // 2.3 Suspended Floating Platform 2 (x: 572 to 792)
          this.groundLayer.putTileAt(leftCapIndex, 13, 6);
          for (let col = 14; col <= 17; col++) {
            this.groundLayer.putTileAt(grassTileIndex, col, 6);
          }
          this.groundLayer.putTileAt(rightCapIndex, 18, 6);

          // 2.4 Suspended Floating Platform 3 (x: 924 to 1188)
          this.groundLayer.putTileAt(leftCapIndex, 21, 4);
          for (let col = 22; col <= 25; col++) {
            this.groundLayer.putTileAt(grassTileIndex, col, 4);
          }
          this.groundLayer.putTileAt(rightCapIndex, 26, 4);

          // Enable Arcade Physics Collision on all tiles
          this.groundLayer.setCollisionByExclusion([-1]);
        }

        // 3. Player Character setup
        const frameHeight = Math.floor(373 / 2);
        const targetHeight = 64;
        const scaleFactor = targetHeight / frameHeight;

        this.player = this.physics.add.sprite(140, 360, 'elahim_run', 0);
        this.player.setScale(scaleFactor);
        this.player.setCollideWorldBounds(false);

        if (this.player.body) {
          this.player.body.setSize(36 / scaleFactor, 54 / scaleFactor);
          this.player.body.setOffset(38, 32);
        }

        // Collide player with tilemap layer
        if (this.groundLayer) {
          this.physics.add.collider(this.player, this.groundLayer);
        }

        // Animations
        if (!this.anims.exists('player_idle')) {
          this.anims.create({
            key: 'player_idle',
            frames: this.anims.generateFrameNumbers('elahim_run', { start: 0, end: 5 }),
            frameRate: 7,
            repeat: -1,
          });
        }
        if (!this.anims.exists('player_run')) {
          this.anims.create({
            key: 'player_run',
            frames: this.anims.generateFrameNumbers('elahim_run', { start: 6, end: 11 }),
            frameRate: 11,
            repeat: -1,
          });
        }
        this.player.anims.play('player_idle', true);

        // Camera setup with roundPixels enabled
        this.cameras.main.setBounds(0, 0, mapWidthInTiles * tileWidth, 540);
        this.cameras.main.startFollow(this.player, true, 0.1, 0.1);

        // Input controls
        if (this.input.keyboard) {
          this.cursors = this.input.keyboard.createCursorKeys();
          this.keys = this.input.keyboard.addKeys({
            w: Phaser.Input.Keyboard.KeyCodes.W,
            a: Phaser.Input.Keyboard.KeyCodes.A,
            s: Phaser.Input.Keyboard.KeyCodes.S,
            d: Phaser.Input.Keyboard.KeyCodes.D,
            space: Phaser.Input.Keyboard.KeyCodes.SPACE,
          }) as { [key: string]: Phaser.Input.Keyboard.Key };
        }

        // Diagnostic HUD
        const info = this.add.text(
          20,
          20,
          `PHASER 3 TILEMAP LAYER TEST\n• load.image('tiles', 'tileset_relic_forest.png')\n• addTilesetImage(tileWidth: 44, tileHeight: 44, margin: ${activeMargin}, spacing: ${activeSpacing})\n• render: { pixelArt: true, roundPixels: true, antialias: false }\n• Controls: A/D or ←/→ to Move, W/Space to Jump`,
          {
            fontSize: '12px',
            color: '#4ade80',
            backgroundColor: '#000000bb',
            padding: { x: 10, y: 8 },
          }
        );
        info.setScrollFactor(0);
      }

      update() {
        if (!this.player || !this.player.body) return;

        const left = this.cursors?.left.isDown || this.keys?.a.isDown;
        const right = this.cursors?.right.isDown || this.keys?.d.isDown;
        const jump = this.cursors?.up.isDown || this.keys?.w.isDown || this.keys?.space.isDown;

        const speed = 220;

        if (left) {
          this.player.setVelocityX(-speed);
          this.player.setFlipX(true);
          this.player.anims.play('player_run', true);
        } else if (right) {
          this.player.setVelocityX(speed);
          this.player.setFlipX(false);
          this.player.anims.play('player_run', true);
        } else {
          this.player.setVelocityX(0);
          this.player.anims.play('player_idle', true);
        }

        if (jump && this.player.body.blocked.down) {
          this.player.setVelocityY(-460);
        }
      }
    }

    // 3. Configuration with pixelArt: true, roundPixels: true, antialias: false
    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      parent: containerRef.current,
      width: 960,
      height: 540,
      pixelArt: true,
      render: {
        pixelArt: true,
        roundPixels: true,
        antialias: false,
      },
      physics: {
        default: 'arcade',
        arcade: {
          gravity: { x: 0, y: 950 },
          debug: false,
        },
      },
      scene: TestScene,
    };

    gameRef.current = new Phaser.Game(config);

    return () => {
      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
      }
    };
  }, [activeMargin, activeSpacing]);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#0a0612] flex flex-col items-center justify-center font-sans select-none">
      {/* Top Controls Bar */}
      <div className="absolute top-3 left-4 right-4 z-50 flex items-center justify-between pointer-events-auto">
        <div className="bg-black/85 backdrop-blur border border-emerald-500/40 rounded-xl px-4 py-2 text-xs text-emerald-300 font-mono flex items-center gap-3 shadow-xl">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>PHASER 3 TILESET (load.image + addTilesetImage + roundPixels)</span>
        </div>

        {/* Quick margin/spacing presets to test in real-time */}
        <div className="flex items-center gap-2 bg-black/80 backdrop-blur px-3 py-1.5 rounded-xl border border-white/10 text-xs">
          <span className="text-zinc-400 font-semibold mr-1">Preset:</span>
          <button
            onClick={() => {
              setActiveMargin(1);
              setActiveSpacing(2);
            }}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
              activeMargin === 1 && activeSpacing === 2
                ? 'bg-emerald-500 text-black shadow'
                : 'bg-zinc-800 text-zinc-300 hover:text-white'
            }`}
          >
            margin: 1, spacing: 2 (Requested)
          </button>
          <button
            onClick={() => {
              setActiveMargin(0);
              setActiveSpacing(0);
            }}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
              activeMargin === 0 && activeSpacing === 0
                ? 'bg-emerald-500 text-black shadow'
                : 'bg-zinc-800 text-zinc-300 hover:text-white'
            }`}
          >
            margin: 0, spacing: 0
          </button>
        </div>

        {onBack && (
          <button
            onClick={onBack}
            className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold tracking-wider transition border border-white/20 shadow-lg cursor-pointer"
          >
            ← BACK TO GAME
          </button>
        )}
      </div>

      {/* Phaser Canvas Container */}
      <div
        ref={containerRef}
        className="relative max-w-[1280px] max-h-[720px] aspect-[16/9] shadow-2xl rounded-lg overflow-hidden border border-emerald-900/60"
        style={{ width: '960px', height: '540px' }}
      />
    </div>
  );
}
