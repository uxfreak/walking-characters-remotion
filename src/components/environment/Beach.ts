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

class SimplePalmTree {
  private mesh: THREE.Group;

  constructor(x: number, z: number, scale: number = 1, seed: number = 0) {
    this.mesh = new THREE.Group();

    // Trunk with better shape
    const trunkGeometry = new THREE.CylinderGeometry(
      0.3 * scale,
      0.5 * scale,
      6 * scale,
      8
    );
    const trunk = new THREE.Mesh(trunkGeometry, BeachMaterials.palmTrunk);
    trunk.position.y = 3 * scale;
    trunk.castShadow = true;
    this.mesh.add(trunk);

    // Create palm fronds using planes for a more realistic look
    const frondCount = 8;
    for (let i = 0; i < frondCount; i++) {
      const angle = (i / frondCount) * Math.PI * 2;

      // Create a frond group
      const frondGroup = new THREE.Group();

      // Main stem of the frond
      const stemGeometry = new THREE.PlaneGeometry(0.2 * scale, 4 * scale);
      const stem = new THREE.Mesh(stemGeometry, BeachMaterials.palmLeaves);
      stem.position.y = 2 * scale;
      frondGroup.add(stem);

      // Add leaves along the stem
      for (let j = 0; j < 6; j++) {
        const leafGeometry = new THREE.PlaneGeometry(0.8 * scale, 0.5 * scale);
        const leaf = new THREE.Mesh(leafGeometry, BeachMaterials.palmLeaves);
        leaf.position.y = (1 + j * 0.5) * scale;
        leaf.position.x = (j % 2 === 0 ? 0.4 : -0.4) * scale;
        leaf.rotation.z = j % 2 === 0 ? 0.3 : -0.3;
        frondGroup.add(leaf);
      }

      frondGroup.position.y = 6 * scale;
      frondGroup.rotation.y = angle;
      frondGroup.rotation.z = Math.PI / 4;
      this.mesh.add(frondGroup);
    }

    this.mesh.position.set(x, 0, z);
    this.mesh.rotation.y = seed * Math.PI;
  }

  getMesh(): THREE.Group {
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
  private palmTrees: SimplePalmTree[] = [];
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
        if (x < 15) {
          height = 0; // Flat beach area
        } else {
          // Gradual slope down to water
          height = -(x - 15) * 0.05;
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
        40,
        sectionLength,
        20,
        50
      );
      const wetSand = new THREE.Mesh(wetSandGeometry, BeachMaterials.wetSand);
      wetSand.rotation.x = -Math.PI / 2;
      wetSand.position.set(15, -0.5, section * sectionLength);
      wetSand.receiveShadow = true;
      this.wetSandSections.push(wetSand);
      scene.add(wetSand);
    }

    // Create water (large ocean on the right side)
    const waterGeometry = new THREE.PlaneGeometry(300, 600, 80, 80);
    this.waterPlane = new THREE.Mesh(waterGeometry, BeachMaterials.water);
    this.waterPlane.rotation.x = -Math.PI / 2;
    this.waterPlane.position.set(100, -1, 0);
    scene.add(this.waterPlane);

    // Add horizon water
    const horizonWaterGeometry = new THREE.PlaneGeometry(500, 600, 20, 20);
    this.horizonWater = new THREE.Mesh(
      horizonWaterGeometry,
      BeachMaterials.water
    );
    this.horizonWater.rotation.x = -Math.PI / 2;
    this.horizonWater.position.set(200, -1.5, 0);
    scene.add(this.horizonWater);

    // Create waves
    this.createWaves();

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
    // Waves are now handled purely through water vertex animation
    // No foam meshes are created
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

  private createPalmTrees(): void {
    // Use deterministic random for tree placement
    const random = this.createSeededRandom(this.seed);

    // Place palm trees in multiple sections for infinite scrolling
    for (let section = -1; section <= 1; section++) {
      // Trees near the walking path (left side)
      for (let i = 0; i < 4; i++) {
        const x = -30 + random() * 20;
        const z = section * 200 + i * 40 + random() * 20;
        const scale = 0.8 + random() * 0.4;
        const palmTree = new SimplePalmTree(x, z, scale, random() * 1000);
        this.palmTrees.push(palmTree);
        this.scene.add(palmTree.getMesh());
      }

      // Some trees on the right (beach side)
      for (let i = 0; i < 2; i++) {
        const x = 5 + random() * 10;
        const z = section * 200 + i * 60 + random() * 30;
        const scale = 0.7 + random() * 0.3;
        const palmTree = new SimplePalmTree(x, z, scale, random() * 1000);
        this.palmTrees.push(palmTree);
        this.scene.add(palmTree.getMesh());
      }
    }
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

    // Update wave time for water animation
    this.waveTime += 0.016;

    // Animate water surface
    const waterVertices = this.waterPlane.geometry.attributes.position.array;
    for (let i = 0; i < waterVertices.length; i += 3) {
      const x = waterVertices[i];
      const z = waterVertices[i + 1];
      waterVertices[i + 2] =
        Math.sin(x * 0.1 + this.waveTime) * 0.3 +
        Math.sin(z * 0.1 + this.waveTime * 1.5) * 0.2;
    }
    this.waterPlane.geometry.attributes.position.needsUpdate = true;

    // Animate horizon water
    const horizonVertices =
      this.horizonWater.geometry.attributes.position.array;
    for (let i = 0; i < horizonVertices.length; i += 3) {
      const x = horizonVertices[i];
      const z = horizonVertices[i + 1];
      horizonVertices[i + 2] =
        Math.sin(x * 0.05 + this.waveTime * 0.8) * 0.2 +
        Math.sin(z * 0.05 + this.waveTime * 1.2) * 0.15;
    }
    this.horizonWater.geometry.attributes.position.needsUpdate = true;

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
      seagullData.mesh.position.y = 15 + Math.sin(this.waveTime * 2) * 3;

      // Wing flapping animation
      if (seagullData.mesh.children[1] && seagullData.mesh.children[2]) {
        seagullData.mesh.children[1].rotation.z =
          Math.sin(this.waveTime * 10) * 0.3;
        seagullData.mesh.children[2].rotation.z =
          -Math.sin(this.waveTime * 10) * 0.3;
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
