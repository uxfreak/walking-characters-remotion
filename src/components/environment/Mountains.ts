import * as THREE from 'three';
import { MountainMaterials } from '../../constants/materials';
import { randomRange } from '../../utils/math';
import { createLoopableObject, LoopableObject } from '../../utils/three-helpers';

export interface MountainRangeConfig {
  distance: number;
  count: number;
  baseHeight: number;
  heightVariation: number;
  material: THREE.Material;
  opacity: number;
  speed: number;
}

export class Mountain extends THREE.Group {
  constructor(
    height: number,
    radius: number,
    material: THREE.Material
  ) {
    super();
    
    // Main peak
    const mainPeak = this.createMesh(
      new THREE.ConeGeometry(radius, height, 8),
      material
    );
    mainPeak.position.y = height / 2;
    this.add(mainPeak);
    
    // Secondary peaks for ridges
    const numSecondaryPeaks = 2 + Math.floor(Math.random() * 3);
    for (let j = 0; j < numSecondaryPeaks; j++) {
      const secondaryHeight = height * randomRange(0.6, 0.9);
      const secondaryRadius = radius * randomRange(0.5, 0.9);
      
      const secondaryPeak = this.createMesh(
        new THREE.ConeGeometry(secondaryRadius, secondaryHeight, 8),
        material
      );
      
      const angle = (j / numSecondaryPeaks) * Math.PI * 2;
      const offsetDistance = radius * 0.6;
      secondaryPeak.position.set(
        Math.cos(angle) * offsetDistance,
        secondaryHeight / 2,
        Math.sin(angle) * offsetDistance
      );
      this.add(secondaryPeak);
    }
    
    // Foothills
    const numFoothills = 3 + Math.floor(Math.random() * 4);
    for (let k = 0; k < numFoothills; k++) {
      const foothillHeight = height * randomRange(0.2, 0.5);
      const foothillRadius = radius * randomRange(0.8, 1.3);
      
      const foothillMaterial = material.clone();
      if (foothillMaterial instanceof THREE.MeshPhongMaterial) {
        foothillMaterial.opacity = material.opacity * 0.8;
      }
      
      const foothill = this.createMesh(
        new THREE.ConeGeometry(foothillRadius, foothillHeight, 6),
        foothillMaterial
      );
      
      const foothillAngle = Math.random() * Math.PI * 2;
      const foothillDistance = radius * randomRange(1.2, 2);
      foothill.position.set(
        Math.cos(foothillAngle) * foothillDistance,
        foothillHeight / 2,
        Math.sin(foothillAngle) * foothillDistance
      );
      this.add(foothill);
    }
    
    // Random rotation for variety
    this.rotation.y = Math.random() * Math.PI * 2;
  }
  
  private createMesh(geometry: THREE.BufferGeometry, material: THREE.Material): THREE.Mesh {
    const mesh = new THREE.Mesh(geometry, material);
    mesh.castShadow = false; // Mountains don't cast shadows (too far)
    mesh.receiveShadow = false;
    return mesh;
  }
}

export class MountainRange {
  private mountains: LoopableObject[] = [];
  private ranges: MountainRangeConfig[] = [
    {
      distance: 80,
      count: 8,
      baseHeight: 40,
      heightVariation: 25,
      material: MountainMaterials.far,
      opacity: 0.7,
      speed: 0.003
    },
    {
      distance: 60,
      count: 6,
      baseHeight: 30,
      heightVariation: 20,
      material: MountainMaterials.mid,
      opacity: 0.8,
      speed: 0.005
    },
    {
      distance: 45,
      count: 5,
      baseHeight: 25,
      heightVariation: 15,
      material: MountainMaterials.close,
      opacity: 0.9,
      speed: 0.007
    }
  ];
  
  constructor(scene: THREE.Scene, resetZ: number = -120, maxZ: number = 120) {
    this.ranges.forEach((range, rangeIndex) => {
      const material = range.material.clone();
      if (material instanceof THREE.MeshPhongMaterial) {
        material.opacity = range.opacity + (rangeIndex * 0.1);
      }
      
      for (let i = 0; i < range.count; i++) {
        const mainHeight = range.baseHeight + Math.random() * range.heightVariation;
        const mainRadius = randomRange(12, 20);
        
        const mountain = new Mountain(mainHeight, mainRadius, material);
        
        // Position mountain
        const side = Math.random() > 0.5 ? -1 : 1;
        const lateralSpread = randomRange(50, 90);
        
        mountain.position.set(
          side * lateralSpread,
          -1.3,
          i < range.count / 2 ? 
            range.distance + randomRange(0, 30) :
            -range.distance - randomRange(0, 30)
        );
        
        const loopableMountain = createLoopableObject(mountain, resetZ, maxZ, range.speed);
        scene.add(loopableMountain);
        this.mountains.push(loopableMountain);
      }
    });
  }
  
  public update(deltaZ: number): void {
    this.mountains.forEach(mountain => {
      const speed = mountain.userData.speed || 1;
      mountain.position.z -= deltaZ * speed;
      
      if (mountain.position.z < mountain.userData.resetZ!) {
        mountain.position.z = mountain.userData.maxZ!;
      }
    });
  }
  
  public updateByFrame(totalDistance: number): void {
    const loopDistance = 240; // Distance before mountains loop (maxZ - resetZ)
    
    this.mountains.forEach((mountain, index) => {
      // Store initial position if not already stored
      if (mountain.userData.initialZ === undefined) {
        mountain.userData.initialZ = mountain.position.z;
      }
      
      // Calculate position based on total distance with looping
      const initialZ = mountain.userData.initialZ as number;
      const speed = mountain.userData.speed || 1;
      const movedDistance = (totalDistance * speed) % loopDistance;
      mountain.position.z = initialZ - movedDistance;
      
      // Handle wrapping
      if (mountain.position.z < -120) {
        mountain.position.z += loopDistance;
      }
    });
  }
  
  public getMountains(): LoopableObject[] {
    return this.mountains;
  }
}