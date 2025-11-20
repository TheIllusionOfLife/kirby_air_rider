import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RacerState, RacerType, GameConfig, Vector2 } from '../types';
import { RACER_STATS, TRACK_CHECKPOINTS, RACER_SVGS, UI_TEXT, TRACK_WIDTH, WALL_BOUNCE_LOSS, COLLISION_RADIUS } from '../constants';
import * as V from '../utils/math';

interface GameCanvasProps {
  config: GameConfig;
  onFinish: (results: RacerState[]) => void;
}

// Extend RacerState locally to include track progress 't'
interface ExtendedRacerState extends RacerState {
    progressT: number;
}

// Procedural Glow/Shadow Texture for Hover Effect
const createHoverTexture = (): THREE.CanvasTexture => {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d')!;

    // Radial Gradient (White center -> Cyan -> Transparent)
    const grad = ctx.createRadialGradient(64, 64, 10, 64, 64, 60);
    grad.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
    grad.addColorStop(0.4, 'rgba(0, 255, 255, 0.4)');
    grad.addColorStop(1, 'rgba(0, 255, 255, 0)');

    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 128, 128);

    return new THREE.CanvasTexture(canvas);
}

// Procedural Grass Texture
const createGrassTexture = (): THREE.CanvasTexture => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;

    // Base Green
    ctx.fillStyle = '#388E3C'; 
    ctx.fillRect(0, 0, 512, 512);

    // Blades of grass (Noise)
    for(let i=0; i<5000; i++) {
        const x = Math.random() * 512;
        const y = Math.random() * 512;
        const w = 2 + Math.random() * 4;
        const h = 2 + Math.random() * 6;
        // Random varied greens
        const lightness = 40 + Math.random() * 30; 
        ctx.fillStyle = `hsl(120, 60%, ${lightness}%)`;
        ctx.fillRect(x, y, w, h);
    }
    
    // Add some dirt/dark patches
    for(let i=0; i<200; i++) {
         const x = Math.random() * 512;
         const y = Math.random() * 512;
         const r = Math.random() * 10;
         ctx.fillStyle = 'rgba(40, 30, 10, 0.1)';
         ctx.beginPath();
         ctx.arc(x, y, r, 0, Math.PI*2);
         ctx.fill();
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(40, 40); // High repeat for large ground
    tex.anisotropy = 16;
    return tex;
}

// Create a Chevron Shape for the holographic guides
const createChevronTexture = (): THREE.CanvasTexture => {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d')!;
    ctx.clearRect(0,0,256,256);
    
    // Draw Chevron pointing UP (which we will orient forward)
    ctx.strokeStyle = '#00ffff';
    ctx.lineWidth = 40;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.shadowColor = '#00ffff';
    ctx.shadowBlur = 30;

    ctx.beginPath();
    ctx.moveTo(40, 180);
    ctx.lineTo(128, 80);
    ctx.lineTo(216, 180);
    ctx.stroke();

    return new THREE.CanvasTexture(canvas);
}


const MobileControls: React.FC<{ onInput: (type: string, active: boolean) => void }> = ({ onInput }) => {
  const handleTouch = (type: string, active: boolean) => (e: React.TouchEvent | React.MouseEvent) => {
    if (e.cancelable) e.preventDefault();
    e.stopPropagation();
    onInput(type, active);
  };

  return (
    <div className="absolute inset-0 pointer-events-none z-40 flex flex-col justify-end pb-6 px-6 select-none">
      <div className="flex justify-between items-end w-full h-48">
        <div className="flex gap-6 pointer-events-auto mb-4">
           <button 
             className="w-24 h-24 bg-white/10 backdrop-blur-md rounded-full border-4 border-white/30 active:bg-white/40 active:scale-95 flex items-center justify-center transition-all shadow-lg"
             onTouchStart={handleTouch('left', true)}
             onTouchEnd={handleTouch('left', false)}
             onMouseDown={handleTouch('left', true)}
             onMouseUp={handleTouch('left', false)}
             onMouseLeave={handleTouch('left', false)}
           >
             <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-10 h-10 text-white">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
             </svg>
           </button>
           <button 
             className="w-24 h-24 bg-white/10 backdrop-blur-md rounded-full border-4 border-white/30 active:bg-white/40 active:scale-95 flex items-center justify-center transition-all shadow-lg"
             onTouchStart={handleTouch('right', true)}
             onTouchEnd={handleTouch('right', false)}
             onMouseDown={handleTouch('right', true)}
             onMouseUp={handleTouch('right', false)}
             onMouseLeave={handleTouch('right', false)}
           >
             <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-10 h-10 text-white">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
             </svg>
           </button>
        </div>
        <div className="flex gap-6 pointer-events-auto items-end mb-4">
           <button 
             className="w-28 h-28 bg-gradient-to-b from-yellow-300 to-orange-500 rounded-full border-[6px] border-white/80 active:scale-90 flex items-center justify-center transition-all shadow-[0_0_25px_rgba(255,165,0,0.6)] group"
             onTouchStart={handleTouch('drift', true)}
             onTouchEnd={handleTouch('drift', false)}
             onMouseDown={handleTouch('drift', true)}
             onMouseUp={handleTouch('drift', false)}
             onMouseLeave={handleTouch('drift', false)}
           >
             <div className="w-16 h-16 rounded-full border-4 border-white/30 group-active:bg-white/20 transition-colors" />
           </button>
        </div>
      </div>
    </div>
  );
};

const GameOverlay = ({ racerRef, config }: { racerRef: React.MutableRefObject<ExtendedRacerState[]>, config: GameConfig }) => {
    const lapRef = useRef<HTMLSpanElement>(null);
    const rankRef = useRef<HTMLSpanElement>(null);
    const speedRef = useRef<HTMLSpanElement>(null);
    const barRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const interval = setInterval(() => {
            const player = racerRef.current.find(r => r.isPlayer);
            if (!player) return;

            // Update Lap (Display Lap is count + 1, clamped to total)
            if (lapRef.current) {
                const displayLap = Math.min(player.lap + 1, config.totalLaps);
                lapRef.current.innerText = `${displayLap} / ${config.totalLaps}`;
            }

            // Update Rank
            if (rankRef.current) {
                const r = player.rank;
                const suffix = r === 1 ? 'st' : r === 2 ? 'nd' : r === 3 ? 'rd' : 'th';
                rankRef.current.innerHTML = `${r}<span class="text-lg ml-1 align-super">${suffix}</span>`;
            }

            // Update Speed
            if (speedRef.current) {
                speedRef.current.innerText = `${(player.currentSpeed * 5000).toFixed(0)}`;
            }
            
            // Update Bar
            if (barRef.current) {
                barRef.current.style.width = `${player.chargeLevel}%`;
            }

        }, 50); // Update UI at 20fps
        return () => clearInterval(interval);
    }, [config.totalLaps]);

    return (
        <div className="absolute inset-0 pointer-events-none p-4 md:p-8 flex flex-col justify-between z-30">
             {/* Top Left: Lap and Rank */}
             <div className="flex flex-col gap-4 items-start">
                 {/* Lap Badge */}
                 <div className="bg-black/50 backdrop-blur-sm px-6 py-2 rounded-full border border-white/20 shadow-md flex items-center">
                    <span className="text-yellow-400 font-black text-xl italic mr-3">{UI_TEXT.LAP}</span>
                    <span ref={lapRef} className="text-white text-2xl font-bold font-mono">1 / {config.totalLaps}</span>
                 </div>
                 
                 {/* Rank Badge (Dedicated Section) */}
                 <div className="bg-gradient-to-br from-black/60 to-black/40 backdrop-blur-md px-8 py-4 rounded-2xl border-l-4 border-yellow-400 shadow-lg flex flex-col items-center justify-center min-w-[120px]">
                    <span className="text-gray-300 text-xs font-bold uppercase tracking-widest mb-1">{UI_TEXT.RANK}</span>
                    <span ref={rankRef} className="text-white text-6xl font-black italic leading-none drop-shadow-[0_4px_0_rgba(0,0,0,0.5)]">
                        1<span className="text-lg ml-1 align-super">st</span>
                    </span>
                 </div>
             </div>

             {/* Top Right: Speed (Classic Position) */}
             <div className="absolute top-4 right-4 md:top-8 md:right-8 flex flex-col items-end gap-2 bg-black/40 p-4 rounded-xl border border-white/10 backdrop-blur-md">
                <div className="text-white font-mono text-3xl md:text-4xl font-bold drop-shadow-md italic">
                    <span ref={speedRef}>0</span> <span className="text-sm">km/h</span>
                </div>
                <div className="w-32 md:w-48 h-4 bg-gray-700 rounded-full overflow-hidden border border-white/30">
                    <div 
                        ref={barRef}
                        className="h-full bg-gradient-to-r from-yellow-400 to-red-500 transition-all duration-75"
                        style={{ width: `0%` }}
                    />
                </div>
             </div>
        </div>
    );
}

const GameCanvas: React.FC<GameCanvasProps> = ({ config, onFinish }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [countDown, setCountDown] = useState<number | null>(3);
  const countDownRef = useRef<number | null>(3); // Use Ref to avoid re-renders in effect loop
  
  const racersRef = useRef<ExtendedRacerState[]>([]);
  const inputsRef = useRef({ left: false, right: false, drift: false, multiplier: 0.5 });
  const gameActiveRef = useRef(false);
  const finishedTriggeredRef = useRef(false); 
  const startTimeRef = useRef<number>(0);
  
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const racerMeshesRef = useRef<Record<string, THREE.Group>>({});
  const trackCurveRef = useRef<THREE.CatmullRomCurve3 | null>(null);
  const orbitAngleRef = useRef(0);

  const handleMobileInput = (type: string, active: boolean) => {
      inputsRef.current.multiplier = 0.32; // Reduced sensitivity to 0.32
      if (type === 'left') inputsRef.current.left = active;
      if (type === 'right') inputsRef.current.right = active;
      if (type === 'drift') inputsRef.current.drift = active;
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      inputsRef.current.multiplier = 0.5; 
      if (e.key === 'ArrowLeft') inputsRef.current.left = true;
      if (e.key === 'ArrowRight') inputsRef.current.right = true;
      if (e.key === ' ' || e.key === 'z') inputsRef.current.drift = true;
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') inputsRef.current.left = false;
      if (e.key === 'ArrowRight') inputsRef.current.right = false;
      if (e.key === ' ' || e.key === 'z') inputsRef.current.drift = false;
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  useEffect(() => {
    // Generate Curve to calculate proper start positions
    const points = TRACK_CHECKPOINTS.map(cp => new THREE.Vector3(cp.position.x, 0, cp.position.y));
    points.push(points[0]);
    const tempCurve = new THREE.CatmullRomCurve3(points, true, 'catmullrom', 0.5);

    // Start at 10% of the track
    const startT = 0.1;
    const startPt3 = tempCurve.getPointAt(startT);
    const tangent = tempCurve.getTangentAt(startT).normalize();
    const startAngle = Math.atan2(tangent.z, tangent.x);
    
    const perp = { x: -tangent.z, y: tangent.x };
    const laneSpacing = 70;

    const createRacer = (type: RacerType, isPlayer: boolean, idx: number): ExtendedRacerState => {
      const laneOffset = idx === 0 ? 0 : idx === 1 ? -1 : 1;
      
      const startPos = {
        x: startPt3.x + perp.x * laneSpacing * laneOffset,
        y: startPt3.z + perp.y * laneSpacing * laneOffset
      };

      return {
        id: isPlayer ? 'player' : `cpu-${idx}`,
        type,
        position: startPos,
        velocity: { x: 0, y: 0 },
        angle: startAngle, 
        currentSpeed: 0,
        isDrifting: false,
        chargeLevel: 0,
        lap: 0,
        nextCheckpointIndex: 1,
        finished: false,
        finishTime: 0,
        stats: RACER_STATS[type],
        rank: 1,
        isPlayer,
        progressT: startT 
      };
    };

    const opponents = Object.values(RacerType)
      .filter(t => t !== config.playerRacer)
      .slice(0, 2);

    racersRef.current = [
      createRacer(config.playerRacer, true, 0),
      createRacer(opponents[0], false, 1),
      createRacer(opponents[1], false, 2),
    ];
    
    gameActiveRef.current = false;
    finishedTriggeredRef.current = false;

    let count = 3;
    countDownRef.current = 3;
    setCountDown(3);

    const timer = setInterval(() => {
      count--;
      const displayCount = count > 0 ? count : null;
      setCountDown(displayCount);
      countDownRef.current = displayCount; 
      
      if (count <= 0) {
        clearInterval(timer);
        gameActiveRef.current = true;
        startTimeRef.current = Date.now();
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [config]);

  useEffect(() => {
    if (!mountRef.current) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xaaccff); 
    scene.fog = new THREE.FogExp2(0xaaccff, 0.0008); 
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(60, mountRef.current.clientWidth / mountRef.current.clientHeight, 1, 10000);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    // OPTIMIZATION: Limit pixel ratio to 2 to improve mobile performance
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    mountRef.current.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(2000, 4000, 2000);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    scene.add(dirLight);

    // Ground with Grass Texture
    const grassTex = createGrassTexture();
    const groundMat = new THREE.MeshStandardMaterial({ 
        map: grassTex,
        roughness: 1.0,
        color: 0xddffdd // tint the texture slightly
    });
    const groundGeo = new THREE.PlaneGeometry(20000, 20000);
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -10;
    ground.receiveShadow = true;
    scene.add(ground);

    // Decor
    const decorGroup = new THREE.Group();
    const floatGeos = [
      new THREE.IcosahedronGeometry(80),
      new THREE.OctahedronGeometry(60)
    ];
    const floatMats = [
      new THREE.MeshStandardMaterial({ color: 0xffeb3b }),
      new THREE.MeshStandardMaterial({ color: 0xe91e63 })
    ];
    for(let i=0; i<30; i++) {
        const mesh = new THREE.Mesh(
            floatGeos[Math.floor(Math.random() * floatGeos.length)],
            floatMats[Math.floor(Math.random() * floatMats.length)]
        );
        const angle = Math.random() * Math.PI * 2;
        const dist = 2500 + Math.random() * 3000; // Increased distance to avoid starting area
        mesh.position.set(
            Math.cos(angle) * dist,
            200 + Math.random() * 400,
            Math.sin(angle) * dist
        );
        mesh.userData = { rotSpeed: (Math.random() - 0.5) * 0.05 };
        decorGroup.add(mesh);
    }
    scene.add(decorGroup);

    // Track
    const points = TRACK_CHECKPOINTS.map(cp => new THREE.Vector3(cp.position.x, 0, cp.position.y));
    points.push(points[0]); 
    const curve = new THREE.CatmullRomCurve3(points, true, 'catmullrom', 0.5);
    trackCurveRef.current = curve;
    
    const tubeSegments = 800; 
    const tubeRadius = TRACK_WIDTH;
    const tubeGeo = new THREE.TubeGeometry(curve, tubeSegments, tubeRadius, 32, true);
    
    const roadCanvas = document.createElement('canvas');
    roadCanvas.width = 512; roadCanvas.height = 512;
    const rCtx = roadCanvas.getContext('2d')!;
    rCtx.fillStyle = '#37474f'; 
    rCtx.fillRect(0,0,512,512);
    for(let i=0; i<1000; i++) {
        rCtx.fillStyle = `rgba(255,255,255,${Math.random()*0.05})`;
        rCtx.fillRect(Math.random()*512, Math.random()*512, 2, 2);
    }
    const roadTex = new THREE.CanvasTexture(roadCanvas);
    roadTex.wrapS = THREE.RepeatWrapping;
    roadTex.wrapT = THREE.RepeatWrapping;
    roadTex.repeat.set(100, 1);

    const roadMat = new THREE.MeshStandardMaterial({ map: roadTex, roughness: 0.5, side: THREE.FrontSide });
    const roadMesh = new THREE.Mesh(tubeGeo, roadMat);
    roadMesh.receiveShadow = true;
    roadMesh.position.y = -2; 
    scene.add(roadMesh);

    // Clean Glass Walls (REMOVED ARROW TEXTURE)
    const railGeo = new THREE.TubeGeometry(curve, tubeSegments, tubeRadius + 2, 8, true);
    const railMat = new THREE.MeshPhysicalMaterial({
        color: 0x88ccee,
        transmission: 0.9, 
        transparent: true,
        opacity: 0.4,
        roughness: 0,
        ior: 1.5,
        thickness: 2,
        side: THREE.DoubleSide,
        blending: THREE.NormalBlending,
        depthWrite: false 
    });
    const railMesh = new THREE.Mesh(railGeo, railMat);
    railMesh.position.y = 10; 
    railMesh.scale.y = 0.5; 
    scene.add(railMesh);

    // FLOATING 3D HOLOGRAPHIC GUIDES
    const chevronTex = createChevronTexture();
    const guideGroup = new THREE.Group();
    
    // Create ~40 guides along the track
    const guideCount = 40;
    for(let i=0; i<guideCount; i++) {
        const t = i / guideCount;
        const pt = curve.getPointAt(t);
        const tangent = curve.getTangentAt(t).normalize();
        
        // Create Chevron Mesh (Plane)
        const geom = new THREE.PlaneGeometry(100, 100);
        const mat = new THREE.MeshBasicMaterial({
            map: chevronTex,
            transparent: true,
            opacity: 0.6,
            color: 0x00ffff,
            side: THREE.DoubleSide,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });
        const mesh = new THREE.Mesh(geom, mat);
        
        // Position: Center of track, elevated
        mesh.position.copy(pt);
        mesh.position.y = 60; // Height above road
        
        // Orientation: Look at the next point on the curve
        // We look at a point slightly ahead to align with the tangent
        const lookAtPt = pt.clone().add(tangent);
        mesh.lookAt(lookAtPt);
        
        // Rotate X to lay it flat-ish or face the driver?
        // Let's have them face the driver (vertical gates) like Checkpoints
        // Tangent lookAt makes Z-axis point forward. Plane faces Z. 
        // So it should be correct as a "gate" you fly through.
        
        guideGroup.add(mesh);
    }
    scene.add(guideGroup);


    // Hover Glow Texture
    const hoverTex = createHoverTexture();

    // Racers
    racersRef.current.forEach(racer => {
      const group = new THREE.Group();
      
      // Sprite
      const textureLoader = new THREE.TextureLoader();
      const map = textureLoader.load(RACER_SVGS[racer.type]);
      map.minFilter = THREE.LinearFilter;
      const spriteMat = new THREE.SpriteMaterial({ map: map });
      const sprite = new THREE.Sprite(spriteMat);
      sprite.scale.set(60, 60, 1); 
      sprite.position.y = 25;
      group.add(sprite);

      // Hover Glow Ring (Floating Effect)
      const hoverGeo = new THREE.PlaneGeometry(60, 60);
      const hoverMat = new THREE.MeshBasicMaterial({ 
          map: hoverTex, 
          transparent: true, 
          opacity: 0.6, 
          blending: THREE.AdditiveBlending,
          depthWrite: false,
          side: THREE.DoubleSide
      });
      const hoverMesh = new THREE.Mesh(hoverGeo, hoverMat);
      hoverMesh.rotation.x = -Math.PI / 2;
      hoverMesh.position.y = 2; 
      group.add(hoverMesh);

      scene.add(group);
      racerMeshesRef.current[racer.id] = group;
    });

    const animate = () => {
      const delta = Math.min(clock.getDelta(), 0.1); // Cap to 10fps max lag
      const frameRatio = delta * 60; 
      
      const isMobile = window.innerWidth < 768;
      // Multiplier: Global Speed (2.5x) + Mobile Boost (3.0x) if mobile
      const GLOBAL_SPEED_SCALE = 2.5 * (isMobile ? 3.0 : 1.0);
      
      const physicsScale = frameRatio * GLOBAL_SPEED_SCALE;

      // Pulse the Guides
      const time = Date.now() * 0.005;
      guideGroup.children.forEach((mesh, i) => {
         const s = 1 + Math.sin(time + i * 0.5) * 0.2;
         mesh.scale.set(s, s, s);
         (mesh as THREE.Mesh).material.opacity = 0.4 + Math.sin(time + i) * 0.3;
      });
      
      decorGroup.children.forEach(child => {
          child.rotation.x += child.userData.rotSpeed * frameRatio;
          child.rotation.y += child.userData.rotSpeed * frameRatio;
      });

      // Game Logic
      if (trackCurveRef.current) {
        // Sort racers
        const racersSorted = [...racersRef.current].sort((a, b) => {
            // Finished racers first, sorted by time
            if (a.finished && b.finished) return a.finishTime - b.finishTime;
            if (a.finished) return -1;
            if (b.finished) return 1;
            // Then by lap and progress
            const scoreA = a.lap * 10 + a.progressT;
            const scoreB = b.lap * 10 + b.progressT;
            return scoreB - scoreA;
        });
        racersSorted.forEach((r, i) => { r.rank = i + 1; });

        racersRef.current.forEach(racer => {
            const isAI = !racer.isPlayer || racer.finished;
            
            // PREMATURE START FIX:
            if (!racer.finished && !gameActiveRef.current) {
                return;
            }

            let steerInput = 0;
            let driftInput = false;

            if (racer.isPlayer && !racer.finished && gameActiveRef.current) {
                if (inputsRef.current.left) steerInput = -1 * inputsRef.current.multiplier;
                if (inputsRef.current.right) steerInput = 1 * inputsRef.current.multiplier;
                driftInput = inputsRef.current.drift;
            } else if (isAI) {
                 // AI Steering
                 let lookAheadT = racer.progressT + 0.03;
                 if(lookAheadT > 1) lookAheadT -= 1;
                 const targetPt = trackCurveRef.current!.getPointAt(lookAheadT);
                 
                 const dx = targetPt.x - racer.position.x;
                 const dz = targetPt.z - racer.position.y;
                 const targetAngle = Math.atan2(dz, dx);
                 
                 let angleDiff = targetAngle - racer.angle;
                 while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
                 while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;

                 if (angleDiff > 0.05) steerInput = 1.0;
                 else if (angleDiff < -0.05) steerInput = -1.0;
                 if (Math.abs(angleDiff) > 0.4) driftInput = true; 
            }

            // Physics
            const targetSpeed = racer.stats.topSpeed;
            const acceleration = racer.stats.acceleration;
            
            if (driftInput) {
                if (!racer.isDrifting) racer.isDrifting = true;
                racer.currentSpeed *= Math.pow(0.995, frameRatio); 
                racer.chargeLevel = Math.min(100, racer.chargeLevel + racer.stats.chargeSpeed * 2 * frameRatio);
                steerInput *= 2.5; 
            } else {
                if (racer.isDrifting) {
                    racer.isDrifting = false;
                    const boost = (racer.chargeLevel / 100) * (racer.stats.topSpeed * 6.0);
                    racer.currentSpeed += boost;
                    racer.chargeLevel = 0;
                }
                if (racer.currentSpeed < targetSpeed) {
                    racer.currentSpeed += acceleration * physicsScale;
                } else if (racer.currentSpeed > targetSpeed) {
                    racer.currentSpeed -= acceleration * 0.05 * physicsScale; 
                }
            }
            
            if (racer.currentSpeed < 0) racer.currentSpeed = 0;
            racer.angle += steerInput * racer.stats.turnSpeed * physicsScale;

            let nextX = racer.position.x + Math.cos(racer.angle) * racer.currentSpeed * 50 * physicsScale; 
            let nextY = racer.position.y + Math.sin(racer.angle) * racer.currentSpeed * 50 * physicsScale;

            // Wall Collision (Clamp to tube)
            const p3 = new THREE.Vector3(nextX, 0, nextY);
            const splinePt = trackCurveRef.current!.getPointAt(racer.progressT);
            const distSq = splinePt.distanceToSquared(p3);
            if (distSq > (TRACK_WIDTH * TRACK_WIDTH)) {
                 const divisions = 100; 
                 let minDistSq = Infinity;
                 let closestPoint = new THREE.Vector3();
                 for (let i=-5; i<=5; i++) {
                     let t = racer.progressT + (i/divisions)*0.1;
                     if(t<0) t+=1; if(t>1) t-=1;
                     const pt = trackCurveRef.current!.getPointAt(t);
                     const d = pt.distanceToSquared(p3);
                     if (d < minDistSq) { minDistSq = d; closestPoint.copy(pt); }
                 }
                 const distToCenter = Math.sqrt(minDistSq);
                 if (distToCenter > TRACK_WIDTH - 15) { 
                    const normal = new THREE.Vector3().subVectors(p3, closestPoint).normalize();
                    const clamped = closestPoint.add(normal.multiplyScalar(TRACK_WIDTH - 16));
                    nextX = clamped.x;
                    nextY = clamped.z;
                    racer.currentSpeed *= WALL_BOUNCE_LOSS;
                }
            }

            racer.position.x = nextX;
            racer.position.y = nextY;

            // Update Spline Progress (t)
            let bestT = racer.progressT;
            let minD = Infinity;
            const pCur = new THREE.Vector3(racer.position.x, 0, racer.position.y);
            // Wide search
            for(let dt = -0.02; dt <= 0.05; dt+=0.001) {
                 let tryT = racer.progressT + dt;
                 if(tryT > 1) tryT -= 1;
                 if(tryT < 0) tryT += 1;
                 const pt = trackCurveRef.current!.getPointAt(tryT);
                 const d = pt.distanceToSquared(pCur);
                 if(d < minD) { minD = d; bestT = tryT; }
            }
            
            // Lap Counting Logic
            if (racer.progressT > 0.9 && bestT < 0.1) {
                racer.lap += 1;
                // Check finish condition (>= totalLaps)
                if (racer.lap >= config.totalLaps && !racer.finished) {
                    racer.finished = true;
                    racer.finishTime = Date.now() - startTimeRef.current;
                }
            }
            racer.progressT = bestT;
        });

        // Racer Collisions
        for (let i = 0; i < racersRef.current.length; i++) {
            for (let j = i + 1; j < racersRef.current.length; j++) {
                const r1 = racersRef.current[i];
                const r2 = racersRef.current[j];
                const dist = V.dist(r1.position, r2.position);
                if (dist < COLLISION_RADIUS * 2) {
                    const nx = r2.position.x - r1.position.x;
                    const ny = r2.position.y - r1.position.y;
                    const len = Math.sqrt(nx*nx + ny*ny);
                    const unx = nx / len;
                    const uny = ny / len;
                    const overlap = COLLISION_RADIUS * 2 - dist;
                    r1.position.x -= unx * overlap * 0.5;
                    r1.position.y -= uny * overlap * 0.5;
                    r2.position.x += unx * overlap * 0.5;
                    r2.position.y += uny * overlap * 0.5;
                    r1.currentSpeed *= 0.8;
                    r2.currentSpeed *= 0.8;
                }
            }
        }

        // Check Player Finish Trigger
        const player = racersRef.current.find(r => r.isPlayer);
        if (player && player.finished && !finishedTriggeredRef.current) {
             // Send sorted results (Finished first, then by progress)
             const sorted = [...racersRef.current].sort((a, b) => {
                if (a.finished && b.finished) return a.finishTime - b.finishTime;
                if (a.finished) return -1;
                if (b.finished) return 1;
                const scoreA = a.lap * 10 + a.progressT;
                const scoreB = b.lap * 10 + b.progressT;
                return scoreB - scoreA;
             });
             finishedTriggeredRef.current = true;
             onFinish(sorted);
        }
      }

      // Visual Sync
      const now = Date.now();
      racersRef.current.forEach(racer => {
          const group = racerMeshesRef.current[racer.id];
          if (group) {
              group.position.set(racer.position.x, 0, racer.position.y);
              const sprite = group.children[0] as THREE.Sprite;
              const hoverMesh = group.children[1] as THREE.Mesh;

              let tilt = 0;
              if (racer.isPlayer && !racer.finished) {
                   if (inputsRef.current.left) tilt = 0.25;
                   if (inputsRef.current.right) tilt = -0.25;
              }
              const currentRot = sprite.material.rotation;
              // Lerp independent of frame rate
              sprite.material.rotation = V.lerp(currentRot, tilt, 0.1 * frameRatio);
              
              // Bounce
              const bounce = Math.sin(now * 0.005 + (racer.isPlayer ? 0 : 2)) * 2.0;
              sprite.position.y = 25 + bounce;

              // Hover Glow Pulse
              if (hoverMesh) {
                  const pulse = 1.0 + Math.sin(now * 0.01) * 0.2;
                  hoverMesh.scale.set(pulse, pulse, 1);
                  (hoverMesh.material as THREE.MeshBasicMaterial).opacity = 0.4 + Math.sin(now * 0.01) * 0.2;
              }
          }
      });

      const player = racersRef.current.find(r => r.isPlayer) || racersRef.current[0];
      
      if (!player.finished) {
          const camDist = 150; 
          const targetCamPos = new THREE.Vector3(
              player.position.x - Math.cos(player.angle) * camDist,
              80, 
              player.position.y - Math.sin(player.angle) * camDist
          );
          if (countDownRef.current !== null) camera.position.copy(targetCamPos);
          else camera.position.lerp(targetCamPos, 0.1 * frameRatio);
          camera.lookAt(player.position.x, 10, player.position.y);
      } else {
          orbitAngleRef.current += 0.005 * frameRatio;
          const orbitDist = 200;
          camera.position.x = player.position.x + Math.cos(orbitAngleRef.current) * orbitDist;
          camera.position.z = player.position.y + Math.sin(orbitAngleRef.current) * orbitDist;
          camera.position.y = 100;
          camera.lookAt(player.position.x, 20, player.position.y);
      }

      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    };

    const animationId = requestAnimationFrame(animate);
    const clock = new THREE.Clock();

    const handleResize = () => {
        if (!mountRef.current) return;
        camera.aspect = mountRef.current.clientWidth / mountRef.current.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
      mountRef.current?.removeChild(renderer.domElement);
      renderer.dispose();
    };
  }, [config, onFinish]);

  return (
    <div className="relative w-full h-full">
      <div ref={mountRef} className="w-full h-full" />
      
      {countDown === null && !racersRef.current[0].finished && <MobileControls onInput={handleMobileInput} />}

      {countDown !== null && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-50">
            <h1 className="text-9xl font-black text-yellow-400 stroke-black drop-shadow-[0_5px_5px_rgba(0,0,0,1)] animate-ping">
                {countDown}
            </h1>
        </div>
      )}
      
      {/* New HUD Overlay Component */}
      <GameOverlay racerRef={racersRef} config={config} />
    </div>
  );
};

export default GameCanvas;