import * as THREE from 'three';
import { BaseEnvironment, EnvironmentConfig } from './BaseEnvironment';
import { JunglePath } from './Path';

export const CherryBlossomConfig: EnvironmentConfig = {
  backgroundColor: 0xFFE4E1, // Misty rose
  fogColor: 0xFFB6C1, // Light pink
  fogNear: 25,
  fogFar: 80,
  groundColor: 0x90EE90, // Light green grass
  pathColor: 0xD2691E, // Chocolate (wooden path)
  enableShadows: true
};

// Cherry blossom materials
export const CherryBlossomMaterials = {
  grass: new THREE.MeshPhongMaterial({ 
    color: 0x90EE90,
    shininess: 10
  }),
  woodPath: new THREE.MeshPhongMaterial({ 
    color: 0xD2691E,
    shininess: 20
  }),
  trunk: new THREE.MeshPhongMaterial({ 
    color: 0x4B3621 // Dark brown
  }),
  blossom: new THREE.MeshPhongMaterial({ 
    color: 0xFFB6C1, // Light pink
    shininess: 5
  }),
  fallenPetals: new THREE.MeshPhongMaterial({ 
    color: 0xFFC0CB,
    transparent: true,
    opacity: 0.8
  })
};

class CherryTree {
  private mesh: THREE.Group;
  
  constructor(x: number, z: number, size: number = 1, random: () => number) {
    this.mesh = new THREE.Group();
    
    // Trunk
    const trunkGeometry = new THREE.CylinderGeometry(0.5 * size, 0.7 * size, 6 * size, 8);
    const trunk = new THREE.Mesh(trunkGeometry, CherryBlossomMaterials.trunk);
    trunk.position.y = 3 * size;
    trunk.castShadow = true;
    this.mesh.add(trunk);
    
    // Blossom clusters
    const clusterCount = 5 + Math.floor(random() * 3);
    for (let i = 0; i < clusterCount; i++) {
      const clusterSize = (2 + random() * 1.5) * size;
      const clusterGeometry = new THREE.SphereGeometry(clusterSize, 8, 6);
      const cluster = new THREE.Mesh(clusterGeometry, CherryBlossomMaterials.blossom);
      
      const angle = (i / clusterCount) * Math.PI * 2;
      const radius = (1.5 + random() * 1) * size;
      cluster.position.set(
        Math.cos(angle) * radius,
        (5 + random() * 2) * size,
        Math.sin(angle) * radius
      );
      cluster.castShadow = true;
      this.mesh.add(cluster);
    }
    
    this.mesh.position.set(x, 0, z);
  }
  
  getMesh(): THREE.Group {
    return this.mesh;
  }
}

class FallingPetals {
  private particles: THREE.Points;
  private geometry: THREE.BufferGeometry;
  private velocities: Float32Array;
  private rotations: Float32Array;
  
  constructor(scene: THREE.Scene, random: () => number) {
    const petalCount = 500;
    const positions = new Float32Array(petalCount * 3);
    this.velocities = new Float32Array(petalCount * 2); // x and y velocity
    this.rotations = new Float32Array(petalCount);
    
    // Initialize petal positions
    for (let i = 0; i < petalCount; i++) {
      positions[i * 3] = (random() - 0.5) * 80;      // x
      positions[i * 3 + 1] = random() * 30;          // y
      positions[i * 3 + 2] = (random() - 0.5) * 80;  // z
      this.velocities[i * 2] = (random() - 0.5) * 0.1;     // x drift
      this.velocities[i * 2 + 1] = 0.05 + random() * 0.1;  // fall speed
      this.rotations[i] = random() * Math.PI * 2;
    }
    
    this.geometry = new THREE.BufferGeometry();
    this.geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    
    // Custom shader for petal shape
    const material = new THREE.PointsMaterial({
      color: 0xFFB6C1,
      size: 0.5,
      transparent: true,
      opacity: 0.7,
      map: this.createPetalTexture()
    });
    
    this.particles = new THREE.Points(this.geometry, material);
    scene.add(this.particles);
  }
  
  private createPetalTexture(): THREE.Texture {
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;
    const context = canvas.getContext('2d')!;
    
    // Draw petal shape
    context.fillStyle = '#FFB6C1';
    context.beginPath();
    context.ellipse(16, 16, 12, 8, 0, 0, Math.PI * 2);
    context.fill();
    
    const texture = new THREE.CanvasTexture(canvas);
    return texture;
  }
  
  update(deltaTime: number): void {
    const positions = this.geometry.attributes.position.array as Float32Array;
    
    for (let i = 0; i < positions.length / 3; i++) {
      const x = i * 3;
      const y = i * 3 + 1;
      const z = i * 3 + 2;
      
      // Apply drift and fall
      positions[x] += this.velocities[i * 2] * deltaTime * 10;
      positions[y] -= this.velocities[i * 2 + 1] * deltaTime * 10;
      
      // Add slight swaying motion
      positions[x] += Math.sin(this.rotations[i]) * 0.01;
      this.rotations[i] += deltaTime * 2;
      
      // Reset petal if it falls below ground
      if (positions[y] < -2) {
        positions[y] = 30;
        positions[x] = (this.random() - 0.5) * 80;
        positions[z] = (this.random() - 0.5) * 80;
      }
    }
    
    this.geometry.attributes.position.needsUpdate = true;
  }
}

class WoodenPath extends JunglePath {
  constructor(scene: THREE.Scene) {
    super(scene);
    // Override path material to wooden planks
    this.getSegments().forEach(segment => {
      segment.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.material = CherryBlossomMaterials.woodPath;
        }
      });
    });
  }
}

export class CherryBlossomEnvironment extends BaseEnvironment {
  private ground: THREE.Mesh;
  private path: WoodenPath;
  private cherryTrees: CherryTree[] = [];
  private fallingPetals: FallingPetals;
  
  constructor(scene: THREE.Scene, seed: number = 12345) {
    super(scene, CherryBlossomConfig, seed);
    
    // Create grassy ground
    this.ground = this.createGround(CherryBlossomMaterials.grass);
    scene.add(this.ground);
    
    // Create wooden path
    this.path = new WoodenPath(scene);
    
    // Create cherry trees
    this.createCherryTrees();
    
    // Create falling petals
    const petalRandom = this.createSeededRandom(this.seed + 3000);
    this.fallingPetals = new FallingPetals(scene, petalRandom);
    
    // Add some fallen petals on the ground
    this.addFallenPetals();
  }
  
  private createCherryTrees(): void {
    const random = this.createSeededRandom(this.seed);
    
    // Create avenue of cherry trees
    for (let i = 0; i < 30; i++) {
      // Trees on both sides
      const z = -80 + i * 6;
      const xLeft = -8 - random() * 5;
      const xRight = 8 + random() * 5;
      const size = 0.8 + random() * 0.4;
      
      const treeLeft = new CherryTree(xLeft, z, size, random);
      const treeRight = new CherryTree(xRight, z, size, random);
      
      this.cherryTrees.push(treeLeft, treeRight);
      this.scene.add(treeLeft.getMesh());
      this.scene.add(treeRight.getMesh());
    }
  }
  
  private addFallenPetals(): void {
    const random = this.createSeededRandom(this.seed + 2000);
    const petalGeometry = new THREE.PlaneGeometry(0.3, 0.3);
    const petalGroup = new THREE.Group();
    
    // Scatter petals on the ground
    for (let i = 0; i < 100; i++) {
      const petal = new THREE.Mesh(petalGeometry, CherryBlossomMaterials.fallenPetals);
      petal.position.set(
        (random() - 0.5) * 40,
        -1.25,
        (random() - 0.5) * 100
      );
      petal.rotation.x = -Math.PI / 2;
      petal.rotation.z = random() * Math.PI * 2;
      petalGroup.add(petal);
    }
    
    this.scene.add(petalGroup);
  }
  
  updateByFrame(totalDistance: number): void {
    // Update ground position
    const groundCycleLength = 200;
    const groundPosition = -totalDistance % groundCycleLength;
    this.ground.position.z = groundPosition;
    
    // Update path
    this.path.updateByFrame(totalDistance);
    
    // Update cherry trees
    const treeSpacing = 6;
    const totalTreeDistance = (this.cherryTrees.length / 2) * treeSpacing;
    
    this.cherryTrees.forEach((tree, index) => {
      const treeIndex = Math.floor(index / 2);
      const baseZ = -80 + treeIndex * treeSpacing;
      const newZ = baseZ - (totalDistance % totalTreeDistance);
      
      if (newZ < -100) {
        tree.getMesh().position.z = newZ + totalTreeDistance;
      } else {
        tree.getMesh().position.z = newZ;
      }
    });
    
    // Update falling petals
    this.fallingPetals.update(0.016);
  }
  
  getConfig(): EnvironmentConfig {
    return CherryBlossomConfig;
  }
}