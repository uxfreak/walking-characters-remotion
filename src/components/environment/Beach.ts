import * as THREE from "three";
import { BaseEnvironment, EnvironmentConfig } from "./BaseEnvironment";
import { JunglePath } from "./Path";

export const BeachConfig: EnvironmentConfig = {
  backgroundColor: 0xffb6c1, // Light pink sunset sky
  fogColor: 0xffb6c1, // Pink fog to match sunset
  fogNear: 50,
  fogFar: 200,
  groundColor: 0xf4e4c1, // Light sand color
  pathColor: 0xd4a76a, // Wet sand color
  enableShadows: true,
  characterYOffset: 1.2, // Lift characters to prevent legs being buried in sand
};

// Beach-specific materials
export const BeachMaterials = {
  sand: new THREE.MeshStandardMaterial({
    color: 0xf4e4c1,
    roughness: 0.9,
    metalness: 0.1,
  }),
  wetSand: new THREE.MeshStandardMaterial({
    color: 0xd4a76a,
    roughness: 0.7,
    metalness: 0.2,
  }),
  water: new THREE.MeshStandardMaterial({
    color: 0x006994,
    transparent: true,
    opacity: 0.85,
    roughness: 0.3,
    metalness: 0.3,
  }),
  palmTrunk: new THREE.MeshStandardMaterial({
    color: 0x8b4513,
    roughness: 1,
    metalness: 0,
  }),
  palmLeaves: new THREE.MeshStandardMaterial({
    color: 0x228b22,
    roughness: 0.8,
    metalness: 0,
    side: THREE.DoubleSide,
  }),
};

class DetailedPalmTree {
  private mesh: THREE.Group;

  constructor(x: number, z: number, seed: number = 0, size: 'small' | 'medium' | 'large' = 'medium') {
    this.mesh = new THREE.Group();
    
    // Use seeded random for consistent tree generation
    const random = this.createSeededRandom(seed);
    
    // Size variations
    const sizeMultipliers = {
      small: { height: 0.6, width: 0.7, fronds: 6 },
      medium: { height: 1.0, width: 1.0, fronds: 8 },
      large: { height: 1.4, width: 1.2, fronds: 10 }
    };
    const sizeConfig = sizeMultipliers[size];
    
    // Trunk with segments and slight curve - reduced radius
    const trunkHeight = 8 * sizeConfig.height;
    const trunkRadius = 0.25 * sizeConfig.width; // Reduced from 0.5 to 0.25
    
    const trunkCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3((0.2 + random() * 0.2) * sizeConfig.width, trunkHeight * 0.25, 0),
      new THREE.Vector3((0.1 + random() * 0.2) * sizeConfig.width, trunkHeight * 0.5, (0.1 + random() * 0.1) * sizeConfig.width),
      new THREE.Vector3(0, trunkHeight * 0.75, 0),
      new THREE.Vector3((-0.1 + random() * 0.2) * sizeConfig.width, trunkHeight, 0)
    ]);
    
    const trunkGeometry = new THREE.TubeGeometry(trunkCurve, 20, trunkRadius, 8, false);
    const trunkMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x8B4513,
      roughness: 0.8,
      metalness: 0
    });
    const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
    trunk.castShadow = true;
    this.mesh.add(trunk);
    
    // Palm fronds with curved geometry
    const leafMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x228B22,
      side: THREE.DoubleSide,
      roughness: 0.7,
      metalness: 0
    });
    
    for (let i = 0; i < sizeConfig.fronds; i++) {
      const frond = new THREE.Group();
      
      // Create curved frond spine with some variation - scaled by size
      const curve1 = (2 + random() * 1) * sizeConfig.width;
      const curve2 = (4 + random() * 1) * sizeConfig.width;
      const curve3 = (5.5 + random() * 0.5) * sizeConfig.width;
      
      const frondCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(curve1, -0.5 * sizeConfig.height, 0),
        new THREE.Vector3(curve2, -1.5 * sizeConfig.height, 0),
        new THREE.Vector3(curve3, -2.5 * sizeConfig.height, 0)
      ]);
      
      // Create frond geometry with leaflets
      const frondShape = new THREE.Shape();
      frondShape.moveTo(0, 0);
      
      // Create leaflet pattern
      for (let j = 0; j < 20; j++) {
        const t = j / 20;
        const point = frondCurve.getPoint(t);
        const width = (1 - t) * 0.8;
        
        if (j % 2 === 0) {
          frondShape.lineTo(point.x + width, point.y + width * 0.3);
        } else {
          frondShape.lineTo(point.x - width, point.y - width * 0.3);
        }
      }
      
      const frondGeometry = new THREE.ShapeGeometry(frondShape);
      const frondMesh = new THREE.Mesh(frondGeometry, leafMaterial);
      frondMesh.castShadow = true;
      
      frond.add(frondMesh);
      frond.position.y = trunkHeight;
      frond.rotation.y = (Math.PI * 2 / sizeConfig.fronds) * i + random() * 0.2;
      frond.rotation.z = Math.PI / 8 + random() * 0.2;
      
      this.mesh.add(frond);
    }
    
    // Add coconuts - scaled by size
    const coconutMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x8B4513,
      roughness: 0.9,
      metalness: 0
    });
    const coconutCount = size === 'small' ? 2 : size === 'large' ? 6 : 4;
    const coconutSize = 0.2 * sizeConfig.width;
    
    for (let i = 0; i < coconutCount; i++) {
      const coconut = new THREE.Mesh(
        new THREE.SphereGeometry(coconutSize, 8, 6),
        coconutMaterial
      );
      coconut.position.set(
        (random() * 1 - 0.5) * sizeConfig.width,
        trunkHeight * 0.9 + random() * 0.5,
        (random() * 1 - 0.5) * sizeConfig.width
      );
      coconut.castShadow = true;
      this.mesh.add(coconut);
    }
    
    this.mesh.position.set(x, 0, z);
    this.mesh.castShadow = true;
    this.mesh.receiveShadow = true;
  }

  private createSeededRandom(seed: number): () => number {
    let state = seed;
    return () => {
      state = (state * 1664525 + 1013904223) % Math.pow(2, 32);
      return state / Math.pow(2, 32);
    };
  }

  public getMesh(): THREE.Group {
    return this.mesh;
  }
}

class BeachPath extends JunglePath {
  constructor(scene: THREE.Scene) {
    super(scene);
    // Override path material to wet sand
    this.getSegments().forEach((segment) => {
      segment.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.material = BeachMaterials.wetSand;
        }
      });
    });
  }
}

export class BeachEnvironment extends BaseEnvironment {
  private beachSections: THREE.Mesh[] = [];
  private wetSandSections: THREE.Mesh[] = [];
  private waterPlane: THREE.Mesh;
  private horizonWater: THREE.Mesh;
  private path: BeachPath;
  private palmTrees: DetailedPalmTree[] = [];
  private sun: THREE.Mesh;
  private waves: { mesh: THREE.Mesh; offset: number }[] = [];
  private seagulls: {
    mesh: THREE.Group;
    speed: number;
    radius: number;
    angle: number;
    centerX: number;
  }[] = [];
  private mountains: { mesh: THREE.Group; originalZ: number }[] = [];
  private waveTime: number = 0;
  private tidalWaves: { mesh: THREE.Mesh; offset: number; originalZ: number }[] = [];

  constructor(scene: THREE.Scene, seed: number = 12345) {
    super(scene, BeachConfig, seed);

    // Create sunset gradient background
    this.createSunsetBackground();

    // Set up sunset lighting
    this.setupSunsetLighting();

    // Create beach sections for infinite scrolling
    const sectionLength = 200;
    for (let section = -1; section <= 1; section++) {
      // Create beach terrain with gentle slope
      const beachGeometry = new THREE.PlaneGeometry(
        200,
        sectionLength,
        100,
        100
      );
      const beachVertices = beachGeometry.attributes.position.array;

      // Create gentle slope to water (water is on the right side at x > 15)
      for (let i = 0; i < beachVertices.length; i += 3) {
        const x = beachVertices[i];
        const z = beachVertices[i + 1];

        let height = 0;
        if (x < 1) {
          height = 0; // Flat beach area where characters walk
        } else {
          // Gradual slope down to water - shoreline at x=1
          height = -(x - 1) * 0.1;
        }

        // Add small sand ripples
        height += Math.sin(x * 0.5) * 0.05;
        height += Math.sin(z * 0.3) * 0.03;

        beachVertices[i + 2] = height;
      }

      beachGeometry.computeVertexNormals();
      const beach = new THREE.Mesh(beachGeometry, BeachMaterials.sand);
      beach.rotation.x = -Math.PI / 2;
      beach.position.y = 0; // Slightly below ground level
      beach.position.z = section * sectionLength;
      beach.receiveShadow = true;
      this.beachSections.push(beach);
      scene.add(beach);

      // Create wet sand area
      const wetSandGeometry = new THREE.PlaneGeometry(
        4, // Much narrower wet sand strip
        sectionLength,
        10,
        50
      );
      const wetSand = new THREE.Mesh(wetSandGeometry, BeachMaterials.wetSand);
      wetSand.rotation.x = -Math.PI / 2;
      wetSand.position.set(0.5, -0.3, section * sectionLength); // Right where characters walk
      wetSand.receiveShadow = true;
      this.wetSandSections.push(wetSand);
      scene.add(wetSand);
    }

    // Create water (large ocean on the right side)
    const waterGeometry = new THREE.PlaneGeometry(300, 600, 80, 80);
    this.waterPlane = new THREE.Mesh(waterGeometry, BeachMaterials.water);
    this.waterPlane.rotation.x = -Math.PI / 2;
    this.waterPlane.position.set(2, -1, 0); // Right next to characters
    scene.add(this.waterPlane);

    // Add horizon water
    const horizonWaterGeometry = new THREE.PlaneGeometry(500, 600, 20, 20);
    this.horizonWater = new THREE.Mesh(
      horizonWaterGeometry,
      BeachMaterials.water
    );
    this.horizonWater.rotation.x = -Math.PI / 2;
    this.horizonWater.position.set(25, -1.5, 0); // Closer horizon
    scene.add(this.horizonWater);

    // Create waves
    this.createWaves();

    // Create tidal waves that reach the wet sand
    this.createTidalWaves();

    // Create palm trees
    this.createPalmTrees();

    // Create sun
    this.createSun();

    // Create seagulls
    this.createSeagulls();

    // Create wet sand path along the shoreline
    this.path = new BeachPath(scene);

    // Create palm trees
    this.createPalmTrees();

    // Create mountains on the non-sea side
    this.createMountains();
  }

  private createSunsetBackground(): void {
    // Create sunset gradient background texture
    const canvas = document.createElement("canvas");
    canvas.width = 256;
    canvas.height = 512;
    const context = canvas.getContext("2d");
    if (context) {
      const gradient = context.createLinearGradient(0, 0, 0, 512);
      gradient.addColorStop(0, "#FFB6C1"); // Light pink at top
      gradient.addColorStop(0.3, "#FF69B4"); // Hot pink
      gradient.addColorStop(0.5, "#FF8C00"); // Dark orange
      gradient.addColorStop(0.7, "#FFD700"); // Gold
      gradient.addColorStop(1, "#4682B4"); // Steel blue at horizon
      context.fillStyle = gradient;
      context.fillRect(0, 0, 256, 512);

      const backgroundTexture = new THREE.CanvasTexture(canvas);
      this.scene.background = backgroundTexture;
    }
  }

  private setupSunsetLighting(): void {
    // Remove existing lights and add sunset-specific lighting
    this.scene.traverse((child) => {
      if (child instanceof THREE.Light && child.type !== "AmbientLight") {
        this.scene.remove(child);
      }
    });

    // Warm ambient light for sunset
    const ambientLight = new THREE.AmbientLight(0xffe4e1, 0.6);
    this.scene.add(ambientLight);

    // Sunset directional light (from the ocean side)
    const sunLight = new THREE.DirectionalLight(0xffa500, 1);
    sunLight.position.set(100, 30, -30);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.camera.near = 0.5;
    sunLight.shadow.camera.far = 150;
    sunLight.shadow.camera.left = -100;
    sunLight.shadow.camera.right = 100;
    sunLight.shadow.camera.top = 100;
    sunLight.shadow.camera.bottom = -100;
    this.scene.add(sunLight);

    // Fill light from opposite side
    const fillLight = new THREE.DirectionalLight(0x87ceeb, 0.3);
    fillLight.position.set(-20, 15, 20);
    this.scene.add(fillLight);
  }

  private createWaves(): void {
    const random = this.createSeededRandom(this.seed);

    // Create animated wave meshes (no foam, just water waves)
    for (let section = -1; section <= 1; section++) {
      for (let i = 0; i < 4; i++) {
        const waveGeometry = new THREE.CylinderGeometry(0.1, 0.8, 0.3, 8);
        const wave = new THREE.Mesh(waveGeometry, BeachMaterials.water);

        // Position waves right at the shoreline
        wave.position.set(
          1.5 + i * 0.5 + random() * 0.3, // Right next to characters
          -0.8, // Slightly below water surface
          section * 200 + i * 30 + random() * 20
        );

        // Rotate to lay flat and add some variation
        wave.rotation.x = Math.PI / 2;
        wave.rotation.z = random() * Math.PI * 2;
        wave.scale.x = 0.8 + random() * 0.4;
        wave.scale.z = 0.6 + random() * 0.6;

        this.waves.push({
          mesh: wave,
          offset: random() * Math.PI * 2,
        });
        this.scene.add(wave);
      }
    }
  }

  private createTidalWaves(): void {
    const random = this.createSeededRandom(this.seed + 200);
    
    // Create tidal wave meshes that periodically wash up onto the wet sand
    for (let section = -1; section <= 1; section++) {
      for (let i = 0; i < 3; i++) {
        // Create a flat water plane for tidal waves near characters
        const tidalGeometry = new THREE.PlaneGeometry(6, 40, 10, 10); // Much smaller for close shoreline
        const tidalWave = new THREE.Mesh(tidalGeometry, BeachMaterials.water);
        
        // Position to cover from water to character area
        tidalWave.position.set(
          -1, // Positioned to reach character area
          -0.7, // Slightly above the wet sand
          section * 200 + i * 60 + random() * 30
        );
        
        tidalWave.rotation.x = -Math.PI / 2;
        tidalWave.rotation.z = (random() - 0.5) * 0.1; // Slight angle variation
        
        // Make initially invisible/transparent
        (tidalWave.material as THREE.MeshStandardMaterial).transparent = true;
        (tidalWave.material as THREE.MeshStandardMaterial).opacity = 0;
        
        this.tidalWaves.push({
          mesh: tidalWave,
          offset: random() * Math.PI * 2,
          originalZ: tidalWave.position.z
        });
        this.scene.add(tidalWave);
      }
    }
  }

  private createPalmTrees(): void {
    const random = this.createSeededRandom(this.seed + 300);
    
    // Helper function to get random size based on weighted distribution
    const getRandomSize = (): 'small' | 'medium' | 'large' => {
      const rand = random();
      if (rand < 0.3) return 'small';
      if (rand < 0.7) return 'medium';
      return 'large';
    };
    
    // Create palm trees along both sides of the beach with size variation
    for (let section = -1; section <= 1; section++) {
      // Trees on the left side (character side) - more sparse
      for (let i = 0; i < 4; i++) {
        const x = -15 + random() * 10; // Left side of characters
        const z = section * 200 + i * 50 + random() * 30;
        const size = getRandomSize();
        const tree = new DetailedPalmTree(x, z, this.seed + section * 100 + i, size);
        this.palmTrees.push(tree);
        this.scene.add(tree.getMesh());
      }
      
      // Trees on the right side (near water but not blocking view)
      for (let i = 0; i < 3; i++) {
        const x = 8 + random() * 5; // Right side near water
        const z = section * 200 + i * 60 + random() * 20;
        const size = getRandomSize();
        const tree = new DetailedPalmTree(x, z, this.seed + section * 100 + i + 50, size);
        this.palmTrees.push(tree);
        this.scene.add(tree.getMesh());
      }
      
      // Dense forest near mountains (far left side)
      for (let i = 0; i < 12; i++) {
        const x = -40 + random() * 25; // Deep into the mountain area
        const z = section * 200 + i * 25 + random() * 20;
        
        // Forest trees tend to be taller but more varied
        const forestRand = random();
        const size = forestRand < 0.2 ? 'small' : forestRand < 0.5 ? 'medium' : 'large';
        
        const tree = new DetailedPalmTree(x, z, this.seed + section * 100 + i + 100, size);
        this.palmTrees.push(tree);
        this.scene.add(tree.getMesh());
      }
      
      // Additional scattered trees for depth
      for (let i = 0; i < 8; i++) {
        const x = -25 + random() * 15; // Mid-distance trees
        const z = section * 200 + i * 35 + random() * 25;
        const size = getRandomSize();
        const tree = new DetailedPalmTree(x, z, this.seed + section * 100 + i + 200, size);
        this.palmTrees.push(tree);
        this.scene.add(tree.getMesh());
      }
      
      // Some background trees for atmosphere
      for (let i = 0; i < 6; i++) {
        const x = -65 + random() * 20; // Very far back near mountains
        const z = section * 200 + i * 40 + random() * 30;
        
        // Background trees are mostly large for visibility
        const size = random() < 0.7 ? 'large' : 'medium';
        
        const tree = new DetailedPalmTree(x, z, this.seed + section * 100 + i + 300, size);
        this.palmTrees.push(tree);
        this.scene.add(tree.getMesh());
      }
    }
  }

  private createSun(): void {
    const sunGeometry = new THREE.SphereGeometry(3, 32, 32);
    const sunMaterial = new THREE.MeshBasicMaterial({
      color: 0xffd700,
      emissive: 0xffd700,
      emissiveIntensity: 1,
    });
    this.sun = new THREE.Mesh(sunGeometry, sunMaterial);
    this.sun.position.set(150, 30, -40);
    this.scene.add(this.sun);
  }

  private createSeagulls(): void {
    const random = this.createSeededRandom(this.seed + 100);

    // Create simple seagulls
    for (let i = 0; i < 3; i++) {
      const seagull = this.createSeagull();
      seagull.position.set(
        80 + random() * 60,
        15 + random() * 10,
        (random() - 0.5) * 40
      );
      this.seagulls.push({
        mesh: seagull,
        speed: 0.5 + random() * 0.5,
        radius: 20 + random() * 20,
        angle: random() * Math.PI * 2,
        centerX: 100 + random() * 40,
      });
      this.scene.add(seagull);
    }
  }

  private createSeagull(): THREE.Group {
    const seagull = new THREE.Group();

    // Simple body
    const bodyGeometry = new THREE.SphereGeometry(0.2, 6, 4);
    const bodyMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    seagull.add(body);

    // Wings
    for (let side of [-1, 1]) {
      const wingGeometry = new THREE.PlaneGeometry(1, 0.3);
      const wing = new THREE.Mesh(wingGeometry, bodyMaterial);
      wing.position.x = side * 0.5;
      wing.rotation.y = side * 0.3;
      seagull.add(wing);
    }

    return seagull;
  }


  private createMountains(): void {
    const random = this.createSeededRandom(this.seed + 200);

    // Create coastal mountain materials
    const mountainMaterials = {
      far: new THREE.MeshStandardMaterial({
        color: 0x6b7aa1, // Blue-gray for distant mountains
        roughness: 1,
        metalness: 0,
        transparent: true,
        opacity: 0.6,
      }),
      mid: new THREE.MeshStandardMaterial({
        color: 0x8e9aaf, // Lighter blue-gray
        roughness: 1,
        metalness: 0,
        transparent: true,
        opacity: 0.7,
      }),
      close: new THREE.MeshStandardMaterial({
        color: 0xa5aab8, // Light gray-blue
        roughness: 0.9,
        metalness: 0,
        transparent: true,
        opacity: 0.8,
      }),
    };

    // Create mountain ranges at different distances
    const ranges = [
      {
        distance: -80,
        count: 5,
        material: mountainMaterials.far,
        heightRange: [30, 50],
        widthRange: [15, 25],
      },
      {
        distance: -60,
        count: 4,
        material: mountainMaterials.mid,
        heightRange: [25, 40],
        widthRange: [12, 20],
      },
      {
        distance: -45,
        count: 3,
        material: mountainMaterials.close,
        heightRange: [20, 30],
        widthRange: [10, 18],
      },
    ];

    // Create mountains for each range
    ranges.forEach((range) => {
      for (let section = -1; section <= 1; section++) {
        for (let i = 0; i < range.count; i++) {
          const mountain = new THREE.Group();

          // Main peak
          const height =
            range.heightRange[0] +
            random() * (range.heightRange[1] - range.heightRange[0]);
          const width =
            range.widthRange[0] +
            random() * (range.widthRange[1] - range.widthRange[0]);

          const peakGeometry = new THREE.ConeGeometry(width, height, 8);
          const peak = new THREE.Mesh(peakGeometry, range.material);
          peak.position.y = height / 2;
          mountain.add(peak);

          // Add some variation with secondary peaks
          const numSecondary = Math.floor(1 + random() * 2);
          for (let j = 0; j < numSecondary; j++) {
            const secondaryHeight = height * (0.5 + random() * 0.3);
            const secondaryWidth = width * (0.4 + random() * 0.3);
            const secondaryGeometry = new THREE.ConeGeometry(
              secondaryWidth,
              secondaryHeight,
              6
            );
            const secondaryPeak = new THREE.Mesh(
              secondaryGeometry,
              range.material
            );

            const angle = random() * Math.PI * 2;
            const offset = width * 0.5;
            secondaryPeak.position.set(
              Math.cos(angle) * offset,
              secondaryHeight / 2,
              Math.sin(angle) * offset
            );
            mountain.add(secondaryPeak);
          }

          // Position the mountain
          const xPosition = range.distance + random() * 20 - 10;
          const zPosition =
            section * 200 + (i / range.count) * 180 + random() * 20;

          mountain.position.set(xPosition, 0, zPosition);
          mountain.rotation.y = random() * Math.PI * 2;

          this.mountains.push({ mesh: mountain, originalZ: zPosition });
          this.scene.add(mountain);
        }
      }
    });
  }

  updateByFrame(totalDistance: number): void {
    const sectionLength = 200;

    // Update beach sections
    this.beachSections.forEach((section, index) => {
      const offset = (index - 1) * sectionLength;
      const newZ = offset - (totalDistance % sectionLength);

      if (newZ < -sectionLength) {
        section.position.z = newZ + sectionLength * 3;
      } else if (newZ > sectionLength) {
        section.position.z = newZ - sectionLength * 3;
      } else {
        section.position.z = newZ;
      }
    });

    // Update wet sand sections
    this.wetSandSections.forEach((section, index) => {
      const offset = (index - 1) * sectionLength;
      const newZ = offset - (totalDistance % sectionLength);

      if (newZ < -sectionLength) {
        section.position.z = newZ + sectionLength * 3;
      } else if (newZ > sectionLength) {
        section.position.z = newZ - sectionLength * 3;
      } else {
        section.position.z = newZ;
      }
    });

    // Update wave time based on frame distance (deterministic)
    this.waveTime = totalDistance * 0.1; // Tied to frame progression

    // Animate water surface - frame-based timing
    const frameTime = this.waveTime;
    const waterVertices = this.waterPlane.geometry.attributes.position.array;
    for (let i = 0; i < waterVertices.length; i += 3) {
      const x = waterVertices[i];
      const z = waterVertices[i + 1];
      waterVertices[i + 2] =
        Math.sin(x * 0.1 + frameTime) * 0.3 +
        Math.sin(z * 0.1 + frameTime * 1.5) * 0.2;
    }
    this.waterPlane.geometry.attributes.position.needsUpdate = true;

    // Animate horizon water - frame-based timing
    const horizonVertices =
      this.horizonWater.geometry.attributes.position.array;
    for (let i = 0; i < horizonVertices.length; i += 3) {
      const x = horizonVertices[i];
      const z = horizonVertices[i + 1];
      horizonVertices[i + 2] =
        Math.sin(x * 0.05 + frameTime * 0.8) * 0.2 +
        Math.sin(z * 0.05 + frameTime * 1.2) * 0.15;
    }
    this.horizonWater.geometry.attributes.position.needsUpdate = true;

    // Animate waves (come and go effect) - frame-based animation
    this.waves.forEach((waveData) => {
      const wave = waveData.mesh;

      // Frame-based wave timing (deterministic)
      const frameTime = this.waveTime;

      // Wave motion - rise and fall with sine wave
      const waveHeight = Math.sin(frameTime * 1.5 + waveData.offset) * 0.4;
      wave.position.y = -0.8 + Math.max(0, waveHeight); // Only show when above water level

      // Scale animation - waves grow and shrink
      const scaleAnimation =
        Math.sin(frameTime * 2 + waveData.offset) * 0.3 + 0.7;
      wave.scale.y = Math.max(0.1, scaleAnimation);

      // Opacity animation - waves fade in and out
      const opacity = Math.max(
        0,
        Math.sin(frameTime * 1.2 + waveData.offset) * 0.8 + 0.2
      );
      (wave.material as THREE.MeshStandardMaterial).opacity = opacity;
      (wave.material as THREE.MeshStandardMaterial).transparent = true;

      // Infinite scrolling for waves
      const originalZ = wave.userData.originalZ || wave.position.z;
      if (!wave.userData.originalZ) {
        wave.userData.originalZ = originalZ;
      }

      const sectionOffset =
        Math.floor(originalZ / sectionLength) * sectionLength;
      const localZ = originalZ % sectionLength;
      const newZ = sectionOffset + localZ - (totalDistance % sectionLength);

      if (newZ < -sectionLength) {
        wave.position.z = newZ + sectionLength * 3;
      } else if (newZ > sectionLength) {
        wave.position.z = newZ - sectionLength * 3;
      } else {
        wave.position.z = newZ;
      }
    });

    // Animate tidal waves that wash up onto wet sand
    this.tidalWaves.forEach((tidalData) => {
      const tidalWave = tidalData.mesh;
      const material = tidalWave.material as THREE.MeshStandardMaterial;
      
      // Slow tidal cycle - frame-based timing (deterministic)
      const frameTime = this.waveTime;
      const tidalCycle = Math.sin(frameTime * 0.3 + tidalData.offset);
      
      if (tidalCycle > 0) {
        // Wave is coming in - starts from ocean and sweeps toward characters
        const progress = tidalCycle; // 0 to 1
        
        // Wave sweeps from water edge (X=2) toward characters (X=0)
        const maxReach = 3; // Distance from water (X=2) to characters (X=0)
        tidalWave.scale.x = progress; // Scale grows from 0 to 1
        
        // Position the wave so it sweeps toward characters
        tidalWave.position.x = 2 - (maxReach * progress * 0.5); // Wave extends toward characters
        
        // Fade in as wave advances
        material.opacity = progress * 0.4;
        tidalWave.scale.y = 1;
      } else {
        // Wave is receding - move back toward ocean
        const recedeProgress = Math.abs(tidalCycle); // 0 to 1 (as wave goes more negative)
        
        if (recedeProgress > 0.1) { // Only show receding animation when clearly negative
          // Wave visibly recedes back toward ocean
          const recedeAmount = (recedeProgress - 0.1) / 0.9; // Normalize to 0-1
          
          // Scale shrinks as wave recedes
          tidalWave.scale.x = 1 - recedeAmount;
          
          // Move wave back toward ocean
          tidalWave.position.x = 0.5 + (recedeAmount * 1.5); // Moves from character area back to ocean
          
          // Fade out as it recedes
          material.opacity = (1 - recedeAmount) * 0.3;
        } else {
          // Completely hidden between cycles
          material.opacity = 0;
          tidalWave.scale.x = 0;
          tidalWave.position.x = -1; // Reset position
        }
      }
      
      // Infinite scrolling for tidal waves
      const originalZ = tidalData.originalZ;
      const sectionOffset = Math.floor(originalZ / sectionLength) * sectionLength;
      const localZ = originalZ % sectionLength;
      const newZ = sectionOffset + localZ - (totalDistance % sectionLength);
      
      if (newZ < -sectionLength) {
        tidalWave.position.z = newZ + sectionLength * 3;
        tidalData.originalZ = tidalWave.position.z;
      } else if (newZ > sectionLength) {
        tidalWave.position.z = newZ - sectionLength * 3;
        tidalData.originalZ = tidalWave.position.z;
      } else {
        tidalWave.position.z = newZ;
      }
    });

    // Update path
    this.path.updateByFrame(totalDistance);

    // Update palm trees position for infinite scrolling
    this.palmTrees.forEach((tree) => {
      const originalZ =
        tree.getMesh().userData.originalZ || tree.getMesh().position.z;
      if (!tree.getMesh().userData.originalZ) {
        tree.getMesh().userData.originalZ = originalZ;
      }

      const sectionOffset =
        Math.floor(originalZ / sectionLength) * sectionLength;
      const localZ = originalZ % sectionLength;
      const newZ = sectionOffset + localZ - (totalDistance % sectionLength);

      if (newZ < -sectionLength) {
        tree.getMesh().position.z = newZ + sectionLength * 3;
      } else if (newZ > sectionLength) {
        tree.getMesh().position.z = newZ - sectionLength * 3;
      } else {
        tree.getMesh().position.z = newZ;
      }
    });

    // Animate seagulls
    this.seagulls.forEach((seagullData) => {
      seagullData.angle += 0.01 * seagullData.speed;
      seagullData.mesh.position.x =
        seagullData.centerX + Math.cos(seagullData.angle) * seagullData.radius;
      seagullData.mesh.position.z =
        Math.sin(seagullData.angle) * seagullData.radius;
      seagullData.mesh.position.y = 15 + Math.sin(frameTime * 2) * 3;

      // Wing flapping animation - frame-based timing
      if (seagullData.mesh.children[1] && seagullData.mesh.children[2]) {
        seagullData.mesh.children[1].rotation.z =
          Math.sin(frameTime * 10) * 0.3;
        seagullData.mesh.children[2].rotation.z =
          -Math.sin(frameTime * 10) * 0.3;
      }
    });

    // Update mountains for infinite scrolling with parallax
    this.mountains.forEach((mountainData) => {
      const mountain = mountainData.mesh;
      const originalZ = mountainData.originalZ;

      // Apply parallax effect - mountains move slower than foreground
      const parallaxSpeed = 0.3; // Mountains move at 30% of walking speed
      const effectiveDistance = totalDistance * parallaxSpeed;

      const newZ = originalZ - (effectiveDistance % sectionLength);

      if (newZ < -sectionLength) {
        mountain.position.z = newZ + sectionLength * 3;
      } else if (newZ > sectionLength) {
        mountain.position.z = newZ - sectionLength * 3;
      } else {
        mountain.position.z = newZ;
      }
    });
  }

  getConfig(): EnvironmentConfig {
    return BeachConfig;
  }
}
