import * as THREE from 'three';
import { BaseEnvironment, EnvironmentConfig } from './BaseEnvironment';
import { TreeField } from './Trees';
import { MountainRange } from './Mountains';
import { JunglePath } from './Path';

export const SnowyForestConfig: EnvironmentConfig = {
  backgroundColor: 0xE0E5E5, // Light gray sky
  fogColor: 0xF0F8FF, // Alice blue
  fogNear: 20,
  fogFar: 70,
  groundColor: 0xFAFAFA, // Snow white
  pathColor: 0xD3D3D3, // Light gray (packed snow)
  enableShadows: true
};

// Snowy materials
export const SnowyMaterials = {
  snow: new THREE.MeshPhongMaterial({ 
    color: 0xFAFAFA,
    shininess: 20
  }),
  packedSnow: new THREE.MeshPhongMaterial({ 
    color: 0xD3D3D3,
    shininess: 15
  }),
  frostedTrunk: new THREE.MeshPhongMaterial({ 
    color: 0x8B7355
  }),
  snowyFoliage: new THREE.MeshPhongMaterial({ 
    color: 0x006400 // Dark green under snow
  }),
  snowCap: new THREE.MeshPhongMaterial({ 
    color: 0xFFFFFF,
    shininess: 30
  })
};

class SnowParticles {
  private particles: THREE.Points;
  private geometry: THREE.BufferGeometry;
  private velocities: Float32Array;
  private random: () => number;
  
  constructor(scene: THREE.Scene, random: () => number) {
    this.random = random;
    const particleCount = 1000;
    const positions = new Float32Array(particleCount * 3);
    this.velocities = new Float32Array(particleCount);
    
    // Initialize particle positions
    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (this.random() - 0.5) * 100;     // x
      positions[i * 3 + 1] = this.random() * 50;          // y
      positions[i * 3 + 2] = (this.random() - 0.5) * 100; // z
      this.velocities[i] = 0.1 + this.random() * 0.2;     // fall speed
    }
    
    this.geometry = new THREE.BufferGeometry();
    this.geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    
    const material = new THREE.PointsMaterial({
      color: 0xFFFFFF,
      size: 0.3,
      transparent: true,
      opacity: 0.8
    });
    
    this.particles = new THREE.Points(this.geometry, material);
    scene.add(this.particles);
  }
  
  update(deltaTime: number): void {
    const positions = this.geometry.attributes.position.array as Float32Array;
    
    for (let i = 0; i < positions.length / 3; i++) {
      const y = i * 3 + 1;
      positions[y] -= this.velocities[i] * deltaTime * 10;
      
      // Reset particle if it falls below ground
      if (positions[y] < -2) {
        positions[y] = 50;
        positions[i * 3] = (this.random() - 0.5) * 100;
        positions[i * 3 + 2] = (this.random() - 0.5) * 100;
      }
    }
    
    this.geometry.attributes.position.needsUpdate = true;
  }
}

class SnowyTreeField extends TreeField {
  constructor(scene: THREE.Scene, treeCount: number, minZ: number, maxZ: number, seed: number) {
    super(scene, treeCount, minZ, maxZ, seed);
    
    // Add snow caps to trees
    this.trees.forEach(tree => {
      tree.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          // Change trunk to frosted appearance
          if (child.material === this.trunkMaterial) {
            child.material = SnowyMaterials.frostedTrunk;
          }
          // Add snow to foliage
          if (child.material === this.foliageMaterial) {
            child.material = SnowyMaterials.snowyFoliage;
            
            // Add snow cap on top
            const snowCapGeometry = new THREE.ConeGeometry(
              child.geometry.parameters.radiusTop * 0.8,
              2,
              8
            );
            const snowCap = new THREE.Mesh(snowCapGeometry, SnowyMaterials.snowCap);
            snowCap.position.y = child.position.y + child.geometry.parameters.height / 2;
            tree.add(snowCap);
          }
        }
      });
    });
  }
}

class SnowyPath extends JunglePath {
  constructor(scene: THREE.Scene) {
    super(scene);
    // Override path material to packed snow
    this.getSegments().forEach(segment => {
      segment.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.material = SnowyMaterials.packedSnow;
        }
      });
    });
  }
}

export class SnowyForestEnvironment extends BaseEnvironment {
  private ground: THREE.Mesh;
  private path: SnowyPath;
  private trees: SnowyTreeField;
  private mountains: MountainRange;
  private snowParticles: SnowParticles;
  
  constructor(scene: THREE.Scene, seed: number = 12345) {
    super(scene, SnowyForestConfig, seed);
    
    // Create snowy ground
    this.ground = this.createGround(SnowyMaterials.snow);
    scene.add(this.ground);
    
    // Create snowy path
    this.path = new SnowyPath(scene);
    
    // Create snowy trees
    this.trees = new SnowyTreeField(scene, 60, -80, 80, seed);
    
    // Create mountains with snow
    this.mountains = new MountainRange(scene, -120, 120, seed + 10000);
    // Make mountains whiter by traversing the scene objects
    this.mountains.getMountains().forEach(mountain => {
      mountain.traverse((child) => {
        if (child instanceof THREE.Mesh && child.material instanceof THREE.MeshPhongMaterial) {
          const originalOpacity = child.material.opacity;
          child.material = new THREE.MeshPhongMaterial({
            color: 0xF0F8FF,
            transparent: true,
            opacity: originalOpacity
          });
        }
      });
    });
    
    // Create falling snow
    this.snowParticles = new SnowParticles(scene, this.random);
  }
  
  updateByFrame(totalDistance: number): void {
    // Update ground position
    const groundCycleLength = 200;
    const groundPosition = -totalDistance % groundCycleLength;
    this.ground.position.z = groundPosition;
    
    // Update all elements
    this.path.updateByFrame(totalDistance);
    this.trees.updateByFrame(totalDistance);
    this.mountains.updateByFrame(totalDistance);
    
    // Update snow particles
    this.snowParticles.update(0.016); // Assuming 60fps
  }
  
  getConfig(): EnvironmentConfig {
    return SnowyForestConfig;
  }
}