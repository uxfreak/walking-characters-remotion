import * as THREE from 'three';
import { TreeMaterials } from '../../constants/materials';
import { randomRange, SeededRandom } from '../../utils/math';
import { createLoopableObject, LoopableObject } from '../../utils/three-helpers';

export enum TreeType {
  TALL_JUNGLE = 0,
  BROAD_JUNGLE = 1,
  VINE_COVERED = 2
}

export interface TreeConfig {
  type?: TreeType;
  minHeight?: number;
  maxHeight?: number;
  position?: THREE.Vector3;
  resetZ?: number;
  maxZ?: number;
  seed?: number;
}

export class Tree extends THREE.Group {
  private rng: SeededRandom;

  constructor(config: TreeConfig = {}) {
    super();
    
    // Use seed for deterministic generation
    this.rng = new SeededRandom(config.seed ?? 12345);
    
    const type = config.type ?? Math.floor(this.rng.next() * 3);
    const trunkMaterial = TreeMaterials.trunks[Math.floor(this.rng.next() * TreeMaterials.trunks.length)];
    const foliageMaterial = TreeMaterials.foliage[Math.floor(this.rng.next() * TreeMaterials.foliage.length)];
    
    switch (type) {
      case TreeType.TALL_JUNGLE:
        this.createTallJungleTree(trunkMaterial, foliageMaterial, config);
        break;
      case TreeType.BROAD_JUNGLE:
        this.createBroadJungleTree(trunkMaterial, foliageMaterial, config);
        break;
      case TreeType.VINE_COVERED:
        this.createVineCoveredTree(trunkMaterial, foliageMaterial, config);
        break;
    }
    
    // Deterministic rotation
    this.rotation.y = this.rng.next() * Math.PI * 2;
    
    // Set position if provided
    if (config.position) {
      this.position.copy(config.position);
    }
  }
  
  private createMesh(geometry: THREE.BufferGeometry, material: THREE.Material): THREE.Mesh {
    const mesh = new THREE.Mesh(geometry, material);
    mesh.castShadow = true;
    return mesh;
  }
  
  private createTallJungleTree(
    trunkMaterial: THREE.Material,
    foliageMaterial: THREE.Material,
    config: TreeConfig
  ): void {
    const minHeight = config.minHeight ?? 8;
    const maxHeight = config.maxHeight ?? 20;
    const trunkHeight = this.rng.range(minHeight, maxHeight);
    const trunkRadius = this.rng.range(0.4, 1);
    
    // Trunk
    const trunk = this.createMesh(
      new THREE.CylinderGeometry(trunkRadius * 0.7, trunkRadius, trunkHeight, 8),
      trunkMaterial
    );
    trunk.position.y = trunkHeight / 2 - 1.3;
    this.add(trunk);
    
    // Canopy
    const foliageRadius = this.rng.range(3, 5);
    const canopy = this.createMesh(
      new THREE.SphereGeometry(foliageRadius, 10, 8),
      foliageMaterial
    );
    canopy.position.y = trunkHeight - 1.3 - foliageRadius * 0.3;
    canopy.scale.set(1, 0.7, 1);
    this.add(canopy);
  }
  
  private createBroadJungleTree(
    trunkMaterial: THREE.Material,
    foliageMaterial: THREE.Material,
    config: TreeConfig
  ): void {
    const minHeight = config.minHeight ?? 7;
    const maxHeight = config.maxHeight ?? 15;
    const trunkHeight = this.rng.range(minHeight, maxHeight);
    const trunkRadius = this.rng.range(0.5, 0.9);
    
    // Trunk
    const trunk = this.createMesh(
      new THREE.CylinderGeometry(trunkRadius * 0.8, trunkRadius, trunkHeight, 8),
      trunkMaterial
    );
    trunk.position.y = trunkHeight / 2 - 1.3;
    this.add(trunk);
    
    // Wide canopy
    const canopyRadius = this.rng.range(4, 6);
    const canopy = this.createMesh(
      new THREE.SphereGeometry(canopyRadius, 10, 6),
      foliageMaterial
    );
    canopy.position.y = trunkHeight - 1.3 - canopyRadius * 0.4;
    canopy.scale.set(1.3, 0.5, 1.3);
    this.add(canopy);
    
    // Additional smaller canopies
    for (let j = 0; j < 2; j++) {
      const smallCanopyRadius = this.rng.range(1.5, 2.3);
      const smallCanopy = this.createMesh(
        new THREE.SphereGeometry(smallCanopyRadius, 8, 6),
        foliageMaterial
      );
      const angle = j * Math.PI;
      smallCanopy.position.set(
        Math.cos(angle) * canopyRadius * 0.7,
        trunkHeight - 1.3 - smallCanopyRadius * 0.6,
        Math.sin(angle) * canopyRadius * 0.7
      );
      smallCanopy.scale.set(0.9, 0.6, 0.9);
      this.add(smallCanopy);
    }
  }
  
  private createVineCoveredTree(
    trunkMaterial: THREE.Material,
    foliageMaterial: THREE.Material,
    config: TreeConfig
  ): void {
    const minHeight = config.minHeight ?? 8;
    const maxHeight = config.maxHeight ?? 18;
    const trunkHeight = this.rng.range(minHeight, maxHeight);
    const trunkRadius = this.rng.range(0.3, 0.6);
    
    // Trunk
    const trunk = this.createMesh(
      new THREE.CylinderGeometry(trunkRadius, trunkRadius * 1.1, trunkHeight, 8),
      trunkMaterial
    );
    trunk.position.y = trunkHeight / 2 - 1.3;
    this.add(trunk);
    
    // Irregular foliage
    const foliageRadius = this.rng.range(2.5, 4);
    const mainFoliage = this.createMesh(
      new THREE.SphereGeometry(foliageRadius, 8, 6),
      foliageMaterial
    );
    mainFoliage.position.y = trunkHeight - 1.3 - foliageRadius * 0.4;
    mainFoliage.scale.set(1, 0.8, 1);
    this.add(mainFoliage);
    
    // Hanging vines
    const vineMaterial = new THREE.MeshPhongMaterial({ color: 0x556B2F });
    for (let j = 0; j < 3; j++) {
      const vineLength = this.rng.range(1, 3);
      const vine = this.createMesh(
        new THREE.CylinderGeometry(0.02, 0.05, vineLength, 6),
        vineMaterial
      );
      const vineStartHeight = mainFoliage.position.y - foliageRadius * 0.5;
      vine.position.set(
        (this.rng.next() - 0.5) * foliageRadius * 1.5,
        vineStartHeight - vineLength / 2,
        (this.rng.next() - 0.5) * foliageRadius * 1.5
      );
      this.add(vine);
    }
  }
}

export class TreeField {
  private trees: LoopableObject[] = [];
  private rng: SeededRandom;
  
  constructor(
    scene: THREE.Scene,
    count: number = 60,
    resetZ: number = -80,
    maxZ: number = 80,
    seed: number = 12345
  ) {
    this.rng = new SeededRandom(seed);
    
    for (let i = 0; i < count; i++) {
      const treeType = Math.floor(this.rng.next() * 3) as TreeType;
      const tree = new Tree({ type: treeType, seed: seed + i });
      
      // Position trees in jungle
      const side = this.rng.next() > 0.5 ? -1 : 1;
      const distanceFromPath = this.rng.range(3, 23);
      const spreadZ = (i - count / 2) * 6 + this.rng.range(-7.5, 7.5);
      
      tree.position.set(
        side * distanceFromPath + this.rng.range(-2.5, 2.5),
        -1.3,
        spreadZ
      );
      
      const loopableTree = createLoopableObject(tree, resetZ, maxZ);
      scene.add(loopableTree);
      this.trees.push(loopableTree);
    }
  }
  
  public update(deltaZ: number): void {
    this.trees.forEach(tree => {
      tree.position.z -= deltaZ;
      if (tree.position.z < tree.userData.resetZ!) {
        tree.position.z = tree.userData.maxZ!;
      }
    });
  }
  
  public updateByFrame(totalDistance: number): void {
    const loopDistance = 160; // Distance before trees loop (maxZ - resetZ)
    
    this.trees.forEach((tree, index) => {
      // Use the stored original position from creation
      const initialZ = tree.userData.originalZ || tree.position.z;
      
      // Calculate position based on total distance with looping
      const movedDistance = totalDistance % loopDistance;
      tree.position.z = initialZ - movedDistance;
      
      // Handle wrapping smoothly
      if (tree.position.z < -80) {
        tree.position.z += loopDistance;
      }
    });
  }
  
  public getTrees(): LoopableObject[] {
    return this.trees;
  }
}